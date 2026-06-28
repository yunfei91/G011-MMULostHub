from django.shortcuts import render, redirect # render = return HTML page ; redirect = jump to another URL
from django.http import JsonResponse # Return JSON data to frontend
from django.contrib.auth.models import User # Django built-in user model
from django.contrib.auth import authenticate, login, logout 
from django.contrib.auth.decorators import login_required # Only users who are logged in can access this page
from django.views.decorators.cache import never_cache # Prevent browser cache, user cannot press back to access previous page

from django.contrib import messages # Show messages system (success/error alerts)
from django.core.paginator import Paginator

# yunfee add to check other user's profile
# check if the user exists if not then 404
from django.shortcuts import get_object_or_404

# yf added to connect supabase (real server)
from utils.supabase import upload_to_supabase

from .services import create_user_account # Custom function for create user
from .models import Profile 
from items.models import Post
from report.models import UserReport #zinc add for user report
from .decorators import reverify_required #zinc add for reverify decorator  

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

# ======================================================
#                   User Login
# ======================================================
def user_login(request):
    if request.method == 'POST': # Form submitted
        # Get email, if no email will use empty '' , remove spaces, lowercase
        email = (request.POST.get('email') or '').strip().lower()
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

        # Validate password using Django password validators
        if password and not password_error:
            try:
                # Check password against Django validation rules
                validate_password(password)
            except ValidationError as e:
                # Store the first validation error message
                password_error = e.messages[0]

        # Prevent password from being the same as email
        if password == email:
            password_error = "Password cannot be the same as email."

        if email_error or password_error:
            return render(request, 'user/user-login.html', { # Send errors back to login page
                'email_error': email_error,
                'password_error': password_error,
                'email': email,
            })
        
        user = authenticate(request, username=email, password=password) # Check user in db exist or not

        if user is None:
            user_login_error = "Wrong password"
            return render(request, 'user/user-login.html', {
                'user_login_error': user_login_error,
                'email': email,
            })

        login(request, user) # Create user session after successful login
        return redirect('mainPage')
    
    return render(request, 'user/user-login.html')

# ======================================================
#                   Forgot pw
# ======================================================
def forgot_pw(request):
    email = "" # Initialize email variable

    # Process form submission
    if request.method == 'POST':
        email = (request.POST.get('email') or '').strip().lower()

        if not email:
            return render(request, 'user/forgot-pw.html', {
                'error': "Please enter your MMU email.",
                'email': email,
            })
        
        if not (
            re.match(r'^[A-Za-z0-9._%+-]+@mmu\.edu\.my$',email)
            or
            re.match(r'^[A-Za-z0-9._%+-]+@student\.mmu\.edu\.my$',email)
        ):
            return render(request, 'user/forgot-pw.html', {
                'error': "Please enter a valid MMU email",
                'email': email,
            })
        
        # Check whether the email is registered
        if not User.objects.filter(username=email).exists():
            return render(request, 'user/forgot-pw.html', {
                'error': "MMU email not registered",
                'email': email,
            })
        
        # Generate a 6-digit OTP
        otp = str(random.randint(100000, 999999))

        # Store password reset information in session
        request.session['reset_data'] = {
            'email': email,
            'otp': otp,
            'otp_time': time.time()
        }

        send_otp_email(email, otp) # Send OTP to the user's email

        return redirect('reset_otp_verify')

    return render(request, 'user/forgot-pw.html', {
        'email': email
    })

