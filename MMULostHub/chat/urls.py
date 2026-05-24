from django.urls import path
from . import views

urlpatterns = [
    path('', views.inbox, name='chat_inbox'),
    path('start/<str:username>/', views.start_chat, name='start_chat'),
    path('room/<int:room_id>/', views.chat_room, name='chat_room'),
]