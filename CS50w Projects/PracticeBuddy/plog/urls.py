from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("records", views.records_view, name="records"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Endpoints
    path("user", views.get_user, name="get_user"),
    path("save_log", views.save_log, name="save_log"), # save new log
    path("log/<int:logID>", views.get_log_data, name="get_log_data"),  # lets update the URL to make it unique by user later, but for now, i'll just rely on the logID
    path("user/<int:userID>/exercises", views.get_all_exercises_fr_users, name="get_all_exercises_fr_users"),
    path("user/<int:userID>/templates", views.get_templates, name="get_templates"),
    path("exercise/<int:exerciseID>", views.get_exercise_data, name="get_exercise_data"),
    path("template/<int:templateID>", views.get_template_data, name="get_template_data"),
    path("template/<int:templateID>/delete", views.delete_template, name="delete_template"),
    path("save_template", views.save_template, name="save_template"),
]