def reset_otp_verify(request):
    # Search reset information from session
    data = request.session.get('reset_data')

    # Redirect if reset session does not exist
    if not data:
        return redirect('forgot_pw')
    
    now = time.time()

    # OTP resend cooldown in 30 seconds
    resend_cooldown = 30
    # Calculate remaining resend cooldown time
    resend_remaining = int(resend_cooldown - (now - data['otp_time']))
    # Prevent negative countdown values
    resend_remaining = max(0, resend_remaining)

    # OTP validity period in 60 seconds
    otp_valid_seconds = 60
    # Calculate remaining OTP validity time
    otp_remaining = int(otp_valid_seconds - (now - data['otp_time']))
    otp_remaining = max(0, otp_remaining)

    context = {
        'otp_remaining': otp_remaining,
        'resend_remaining': resend_remaining,
        # Allow OTP resend when cooldown ends
        'can_resend': resend_remaining == 0,
        # Check whether OTP has expired
        'expired': otp_remaining == 0
    }

    if request.method == 'POST':
        # Get OTP entered by the user
        user_otp = request.POST.get('otp', '')

        # Reject expired OTP
        if context['expired']:
            context['error'] = "OTP expired"
            return render(request, 'user/resetpw-otp.html', context)

        # Check if user entered OTP matches the stored system OTP
        if user_otp != data['otp']:
            context['error'] = "Invalid OTP"
            return render(request, 'user/resetpw-otp.html', context)

        return redirect('reset_pw')

    return render(request, 'user/resetpw-otp.html', context)

# Handle OTP resend request via AJAX
def resend_reset_otp(request):
    if request.method != "POST":
        # Return error response for invalid request method
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
    data = request.session.get('reset_data')

    # Check if session exists
    if not data:
        # Return error if reset session has expired
        return JsonResponse({'error': 'Session expired'}, status=400)
    
    now = time.time()
    
    # Enforce OTP resend cooldown (30 seconds)
    if now - data['otp_time'] < 30:
        return JsonResponse({
            'error': 'Please wait before requesting a new OTP.'
        }, status=400)
    
    # Generate a new 6-digit OTP
    otp = str(random.randint(100000, 999999))

    # Update OTP and timestamp in session, let old OTP invalid
    data['otp'] = otp
    data['otp_time'] = now

    # Save updated OTP data back to session
    request.session['reset_data'] = data
    request.session.modified = True

    # Send new OTP to user's email
    send_otp_email(data['email'], otp)

    return JsonResponse({'success': True})

def reset_pw(request):
    data = request.session.get('reset_data')

    if not data: # Must come from OTP page URL , flow by flow
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

        # Get user from database using email
        user = User.objects.get(username=data['email'])
        # Hash and set the new password securely
        user.set_password(password)
        user.save()

        # Clear reset session data after successful password reset
        request.session.pop('reset_data', None)

        messages.success(request, "Password reset successful!")
        
        return redirect('user_login')

    return render(request, 'user/reset-pw.html')

# ======================================================
#                   Admin Login
# ======================================================
def admin_login(request):
    # Store error message and email input transfer to page
    error_message = ""
    email = ""

    if request.method == 'POST':
        email = (request.POST.get('email') or '').strip().lower()
        password = request.POST.get('password') or ''

        # Validate required fields
        if not email or not password:
            error_message = "Please fill in all fields"
        else:
            # Check db the user exist or not , password correct or not
            user = authenticate(request, username=email, password=password)

            # Check email or password if authentication failed
            if user is None:
                error_message = "Invalid admin credentials"
            # Check the email is admin or not
            elif not user.is_staff:
                error_message = "You are not authorized as admin."
            else:
                login(request, user)
                return redirect('admin_mainpage')

    return render(request, 'user/admin-login.html', {
        'error_message': error_message,
        'email': email
    })

# ======================================================
#                   Register
# ======================================================
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

        # Show error if name is empty
        if not name:
            name_error = "Please enter your name."
        # Check duplicate name , if name already exists in Profile
        elif Profile.objects.filter(name=name).exists(): 
            name_error = "Name already taken."

        if not email:
            email_error = "Please enter your MMU email."
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

        # Return form with validation errors if any exist
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

def check_name(request):
    name = (request.GET.get('name') or '').strip()
    exists = Profile.objects.filter(name=name).exists() # Check name exists

    return JsonResponse({'exists': exists}) # Return result to frontend

