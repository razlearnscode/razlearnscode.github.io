from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    pass

# Since I'm creating this app for myself, let's make the workout template not exchangeable
# Therefore, it will be a one (User) to many (workout) relationship


class Workout(models.Model):

    WO_STATE_OPTIONS = [
        ('NOT STARTED', 'Not Started' ),
        ('COMPLETED', 'Completed'),
    ]
    
    name = models.CharField(max_length=255)
    desc = models.CharField(max_length=500)
    date = models.DateTimeField(auto_now_add=True) # auto log the time when new workout is created
    status = models.CharField(max_length=64, choices=WO_STATE_OPTIONS, default='NOT STARTED')
    
    # default=1 means that if no user is specified when creating a new record, Django to
    # automatically set it to the user with id=1 (which is the superuser admin)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workouts')

    
    def __str__(self):
        return f"{self.user} did {self.name} on {self.date}"
    

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
    note = models.CharField(max_length=500, blank=True, null=True)
    category = models.CharField(max_length=64, choices=CATEGORIES, default='OTHERS', blank=True, null=True)

    # 1 workout can have multiple exercise
    # 1 exercise can be in multiple workout
    workout = models.ManyToManyField(Workout, related_name="exercises_included")

    def __str__(self):
        return self.name


    # Other information I can get from the Set model
    #   date of the workout
    #   number of sets
    #   previous record
    #   personal record
    
class Set(models.Model): # the Set belongs to a specific Exercises (not directly to Workout)

    STATUS = [
        ('NOT STARTED', 'Not Started'),
        ('COMPLETED', 'Completed'),
        ('INCOMPLETED', 'Incompleted'),
    ]

    name = models.CharField(max_length=255)
    weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True) # in kg
    duration = models.PositiveIntegerField(blank=True, null=True)  # in seconds
    status = models.CharField(max_length=64, choices=STATUS, default='NOT STARTED', blank=True, null=True) # blank = true because some set may not be assigned at all
    reps = models.PositiveIntegerField(blank=True, null=True)
    session = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='sets') # 1 exercises can have multiple sets. But the same set can only belong to 1 exercises

    def __str__(self):
        return f"Set: {self.name} status: ({self.status})"

