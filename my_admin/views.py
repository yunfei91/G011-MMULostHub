from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Q

from items.models import Post
from report.models import Feedback, Report

from .email_utils import send_feedback_confirmation, send_report_confirmation


# Admin 权限检查
def is_admin(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)


# Admin Main Page
@user_passes_test(is_admin)
def admin_mainpage(request):
    return render(request, 'my_admin/adminmainpage.html')


# Feedback Page
@user_passes_test(is_admin)
def admin_feedback_view(request):
    query = request.GET.get('q')

    feedbacks = Feedback.objects.all().order_by('-created_at')

    # search bar
    if query:
        feedbacks = feedbacks.filter(
            Q(comments__icontains=query) |
            Q(user__username__icontains=query)
        )

    return render(request, 'my_admin/adminfeedback.html', {
        'feedbacks_data': feedbacks
    })


# Report Page 
@user_passes_test(is_admin)
def admin_report_view(request):
    query = request.GET.get('q')

    reports = Report.objects.all().order_by('-created_at')

    # search bar
    if query:
        reports = reports.filter(
            Q(comments__icontains=query) |
            Q(user__username__icontains=query) |
            Q(post__title__icontains=query)
        )

    return render(request, 'my_admin/adminreport.html', {
        'reports': reports
    })


# Delete Reported Post
@user_passes_test(is_admin)
def delete_reported_post(request, post_id):
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id)
        post.delete()

        print(f"Deleted post {post_id}")

    return redirect(request.META.get('HTTP_REFERER', 'admin_mainpage'))


# Update Feedback Status
@user_passes_test(is_admin)
def update_feedback_status(request, feedback_id):
    if request.method == 'POST':
        feedback = get_object_or_404(Feedback, id=feedback_id)

        if feedback.status == 'Pending':
            feedback.status = 'Checked'
            feedback.save()

            # send email
            if feedback.user and feedback.user.email:
                send_feedback_confirmation(feedback.user.email)

    return redirect('admin_feedback')


# Update Report Status
@user_passes_test(is_admin)
def update_report_status(request, report_id):
    if request.method == 'POST':
        report = get_object_or_404(Report, id=report_id)

        if report.status == 'Pending':
            report.status = 'Checked'
            report.save()

            # send email
            if report.user and report.user.email:
                category = "Unknown Item"

                if report.post:
                    category = report.post.get_post_itemcategory_display()

                send_report_confirmation(
                    report.user.email,
                    category
                )

    return redirect('admin_report')