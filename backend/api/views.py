from django.shortcuts import render
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET

@require_GET
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

# Create your views here.
