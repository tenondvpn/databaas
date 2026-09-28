from django.urls import path, re_path, include
#from django.conf.urls import url
from picker import views

urlpatterns = (
    re_path(r'^$',views.picker_index),
    re_path(r'^picker_header/$',views.picker_header_index),
    re_path(r'^chain_block/$',views.chain_block),
    re_path(r'^show_block/(?P<hash>.*)/$',views.show_block),
    re_path(r'^get_sql/$',views.get_sql),
    re_path(r'^get_sql_data/$',views.get_sql_data),
    re_path(r'^get_sql_tree_async/$',views.get_sql_tree_async),
    re_path(r'^get_table_tree_async/$',views.get_table_tree_async),
    re_path(r'^get_function_tree_async/$',views.get_function_tree_async),
    re_path(r'^get_table_detail/$',views.get_table_detail),
    re_path(r'^get_function_detail/$',views.get_function_detail),
    re_path(r'^save_python_function/$',views.save_python_function),
    re_path(r'^get_blocks/$',views.get_blocks),
)