def check_email(request):
    email = (request.GET.get('email') or '').strip().lower()
    exists = User.objects.filter(username=email).exists()

    return JsonResponse({'exists': exists})

# ======================================================
#                  Email Verification
# ======================================================
import resend
from django.conf import settings
from django.template.loader import render_to_string

def send_otp_email(email, otp):
    resend.api_key = settings.RESEND_API_KEY

    html = render_to_string(
        "email/otp_email.html",
        {"otp": otp}
    )

    response = resend.Emails.send({
        "from": "MMU LostHub <admin@mmulosthub.me>",
        "to": [email],
        "subject": "Your OTP Code",
        "html": html,
    })

    print("Resend response:", response)
    return response

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
    
    messages.success(request, "Registration successful!")
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

# ======================================================
#                   Logout
# ======================================================
def user_logout(request):
    logout(request) # Django logout, clear login session and let user become anonymous user
    request.session.flush() # Completely clear session data

    messages.success(request, "logout_success")

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

# ======================================================
#                   Profile
# ======================================================
@login_required(login_url='beginning')
@never_cache # Must login first
def update_name(request):
    if request.method == "POST":
        if request.user != request.user:
            return redirect('profile')

        name = (request.POST.get("name") or "").strip()

        # empty name
        if not name:
            messages.error(request, "Name cannot be empty.")
            return redirect('profile')
        
        # Check for duplicate name excluding current user
        if Profile.objects.filter(name=name).exclude(user=request.user).exists(): # Check duplicate name except self
            messages.error(request, "Name already taken.")
            return redirect('profile')

        request.user.first_name = name # Update Django User
        request.user.save()

        # Update or create user profile and save name
        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.name = name # Update profile
        profile.save()
        
    messages.success(request, "Name updated successfully!")

    return redirect('profile')

@login_required(login_url='beginning')
@never_cache
def profile(request, user_id=None): #zinc add if else

    # Determine whether to display another user's profile
    if user_id:
        user = User.objects.get(id=user_id)
    else:
        user = request.user

    # Create user profile , make sure profile exists
    profile, created = Profile.objects.get_or_create(user=user)
    need_reverify = profile.need_reverify #zinc add reverify acc

    # Get all posts created by the user (latest first)
    posts = Post.objects.filter(post_user=user).order_by('-id')

    all_posts_list = posts
    lost_posts_list = posts.filter(post_type='lost').select_related('cover_image').prefetch_related('images')
    found_posts_list = posts.filter(post_type='found').select_related('cover_image').prefetch_related('images')

    # Get pagination page numbers from query parameters
    all_page = request.GET.get('all_page', 1)
    lost_page = request.GET.get('lost_page', 1)
    found_page = request.GET.get('found_page', 1)
    PER_PAGE = 6

    # Paginate all posts with defined page size
    all_posts = Paginator(all_posts_list, PER_PAGE).get_page(all_page)
    lost_posts = Paginator(lost_posts_list, PER_PAGE).get_page(lost_page)
    found_posts = Paginator(found_posts_list, PER_PAGE).get_page(found_page)

    # Arrange post images by display order
    for post in all_posts:
        post.sorted_images = post.images.all().order_by('order')
    for post in lost_posts:
        post.sorted_images = post.images.all().order_by('order')
    for post in found_posts:
        post.sorted_images = post.images.all().order_by('order')

    # Determine active tab in UI
    active_tab = request.GET.get('tab', 'all')

    #zinc add is_owner
    is_owner = (request.user == user)

    # Render profile page with user data and posts
    return render(request, 'user/profile.html', {
        'user': user,
        'profile': profile,
        'all_posts': all_posts,
        'lost_posts': lost_posts,
        'found_posts': found_posts,

        'lost_count': lost_posts_list.count(),
        'found_count': found_posts_list.count(),
        'posts_count': all_posts_list.count(),

        'is_owner': is_owner, #zinc add
        'need_reverify': need_reverify, #zinc add
        #'is_owner': True # Own profile
        'active_tab': active_tab,
    })

