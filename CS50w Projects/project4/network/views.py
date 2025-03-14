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

@csrf_exempt
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
            return JsonResponse({""
                "message": "Post submitted successfully.",
                "new_post": new_post.serialize(post_owner)
            }, status=201)
        else:
            return JsonResponse({
                "error": "Post content cannot be empty."
            }, status=404)
        

@csrf_exempt
@login_required
def all_posts_view(request):
    get_all_posts = Post.objects.all().order_by('-timestamp')
    # pass the logged_in_user as paraeter because I don't have this information at the Post level
    # I do have the content_owner info at the post level though, so I can already use that information
    return JsonResponse([post.serialize(request.user) for post in get_all_posts], safe=False) 


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


def get_profile(request, user_id):

    if request.method == 'GET':

        request_profile = User.objects.get(pk=user_id)

        # Rather than relying on the serialize definition in Models.py, I can get most of the information
        # I want directly here in this views.py function

        return JsonResponse({
            "message": "request successful",
            "username": request_profile.username,
            "profile_picture": request_profile.profile_picture,
            "follower": request_profile.followers.count(),
            "follow": request_profile.following.count(),
            "following_this_user": Follow.objects.filter(user=request.user, target_user=request_profile).exists(),
            "user_own_account": request.user == request_profile,
        }, status=201)
    

def show_profile(request, user_id):
    return render(request, "network/profile.html")



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
    

@csrf_exempt
@login_required
def follow_user(request, target_userID):

    # Validation to make sure the user exists
    user = get_object_or_404(User, id=target_userID)

    if request.method == 'PUT':
        
        # Get the users required for the request
        request_user = request.user # users who want to perform the follow action
        target_user = User.objects.get(id=target_userID) # user to be followed

        # Perform check if the user has already followed this user before
        follow, created = Follow.objects.get_or_create(user=request_user, target_user=target_user)

        if (created):
            return JsonResponse({
                "action": "add_follow",
                "message": "{request_user} has started following {target_user}"
            }, status=201)
        else:
            follow.delete()
            return JsonResponse({
                "action": "unfollow",
                "message": "{request_user} has unfollowed {target_user}"
            }, status=200)

