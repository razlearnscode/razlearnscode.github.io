from django.urls import path
from django.contrib import admin

from . import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("ActiveListing/<int:product_id>", views.listing_page, name="listing_page"),
    path("place_bid/<int:product_id>", views.place_bid, name="add_bid")
]