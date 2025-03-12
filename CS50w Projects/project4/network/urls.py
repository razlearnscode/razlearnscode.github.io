
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # Show all posts

    path('all_posts_2', views.all_posts_view_2, name="all_posts_2"),

    # API Routes
    path('posts/all_posts', views.all_posts_view, name="all_posts"), # show all post
    path("like_post/<int:post_id>", views.like_post, name="like_post"), # handle likes
    path("edit_post/<int:post_id>", views.edit_post, name="edit_post"), # handle edits
    
    # Submit post route
    path("post", views.compose_post, name="compose_post"),

    # Profile Page
    path("profile/<int:user_id", views.show_profile, name="profile_view")

]


