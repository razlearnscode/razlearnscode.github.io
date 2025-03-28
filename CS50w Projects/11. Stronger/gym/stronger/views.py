import json
from django.utils import timezone
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


from .models import User, Workout, Exercise, Set

# Create your views here.
def index(request):
    return render(request, "stronger/index.html")

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
            return render(request, "stronger/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "stronger/login.html")


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
            return render(request, "stronger/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "stronger/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "stronger/register.html")
        
@csrf_exempt
def save_workout(request):

    try:

        if request.method == 'POST':
            
            data = json.loads(request.body)
            user = request.user
            workout = data.get("workout")
            notes = data.get("notes", "")
            
            exercises = data.get("exercises", []) # try to get the exercise from data. If empty, then return an empty list [] instead

            workout = Workout.objects.create(
                user=user, 
                name=workout, 
                desc=notes, 
            )

            for ex in exercises:
                ex_name = ex.get("name", "Unnamed")
                ex_notes = ex.get("notes", "")
                ex_category = ex.get("category", "OTHERS")
                sets = ex.get("sets", [])

                exercise = Exercise.objects.create(
                    name=ex_name,
                    exercise_note=notes,
                    category=ex_category
                )

                workout.exercises.add(exercise) # link the newly created exercise to the workout exercises attribute of the Workout object

                # Iterate through the sets list that I created above
                # start=1 so that the index starts at 1 instead of 0 ("Set 1", "Set 2")
                # Using enumerate, I can get both the index and the current value
                for index, set in enumerate(sets, start=1):
                    Set.objects.create(
                        # name=f"Set {index}", -- reference for the future
                        desc=set.get("desc"),
                        weight=set.get("value"),
                        reps=set.get("reps"),
                        exercise=exercise
                    )

            return JsonResponse({"message": "Workout saved successfully!"}, status=201)
    
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



def get_user(request):
    if request.method == 'GET':
        logged_in_user = request.user
        return JsonResponse(logged_in_user.serialize())