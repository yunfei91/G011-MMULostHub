from django.shortcuts import render, redirect # render = return HTML page ; redirect = jump to another URL
from django.http import JsonResponse # Return JSON data to frontend
from django.contrib.auth.models import User # Django built-in user model
from django.contrib.auth import authenticate, login, logout 
from django.contrib.auth.decorators import login_required # Only users who are logged in can access this page
from django.views.decorators.cache import never_cache # Prevent browser cache, user cannot press back to access previous page

from django.contrib import messages # Show messages system (success/error alerts)

# yunfee add to check other user's profile
# check if the user exists if not then 404
from django.shortcuts import get_object_or_404

from .services import create_user_account # Custom function for create user
from .models import Profile 
from items.models import Post
from report.models import UserReport #zinc add for report user

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from django.core.mail import EmailMultiAlternatives # Send email with HTML content
from django.template.loader import render_to_string # Convert HTML template to string (wording email)
from django.utils.html import strip_tags # Remove HTML tags to create plain text version of email
from django.conf import settings

import time # Handle timestamps
import random # Generate random OTP for email verification
import re # Regular expression for validation

def beginning(request):
    return render(request, 'user/beginning.html')

def user_login(request):
    if request.method == 'POST': # Form submitted
        email = (request.POST.get('email') or '').strip().lower() # Get email, remove spaces, lowercase
        password = request.POST.get('password') or '' # Use empty string to prevent error when value=None

        # Store error messages
        email_error = ""
        password_error = ""
        user_login_error = ""

        if not email:
            email_error = "Please enter your MMU email." # Empty email
        elif not (
            re.match(r'^[A-Za-z0-9._%+-]+@mmu\.edu\.my$',email)
            or
            re.match(r'^[A-Za-z0-9._%+-]+@student\.mmu\.edu\.my$',email)
        ):
            email_error = "Please enter a valid MMU email."

        if password and not password_error:
            try:
                validate_password(password)
            except ValidationError as e:
                password_error = e.messages[0]

        if password == email:
            password_error = "Password cannot be the same as email."

        if email_error or password_error:
            return render(request, 'user/user-login.html', { # Send errors back to login page
                'email_error': email_error,
                'password_error': password_error,
                'email': email,
            })
        
        user = authenticate(request, username=email, password=password) # Check user in db

        if user is None:
            user_login_error = "Invalid email or password"
            return render(request, 'user/user-login.html', {
                'user_login_error': user_login_error,
                'email': email,
            })

        login(request, user) # Login success, create session
        return redirect('mainPage')
    
    return render(request, 'user/user-login.html')

def forgot_pw(request):
    if request.method == 'POST':
        email = (request.POST.get('email') or '').strip().lower()

        if not email:
            return render(request, 'user/forgot-pw.html', {
                'error': "Please enter your email."
            })
        
        if not User.objects.filter(username=email).exists():
            return render(request, 'user/forgot-pw.html', {
                'error': "Email not registered"
            })

        otp = str(random.randint(100000, 999999))

        request.session['reset_data'] = { # Stor in session
            'email': email,
            'otp': otp,
            'otp_time': time.time()
        }

        send_otp_email(email, otp)

        return redirect('reset_otp_verify')

    return render(request, 'user/forgot-pw.html')

def reset_otp_verify(request):
    data = request.session.get('reset_data')

    if not data:
        return redirect('forgot_pw')
    
    now = time.time()

    resend_cooldown = 30
    resend_remaining = int(resend_cooldown - (now - data['otp_time']))
    resend_remaining = max(0, resend_remaining)

    otp_valid_seconds = 60
    otp_remaining = int(otp_valid_seconds - (now - data['otp_time']))
    otp_remaining = max(0, otp_remaining)

    context = {
        'otp_remaining': otp_remaining,
        'resend_remaining': resend_remaining,
        'can_resend': resend_remaining == 0,
        'expired': otp_remaining == 0
    }

    if request.method == 'POST':
        user_otp = request.POST.get('otp', '')

        if context['expired']:
            context['error'] = "OTP expired"
            return render(request, 'user/resetpw-otp.html', context)

        if user_otp != data['otp']:
            context['error'] = "Invalid OTP"
            return render(request, 'user/resetpw-otp.html', context)

        return redirect('reset_pw')

    return render(request, 'user/resetpw-otp.html', context)

