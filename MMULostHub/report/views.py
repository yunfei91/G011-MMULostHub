from django.shortcuts import render, redirect
from  .services import create_feedback
from django.contrib.auth.decorators import login_required
from django.contrib import messages

@login_required
def feedback_form_view(request):
    profile = request.user.profile

    if not profile.is_mmu_verified:
        messages.error(request, "You have not verified your MMU account. Please verify before creating a post.")
        return redirect('mainPage')
    
    if request.method == "POST":
        comments = request.POST.get('comments')
        image = request.FILES.get('image-upload') 

        #call service function
        create_feedback(comments=comments, image=image, user=request.user)

        return redirect('mainPage')
    
    return render(request, 'report/feedback.html')
