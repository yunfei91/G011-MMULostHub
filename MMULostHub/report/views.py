from django.shortcuts import render, redirect, get_object_or_404
from .services import create_feedback
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.contrib import messages
from items.models import Post
from .models import Report, UserReport
from django.contrib.auth.models import User
from user.decorators import reverify_required

# yf added to connect supabase (real server)
from utils.supabase import upload_to_supabase

def get_safe_next_url(request):
    next_url = request.GET.get('next') or request.POST.get('next')

    if next_url and next_url != "None":
        return next_url

    return None


# Feedback Form
@login_required(login_url='beginning')
@never_cache
@reverify_required
def feedback_form_view(request):

    next_url = get_safe_next_url(request)

    if request.method == "POST":

        comments = request.POST.get('comments')
        image = request.FILES.get('image-upload')
        image_url = None
        image_name = None

        if image:
            image_url = upload_to_supabase(image)
            image_name = image.name

        create_feedback(
            comments=comments,
            image_url=image_url,
            image_name=image_name,
            user=request.user
        )

        if next_url:
            return redirect(next_url)

        return redirect('mainPage')

    return render(request, 'report/feedback.html', {
        'next_url': next_url
    })


# Report Post
@login_required(login_url='beginning')
@never_cache
@reverify_required
def submit_report(request):

    next_url = get_safe_next_url(request)

    if request.method == "POST":

        post_id = request.POST.get('post_id')
        comments = request.POST.get('comments')
        image = request.FILES.get('image-upload')
        image_url = None
        image_name = None

        if image:
            image_url = upload_to_supabase(image)
            image_name = image.name

        post_instance = get_object_or_404(
            Post,
            id=post_id
        )

        Report.objects.create(
            user=request.user,
            post=post_instance,
            comments=comments,
            image_url=image_url,
            image_name=image_name
        )

        if next_url:
            return redirect(next_url)

        return redirect('mainPage')

    post_id = request.GET.get('post_id')
    post = None

    if post_id:
        post = get_object_or_404(
            Post,
            id=post_id
        )

    return render(request, 'report/reportfunction.html', {
        'post': post,
        'next_url': next_url
    })


# Report User
@login_required(login_url='beginning')
@never_cache
@reverify_required
def report_user(request, user_id):

    reported_user = get_object_or_404(
        User,
        id=user_id
    )

    next_url = get_safe_next_url(request)

    # Prevent users from reporting themselves
    if request.user.id == reported_user.id:

        messages.error(
            request,
            "You cannot report yourself."
        )

        if next_url:
            return redirect(next_url)

        return redirect('profile')

    if request.method == "POST":

        comments = request.POST.get('comments')
        image = request.FILES.get('image')
        image_url = None
        image_name = None

        if not image:
            messages.error(request, "Proof image is required.")
            return redirect(request.path)

        if image:
            image_url = upload_to_supabase(image)
            image_name = image.name

        UserReport.objects.create(
            user=reported_user,
            reported_by=request.user,
            comments=comments,
            image_url=image_url,
            image_name=image_name,
            status="Pending"
        )

        messages.success(
            request,
            "User report submitted successfully."
        )

        if next_url:
            return redirect(next_url)

        return redirect('mainPage')

    return render(request, 'report/reportuser.html', {
        'reported_user': reported_user,
        'next_url': next_url
    })