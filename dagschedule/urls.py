from django.contrib import admin
from django.urls import path, re_path, include

from dagschedule import views

urlpatterns = (
    re_path(r'^$',views.dagschedule),
    re_path(r'^pipeline/', views.dagschedule),
    re_path(r'^processor/', views.processor),
    re_path(r'^picker/', views.picker),
    re_path(r'^history/', views.history),
)
