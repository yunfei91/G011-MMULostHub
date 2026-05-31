from django.urls import path
from . import views

urlpatterns = [

    # yf urls in item app
    path('', views.mainPage, name='mainPage'),
    path('createpost/', views.createPost, name='createPost'),
    path('editpost/<int:post_id>/', views.editPost, name='editPost'),       #editpost/（show edit post id)
    path('deletepost/<int:post_id>/', views.deletePost, name = 'deletePost'),
    path('mapsearch/', views.map_search, name = 'mapSearch'),

    # yt urls in item app
    path('lost-posts/', views.lost_posts, name='lost_posts'),
    path('found-posts/', views.found_posts, name='found_posts'),

]