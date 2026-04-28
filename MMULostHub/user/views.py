from django.shortcuts import render, redirect # render = return HTML page ; redirect = jump to another URL
from django.http import JsonResponse # Return JSON data to frontend
from django.contrib.auth.models import User
from .services import create_user_account
from django.contrib.auth import authenticate, login, logout
import re # Regular expression for validation
from .models import Profile

def beginning(request):
    return render(request, 'user/beginning.html')

def user_login(request):
    if request.method == 'POST':
        email = (request.POST.get('email') or '').strip().lower() # Get email, remove spaces, lowercase
        password = request.POST.get('password') or ''

        # Store error messages
        email_error = ""
        password_error = ""
        user_login_error = ""

        if not email:
            email_error = "Please enter your MMU email." # Empty check
        elif not (
            re.match(r'^[A-Za-z0-9._%+-]+@mmu\.edu\.my$',email)
            or
            re.match(r'^[A-Za-z0-9._%+-]+@student\.mmu\.edu\.my$',email)
        ):
            email_error = "Please enter a valid email."

        if not password:
            password_error = "Please enter your password." # Empty check

        if email_error or password_error:
            return render(request, 'user/user-login.html', {
                'email_error': email_error,
                'password_error': password_error,
                'email': email,
            })
        
        user = authenticate(request, username=email, password=password) # Check login info

        if user is None:
            user_login_error = "Invalid email"
            return render(request, 'user/user-login.html', {
                'user_login_error': user_login_error,
                'email': email,
            })

        login(request, user)
        return redirect('mainPage')
    
    return render(request, 'user/user-login.html')

def admin_login(request):
    if request.method == 'POST':
        email = (request.POST.get('email') or '').strip().lower()
        password = request.POST.get('password') or ''

        login_error = ""
        email_error = ""

        if not email:
            email_error = "Please enter your email."
            return render(request, 'user/admin-login.html', {'email_error': email_error}) # Empty check
        elif not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            email_error = "Please enter a valid email."
            return render(request, 'user/admin-login.html', {'email_error': email_error})

        user = authenticate(request, username=email, password=password)

        if user is None:
            login_error = "Invalid email"
            return render(request, 'user/admin-login.html', {
                'admin_login_error': login_error,
            })

        # Check admin permission
        if not user.is_staff:
            login_error = "You are not authorized as admin."
            return render(request, 'user/admin-login.html', {
                'login_error': login_error
            })

        login(request, user)
        return redirect('mainPage')

    return render(request, 'user/admin-login.html')

def register(request):
    # Handle form submission
    if request.method == 'POST':
        name = request.POST.get('name','').strip()
        email = (request.POST.get('email') or '').strip().lower()
        password = request.POST.get('password','')
        confirm_password = request.POST.get('confirm_password','')

        name_error = ""
        email_error = ""
        password_error = ""
        confirm_password_error = ""

        if not name:
            name_error = "Please enter your name."
        elif Profile.objects.filter(name=name).exists(): # Check duplicate name
            name_error = "Name already taken."

        if not email:
            email_error = "Please enter your email."
        elif not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            email_error = "Please enter a valid email."
        elif User.objects.filter(username=email).exists(): # Check email exists
            email_error = "Email already registered."
    
        if not password:
            password_error = "Please enter a password."
        
        if not confirm_password:
            confirm_password_error = "Please confirm your password."
        elif password != confirm_password:
            confirm_password_error = "Passwords do not match."

        if name_error or email_error or password_error or confirm_password_error:
            return render(request, 'user/register.html', {
                'name_error': name_error,
                'email_error': email_error,
                'password_error': password_error,
                'confirm_password_error': confirm_password_error,
                'name': name,
                'email': email,
                'confirm_password': confirm_password,
            })
        
        user = create_user_account(name, email, password) # Call custom function    
        return redirect('user-login')
    
    return render(request, 'user/register.html')

def check_name(request):
    name = (request.GET.get('name') or '').strip()
    exists = Profile.objects.filter(name=name).exists() # Check name exists

    return JsonResponse({'exists': exists}) # Return result to frontend

def check_email(request):
    email = (request.GET.get('email') or '').strip().lower()
    exists = User.objects.filter(username=email).exists()

    return JsonResponse({'exists': exists})

from django.contrib.auth.decorators import login_required
from django.contrib import messages
from items.models import Post
@login_required # Must login first
def update_name(request):
    if request.method == "POST":
        name = request.POST.get("name").strip()

        if Profile.objects.filter(name=name).exclude(user=request.user).exists(): # Check duplicate name except self
            messages.error(request, "Name already taken.")
            return redirect('profile')

        request.user.first_name = name # Update Django User
        request.user.save()

        profile = request.user.profile
        profile.name = name # Update profile
        profile.save()
        
    return redirect('profile')

def profile(request):

    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)

    lost_posts = Post.objects.filter(
        post_user=user,
        post_type='lost'
    ).order_by('-id')

    found_posts = Post.objects.filter(
        post_user=user,
        post_type='found'
    ).order_by('-id')

    return render(request, 'user/profile.html', {
        'user': user,
        'profile': profile,
        'lost_posts': lost_posts,
        'found_posts': found_posts
    })

def update_bio(request):
    if request.method == 'POST':
        bio = request.POST.get('bio', '')

        profile, created = Profile.objects.get_or_create(user=request.user)
        profile.bio = bio # Update bio
        profile.save()

        return redirect('profile')

    return redirect('profile')

def update_avatar(request):
    print("FILES:", request.FILES)

    if request.method == 'POST':
        avatar = request.FILES.get('avatar') # Get uploaded image

        if avatar:
            profile, created = Profile.objects.get_or_create(user=request.user)

            # Delete old avatar
            if profile.avatar:
                profile.avatar.delete(save=False)

            # Save new avatar
            profile.avatar = avatar
            profile.save()

    return redirect('profile')