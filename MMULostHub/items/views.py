from django.shortcuts import render, redirect, get_object_or_404
from .models import MMULocation, Post, CATEGORY_CHOICES
from .services import create_post, edit_post
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.contrib import messages

@login_required(login_url='beginning')
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

@login_required
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

@login_required
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

# yt added for lost posts page
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