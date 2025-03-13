from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
import json

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


def user(request):
    # send all logged in user information to the API request for display
    if request.method == 'GET':
        logged_in_user = request.user
        return JsonResponse(logged_in_user.serialize())

@csrf_exempt
@login_required
def compose_post(request):

    if request.method == 'POST':

        data = json.loads(request.body)
        post_owner_username = data.get("owner_username")
        new_post_content = data.get("body")

        post_owner = User.objects.get(username=post_owner_username)

        if (new_post_content): # if content is not empty
            new_post = Post.objects.create(
                user=post_owner,
                body=new_post_content,
            )
            new_post.save()
            return JsonResponse({"message": "Post submitted successfully."}, status=201)
        else:
            return JsonResponse({"error": "Post content cannot be empty."}, status=404)
        

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

    return render(request, "network/all_posts_2.html", {

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
@login_required
def edit_post(request, post_id):
    
    if request.method == 'PUT': #receive the content and update the post
        
        post_to_update = Post.objects.get(pk=post_id) # get the post from ID
        data = json.loads(request.body) # get all the data from the API

        new_content = data.get("content") # get the content from the body

        post_to_update.body = new_content
        post_to_update.save()

        return JsonResponse({
            "action": "updated",
            "message": "Post updated successfully!"
        }, status=200)