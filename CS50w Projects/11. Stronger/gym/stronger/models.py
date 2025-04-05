from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import datetime
from django.utils import timezone

# Create your models here.
class User(AbstractUser):
    
    def serialize(self):
        return {
            "username": self.username,
            "id": self.id
        }


class Exercise(models.Model):

    # Let's have a separate Date, then can verify whether I can just get it from the Workout
    # Actually I think I can reference the date from the workout
    CATEGORIES = [
        ('RUN', 'run'),
        ('WALK', 'walk'),
        ('SWIM', 'swim'),
        ('INCLINE', 'incline'),
        ('CHEST', 'chest'),
        ('BACK', 'back'),
        ('SHOULDERS', 'shoulder'),
        ('ARMS', 'arms'),
        ('CORE', 'core'),
        ('LEGS', 'leg'),
        ('OTHERS', 'Others'),
    ]

    name = models.CharField(max_length=255)
    exercise_note = models.CharField(max_length=500, blank=True, null=True)
    category = models.CharField(max_length=64, choices=CATEGORIES, default='OTHERS', blank=True, null=True)


    def __str__(self):
        return f"Exercise: {self.name}"




class Set(models.Model): # the Set belongs to a specific Exercises (not directly to Workout)

    desc = models.CharField(max_length=255)
    weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True) # in kg
    duration = models.PositiveIntegerField(blank=True, null=True)  # in seconds
    reps = models.PositiveIntegerField(blank=True, null=True)
    completed_at = models.DateTimeField(auto_now_add=True)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='sets') # 1 exercises can have multiple sets. But the same set can only belong to 1 exercises

    def __str__(self):
        format_completed_date = self.completed_at.strftime("%d/%m/%Y") if self.completed_at else "Unknown Date"
        return f"Set: {self.desc} completed on {format_completed_date}"


class Workout(models.Model):
    
    name = models.CharField(max_length=255)
    desc = models.CharField(max_length=500)
    completed_at = models.DateTimeField(auto_now_add=True) # auto log the time when new workout is created
    
    # default=1 means that if no user is specified when creating a new record, Django to
    # automatically set it to the user with id=1 (which is the superuser admin)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workouts')

    # 1 workout can have multiple exercise
    # 1 exercise can be in multiple workout
    exercises = models.ManyToManyField(Exercise, related_name="workouts")
    
    def __str__(self):
        format_completed_date = self.completed_at.strftime("%d/%m/%Y") if self.completed_at else "Unknown Date"
        return f"{self.user} did {self.name} on {format_completed_date}"
    


# Since I'm creating this app for myself, let's make the workout template not exchangeable
# Therefore, it will be a one (User) to many (workout) relationship

class WorkoutTemplate(models.Model):

    # Note: Template is not the same as workout
    # Workout is the session the user performs on the date
    # Template is a preset structure that users can reuse
    # This way, whenever I change the workout, I have the option to change/or NOT the template
    
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='templates')
    desc = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True) # only add when the object is created
    last_updated = models.DateTimeField(auto_now=True)  # add when both the object is created or saved

    def __str__(self):
        return f"Template: {self.name}"
    
    def serialize(self):
        now = timezone.now()
        days_ago = (now - self.last_updated).days

        return {
            "id": self.id,
            "name": self.name,
            "desc": self.desc,
            "user_id": self.user.id,
            "created_at": self.created_at.isoformat(),
            "last_updated": self.last_updated.isoformat(),
            "days_since_updated": days_ago,
            "exercises": [exercise.serialize() for exercise in self.exercises_template.all()]
        }

    

class ExerciseTemplate(models.Model):

    # Rather than link this to the existing Exercise model
    # I need to create this template modal so that I can freely edit/move the template
    # without actually interfering/updating the actual exercises

    workout_template = models.ForeignKey(WorkoutTemplate, on_delete=models.CASCADE, related_name='exercises_template')
    
    # Link the template with the actual exercise, so I can reference its information
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='template_exercises')

    def __str__(self):
        return f"{self.exercise.name} in Template {self.workout_template.name}"
    
    def serialize(self):
        return {
            "exercise_id": self.exercise.id,
            "exercise_name": self.exercise.name,
            "sets": [set_template.serialize() for set_template in self.set_templates.all()]
    }
    


class SetTemplate(models.Model):
    
    # Template for individual sets within an exercise in a workout template.

    exercise_template = models.ForeignKey(ExerciseTemplate, on_delete=models.CASCADE, related_name='set_templates')
    desc = models.CharField(max_length=255, blank=True, null=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    duration = models.PositiveIntegerField(blank=True, null=True)
    reps = models.PositiveIntegerField(blank=True, null=True)

    def __str__(self):
        return f"SetTemplate for {self.exercise_template.exercise.name} (Reps: {self.reps}, Weight: {self.weight}, Duration: {self.duration})"
    
    def serialize(self):
        return {
            "desc": self.desc,
            "reps": self.reps,
            "weight": float(self.weight) if self.weight is not None else None,
            "duration": self.duration,
    }