def resend_reset_otp(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
    data = request.session.get('reset_data')

    if not data:
        return JsonResponse({'error': 'Session expired'}, status=400)
    
    now = time.time()
    
    if now - data['otp_time'] < 30:
        return JsonResponse({
            'error': 'Please wait before requesting a new OTP.'
        }, status=400)
    
    otp = str(random.randint(100000, 999999))

    data['otp'] = otp
    data['otp_time'] = now

    request.session['reset_data'] = data
    request.session.modified = True

    send_otp_email(data['email'], otp)

    return JsonResponse({'success': True})

def reset_pw(request):
    data = request.session.get('reset_data')

    if not data: # Must come from OTP page
        return redirect('forgot_pw')

    if request.method == 'POST':
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

        if not password:
            return render(request, 'user/reset-pw.html', {
                'error': "Please enter password"
            })

        if password != confirm_password:
            return render(request, 'user/reset-pw.html', {
                'error': "Passwords do not match"
            })

        user = User.objects.get(username=data['email'])
        user.set_password(password)
        user.save()

        request.session.pop('reset_data', None)

        return render(request, 'user/reset-pw.html', {
            'success': True
        })

    return render(request, 'user/reset-pw.html')

def admin_login(request):
    if request.method == 'POST':
        email = (request.POST.get('email') or '').strip().lower()
        password = request.POST.get('password') or ''

        admin_login_error = ""
        email_error = ""

        if not email:
            email_error = "Please enter admin email."
            return render(request, 'user/admin-login.html', {'email_error': email_error}) # Empty check

        user = authenticate(request, username=email, password=password)

        if user is None:
            admin_login_error = "Invalid email or password"
            return render(request, 'user/admin-login.html', {
                'admin_login_error': admin_login_error,
            })

        # Check admin permission
        if not user.is_staff: 
            admin_login_error = "You are not authorized as admin."
            return render(request, 'user/admin-login.html', {
                'admin_login_error': admin_login_error
            })

        login(request, user)
        return redirect('admin_mainpage') #zinc 

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
        elif not (
            re.match(r'^[A-Za-z0-9._%+-]+@mmu\.edu\.my$',email)
            or
            re.match(r'^[A-Za-z0-9._%+-]+@student\.mmu\.edu\.my$',email)
        ):
            email_error = "Please enter a valid MMU email."
        elif User.objects.filter(username=email).exists(): # Check email exists
            email_error = "MMU Email already registered."
    
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
        
        otp = str(random.randint(100000, 999999)) # generate 6-digit code

        request.session['register_data'] = { # Save temporary registration data
            'name': name,
            'email': email,
            'password': password,
            'otp': otp,
            'otp_time': time.time()
        }
        
        send_otp_email(email, otp) # Send OTP to user's email
        return redirect('verify_email')
    
    return render(request, 'user/register.html')

def send_otp_email(email, otp):

    html_content =render_to_string("email/otp_email.html", { # convert template to word
        "otp": otp, # Pass data into template
        "email": email
    })

    text_content = strip_tags(html_content) # Create plain text version by removing HTML tags

    email_msg = EmailMultiAlternatives( # Create email message
        subject = "MMU Lost Hub - Email Verification Code",
        body = text_content,
        from_email = settings.DEFAULT_FROM_EMAIL,
        to = [email]
    )

    email_msg.attach_alternative(html_content, "text/html") # Attach HTML version
    email_msg.send()

def check_name(request):
    name = (request.GET.get('name') or '').strip()
    exists = Profile.objects.filter(name=name).exists() # Check name exists

    return JsonResponse({'exists': exists}) # Return result to frontend

def check_email(request):
    email = (request.GET.get('email') or '').strip().lower()
    exists = User.objects.filter(username=email).exists()

    return JsonResponse({'exists': exists})

def verify_email(request):
    data = request.session.get('register_data') # Get session data

    if not data:
        return redirect('register')
    
    now = time.time()
    
    otp_valid_seconds = 60 # OTP valid 60s
    otp_remaining = int(otp_valid_seconds - (now - data['otp_time'])) # Calculate remaining time for OTP
    otp_remaining = max(0, otp_remaining) # Cannot be negative

    resend_cooldown = 30 # resend limit 30s
    resend_remaining = int(resend_cooldown - (now-data['otp_time'])) # Calculate resend wait time
    resend_remaining = max(0, resend_remaining)

    context = {
        'otp_remaining': otp_remaining,
        'resend_remaining': resend_remaining,
        'can_resend': resend_remaining == 0,
        'expired': otp_remaining == 0
    }

    if request.method == 'POST':
        user_otp = request.POST.get('otp', '')

        if context['expired']:
            context['error'] = "OTP expired"
            return render(request,'user/email-verify.html', context)
        
        if user_otp != data['otp']: # Wrong OTP
            context['error'] = "Invalid OTP"
            return render(request, 'user/email-verify.html', context)
        
        if User.objects.filter(username=data['email']).exists():
            context['error'] = "Account already exists"
            return render(request, 'user/email-verify.html', context)
        
        create_user_account( # create new user in db
            data['name'],
            data['email'],
            data['password']
        )

        request.session.pop('register_data', None) # Remove data

        return redirect('user_login')
    
    return render(request, 'user/email-verify.html', context)

def resend_otp(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request'}, status=400) # 400=error, bad request
    
    data = request.session.get('register_data')

    if not data:
        return JsonResponse({'error': 'Session expired'}, status=400)
    
    now = time.time()
    
    if now - data['otp_time'] < 30: # Check if 30 seconds have passed from last OTP generate, prevent spam
        return JsonResponse({
            'error': 'Please wait before requesting a new OTP.'
        }, status=400)
    
    otp = str(random.randint(100000, 999999))

    data['otp'] = otp # Update OTP + time
    data['otp_time'] = now

    request.session['register_data'] = data
    request.session.modified = True # force session save

    try:
        send_otp_email(data['email'], otp)
    except Exception as e: # Catch error
        print("EMAIL ERROR:", e) # Debug log
        return JsonResponse({'error': 'Failed to resend OTP'}, status=500)

    return JsonResponse({'success': True})

def user_logout(request):
    logout(request) # Django logout, clear login session and let user become anonymous user
    request.session.flush() # Completely clear session data

    response = redirect("beginning")
    # Prevent browser from storing page
    # no-store=don't store anything
    # no-cache=must recheck with server
    # force validation again
    # expire immediately
    response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0" 
    response["Pragma"] = "no-cache" # old http cache control
    response["Expires"] = "0" # set page as expired immediately

    return response # send final response to browser

@login_required(login_url='beginning')
@never_cache # Must login first
def update_name(request):
    if request.method == "POST":
        if request.user != request.user:
            return redirect('profile')

        name = (request.POST.get("name") or "").strip()

        if Profile.objects.filter(name=name).exclude(user=request.user).exists(): # Check duplicate name except self
            messages.error(request, "Name already taken.")
            return redirect('profile')

        request.user.first_name = name # Update Django User
        request.user.save()

        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.name = name # Update profile
        profile.save()
        
    return redirect('profile')

@login_required(login_url='beginning')
@never_cache
def profile(request, user_id=None): #zinc add if else

    if user_id:
        user = User.objects.get(id=user_id)
    else:
        user = request.user

    profile, created = Profile.objects.get_or_create(user=user)
    need_reverify = profile.need_reverify #zinc add reverify acc

    all_posts = Post.objects.filter(
        post_user=user
    ).order_by('-id')

    lost_posts = Post.objects.filter(
        post_user=user,
        post_type='lost'
    ).order_by('-id') # Newest first

    found_posts = Post.objects.filter(
        post_user=user,
        post_type='found'
    ).order_by('-id')

    #zinc add is_owner
    is_owner = (request.user == user)

    return render(request, 'user/profile.html', {
        'user': user,
        'profile': profile,
        'all_posts': all_posts,
        'lost_posts': lost_posts,
        'found_posts': found_posts,

        'is_owner': is_owner, #zinc add
        'need_reverify': need_reverify #zinc add
        #'is_owner': True # Own profile
    })

@login_required(login_url='beginning')
@never_cache
def update_bio(request):
    if request.method == 'POST':
        bio = request.POST.get('bio', '')

        profile, created = Profile.objects.get_or_create(user=request.user)
        profile.bio = bio # Update bio
        profile.save()

        return redirect('profile')

    return redirect('profile')

@login_required(login_url='beginning')
@never_cache
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


#zinc add def report_user 
@login_required
def report_user(request, user_id):
    reported_user = get_object_or_404(User, id=user_id)
    if request.method == "POST":
        comments = request.POST.get('comments')
        image = request.FILES.get('image')

        # prevent self report
        if request.user.id == reported_user.id:
            return redirect('profile')

        # create report
        UserReport.objects.create(
            user=reported_user,
            reported_by=request.user,
            comments=comments,
            image=image,
            status="Pending"
        )

        return redirect('userProfile', username=reported_user.username)
    return render(request,'report/reportuser.html', {
            'reported_user': reported_user
        })


@login_required(login_url='beginning')
@never_cache
# yunfee add to check other user's profile
def userProfile(request, username):
    user_obj = get_object_or_404(User, username=username)

    profile, created = Profile.objects.get_or_create(user=user_obj)

    all_posts = Post.objects.filter(
        post_user=user_obj
    ).order_by('-id')

    lost_posts = Post.objects.filter(
        post_user = user_obj,
        post_type = 'lost'
    ).order_by('-id')

    found_posts = Post.objects.filter(
        post_user = user_obj,
        post_type ='found'
    ).order_by('-id')

    return render(request, 'user/profile.html', {
        'user': user_obj,
        'profile': profile,
        'all_posts': all_posts,
        'lost_posts': lost_posts,
        'found_posts': found_posts,
        'is_owner': request.user == user_obj
    })

#zinc add def start_reverify 
@login_required
def start_reverify(request):

    otp = str(random.randint(100000, 999999))

    request.session['reverify_data'] = {

        'otp': otp,
        'otp_time': time.time(),

    }

    send_otp_email(
        request.user.email,
        otp
    )

    return redirect('reverify_otp')

#zinc add def reverify_otp
@login_required
def reverify_otp(request):

    data = request.session.get(
        'reverify_data'
    )

    if not data:
        return redirect('profile')

    now = time.time()
    otp_valid_seconds = 60
    otp_remaining = int(
        otp_valid_seconds - (
            now - data['otp_time']
        )
    )

    otp_remaining = max(0, otp_remaining)
    resend_cooldown = 30
    resend_remaining = int(
        resend_cooldown - (
            now - data['otp_time']
        )
    )

    resend_remaining = max(0, resend_remaining)

    context = {
        'otp_remaining': otp_remaining,
        'resend_remaining': resend_remaining,
        'can_resend': resend_remaining == 0,
        'expired': otp_remaining == 0
    }

    if request.method == 'POST':

        user_otp = request.POST.get(
            'otp',
            ''
        )

        if context['expired']:
            context['error'] = "OTP expired"

            return render(
                request,
                'user/email-verify.html',
                context
            )

        if user_otp != data['otp']:
            context['error'] = "Invalid OTP"

            return render(
                request,
                'user/email-verify.html',
                context
            )

        profile, _ = Profile.objects.get_or_create(
            user=request.user
        )

        profile.need_reverify = False
        profile.is_reverified = True
        profile.is_reported = True
        profile.save()

        # latest user report
        report = UserReport.objects.filter(
            user=request.user
        ).latest('created_at')
        
        report.status = "Verified"
        report.save()

        request.session.pop(
            'reverify_data',
            None
        )

        return redirect('mainPage')

    return render(
        request,
        'user/email-verify.html',
        context
    )

#zinc add def resend_reverify_otp
@login_required
def resend_reverify_otp(request):

    if request.method != "POST":

        return JsonResponse({
            'error': 'Invalid request'
        }, status=400)

    data = request.session.get(
        'reverify_data'
    )

    if not data:

        return JsonResponse({
            'error': 'Session expired'
        }, status=400)

    now = time.time()

    if now - data['otp_time'] < 30:

        return JsonResponse({
            'error':
            'Please wait before requesting a new OTP.'
        }, status=400)

    otp = str(random.randint(100000, 999999))
    data['otp'] = otp
    data['otp_time'] = now
    request.session['reverify_data'] = data
    request.session.modified = True

    send_otp_email(
        request.user.email,
        otp
    )

    return JsonResponse({
        'success': True
    })