@login_required(login_url='beginning')
@never_cache
def update_bio(request):
    if request.method == 'POST':
        bio = request.POST.get('bio', '')

        # Get or create user profile
        profile, created = Profile.objects.get_or_create(user=request.user)
        profile.bio = bio # Update bio
        profile.save()

        messages.success(request, "Bio updated successfully!")
        return redirect('profile')

    return redirect('profile')

@login_required(login_url='beginning')
@never_cache
def update_avatar(request):

    if request.method == 'POST':
        # Get uploaded avatar file
        avatar = request.FILES.get('avatar')

        # Get or create user profile , make sure profile exists
        profile, _ = Profile.objects.get_or_create(user=request.user)

        if avatar:
            # Delete old avatar file if it exists , avoid extra use storage
            image_url = upload_to_supabase(
                avatar,
                folder="avatars"
            )

            # Save new avatar image to profile
            profile.avatar = image_url
            profile.save()

            messages.success(request, "Profile picture updated successfully!")
        else:
            messages.error(request, "No picture selected")

    return redirect('profile')

# ======================================================
#              YF - View other profile
# ======================================================
@login_required(login_url='beginning')
@never_cache
# yunfee add to check other user's profile
def userProfile(request, username):
    user_obj = get_object_or_404(User, username=username)

    profile, created = Profile.objects.get_or_create(user=user_obj)

    #check current login user #zinc add
    profile_self, _ = Profile.objects.get_or_create(user=request.user)

    #block reported user from veiwing other #zinc add
    if (
        profile_self.need_reverify and request.user != user_obj
    ):
        return redirect('profile')
    
    need_reverify = profile.need_reverify #zinc add reverify acc

    # yt added for page number
    all_posts_list = Post.objects.filter(post_user=user_obj).order_by('-id')
    lost_posts_list = Post.objects.filter(post_user=user_obj, post_type='lost').order_by('-id')
    found_posts_list = Post.objects.filter(post_user=user_obj, post_type='found').order_by('-id')

    all_page = request.GET.get('all_page', 1)
    lost_page = request.GET.get('lost_page', 1)
    found_page = request.GET.get('found_page', 1)
    PER_PAGE = 6

    all_posts = Paginator(all_posts_list, PER_PAGE).get_page(all_page)
    lost_posts = Paginator(lost_posts_list, PER_PAGE).get_page(lost_page)
    found_posts = Paginator(found_posts_list, PER_PAGE).get_page(found_page)

    for post in all_posts:
        post.sorted_images = post.images.all().order_by('order')
    for post in lost_posts:
        post.sorted_images = post.images.all().order_by('order')
    for post in found_posts:
        post.sorted_images = post.images.all().order_by('order')

    active_tab = request.GET.get('tab', 'all')

    return render(request, 'user/profile.html', {
        'user': user_obj,
        'profile': profile,
        'all_posts': all_posts,
        'lost_posts': lost_posts,
        'found_posts': found_posts,

        # yt added for post counting
        'lost_count': lost_posts_list.count(),
        'found_count': found_posts_list.count(),
        'posts_count': all_posts_list.count(),

        'is_owner': request.user == user_obj,
        'need_reverify': need_reverify,
        'active_tab': active_tab,
    })


# ======================================================
#              ZINC - Reverify email
# ======================================================
#zinc add def start_reverify 
@login_required(login_url='beginning')
@never_cache
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
@login_required(login_url='beginning')
@never_cache
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
        profile.is_reported = False
        profile.save()

        # latest user report
        report = UserReport.objects.filter(
            user=request.user,
            status="Waiting for Reverify"
        ).update(
            status="Verified"
        )

        if not report:
            return redirect('profile')

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
@login_required(login_url='beginning')
@never_cache
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
