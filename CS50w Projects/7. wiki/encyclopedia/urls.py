from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"), 
    path("wiki/<str:entry_name>", views.entry_page, name="entry_page"),
    path("search", views.search, name="search_result"),
    path("create_entry", views.create_entry, name="create_entry"),
    path('edit_entry', views.edit_entry, name="edit_page"),
    path('save_edit', views.save_edit, name="save_edit"),
    path('random', views.random_entry, name="randomize")
]
