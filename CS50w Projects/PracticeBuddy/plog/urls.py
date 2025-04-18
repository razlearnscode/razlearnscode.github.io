from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Endpoints
    path("user", views.get_user, name="get_user"),
    path("save_log", views.save_log, name="save_log"), # save new log 
    path("templates/<int:userID>", views.get_templates, name="get_templates"),
    path("save_template", views.save_template, name="save_template"),
]