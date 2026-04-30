from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'mmu_email', 'is_mmu_verified', 'submitted_for_verification')
    list_filter = ('is_mmu_verified',)