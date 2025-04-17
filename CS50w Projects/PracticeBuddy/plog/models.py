from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.
class User(AbstractUser):
    
    def serialize(self):
        return {
            "username": self.username,
            "id": self.id
        }
    

# Can be practice exercise, drill, or even songs
class Exercise(models.Model):

    CATEGORIES = [
        ('SCALE', 'scale'),
        ('RHYTHM', 'rhythm'),
        ('JAM', 'jam'),
        ('SONG', 'song'),
        ('TECHNIQUES', 'techniques'),
        ('OTHERS', 'Others'),
    ]
    
    name = models.CharField(max_length=255)
    notes = models.CharField(max_length=500, blank=True, null=True)
    target = models.PositiveIntegerField(blank=True, null=True) # can be BPM, speed, etc. Keep it broad for now
    category = models.CharField(max_length=64, choices=CATEGORIES, default='OTHERS', blank=True, null=True)

    def __str__(self):
        return f"Exercise: {self.name} - #{self.id}"
    

# Each log entry
class Log(models.Model):

    name = models.CharField(max_length=255)
    desc = models.CharField(max_length=500, blank=True, null=True)
    notes = models.CharField(max_length=500, blank=True, null=True)
    duration = models.DurationField(blank=True, default=timedelta())
    entry_date = models.DateTimeField(default=timezone.now)
    score = models.PositiveIntegerField(
        blank=True, null=True,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ],
        help_text="Score between 1 (lowest) and 5 (highest)"
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="logs_of_user")

    # Link multiple logs to multiple exercises
    exercises_in_log = models.ManyToManyField(Exercise, related_name="logs")

    def __str__(self):
        return f"Entry {self.name} on {self.entry_date}"


class Session(models.Model):
    
    desc = models.CharField(max_length=255, blank=True, null=True) # similar concept to the Stronger app
    bpm = models.PositiveIntegerField(blank=True, null=True)
    # default to timedelta() --> default to zero if no value
    duration = models.DurationField(blank=True, default=timedelta()) # how long the person spends on this session
    practice_date = models.DateTimeField(default=timezone.now) # keep as timezone.now instead of auto_add in case the user wants to update a session in the past

    speed = models.PositiveIntegerField(
        blank=True,
        null=True,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(400)
        ],
        help_text="Speed as percentage, from 0% to 400%"
    )

    score = models.PositiveIntegerField(
        blank=True, null=True,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ],
        help_text="Score between 1 (lowest) and 5 (highest)"
    )

    # 1 session can be in 1 exercise, but 1 exercise can have multiple sessions
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='sessions')

    def __str__(self):
        formatted_date = self.practice_date.strftime("%d/%m/%Y") if self.practice_date else "Unknown Date"
        return f"{self.desc} - {self.bpm} - #{formatted_date}"
    

class LogTemplate(models.Model):

    name = models.CharField(max_length=255)
    desc = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="log_templates")

    def __str__(self):
        return f"Template: {self.name} - #{self.id}"
    
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

    log_template = models.ForeignKey(LogTemplate, on_delete=models.CASCADE, related_name='exercises_template')

    # Link the template with the actual exercise, so I can reference its information
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='template_exercises')

    def __str__(self):
        return f"{self.exercise.name} in Template {self.log_template.name} #{self.log_template.id}"
    
    def serialize(self):
        return {
            "exercise_id": self.exercise.id,
            "exercise_name": self.exercise.name,
            "exercise_cat": self.exercise.category.lower() if self.exercise.category else None, # convert to lowercase because my option value is all lowercase
            "sessions": [session.serialize() for session in self.session_templates.all()]
        }


class SessionTemplate(models.Model):

    exercise_template = models.ForeignKey(ExerciseTemplate, on_delete=models.CASCADE, related_name='session_templates')
    desc = models.CharField(max_length=255, blank=True, null=True) 
    bpm = models.PositiveIntegerField(blank=True, null=True)
    speed = models.PositiveIntegerField(
        blank=True,
        null=True,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(400)
        ],
        help_text="Speed as percentage, from 0% to 400%"
    )

    def __str__(self):
        return f"SessionTemplate for {self.exercise_template.exercise.name} - BPM: {self.bpm} - Speed: {self.speed}"
    
    def serialize(self):
        return {
            "id": self.id,
            "desc": self.desc,
            "bpm": self.bpm if self.bpm is not None else 0,
            "speed": int(100),
        }
