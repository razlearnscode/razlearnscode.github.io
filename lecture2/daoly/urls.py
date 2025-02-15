from django.urls import path
from . import views

app_name = "daoly"
urlpatterns = [
    path("", views.index, name="index"), 
    path("addQuote.html", views.add, name="addQuote")
]