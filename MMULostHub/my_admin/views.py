import email

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Q

from items.models import Post
from report.models import Feedback, Report, UserReport

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

    # Search User
    if query:

        users = User.objects.filter(
            username__icontains=query
        )

    else:

        users = User.objects.all()

    # Ensure Profile Exists
    for user in users:

        Profile.objects.get_or_create(
            user=user
        )

    # View Type
    view_type = request.GET.get(
        'view',
        'all'
    )

    users = users.select_related(
        'profile'
    )

    # Show Only Reported Users
    if view_type == 'reported_only':

        users = users.filter(
            profile__is_reported=True
        )

    # Order Users
    users = users.order_by(
        '-profile__is_reported',
        'username'
    )

    # Reports
    reports = UserReport.objects.select_related(
        'user',
        'reported_by'
    )

    # Active cases only
    if view_type == 'all' or view_type == 'user_only':

        reports = reports.exclude(
            status__in=['Closed', 'Rejected']
        )

    # Report History
    elif view_type == 'reported_only':
        reports = reports.order_by(
            '-created_at'
        )

    return render(
        request,
        'admin/adminviewuser.html',
        {
            'users': users,
            'reports': reports,
            'view_type': view_type,
        }
    )


# Ban User
@user_passes_test(is_admin)
def delete_user(request):

    if request.method == "POST":

        user_id = request.POST.get(
            'user_id'
        )

        user = get_object_or_404(
            User,
            id=user_id
        )

        email = user.email

        user.delete()  # Permanently delete the user and all related data

        # Send email
        if email:
            send_account_deleted_email(email)

    return redirect('admin_user')


# Verify Report
@user_passes_test(is_admin)
def verify_report(request, report_id):

    report = get_object_or_404(
        UserReport,
        id=report_id
    )

    UserReport.objects.filter(
        user=report.user,
    ).update(
        status="Waiting for Reverify"
    )

    #Mark user as restricted
    profile, _ = Profile.objects.get_or_create(user=report.user)

    profile.is_reported = True
    profile.need_reverify = True
    profile.save()

    # Send email to reported user
    if report.user and report.user.email:
        send_user_report_verified_email(
        report.user.email
    )

    return redirect('admin_user')


# Reject Report
@user_passes_test(is_admin)
def reject_report(request, report_id):

    report = get_object_or_404(
        UserReport,
        id=report_id
    )

    # Send email to report owner
    if report.reported_by and report.reported_by.email:
        send_report_rejected_email(
            report.reported_by.email
        )
    
    # Reset user profile status
    profile, _ = Profile.objects.get_or_create(user=report.user)

    profile.is_reported = False
    profile.need_reverify = False
    profile.is_reported = False
    profile.save()

    # delete reports
    UserReport.objects.filter(
        user=report.user,
    ).update(
        status="Rejected"
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

# Confirm Verified
@user_passes_test(is_admin)
def confirm_verified(request, report_id):

    report = get_object_or_404(
        UserReport,
        id=report_id
    )

    profile, created = Profile.objects.get_or_create(user=report.user)
   
    profile.is_reported = False
    profile.need_reverify = False
    profile.is_reverified = True
    profile.save()

    #Remove report record
    UserReport.objects.filter(
        user=report.user,
    ).update(
        status="Closed"
    )

    return redirect('admin_user')