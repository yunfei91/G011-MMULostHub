from django.shortcuts import render, redirect
from .models import MMULocation, Post, CATEGORY_CHOICES
from .services import create_post
from django.contrib.auth.decorators import login_required

# yt added
# Prevent browser cache, user cannot press back to access previous page
from django.views.decorators.cache import never_cache 

@login_required(login_url='beginning') # If didn't login, will redirect to beginning page
@never_cache
def mainPage(request):
    post_box = Post.objects.all().order_by('-id')       #newest post on top # display all post in main page and order by datetime (latest post will be on top)
    return render(request, 'items/mainpage.html', {'posts': post_box})

@login_required(login_url='beginning')
@never_cache
def createPost(request):
    if request.method == "POST":
        try:
            create_post({
                'post_type': request.POST.get('post_type'),
                'post_datetime': request.POST.get('post_datetime'),
                'post_itemcategory': request.POST.get('post_itemcategory'),
                'post_location': request.POST.get('post_location'),
                'post_description': request.POST.get('post_description'),
            }
            , request.user)

            return redirect('mainPage')
        
        except ValueError as e:                                 # e = error msg from service.py
            return render(request, 'items/createpost.html', {
                'error': str(e),                                 # e string and display in html
                'item_categories': CATEGORY_CHOICES,
                'locations': MMULocation.objects.all(),
            })
        
    return render(request, 'items/createpost.html', {
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
    })