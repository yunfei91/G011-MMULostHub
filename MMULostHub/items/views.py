from django.shortcuts import render, redirect, get_object_or_404
from .models import MMULocation, Post, CATEGORY_CHOICES
from .services import create_post, edit_post
from django.contrib.auth.decorators import login_required

# yt added
# Prevent browser cache, user cannot press back to access previous page
from django.views.decorators.cache import never_cache 
from django.contrib import messages
from django.db.models import Q

# ======================================================
#                 MAIN PAGE VIEW
# ======================================================
@login_required(login_url='beginning') # yt added to block user to jump back to the previous page after logout
@never_cache                           # yt added to block user to jump back to the previous page after logout
def mainPage(request):

    # search by keyword (q= query) if keyword not match = 'empty'
    query = request.GET.get('q', '').strip()

    # search by filter many | getlist = can choose many to filter
    selected_category = request.GET.getlist('category', '')
    selected_locations = request.GET.getlist('location')

    # search by filter date range
    start_date = request.GET.get('start_date', '')
    end_date = request.GET.get('end_date', '')

    # display all post in main page and order by datetime (latest post will be on top)
    post_box = Post.objects.all().order_by('-id')       
    
    #=================================
    #        Search By Keyword       #
    if query:
        post_box = post_box.filter(
            Q(post_location__location_name__icontains=query) |          # icontains = ignore case sencitive (HI\hi\Hi..)
            Q(post_description__icontains=query)                        # | = or
        ).distinct()

    #=================================
    #        Category Filter         #
    if selected_category:
        post_box = post_box.filter(

            # show post related to category choosed
            post_itemcategory__in = selected_category

        )

    #=================================
    #        Location Filter         #

    # remove empty string (none value)
    selected_locations = [
        loc for loc in selected_locations if loc
    ]

    if selected_locations:
        post_box = post_box.filter(

            # show post related to location choosed
            post_location_id__in=selected_locations

        )

    #=================================
    #        Date Range Filter       #
    if start_date:
        post_box = post_box.filter(

            # show post after/when start date choosed
            post_datetime__date__gte=start_date             # gte = greater than or equal
        
        )

    if end_date:
        post_box = post_box.filter(

            # show post before/when end date choosed
            post_datetime__date__lte=end_date                # lte = less than or equal
        
        )
    
    return render(request, 'items/mainpage.html', {
        'posts': post_box,
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
        'query': query,
        'selected_category': selected_category,
        'selected_location': selected_locations,
        'start_date': start_date,
        'end_date': end_date,
    })


# ======================================================
#                 CREATE POST PAGE
# ======================================================
@login_required(login_url='beginning')
@never_cache
def createPost(request):

    # when user submit create post form
    if request.method == "POST":
        try:
            # run service.py to check data accuratecy
            create_post({
                'post_type': request.POST.get('post_type'),
                'post_datetime': request.POST.get('post_datetime'),
                'userposts_images' : request.FILES.get('userposts_images'),
                'post_itemcategory': request.POST.get('post_itemcategory'),
                'post_location': request.POST.get('post_location'),
                'post_description': request.POST.get('post_description'),
            }
            , request.user)                # also save user created post 
        
            # no problem show success msg then change to mainpage
            messages.success(request, "Post created successfully!")
            return redirect('mainPage')
        
        # get error from servoce.py will show error msg and stay in createpost page but keep previous data imput
        except ValueError as e:                                 # e = error msg from service.py
            messages.error(request, str(e))
            return render(request, 'items/createpost.html', {
                'item_categories': CATEGORY_CHOICES,
                'locations': MMULocation.objects.all(),
                'post_data': request.POST
            })
    
    # user first time open createpost page (create new post) will show empty form
    return render(request, 'items/createpost.html', {
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
        'post_data': {},
    })

# ======================================================
#                EDIT POST PAGE
# ======================================================
@login_required(login_url='beginning')
@never_cache
def editPost(request,post_id):

    # post not exist = 404 page 
    post = get_object_or_404(

         # only owner can edit post
        Post, 
        id = post_id, 
        post_user = request.user
    
    )

    # when user submit edit post form
    if request.method == "POST":
        try:

            # check service.py to update data
            edit_post(post,{
                'post_type': request.POST.get('post_type'),
                'post_datetime': request.POST.get('post_datetime'),
                'userposts_images': request.FILES.get('userposts_images'),
                'post_itemcategory': request.POST.get('post_itemcategory'),
                'post_location': request.POST.get('post_location'),
                'post_description': request.POST.get('post_description'),
            })

            # no problem show success popup msg then redirect to mainpage
            messages.success(request, "Post updated successfully!")
            return redirect('mainPage')

        # detect error show error msg popup
        except ValueError as e:
            messages.error(request, str(e))

            # stay in edit page and keep previus edited data
            return render(request, 'items/editpost.html',{
                'post': post,
                'post_data': request.POST,
                'item_categories': CATEGORY_CHOICES,
                'locations': MMULocation.objects.all(),
            })
    
    # user first time open editpost show instance post data selected to edit
    return render(request, 'items/editpost.html', {
        'post': post,
        'post_data': {},
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
    })


# ======================================================
#            MAIN PAGE - DELETE POST VIEW
# ======================================================
@login_required(login_url='beginning')
@never_cache
def deletePost(request, post_id):

    # post not exist = 404 page
    post = get_object_or_404(

        # only owner can delete post
        Post,
        id = post_id,
        post_user = request.user

    )

    # dlt post when click dlt button and show success popup msg then redirect to mainpage
    if request.method == "POST":
        post.delete()
        messages.success(request, "Post deleted successfully!")
        return redirect('mainPage')
    
    # click cancel button redirect to mainpage
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
    
