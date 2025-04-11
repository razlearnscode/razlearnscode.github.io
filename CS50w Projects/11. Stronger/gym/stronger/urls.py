from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Endpoints
    path("user", views.get_user, name="get_user"),
    path("templates/<int:user_id>", views.get_templates, name="get_templates"), # get all templates from the user
    path("records", views.view_records, name="view_records"),
    path("records/<int:exercise_id>", views.get_exercise_records, name="get_exercise_records"),
    path("save_workout", views.save_workout, name="save_workout"), # save workout
    path("save_template", views.save_template, name="save_template"), # save workout
    path("start_workout/<int:template_id>", views.populate_workout_from_template, name="populate_workout_from_template"),
]