from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Q

from items.models import Post
from report.models import Feedback, Report

from .email_utils import (
    send_feedback_confirmation,
    send_report_confirmation,
    send_user_report_verified_email,
    send_report_rejected_email,
    send_account_deleted_email
)

from user.models import Profile
from django.contrib.auth.models import User


# Admin Check
def is_admin(user):
    return user.is_authenticated and (
        user.is_staff or user.is_superuser
    )


# Admin Main Page
@user_passes_test(is_admin)
def admin_mainpage(request):
    return render(
        request,
        'admin/adminmainpage.html'
    )


# Feedback Page
@user_passes_test(is_admin)
def admin_feedback_view(request):

    query = request.GET.get('q')

    feedbacks = Feedback.objects.all().order_by(
        '-created_at'
    )

    # Search
    if query:
        feedbacks = feedbacks.filter(
            Q(comments__icontains=query) |
            Q(user__username__icontains=query)
        )

    return render(
        request,
        'admin/adminfeedback.html',
        {
            'feedbacks': feedbacks
        }
    )


# Report Page
@user_passes_test(is_admin)
def admin_report_view(request):

    query = request.GET.get('q')

    reports = Report.objects.all().order_by(
        '-created_at'
    )

    # Search
    if query:
        reports = reports.filter(
            Q(comments__icontains=query) |
            Q(user__username__icontains=query) |
            Q(post__post_description__icontains=query)
        )

    return render(
        request,
        'admin/adminreport.html',
        {
            'reports': reports
        }
    )


# Delete Reported Post
@user_passes_test(is_admin)
def delete_post(request, post_id):

    if request.method == "POST":

        post = get_object_or_404(
            Post,
            id=post_id
        )

        post.delete()

    return redirect('admin_report')


# Update Feedback Status
@user_passes_test(is_admin)
def update_feedback_status(request, feedback_id):

    if request.method == 'POST':

        feedback = get_object_or_404(
            Feedback,
            id=feedback_id
        )

        if feedback.status == 'Pending':

            feedback.status = 'Checked'
            feedback.save()

            # Send Email
            if feedback.user and feedback.user.email:
                send_feedback_confirmation(
                    feedback.user.email
                )

    return redirect('admin_feedback')


# Update Report Status
@user_passes_test(is_admin)
def update_report_status(request, report_id):

    if request.method == 'POST':

        report = get_object_or_404(
            Report,
            id=report_id
        )

        if report.status == 'Pending':

            report.status = 'Checked'
            report.save()

            # Send Email
            if report.user and report.user.email:

                category = "Unknown Item"

                if report.post:
                    category = (
                        report.post.get_post_itemcategory_display()
                    )

                send_report_confirmation(
                    report.user.email,
                    category
                )

    return redirect('admin_report')


# Admin View User
@user_passes_test(is_admin)
def admin_view_user(request):

    query = request.GET.get('q')

    if query:

        users = User.objects.filter(
            username__icontains=query
        )

    else:

        users = User.objects.all()

    # Ensure profile exists
    for user in users:
        Profile.objects.get_or_create(
            user=user
        )

    users = users.select_related(
        'profile'
    ).order_by(
        '-profile__is_reported',
        'username'
    )

    # Reports
    reports = Report.objects.select_related(
        'user',
        'post'
    ).order_by(
        '-created_at'
    )

    return render(
        request,
        'admin/adminviewuser.html',
        {
            'users': users,
            'reports': reports,
        }
    )


# Ban User
@user_passes_test(is_admin)
def delete_user(request):

    if request.method == "POST":

        user_id = request.POST.get(
            'user_id'
        )

        # Prevent Empty ID
        if not user_id:
            return redirect('admin_user')

        # Prevent Invalid ID
        if not str(user_id).isdigit():
            return redirect('admin_user')

        user = get_object_or_404(
            User,
            id=user_id
        )

        # Ban Account
        user.is_active = False
        user.save()

        # Send email
        if user.email:
            send_account_deleted_email(
                user.email
    )

    return redirect('admin_user')


# Verify Report
@user_passes_test(is_admin)
def verify_report(request, report_id):

    report = get_object_or_404(
        Report,
        id=report_id
    )

    report.status = "Verified"
    report.save()

    # Send email to reported user
    if report.user and report.user.email:
        send_user_report_verified_email(
        report.user.email
    )
        
    if report.user:
        profile = Profile.objects.get_or_create(
            user=report.user
    )[0]

    profile.is_reported = True
    profile.need_reverify = True
    profile.save()

    return redirect('admin_user')


# Reject Report
@user_passes_test(is_admin)
def reject_report(request, report_id):

    report = get_object_or_404(
        Report,
        id=report_id
    )

    report.status = "Rejected"
    report.save()

    # Send email to report owner
    if report.user and report.user.email:
        send_report_rejected_email(
        report.user.email
    )

    return redirect('admin_user')


# Delete Selected Users
@user_passes_test(is_admin)
def delete_selected(request):

    if request.method == "POST":

        selected_ids = request.POST.getlist(
            'selected_users'
        )

        if selected_ids:
            User.objects.filter(
                id__in=selected_ids
            ).update(
                is_active=False
            )

    return redirect('admin_user')