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

    # This doesn't mean you need to have a website page like www.mywebsite/place_bid/10, it simply means that you are taking 
    # the product_id from the website URL, and pass that in your call request to place_bid(request, product_id)
    path("place_bid/<int:product_id>", views.place_bid, name="add_bid"),
    path("comment/<int:product_id>", views.add_comment, name="add_comment"),

    # Watchlist Feature
    path("Watchlist", views.watchlist, name="watchlist_page"),
    path("add_to_watchlist/<int:product_id>", views.add_to_watchlist, name="add_watchlist"),
    path("remove_from_watchlist/<int:product_id>", views.remove_from_watchlist, name="remove_watchlist"),

    path("new_listing", views.new_listing, name="new_listing")
]