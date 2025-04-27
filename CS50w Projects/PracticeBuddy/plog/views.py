import json
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta
from django.shortcuts import get_object_or_404

from .models import User, Log, Exercise, Session, LogTemplate, ExerciseTemplate, SessionTemplate, ExerciseNote

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
    
def records_view(request):

    return render(request, "plog/records.html")


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
    
def get_template_data(request, templateID):

    if request.method == 'GET':

        requested_template = LogTemplate.objects.get(pk=templateID)

        return JsonResponse(requested_template.serialize(), safe=False)
    
def get_log_data(request, logID):
    
    if request.method == 'GET':

        requested_log = Log.objects.get(pk=logID)

        return JsonResponse(requested_log.serialize(), safe=False)


def get_exercise_data(request, exerciseID):
    
    if request.method == 'GET':

        exercise = Exercise.objects.get(pk=exerciseID)

        return JsonResponse(exercise.serialize(), safe=False)
    

    
def get_all_exercises_fr_users(request, userID):
    
    if request.method == 'GET':

        user = User.objects.get(pk=userID)
        exercises = Exercise.objects.filter(user=user).all()

        return JsonResponse([exercise.serialize() for exercise in exercises], safe=False)
    

def get_all_logs_fr_users(request, userID):

    if request.method == 'GET':
        
        user = User.objects.get(pk=userID)
        logs = Log.objects.filter(user=user).all()

        return JsonResponse([log.serialize() for log in logs], safe=False)

    

@csrf_exempt
def delete_template(request, templateID):

    if request.method == 'POST':
        template = get_object_or_404(LogTemplate, id=templateID, user=request.user)
        template.delete()

        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid method"}, status=405)

    
@csrf_exempt
def save_log(request):

    try:
        if request.method == 'POST':
            data = json.loads(request.body)
            user = request.user
            log_name = data.get("name")
            notes = data.get("notes", "")

            template_id = data.get("template_id", None)
            exercises = data.get("exercises", [])

            log_template = None # don't want to use get_or_404 because even without template, we can still save the log
            if template_id:
                try:
                    log_template = LogTemplate.objects.get(pk=template_id)
                except LogTemplate.DoesNotExist:
                    print(f"Warning: Template ID {template_id} does not exist.")

            newLog = Log.objects.create(
                name=log_name,
                user=user,
                notes=notes,
                template=log_template,
            )

            for ex in exercises:
                ex_name = ex.get("name", "Unnamed")
                ex_id = ex.get("id", None)
                ex_notes = ex.get("notes", "")
                ex_category = ex.get("category", "")
                sessions = ex.get("sessions", [])

                # Update or create the Exercise 
                if ex_id:
                    try:
                        exercise = Exercise.objects.get(id=ex_id)
                    except Exercise.DoesNotExist: # CASE: id exists but does not match existing records
                        exercise = Exercise.objects.create(
                            name=ex_name, 
                            category=ex_category
                        )
                else: # CASE: id does not exist, so create new exercise
                    exercise = Exercise.objects.create(name=ex_name, category=ex_category)


                # Create the ExerciseNote object
                exerciseNote = ExerciseNote.objects.create(
                    exercise=exercise,
                    log=newLog,
                    content=ex_notes
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
                        "log": newLog,
                    }

                    Session.objects.create(**session_fields)

            return JsonResponse({
                "message": "Log saved successfully!"}, status=201)

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    

@csrf_exempt
def save_template(request):
    
    try:
        if request.method == 'POST':
            data = json.loads(request.body)
            user = request.user
            template_name = data.get("name")
            template_desc = data.get("desc", "")
            exercises = data.get("exercisesTemplate", [])

            newTemplate = LogTemplate.objects.create(
                user=user,
                name=template_name,
                desc=template_desc,
            )

            for ex in exercises:
                ex_name = ex.get("name")
                sessions = ex.get("sessions", [])

                newExercise = Exercise.objects.create(
                    name=ex_name,
                )

                newExerciseTemplate = ExerciseTemplate.objects.create(
                    log_template=newTemplate,
                    exercise=newExercise,
                )

                for s in sessions:
                    SessionTemplate.objects.create(
                        exercise_template=newExerciseTemplate,
                        bpm=s.get("bpm") or 0,
                        speed=s.get("speed") or 0,
                        desc=s.get("desc", ""), 
                    )
        return JsonResponse({"message": "Template saved successfully!"}, status=201)
                
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)