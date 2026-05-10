from django.urls import path
from . import views

urlpatterns = [
    path('', views.mainPage, name='mainPage'),
    path('createpost/', views.createPost, name='createPost'),
    path('editpost/<int:post_id>/', views.editPost, name='editPost'),       #editpost/（show edit post id)
    path('deletepost/<int:post_id>/', views.deletePost, name = 'deletePost'),

    # yt added for lost and found posts page
    path('lost-posts/', views.lost_posts, name='lost_posts'),
    path('found-posts/', views.found_posts, name='found_posts'),

]