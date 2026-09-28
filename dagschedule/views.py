# coding=utf-8
import sys
sys.setrecursionlimit(10000)
import os
import datetime
import configparser
import shutil
import hashlib

from django.shortcuts import render 
from horae.http_helper import *
from horae.http_decorators import add_visit_record
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate

from horae.tools_util import StaticFunction
from horae.models import Pipeline, Processor, Task
from horae.forms import PipelineForm, ProcessorForm, TaskForm
from horae.horae_interface import *
from horae import common_logger
from common.util import is_admin
from horae import no_block_sys_cmd
from clickhouse_driver import Client

horae_interface = HoraeInterface()
ck_client = Client(host='localhost')

# log/user_log
logger = common_logger.get_logger(
    "view_log",
    "./log/view_log")

config = configparser.ConfigParser()
config.read("./conf/tools.conf")
local_package_path = config.get("tools", "package_path").strip()

UPLOAD_FILES_PATH = 'upload_files/file/'
# WORK_PATH = '/home/admin/doc/rh_ark_tools/upload_files/file/'
WORK_PATH = settings.BASE_DIR + '/upload_files/file/'
__no_block_cmd = no_block_sys_cmd.NoBlockSysCommand(logger)

CURRENT_URL = settings.SITE_URL
NOT_RETRY = 1
ONE_TIME = 2
FIVE_TIME = 3
ALWAYS = 4

@login_required(login_url='/login/')
def dagschedule(request):
    return render(request, 'dag_schedule.html', {"pipe_id": -1})

@login_required(login_url='/login/')
def processor(request):
    user = request.user

    is_super = is_admin(user)
    return render(request, 'processor.html',
                  {'processor': {},
                   'type_str': '', 'private_str': '',
                   'is_owner': '', 'config_str': '', 'is_super': is_super,
                   'owner_name': '', 'page_title': '算子详情', 'pipeline_model': 1,
                   'page_index': 4})

@login_required(login_url='/login/')
def picker(request):
    return render(request, 'picker.html', {"pipe_id": -1})

# 执行状态
@login_required(login_url='/login/')
def history(request):
    user = request.user

    is_super = is_admin(user)
    status = request.GET.get('status')
    runtime = request.GET.get('runtime')

    pl_name = request.GET.get('pl_name')
    task_name = request.GET.get('task_name')
    if status == "success":
        return render(request, 'dag_history.html',
                      {'is_super': is_super, 'page_title': '执行状态', 'user': user, 'pipename': '', 'status': '2',
                       'runtime': runtime, 'pipeline_model': 1, 'page_index': 3})
    elif status == "fail":
        return render(request, 'dag_history.html',
                      {'is_super': is_super, 'page_title': '执行状态', 'user': user, 'pipename': '', 'status': '3',
                       'runtime': runtime, 'pipeline_model': 1, 'page_index': 3})
    elif pl_name:
        return render(request, 'dag_history.html',
                      {'is_super': is_super, 'page_title': '执行状态', 'user': user, 'pipename': pl_name,
                       'taskname': task_name, 'status': '', 'runtime': runtime, 'pipeline_model': 1, 'page_index': 3})
    else:
        return render(request, 'dag_history.html',
                      {'is_super': is_super, 'page_title': '执行状态', 'user': user, 'pipename': '', 'status': '',
                       'runtime': '', 'pipeline_model': 1, 'page_index': 3})
