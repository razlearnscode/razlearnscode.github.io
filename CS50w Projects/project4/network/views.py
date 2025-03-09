from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post, Like, Follow


def index(request):
    return render(request, "network/index.html")


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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


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
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def compose_post(request):

    if request.method == 'POST':
        
        new_post = request.POST['post_input_box'].strip() # Remove the extra space
        
        # I use strip because if the post is empty, then after removing whitespace,
        # the return content is truly null. So my condition below will work

        if new_post:

            Post.objects.create(
                user=request.user,
                body=new_post,
            )

            return HttpResponseRedirect(reverse("index"))
        
        else:

            return render(request, "network/index.html", {
                "message": "Cannot submit empty post"
            })
        

def all_posts_view(request):

    get_all_posts = Post.objects.all().order_by('-timestamp')

    # Perform validation to check if the user has already liked that post
    for post in get_all_posts:
        post.is_liked_by_user = Like.objects.filter(user=request.user, post=post).exists()

    return render(request, "network/all_posts.html", {
        "all_posts": get_all_posts
    })


def like_post(request, post_id):
    
    # get the post
    if request.method == 'POST':

        postID = Post.objects.get(id=post_id)

        # First, perform check if the user has liked this post before

        if Like.objects.filter(user=request.user, post=postID).exists():
            
            # If the user liked this post already, allow them to unlike it
            Like.objects.get(user=request.user, post=postID).delete()
        else:

            # Else if they haven't liked this, count this as a like request 
            Like.objects.create(user=request.user, post=postID)


    # Redirecting users back to the all_post_view function. Note that all_posts here
    # is the name of the urls as defined in urls.py
    return HttpResponseRedirect(reverse("all_posts"))
