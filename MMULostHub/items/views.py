from django.shortcuts import render, redirect, get_object_or_404

from .models import MMULocation, Post, CATEGORY_CHOICES
from .services import create_post, edit_post
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.core.paginator import Paginator

from django.views.decorators.http import require_POST

# for crop image
import json
import base64
from django.core.files.base import ContentFile
import uuid

#zinc add to check if user is verified before create post
from user.models import Profile
from user.decorators import reverify_required

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
    selected_category = request.GET.getlist('category')
    selected_locations = request.GET.getlist('location')
    selected_category = [c for c in selected_category if c]

    # search by filter date range
    start_date = request.GET.get('start_date', '')
    end_date = request.GET.get('end_date', '')

    # display all post in main page and order by datetime (latest post will be on top)
    post_box = Post.objects.all().order_by('-id')
    post_box = apply_filters(request, post_box)   

    paginator = Paginator(post_box, 9)
    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number) 
    
    for post in posts:
        post.sorted_images = post.images.all().order_by('order')

    return render(request, 'items/mainpage.html', {
        'posts': posts,
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
        'query': query,
        'selected_category': selected_category,
        'selected_location': selected_locations,
        'start_date': start_date,
        'end_date': end_date,
    })

# ======================================================
#             SEARCH FILTER FUNCTION
# ======================================================
def apply_filters(request, post_box):

    # search by keyword (q= query) if keyword not match = 'empty'
    query = request.GET.get('q', '').strip()

    # search by filter many | getlist = can choose many to filter
    selected_category = request.GET.getlist('category')
    selected_locations = request.GET.getlist('location')

    # search by filter date range
    start_date = request.GET.get('start_date', '')
    end_date = request.GET.get('end_date', '')

    selected_category = [c for c in selected_category if c]
    selected_locations = [l for l in selected_locations if l]

    # keyword
    if query:
        matching_categories = [
            value for value, label in CATEGORY_CHOICES
            if query.lower() in label.lower()
        ]

        post_box = post_box.filter(
            Q(post_location__location_name__icontains=query) |
            Q(post_description__icontains=query) |
            Q(post_itemcategory__in=matching_categories)
        ).distinct()

    # category
    if selected_category:
        post_box = post_box.filter(
            post_itemcategory__in=selected_category
        )

    # location
    if selected_locations:
        post_box = post_box.filter(
            Q(post_location_id__in=selected_locations) | Q(post_location__isnull=True)
        )

    # start date
    if start_date:
        post_box = post_box.filter(
            post_datetime__date__gte=start_date
        )

    # end date
    if end_date:
        post_box = post_box.filter(
            post_datetime__date__lte=end_date
        )

    return post_box

# ======================================================
#                 CREATE POST PAGE
# ======================================================
@login_required(login_url='beginning')
@never_cache
@reverify_required
def createPost(request):

    #zinc add to check if user is verified before create post
    profile, _ = Profile.objects.get_or_create(user=request.user )
    
    if profile.need_reverify:
        messages.error(
            request,
            "Please verify your account again."
        )

        return redirect('profile')

    # when user submit create post form
    if request.method == "POST":
        try:

            # =====================================
            #     Get cropped image from JS
            # =====================================

            cropped = request.POST.get("cropped_images")

            image_files = []

            # if user cropped image
            if cropped:

                # change json format to python list and dictionary format
                images_data = json.loads(cropped)

                # loop imae one by one to check new or old and save
                for img in images_data:

                    # check image format got ;base64; or not 
                    # if got then change to file format and save with new order
                    format, imgstr = img.split(';base64,')
                    ext = format.split('/')[-1]

                    image_file = ContentFile(
                        base64.b64decode(imgstr),
                        name=f'cropped_{timezone.now().timestamp()}.{ext}'
                    )

                    image_files.append(image_file)
            
            else:
                uploaded = request.FILES.get('userposts_images')

                if uploaded:
                    image_files.append(uploaded)

            # run service.py to check data accuratecy
            create_post({
                'post_user': request.POST.get('post_user'), #zinc
                'post_type': request.POST.get('post_type'),
                'post_datetime': request.POST.get('post_datetime'),
                'images': image_files,
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
@reverify_required
# request = user open website (send http request to server)
def editPost(request,post_id):

    # if post not exist = 404 page 
    #if yes then post get detail from storage
    post = get_object_or_404(

         # only owner can edit post
        Post, 
        id = post_id, 
        post_user = request.user
    
    )

    # when user submit edit post form
    if request.method == "POST":
        try:

            # =====================================
            #     Get cropped image from JS
            # =====================================

            # from form take cropped img 
            cropped = request.POST.get("cropped_images")
            
            # create new empty list to save old and new images wuth neww arragement
            existing_ids = []
            images_order = []

            # if got new cropped images
            if cropped:

                # change json format to python list and dictionary format
                images_data = json.loads(cropped)

                # loop imae one by one to check new or old and save
                for img in images_data:

                    # keep existing image
                    if img["type"] == "existing":
                        existing_ids.append(img["id"])

                        # save old image with new order
                        images_order.append({
                            "type": "existing",
                            "id": img["id"],
                            "order": img["order"]
                        })

                    # new cropped image
                    elif img["type"] == "new":

                        image_data = img["image"]

                        # check image format got ;base64; or not 
                        # if got then change to file format and save with new order
                        if ';base64,' in image_data:

                            format, imgstr = image_data.split(';base64,')

                            ext = format.split('/')[-1]

                            image_file = ContentFile(
                                base64.b64decode(imgstr),
                                name = f"{uuid.uuid4()}.{ext}"
                            )

                            images_order.append({
                                "type": "new",
                                "file": image_file,
                                "order": img["order"]
                            })

            # =====================================
            #         Update post
            # =====================================

            edit_post(post,{
                'post_type': request.POST.get('post_type'),
                'post_datetime': request.POST.get('post_datetime'),
                'images_order': images_order,
                'existing_ids': existing_ids,
                'post_itemcategory': request.POST.get('post_itemcategory'),
                'post_location': request.POST.get('post_location'),
                'post_description': request.POST.get('post_description'),
            })

            # no problem show success popup msg then redirect to mainpage
            messages.success(request, "Post updated successfully!")
            
            next_url = request.POST.get("next")

            if next_url:
                return redirect(next_url)

            return redirect("mainPage")

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
        'next_url': request.GET.get('next', ''),
        'existing_images': [
            {
                'id': img.id,
                'url': img.image.url
            }
            for img in post.images.all().order_by('order')
        ]
    })


