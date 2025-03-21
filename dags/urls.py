"""noah URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include
#from django.conf.urls import url, include

from dags import views

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r'^login/$', views.login),
    re_path(r'^register/$', views.register),
    re_path(r'^logout/$', views.logout),
    re_path(r'^get_user_info/$', views.get_user_info),
    re_path(r'^pipeline/', include('horae.urls')),
    re_path(r'^processor/', include('horae.processor_urls')),
    re_path(r'^picker/', include('picker.urls')),
    re_path(r'^pyplugin/', include('pyplugin.urls')),
    re_path(r'^dagschedule/', include('dagschedule.urls')),
]
