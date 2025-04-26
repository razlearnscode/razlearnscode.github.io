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
    
def get_best_session(sessions_queryset):
    return sessions_queryset.order_by('-speed', '-bpm', '-score').first()

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
    target = models.PositiveIntegerField(blank=True, null=True) # can be BPM, speed, etc. Keep it broad for now
    category = models.CharField(max_length=64, choices=CATEGORIES, default='OTHERS', blank=True, null=True)

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="exercises_of_user")

    def __str__(self):
        return f"Exercise: {self.name} - #{self.id}"
    

    def serialize(self):

        # Group session by logs for data visualization
        logs = self.logs.all().order_by("-entry_date")

        sessions_grouped_by_log = []

        for log in logs:
            #Filter only sessions of this exercise in this log
            sessions = log.sessions.filter(exercise=self)

            # Get best session
            best_session = get_best_session(sessions)

            exercise_note = log.exercise_notes.filter(exercise=self).first()

            # append the log only if it has sessions, else abort and move to the the next log
            if not sessions.exists():
                continue # Skip logs where this exercise has no sessions
            
            sessions_grouped_by_log.append({
                "log_id": log.id,
                "log_name": log.name,
                "entry_date": log.entry_date,
                "exercise_notes": exercise_note.content if exercise_note else None,
                "sessions": [session.serialize() for session in sessions],
                "best_session": best_session.serialize() if best_session else None
            })

        return {
            "exercise_id": self.id,
            "exercise_name": self.name,
            "exercise_cat": self.category.lower() if self.category else None, # convert to lowercase because my option value is all lowercase
            "sessions_by_log": sessions_grouped_by_log
        }
    

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

    template = models.ForeignKey(LogTemplate,on_delete=models.SET_NULL,
                                 null=True, blank=True, related_name="logs_created_from_template",
                                 help_text="Optional. Reference to the template used to create this log")

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="logs_of_user")

    # Link multiple logs to multiple exercises
    exercises_in_log = models.ManyToManyField(Exercise, related_name="logs")

    def __str__(self):
        return f"#{self.id} - {self.name} - {self.entry_date}"
    
    def serialize(self):

        return {
            "id": self.id,
            "name": self.name,
            "notes": self.notes,
            "user_id": self.user.id,
            "entry_date": self.entry_date.isoformat(),
            "log_template_id": self.template.id,
            "exercises": [exercise.serialize() for exercise in self.exercises_in_log.all()]
        }


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
    log = models.ForeignKey(Log, on_delete=models.CASCADE, related_name="sessions", null=True, blank=True)


    def __str__(self):
        formatted_date = self.practice_date.strftime("%d/%m/%Y") if self.practice_date else "Unknown Date"
        return f"{self.exercise.name} - BPM: {self.bpm} - Speed: {self.speed} - Dur: {self.duration} - #{formatted_date}"
    
    def serialize(self):
        formatted_date = self.practice_date.strftime("%d/%m/%Y") if self.practice_date else "Unknown Date"
        
        return {
            "id": self.id,
            "bpm": self.bpm,
            "speed": self.speed,
            "score": self.score,
            "session_date": formatted_date,
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
    

class ExerciseNote(models.Model):

    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name="notes")
    log = models.ForeignKey(Log, on_delete=models.CASCADE, related_name="exercise_notes")
    content = models.TextField(blank=True)
    pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-pinned', '-created_at'] # Pinned and latest notes come first

    def pinned_note(self):
        return self.notes.filter(pinned=True).first()

    def __str__(self):
        return f"Note for {self.exercise.name} dated {self.created_at}"
    
    def serialize(self):
        formatted_date = self.created_at.strftime("%d/%m/%Y") if self.created_at else "Unknown Date"
        return {
            "id": self.id,
            "content": self.content,
            "entry_date": formatted_date,
        }
    
    