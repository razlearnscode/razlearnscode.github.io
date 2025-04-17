import json
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta

from .models import User, Log, Exercise, Session, LogTemplate, ExerciseTemplate, SessionTemplate

# Create your views here.
def index(request):
    return render(request, "plog/index.html")

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
            return render(request, "plog/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "plog/login.html")


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
            return render(request, "plog/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "plog/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "plog/register.html")
    

def get_user(request):
    if request.method == 'GET':
        logged_in_user = request.user
        return JsonResponse(logged_in_user.serialize())
    

def get_templates(request, userID):
    if request.method == 'GET':
        
        user = User.objects.get(pk=userID)
        saved_templates = LogTemplate.objects.filter(user=user).all()

        return JsonResponse([template.serialize() for template in saved_templates], safe=False)


    pass
    
@csrf_exempt
def save_log(request):

    try:
        if request.method == 'POST':
            data = json.loads(request.body)
            user = request.user
            log_name = data.get("name")
            notes = data.get("notes", "")

            exercises = data.get("exercises", [])

            newLog = Log.objects.create(
                name=log_name,
                user=user,
                notes=notes,
            )

            for ex in exercises:
                ex_name = ex.get("name", "Unnamed")
                ex_notes = ex.get("notes", "")
                ex_category = ex.get("category", "")
                sessions = ex.get("sessions", [])

                exercise = Exercise.objects.create(
                    name=ex_name,
                    notes=ex_notes,
                    category=ex_category
                )

                # Add the exercises to the Log
                newLog.exercises_in_log.add(exercise)

                print("Sessions is:", sessions)

                for s in sessions:
                    session_fields = {
                        "desc": s.get("desc"),
                        "bpm": s.get("bpm"),
                        "speed": s.get("speed"),
                        "score": s.get("score"),
                        "duration": timedelta(seconds=s.get("duration", 0)),
                        "exercise": exercise,
                    }

                    Session.objects.create(**session_fields)

            return JsonResponse({
                "message": "Log saved successfully!"}, status=201)

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)