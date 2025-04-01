from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(User)
admin.site.register(Workout)
admin.site.register(Exercise)
admin.site.register(Set)
admin.site.register(WorkoutTemplate)
admin.site.register(ExerciseTemplate)
admin.site.register(SetTemplate)