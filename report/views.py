from django.shortcuts import render, redirect, get_object_or_404
from  .services import create_feedback
from django.contrib.auth.decorators import login_required
from items.models import Post
from .models import Feedback, Report

@login_required
def feedback_form_view(request):
    if request.method == "POST":
        comments = request.POST.get('comments')
        image = request.FILES.get('image-upload') 

        #call service function
        if comments:
            create_feedback(comments=comments, image=image, user=request.user)

        return redirect('mainPage')
    
    return render(request, 'report/feedback.html')

@login_required
def submit_report(request):
    if request.method == "POST":
        post_id = request.POST.get('post_id')
        comments = request.POST.get('comments')
        image = request.FILES.get('image-upload')

        #find the post
        post_instance = get_object_or_404(Post, id=post_id)

        #keep to database
        Report.objects.create(
            user=request.user,
            post=post_instance,
            comments=comments,
            image=image,
            status='Pending'
        )
        return redirect('mainPage')
    
    #if GET require, turn back mainpage
    post_id = request.GET.get('post_id')
    if not post_id:
        return redirect('mainPage')
    
    post = get_object_or_404(Post, id=post_id)

    return render(request, 'report/reportform.html', {'post':post})
