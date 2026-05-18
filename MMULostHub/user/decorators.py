#zinc add this file to handle the decorator for checking if user is reported or not
from django.shortcuts import redirect
from .models import Profile
from django.contrib import messages

def reverify_required(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            profile, _ = Profile.objects.get_or_create(user=request.user)
            if profile.need_reverify:
                messages.error(request, "Your account has been reported. Please verify your account again.")
                return redirect('profile')
        return view_func(request, *args, **kwargs)
    return wrapper