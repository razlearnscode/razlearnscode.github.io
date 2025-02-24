from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Listing, Bid, Comment, Watchlist


def index(request):

    all_active_listings = Listing.objects.filter(state="ACTIVE")

    return render(request, "auctions/index.html", {
        "active_listings": all_active_listings
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


def listing_page(request, product_id):
    
    selected_listing = Listing.objects.get(pk=product_id)
    comments_for_listing = selected_listing.comments_by_list.all().order_by('-comment_date')
    show_watchlist = True

    
    if request.user.is_authenticated:
        existing_watchlist_exists = Watchlist.objects.filter(user=request.user, listing=selected_listing).first()

        if existing_watchlist_exists:
            show_watchlist = False
        else:
            show_watchlist = True

    # Need to handle this so that listing without highest_bid still render
    # The revision why I include a call here is so that if the user refresh, the
    # latest bid would still be update
    if selected_listing.highest_bid is not None:
        selected_listing.highest_bid = get_highest_bid(product_id)

        # If I want to update the value to the db, I must perform save
        selected_listing.save()

    # Check whether to show Add or Remove Watchlist

    # Key Note: I cannot perform check for watchlist here because there's an instance that an anonymous user may access this page

    return render(request, "auctions/listing_page.html", {
        "listing": selected_listing,
        "comments": comments_for_listing,
        "show_watchlist": show_watchlist
    })


def get_highest_bid(product_id):

    # First, I want to get all the bids for my listing
    selected_listing = Listing.objects.get(pk=product_id)

    # Remmber, I need to use "bids" here because that's the related name
    # I defined in models.py

    # I just want to show how to get all bids here, I'm actually not using it at all
    all_bids = selected_listing.bids.all()

    current_highest_bid = selected_listing.bids.order_by('-bid_amount').first()

    # Perform the validation here to make sure I don't pass none value
    # for the get_highest_bid function

    if current_highest_bid is None:
        return 0
    else:
        return current_highest_bid.bid_amount

def place_bid(request, product_id):

    if request.method == "POST":

        new_bid = request.POST["new_bid_amount"]

        selected_listing = Listing.objects.get(pk=product_id)
        
        starting_bid = selected_listing.starting_bid
        current_highest_bid = get_highest_bid(product_id)

        if float(new_bid) > current_highest_bid and float(new_bid) > starting_bid: 
            
            # First, create a new record for the bid
            Bid.objects.create(user=request.user, listing=selected_listing, bid_amount=new_bid)

            # Then, save the new bid as the highest bid value
            selected_listing.highest_bid = new_bid
            selected_listing.save()

            # After everything is successful, then I want to redirect user back to the listing page with the updated info
            # Since this is the success flow, I need to sue HttpResponseRedirect instead
            # This is to avoid duplicated entry because the form is cleared

            return HttpResponseRedirect(reverse("listing_page", args=(product_id,)))

        else:
            
            # Show the error message to users
            return render(request, "auctions/listing_page.html", {
                "listing": selected_listing,
                "message": "Make sure your bid is larger than the current highest bid"
            })


def add_comment(request, product_id):

    if request.method == 'POST':

        new_comment = request.POST['comment_input_box']
        selected_listing = Listing.objects.get(pk=product_id)

        if new_comment is not None:

            # Create new comment object for the user and the listing
            Comment.objects.create(user=request.user, listing=selected_listing, comment_text=new_comment)

            return HttpResponseRedirect(reverse("listing_page", args=(product_id,)))

        else: 

            return render(request, "auctions/listing_page.html", {
                "listing": selected_listing,
            })


def watchlist(request):

    watchlist_by_user = Watchlist.objects.filter(user=request.user)

    return render(request, "auctions/watchlist.html", {
        "all_watchlist_request": watchlist_by_user
    })

def add_to_watchlist(request, product_id):

    show_watchlist = True
    message = ""

    if request.method == 'POST':

        selected_listing = Listing.objects.get(pk=product_id)

        # Use a boolean to check if the watchlist already exists before
        # Cannot use get here because if I try to get an object that doesn't exist, the code will fail
        duplicate_watchlist_exists = Watchlist.objects.filter(user=request.user, listing=selected_listing).first()

        # Why this work is because if there's no item in first, it will return None. So the below clause means
        # if the duplicate_watchlist_exists is not None

        # Verify if the user has already added item to the watchlist before
        if duplicate_watchlist_exists:
            message = "This item is already in your watchlist"
            show_watchlist = False
        else:
            Watchlist.objects.create(user=request.user, listing=selected_listing)
            message = "Item successfully added to your Watchlist"
            show_watchlist = False

    return render(request, "auctions/listing_page.html", {
        "listing": selected_listing,
        "watchlist_message": message,
        "show_watchlist": show_watchlist
    })



def remove_from_watchlist(request, product_id):

    message = ""
    watchlist_message = ""
    show_watchlist = False

    if request.method == 'POST':

        selected_listing = Listing.objects.get(pk=product_id)
        existing_watchlist = Watchlist.objects.filter(user=request.user, listing=selected_listing)

        # Since I already did a FE validation to show/hide the Remove watchlist button, I don't need to implement any logic
        # to check if the watchlist exists here

        existing_watchlist.delete()
        show_watchlist = True
    
    return render(request, "auctions/listing_page.html", {
        "listing": selected_listing,
        "watchlist_message": "The item was succesfully removed from your watchlist",
        "show_watchlist": show_watchlist
    })


def new_listing(request):

    # Get all the values from the form
    if request.method == 'POST':
        title = request.POST['listing_title_input']
        desc = request.POST['listing_desc_input']
        start_bid = request.POST['starting_bid_input']
        imageURL = request.POST['image_link']
        category = request.POST['category_selection']

        # Create a new Listing from the information submit
        new_listing = Listing.objects.create(
            title=title,
            description=desc, 
            starting_bid=start_bid,
            imageURL=imageURL,
            category=category
        )

        return HttpResponseRedirect(reverse("listing_page", args=(new_listing.id,)))

    # Supposed I want to pass the list of all categories as defined in CATEGORY_OPTIONS
    # in the Listing model. Since I already imported the Listing model, I can reference it
    categories = Listing.CATEGORY_OPTIONS

    return render(request, "auctions/new_listing.html", {
        "categories": categories
    })