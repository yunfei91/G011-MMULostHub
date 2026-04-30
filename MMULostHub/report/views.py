from django.shortcuts import render, redirect
from  .services import create_feedback
from django.contrib.auth.decorators import login_required

@login_required
def feedback_form_view(request):
    if request.method == "POST":
        comments = request.POST.get('comments')
        image = request.FILES.get('image-upload') 

        #call service function
        create_feedback(comments=comments, image=image, user=request.user)

        return redirect('mainPage')
    
    return render(request, 'report/feedback.html')
