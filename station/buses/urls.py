from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),

    # Here, I take the input as bus_id, then I send it to views.buses
    path("<int:bus_id>", views.buses, name="bus"),

    path("<int:bus_id>/book", views.book, name="book")
]