from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from items.models import Post
from report.models import Feedback, Report
from django.db.models import Q

def is_admin(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)

#admin feedback view
def admin_feedback_view(request):
    #search bar filter
    query = request.GET.get('q')
    #View all checked reports and feedbacks
    feedbacks = Feedback.objects.all().order_by('-created_at')

    if query:
        feedbacks = feedbacks.filter(
            Q(comments__icontains=query) | 
            Q(user__username__icontains=query)
        )

    return render(request, 'my_admin/adminfeedback.html', {
        'feedbacks_data': feedbacks
    })

#admin report view
def admin_report_view(request):
    #search bar filter
    query = request.GET.get('q')

    reports = Report.objects.all().order_by('-created_at')

    if query:
        reports = reports.filter(
            Q(comments__icontains=query) |
            Q(user__username__icontains=query)
        )

    return render(request, 'my_admin/adminreport.html', {
        'reports': reports
    })

#admin Mainpage View
def admin_mainpage(request):
    return render(request, 'my_admin/adminmainpage.html')

#Delete Post Function
@login_required
@user_passes_test(is_admin)
def delete_reported_post(request, post_id):
    if request.method == 'POST':
        post_to_delete = get_object_or_404(Post, id=post_id)
        post_to_delete.delete()
        print(f"Delete successful for post {post_id}")
        return redirect('admin_report')
    return redirect('admin_report')

#Update feedback status
from .email_utils import send_feedback_confirmation
@login_required
@user_passes_test(is_admin)
def update_feedback_status(request, feedback_id):
    if request.method == 'POST':
        feedback = get_object_or_404(Feedback, id=feedback_id)
        if feedback.status == 'Pending':
            feedback.status = 'Checked'
            feedback.save()

            if feedback.user and feedback.user.email:
                send_feedback_confirmation(feedback.user.email)

        return redirect('admin_feedback')
    return redirect('admin_feedback')
    
#Update report status
from .email_utils import send_report_confirmation

def  update_report_status(request, report_id):
    if request.method == 'POST':
        report = get_object_or_404(Report, id=report_id)

        if report.status == 'Pending':
            report.status = 'Checked'
            report.save()

            #send email to user
            if report.user and report.user.email:
                category = "Unknown Item"

                if report.post:
                    category = report.post.get_post_itemcategory_display()

                send_report_confirmation(
                    report.user.email,
                    category
                )

        return redirect('admin_report')
    return redirect('admin_report')
