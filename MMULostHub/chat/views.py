import os

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q
from django.urls import reverse

from .models import ChatRoom, Message
from user.models import Profile

# Create your views here.
@login_required
def inbox(request):

    rooms = ChatRoom.objects.filter(
        Q(user1=request.user) | Q(user2=request.user),
        messages__isnull=False
    ).distinct()

    room_data = []

    for room in rooms:

        if room.user1 == request.user:
            other_user = room.user2
        else:
            other_user = room.user1

        last_message = Message.objects.filter(
            room=room
        ).order_by('-created_at').first()

        my_last_message = Message.objects.filter(
            room=room,
            sender=request.user
        ).order_by('-created_at').first()

        if my_last_message:
            unread_count = Message.objects.filter(
                room=room,
                sender=other_user,
                is_read=False,
            ).count()
        else:
            unread_count = Message.objects.filter(
                room=room,
                sender=other_user
            ).count()

        room_data.append({
            'room': room,
            'other_user': other_user,
            'last_message': last_message,
            'unread_count': unread_count,
            'last_time': last_message.created_at
        })

    room_data.sort(
        key=lambda item: item['last_message'].created_at,
        reverse=True
    )

    return render(request, 'chat/inbox.html', {
        'room_data': room_data
    })

@login_required
def start_chat(request, username):

    profile, _ = Profile.objects.get_or_create(user=request.user) # Create profile if not exist

    if profile.need_reverify:
        return redirect('profile')

    other_user = get_object_or_404(User, username=username)

    if other_user == request.user:
        return redirect('chat_inbox')
    
    room = ChatRoom.objects.filter(Q(user1=request.user, user2=other_user) | Q(user1=other_user, user2=request.user)).first()

    if not room:
        room = ChatRoom.objects.create(user1=request.user, user2=other_user)

    next_url = request.GET.get('next', '')

    if next_url:
        return redirect(f"{reverse('chat_room', kwargs={'room_id': room.id})}?next={next_url}")


    return redirect('chat_room', room_id=room.id)

@login_required
def chat_room(request, room_id):

    profile, _ =Profile.objects.get_or_create(user=request.user) # Create profile if not exist

    if profile.need_reverify:
        return redirect('profile')

    room = get_object_or_404(ChatRoom, id=room_id)

    if request.user != room.user1 and request.user != room.user2:
        return redirect('chat_inbox')
    
    next_url = request.GET.get('next', '')
    
    if request.method == 'POST':
        content = request.POST.get('content')
        uploaded_file = request.FILES.get('file')

        message_type = 'text'

        if uploaded_file:
            file_name = uploaded_file.name.lower()
            extension  = os.path.splitext(file_name)[1]

            if extension in ['.jpg', '.jpeg', '.png', '.gif']:
                message_type = 'image'

            elif extension in ['.mp3', '.wav', '.m4a']:
                message_type = 'audio'

            elif extension in ['.pdf', '.docx']:
                message_type = 'file'

            else:
                message_type = 'file'

        if content or uploaded_file:
            Message.objects.create(
                room=room,
                sender=request.user,
                content=content,
                message_type=message_type,
                file=uploaded_file
            )

        if next_url:
            return redirect(f"{reverse('chat_room', kwargs={'room_id': room.id})}?next={next_url}")

        return redirect('chat_room', room_id=room.id)
    
    Message.objects.filter(
        room=room
    ).exclude(
        sender=request.user
    ).update(
        is_read=True
    ) 
    
    messages = Message.objects.filter(room=room).order_by('created_at')

    if room.user1 == request.user:
        other_user = room.user2
    else:
        other_user = room.user1

    return render(request, 'chat/room.html', {
        'room': room,
        'messages': messages,
        'other_user': other_user,
        'next_url': next_url,
    })