# ======================================================
#            MAIN PAGE - DELETE POST VIEW
# ======================================================
@login_required(login_url='beginning')
@never_cache
@reverify_required
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
    
        next_url = request.POST.get("next")

        if next_url:
            return redirect(next_url)
        
        # click cancel button redirect to mainpage
        return redirect('mainPage')

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#                YT - FOUND POSTS PAGE
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# yt added for lost and found posts page
@login_required(login_url='beginning')
@never_cache
def found_posts(request):

    post_box = Post.objects.filter(post_type='found') \
    .select_related('cover_image') \
    .prefetch_related('images') \
    .order_by('-id')

    for post in post_box:
        post.sorted_images = post.images.all().order_by('order')
        
    # yf add to search 
    post_box = apply_filters(request, post_box)

    # yf add for paginator (change page)
    paginator = Paginator(post_box, 9)
    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)

    return render(request, 'items/found-posts.html', {
        'posts': posts,

        #yf add to search
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
        'query': request.GET.get('q', ''),
        'selected_category': request.GET.getlist('category'),
        'selected_location': request.GET.getlist('location'),
        'start_date': request.GET.get('start_date', ''),
        'end_date': request.GET.get('end_date', ''),
    })

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#                 YT - LOST POSTS PAGE
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
@login_required(login_url='beginning')
@never_cache
def lost_posts(request):

    post_box = Post.objects.filter(post_type='lost') \
    .select_related('cover_image') \
    .prefetch_related('images') \
    .order_by('-id')

    for post in post_box:
        post.sorted_images = post.images.all().order_by('order')

    #yf add to search
    post_box = apply_filters(request, post_box)

    # yf add for paginator (change page)
    paginator = Paginator(post_box, 9)
    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)

    return render(request, 'items/lost-posts.html', {
        'posts': posts,

        # yf add to sesrch
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
        'query': request.GET.get('q', ''),
        'selected_category': request.GET.getlist('category'),
        'selected_location': request.GET.getlist('location'),
        'start_date': request.GET.get('start_date', ''),
        'end_date': request.GET.get('end_date', ''),
    })

# ======================================================
#                 MAP SEARCH PAGE
# ======================================================
@login_required(login_url='beginning')
@never_cache
def map_search(request):

    post_box = Post.objects.all().order_by('-id')
    location = request.GET.get("location")
    
    if location:
        post_box = post_box.filter(post_location__location_code=location)

    return render(request, 'items/mapsearch.html', {
        'posts': post_box,
        'locations': MMULocation.objects.all(),
    })


# ======================================================
#                 POST STATUS
# ======================================================
@login_required(login_url='beginning')
@never_cache
@require_POST
def update_post_status(request, post_id):

    post = get_object_or_404(
        Post,
        id=post_id,
        post_user=request.user
    )

    if post.post_status != "open":
        return redirect("mainPage")

    if post.post_type == "lost":
        post.post_status = "returned"

    elif post.post_type == "found":
        post.post_status = "claimed"

    post.save()

    next_url = request.POST.get("next")

    return redirect(next_url)
