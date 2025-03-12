from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required

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
        

@csrf_exempt
@login_required
def all_posts_view(request):

    get_all_posts = Post.objects.all().order_by('-timestamp')

    # Perform validation to check if the user has already liked that post
    for post in get_all_posts:
        post.is_liked_by_user = Like.objects.filter(user=request.user, post=post).exists()
        post.like_count = post.post_likes.count()

    return JsonResponse([post.serialize(request.user) for post in get_all_posts], safe=False)


def all_posts_view_2(request):

    get_all_posts = Post.objects.all().order_by('-timestamp')

    # Perform validation to check if the user has already liked that post
    for post in get_all_posts:
        post.is_liked_by_user = Like.objects.filter(user=request.user, post=post).exists()
        post.like_count = post.post_likes.count()

    return render(request, "network/all_posts_2.html", {
        "all_posts": get_all_posts
    })

@csrf_exempt
@login_required
def like_post(request, post_id):
    
    # First, check if the post actually exists
    # before doing any other query
    post = get_object_or_404(Post, pk=post_id)

    # API POST requests to handle like/unlike requests
    if request.method == 'PUT':

        # Using this function, I'll get a tuple with
        # (the value of like returned by dB, 
        # , true if new record created, false if recod was found)
        like, created = Like.objects.get_or_create(user=request.user, post=post)


        # Tuple returns true --> New like was created
        # Then increment the playcount
        if created:
            return JsonResponse({
                "action": "add",
                "message": "Like added successfully!", 
                "like_count": post.post_likes.count()
            }, status=201)
        
        # But if tuple returns false
        # --> An existing like record already exists
        # Then treat this as a unlike request
        else:
            like.delete()
            return JsonResponse({
                "action": "remove",
                "message": "Like removed successfully!", 
                "like_count": post.post_likes.count()
            }, status=200)


def show_profile(request, user_id):
    return render(request, "network/index.html")


@csrf_exempt
def post(request, post_id):

    # Query to check if a post with the post_id exists
    try:
        post = Post.objects.get(user=request.user, pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    # Return post details upon receiving a GET request
    if request.method == "GET":
        return JsonResponse(post.serialize())
    
    # Else via PUT request, allow to increment like count
    elif request.method == 'PUT':
        pass

    # Post must be requested via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)