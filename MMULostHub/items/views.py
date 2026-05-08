from django.shortcuts import render, redirect, get_object_or_404
from .models import MMULocation, Post, CATEGORY_CHOICES
from .services import create_post, edit_post
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q

def mainPage(request):

    query = request.GET.get('q', '').strip()

    selected_category = request.GET.get('category', '')

    selected_location = request.GET.get('location', '')

    selected_date = request.GET.get('date', '')

    post_box = Post.objects.all().order_by('-id')       #newest post on top # display all post in main page and order by datetime (latest post will be on top)
    
    if query:
        post_box = post_box.filter(
            Q(post_itemcategory__icontains=query) |
            Q(post_location__location_name__icontains=query) |
            Q(post_description__icontains=query) 
        ).distinct()

    # Category filter
    if selected_category:
        post_box = post_box.filter(
            post_itemcategory=selected_category
        )

    # Location filter
    if selected_location:
        post_box = post_box.filter(
            post_location_id=selected_location
        )

    # Date filter
    if selected_date:
        post_box = post_box.filter(
            post_datetime__date=selected_date
        )
    
    return render(request, 'items/mainpage.html', {
        'posts': post_box,
        'query': query,
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
        'selected_category': selected_category,
        'selected_location': selected_location,
        'selected_date': selected_date
    })

@login_required
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