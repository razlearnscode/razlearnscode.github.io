from django.contrib import admin
from .models import Buses, MRTStation, Passengers

# Register your models here.
admin.site.register(MRTStation)
admin.site.register(Buses)
admin.site.register(Passengers)