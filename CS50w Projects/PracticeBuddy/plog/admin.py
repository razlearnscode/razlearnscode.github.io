from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(User)
admin.site.register(Log)
admin.site.register(Exercise)
admin.site.register(Session)
admin.site.register(LogTemplate)
admin.site.register(ExerciseTemplate)
admin.site.register(SessionTemplate)
admin.site.register(ExerciseNote)