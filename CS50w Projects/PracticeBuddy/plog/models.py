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
    
    desc = models.CharField(max_length=255) # similar concept to the Stronger app
    bpm = models.PositiveIntegerField(blank=True, null=True)
    # default to timedelta() --> default to zero if no value
    duration = models.DurationField(blank=True, default=timedelta()) # how long the person spends on this session
    practice_date = models.DateTimeField(default=timezone.now) # keep as timezone.now instead of auto_add in case the user wants to update a set in the past

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
    