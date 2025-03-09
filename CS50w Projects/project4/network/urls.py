
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # Show all posts
    path('all_posts', views.all_posts_view, name="all_posts"),

    # Submit post route
    path("post", views.compose_post, name="compose_post"),

    # Social actions
    path("like_post/<int:post_id>", views.like_post, name="like_post")

]
