from django.urls import path, re_path, include
#from django.conf.urls import url
from pyplugin import views

urlpatterns = (
    re_path(r'^$',views.pyplugin_index),
    re_path(r'^get_python/$',views.get_python),
    re_path(r'^get_python_data/$',views.get_python_data),
    re_path(r'^get_python_tree_async/$',views.get_python_tree_async),
    re_path(r'^get_table_tree_async/$',views.get_table_tree_async),
    re_path(r'^get_table_detail/$',views.get_table_detail),
)
