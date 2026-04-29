from django.shortcuts import render, redirect, get_object_or_404
from .models import MMULocation, Post, CATEGORY_CHOICES
from .services import create_post, edit_post

def mainPage(request):
    post_box = Post.objects.all().order_by('-id')       #newest post on top # display all post in main page and order by datetime (latest post will be on top)
    return render(request, 'items/mainpage.html', {'posts': post_box})

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

            return redirect('mainPage')
        
        except ValueError as e:                                 # e = error msg from service.py
            return render(request, 'items/createpost.html', {
                'error': str(e),                                 # e string and display in html
                'item_categories': CATEGORY_CHOICES,
                'locations': MMULocation.objects.all(),
                'post_data': request.POST,
            })
        
    return render(request, 'items/createpost.html', {
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
        'post_data': {},
    })


def editPost(request,post_id):

    post = get_object_or_404(Post, id = post_id)

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

            return redirect('mainPage')
        
        except ValueError as e:
            return render(request, 'items/editpost.html',{
                'error': str(e),
                'post': post,
                'item_categories': CATEGORY_CHOICES,
                'locations': MMULocation.objects.all(),
            })
    
    return render(request, 'items/editpoat.html', {
        'post': post,
        'item_categories': CATEGORY_CHOICES,
        'locations': MMULocation.objects.all(),
    })