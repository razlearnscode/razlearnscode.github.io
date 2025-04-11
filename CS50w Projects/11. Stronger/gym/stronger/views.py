import json
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


from .models import User, Workout, Exercise, Set, WorkoutTemplate, ExerciseTemplate, SetTemplate

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

            newWorkout = Workout.objects.create(
                user=user, 
                name=workout, 
                desc=notes, 
            )

            for ex in exercises:
                ex_name = ex.get("name", "Unnamed")
                ex_type = ex.get('type', "")
                ex_notes = ex.get("notes", "")
                ex_category = ex.get("category", "OTHERS")
                sets = ex.get("sets", [])

                exercise = Exercise.objects.create(
                    name=ex_name,
                    exercise_note=ex_notes,
                    category=ex_category,
                    type=ex_type
                )

                newWorkout.exercises.add(exercise) # link the newly created exercise to the workout exercises attribute of the Workout object

                # Iterate through the sets list that I created above
                # start=1 so that the index starts at 1 instead of 0 ("Set 1", "Set 2")
                # Using enumerate, I can get both the index and the current value
                for index, set in enumerate(sets, start=1):
                    
                    set_fields = {
                        "desc": set.get("desc"),
                        "reps": set.get("reps"),
                        "exercise": exercise,
                    }

                    if ex_type == "weight":
                        set_fields["weight"] = set.get("value")
                    elif ex_type == "duration":
                        set_fields["duration"] = set.get("value")
                        
                    Set.objects.create(**set_fields) # this is equivalent to the code below, but you can pass value dynamically

            return JsonResponse({
                "message": "Workout saved successfully!"}, status=201)
    
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
            template_name = data.get("template")
            notes = data.get("notes", "")
            exercises = data.get("exercisesTemplate", [])
            
            newTemplate = WorkoutTemplate.objects.create(
                user=user,
                name=template_name,
                desc=notes,
            )

            for ex_data in exercises:
                ex_name = ex_data.get("name")
                ex_type = ex_data.get("type")
                ex_notes = ex_data.get("notes")
                ex_category = ex_data.get("category")
                sets = ex_data.get("sets", [])

                newExercise = Exercise.objects.create(
                    name=ex_name,
                    exercise_note=ex_notes,
                    category=ex_category,
                    type=ex_type
                )

                newExerciseTemplate = ExerciseTemplate.objects.create(
                    workout_template=newTemplate,
                    exercise = newExercise
                )

                for s in sets:
                    SetTemplate.objects.create(
                        exercise_template=newExerciseTemplate,
                        desc=s.get("desc", ""),
                        reps=s.get("reps") or 0,
                        weight=s.get("value") if ex_type == "weight" else None,
                        # Just in case:
                        # -- Use float to safely parse text to float (because you don't know if it's int or float), so float is safer
                        # -- Then, use int to parse float to int
                        duration=int(float(s.get("value"))) if ex_type == "duration" else None, 
                    )
            return JsonResponse({"message": "Template saved successfully!"}, status=201)

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    

def get_user(request):
    if request.method == 'GET':
        logged_in_user = request.user
        return JsonResponse(logged_in_user.serialize())
    

def get_templates(request, user_id):
    
    if request.method == 'GET':

        user = User.objects.get(pk=user_id)
        saved_templates = WorkoutTemplate.objects.filter(user=user).all()

        return JsonResponse([template.serialize() for template in saved_templates], safe=False)


def populate_workout_from_template(request, template_id):

    if request.method == 'GET':
        
        template = WorkoutTemplate.objects.get(pk=template_id)

        return JsonResponse(template.serialize(), safe=False)
    


def view_records(request):
    return render(request, "stronger/records.html")


def get_exercise_records(request, exercise_id):
    
    if request.method == 'GET':

        exercise = Exercise.objects.get(pk=exercise_id)

        # Get all unique completed_at dates for this exercise
        dates = (
            Set.objects
            .filter(exercise=exercise)
            .annotate(date_only=TruncDate('completed_at'))  # Create the temporary variable date_only to store only the date of the DateTimeField variable
            .values('date_only')
            .distinct()
        )

        # For each date, get the set with the max weight
        best_sets = []
        for entry in dates: # Find the corresponding set for each date
            date = entry['date_only']
            heaviest_set = (
                Set.objects
                .filter(exercise=exercise, completed_at__date=date) # ..[__date] is the special attribute in the DateTimeField get only the date of a timestamp in the Django db
                .order_by('-weight')  # highest weight first
                .first()  # take the top one
            )
            if heaviest_set:
                best_sets.append(heaviest_set)

        # Sort by completed date ascending (optional)
        best_sets.sort(key=lambda s: s.completed_at)

        # Group sets by date
    
        return JsonResponse([set.serialize() for set in best_sets], safe=False)


    # return JsonResponse({
    #     "all_posts": [post.serialize(request.user) for post in page_obj], # formating all posts as component of paginator page objects
    #     "num_pages": paginator.num_pages
    #     }
    #     , safe=False)