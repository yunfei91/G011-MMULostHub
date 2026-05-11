from urllib import request

from django.shortcuts import render, redirect, get_object_or_404
from .models import MMULocation, Post, CATEGORY_CHOICES
from .services import create_post, edit_post
from django.contrib.auth.decorators import login_required

# yt added
# Prevent browser cache, user cannot press back to access previous page
from django.views.decorators.cache import never_cache 

from django.contrib import messages
from django.db.models import Q

# yt added to block user to jump back to the previous page after logout
@login_required(login_url='beginning') # If didn't login, will redirect to beginning page
@never_cache
def mainPage(request):

    query = request.GET.get('q', '').strip()

    selected_category = request.GET.getlist('category', '')

    selected_locations = request.GET.getlist('location')

    start_date = request.GET.get('start_date', '')
    end_date = request.GET.get('end_date', '')

    post_box = Post.objects.all().order_by('-id')       #newest post on top # display all post in main page and order by datetime (latest post will be on top)
    
    if query:
        post_box = post_box.filter(
            Q(post_location__location_name__icontains=query) |
            Q(post_description__icontains=query) 
        ).distinct()

    # Category filter
    if selected_category:
        post_box = post_box.filter(
            post_itemcategory__in=selected_category
        )

    # remove empty string
    selected_locations = [
        loc for loc in selected_locations if loc
    ]

    # Location filter
    if selected_locations:
        post_box = post_box.filter(
            post_location_id__in=selected_locations
        )

    # Date range filter
    if start_date:
        post_box = post_box.filter(
            post_datetime__date__gte=start_date
        )

    if end_date:
        post_box = post_box.filter(
            post_datetime__date__lte=end_date
        )
    
    return render(request, 'items/mainpage.html', {
        'posts': post_box,
        'query': query,
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
        'selected_category': selected_category,
        'selected_location': selected_locations,
        'start_date': start_date,
        'end_date': end_date,
    })

@login_required(login_url='beginning')
@never_cache
def createPost(request):
    if request.method == "POST":
        try:
            create_post({
                'post_type': request.POST.get('post_type'),
                'post_datetime': request.POST.get('post_datetime'),
                'userposts_images' : request.FILES.get('userposts_images'),
                'post_itemcategory': request.POST.get('post_itemcategory'),
                'post_location': request.POST.get('post_location'),
                'post_description': request.POST.get('post_description'),
            }
            , request.user)

            messages.success(request, "Post created successfully!")
            return redirect('mainPage')
        
        except ValueError as e:                                 # e = error msg from service.py
            messages.error(request, str(e))
            return render(request, 'items/createpost.html', {
                'item_categories': CATEGORY_CHOICES,
                'locations': MMULocation.objects.all(),
                'post_data': request.POST
            })
        
    return render(request, 'items/createpost.html', {
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
        'post_data': {},
    })

@login_required(login_url='beginning')
@never_cache
def editPost(request,post_id):

    post = get_object_or_404(
        Post, 
        id = post_id, 
        post_user = request.user
    )

    if request.method == "POST":
        try:
            edit_post(post,{
                'post_type': request.POST.get('post_type'),
                'post_datetime': request.POST.get('post_datetime'),
                'userposts_images': request.FILES.get('userposts_images'),
                'post_itemcategory': request.POST.get('post_itemcategory'),
                'post_location': request.POST.get('post_location'),
                'post_description': request.POST.get('post_description'),
            })

            messages.success(request, "Post updated successfully!")
            return redirect('mainPage')
                    
        except ValueError as e:
            messages.error(request, str(e))

            return render(request, 'items/editpost.html',{
                'post': post,
                'post_data': request.POST,
                'item_categories': CATEGORY_CHOICES,
                'locations': MMULocation.objects.all(),
            })
    
    return render(request, 'items/editpost.html', {
        'post': post,
        'post_data': {},
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
    })

@login_required(login_url='beginning')
@never_cache
def deletePost(request, post_id):
    post = get_object_or_404(
        Post,
        id = post_id,
        post_user = request.user
    )

    if request.method == "POST":
        post.delete()
        messages.success(request, "Post deleted successfully!")
        return redirect('mainPage')
    
    return redirect('mainPage')

# yt added for lost and found posts page
@login_required(login_url='beginning')
@never_cache
def lost_posts(request):
    lost_posts = Post.objects.filter(post_type='lost').order_by('-id')

    return render(request, 'items/lost-posts.html', {
        'posts': lost_posts
    })

@login_required(login_url='beginning')
@never_cache
def found_posts(request):
    found_posts = Post.objects.filter(post_type='found').order_by('-id')

    return render(request, 'items/found-posts.html', {
        'posts': found_posts
    })