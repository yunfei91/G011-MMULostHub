from django.urls import path
from . import views

urlpatterns = [
    path('', views.mainPage, name='mainPage'),
    path('createpost/', views.createPost, name='createPost'),
    path('editpost/<int:post_id>/', views.editPost, name='editPost'),       # editpost/（show edit post's id)
    path('deletepost/<int:post_id>/', views.deletePost, name = 'deletePost'),   # deletepost/（show delete post's id)
]