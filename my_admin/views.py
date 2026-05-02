from django.shortcuts import render
from report.models import Feedback

# Create your views here.
def admin_feedback_view(request):
    feedback_data = Feedback.objects.select_related('user').all().order_by('-created_at')
    return render(request, 'my_admin/adminfeedback.html', {'feedback': feedback_data})
