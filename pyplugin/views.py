# coding=utf-8
import sys
sys.setrecursionlimit(10000)
import os
import datetime
import configparser
import shutil
import hashlib
import time
import binascii
import uuid

from django.shortcuts import render 
from horae.http_helper import *
from horae.http_decorators import add_visit_record
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate
from django.conf import settings

from horae.tools_util import StaticFunction
from horae.models import Pipeline, Processor, Task
from horae.forms import PipelineForm, ProcessorForm, TaskForm
from horae.horae_interface import *
from horae import common_logger
from common.util import is_admin
from horae import no_block_sys_cmd
from clickhouse_driver import Client

horae_interface = HoraeInterface()
ck_client = Client(host='localhost', user="default", password="123456")

@login_required(login_url='/login/')
def pyplugin_index(request):
    return render(request, 'pyplugin.html', {"pipe_id": -1})

@login_required(login_url='/login/')
def get_python(request):
    id = int(request.POST.get('id'))
    if id == 0:
        return JsonHttpResponse({'status': 0, 'python': 
            '''class DagsPlugin():
    def __init__ (self):
        """
        构造函数，任务启动调用一次
        """

    def init_task(self, work_path, init_params):
        """
        初始化函数，任务启动调用一次
        work_path: 任务执行路径
        init_params: 用户自定义参数
        """
        return 0

    def start_task(self):
        """
        任务启动
        """
        return 0

    def call_task(self, msg):
        """
        消息处理函数，处理输入数据
        """

        return 0, -1, ""

       def destroy(self):
        """
        任务结束
        """
        return

    def timer(self):
        """
        任务定时器
        """
            '''})
    elif id == 1:
        return JsonHttpResponse({'status': 0, 'python': 
            '''class DagsPlugin():
    def __init__ (self):
        """
        构造函数，任务启动调用一次
        """

    def init_task(self, work_path, init_params):
        """
        初始化函数，任务启动调用一次
        work_path: 任务执行路径
        init_params: 用户自定义参数
        """
        return 0

    def start_task(self):
        """
        任务启动
        """
        return 0

    def call_task(self, msg):
        """
        消息处理函数，处理输入数据
        """

        return 0, -1, ""

       def destroy(self):
        """
        任务结束
        """
        return

    def timer(self):
        """
        任务定时器
        """
            '''})
    elif id == 2:
        return JsonHttpResponse({'status': 0, 'python': 
            '''class DagsPlugin():
    def __init__ (self):
        """
        构造函数，任务启动调用一次
        """

    def init_task(self, work_path, init_params):
        """
        初始化函数，任务启动调用一次
        work_path: 任务执行路径
        init_params: 用户自定义参数
        """
        return 0

    def start_task(self):
        """
        任务启动
        """
        return 0

    def call_task(self, msg):
        """
        消息处理函数，处理输入数据
        """

        return 0, -1, ""

       def destroy(self):
        """
        任务结束
        """
        return

    def timer(self):
        """
        任务定时器
        """
            '''})
    elif id == 3:
        return JsonHttpResponse({'status': 0, 'python': 
            '''###############################################################################
# coding: utf-8
#

#
###############################################################################
"""
流程编 测试python插件
"""

import time
import threading
import traceback
import json
import hscommsg
from hscommsg import HsTag
import dagscom

class DagsPlugin():
    def __init__ (self):
        self.__work_path = ""
        self.__init_params = ""
        print("hello plugin.")

    def init_task(self, work_path, init_params):
        self.__work_path = work_path
        self.__init_params = init_params
        json_param = json.loads(init_params)
        self.__ws_server = json_param["ws_server"]
        self.__log_ptr = json_param["plugin_logger"]
        return 0

    def start_task(self):
        print("start_task called.")
        return 0

    def destroy(self):
        print("destroy called.")
        return

    def timer(self):
        print("timer called.")

    def call_task(self, msg):
        hsmsg = hscommsg.IHsCommMessage(msg)
        head_error = hsmsg.GetHead().GetItem(HsTag.H5PROTO_TAG_ERROR_NO).GetInt32(0)
        if head_error != 0:
            return 0, -1, ""

        return 0, -1, ""

    def http_call(self, params):
        print("http_call called.")
        return 0, "test"

    def tcp_call(self, msg):
        return 0, msg

    def ws_call(self, con_ptr, msg):
        dagscom.LogInfo(self.__log_ptr, msg)
        status = dagscom.WsSend(self.__ws_server, con_ptr, msg)
        if status == 0:
            return 0, ""
        else:
            return 0, "call failed!"

    def ws_close(self, con_ptr):
        return 0
            '''})
    return JsonHttpResponse({'status': 0, 'python': "hello world"})

@login_required(login_url='/login/')
def contract(request):
    return render(request, 'contract.html', {"pipe_id": -1})

class PROCESSOR_TOP_TYPE(object):
    USER_OWNER_PROC = -1
    SHARED_PROC = -2
    PUBLIC_PROC = -3


global_processor_top_type_map = {
    PROCESSOR_TOP_TYPE.USER_OWNER_PROC: "我创建的",
    PROCESSOR_TOP_TYPE.SHARED_PROC: "共享给我的",
    PROCESSOR_TOP_TYPE.PUBLIC_PROC: "公用的"
}

@login_required(login_url='/login/')
def get_table_tree_async(request):
    user = request.user
    try:
        result = ck_client.execute("show databases")
        databases = []
        res_list = []
        db_idx = 0
        fields = []
        for db in result:
            if db[0] == 'INFORMATION_SCHEMA' or db[0] == 'information_schema' or db[0] == 'system':
                continue

            tables = ck_client.execute("show tables from " + db[0])
            table_idx = 0
            db_item = {
                    "id": "%s" % (db_idx),
                    "text": db[0],
                    "state": "closed",
                    "is_project": 1,
                    "children":[],
            }
            for table in tables:
                db_item["children"].append({
                    "id": "%s-%s" % (db_idx, table_idx),
                    "text": table[0],
                    "state": "open",
                    "is_project": 0,
                    "iconCls": "icon-file"
                })
                table_idx = table_idx + 1
            db_idx = db_idx + 1
            fields.append(db_item)

        return JsonHttpResponse(fields)
    except Exception as ex:
        logger.error('select fail: <%s, %s>' % (python, str(ex)))
        return JsonHttpResponse([])

@login_required(login_url='/login/')
def get_table_detail(request):
    user = request.user
    try:
        db_name = request.POST.get('db')
        table_name = request.POST.get('table')
        show_create_res = ck_client.execute("show create table " + db_name + "." + table_name)
        print(show_create_res);
        res = {}
        res["create"] = show_create_res[0][0]

        show_fileds = ck_client.execute("desc " + db_name + "." + table_name)
        print(show_fileds);

        tmp_result = []
        for filed in show_fileds:
            res_item = {
                "name": filed[0],
                "type": filed[1],
                "default_type": filed[2],
                "default_expression": filed[3],
                "comment": filed[4],
                "codec_expression": filed[5],
                "ttl_expression": filed[6],
            }
                
            tmp_result.append(res_item)

        res["fileds"] = tmp_result

        result = ck_client.execute("select * from " + db_name + "." + table_name + " limit 100", with_column_types=True)
        print(result);

        fields = []
        for filed in result[1]:
            fields.append({ 'name': filed[0], 'type': "text", 'align': "center", 'width': 90 },)

        tmp_result = []
        for item in result[0]:
            res_item = {}
            for i in range(0, len(item)):
                res_item[result[1][i][0]] = str(item[i])
                
            tmp_result.append(res_item)

        res["data_fields"] = fields
        res["datas"] = tmp_result
        res["status"] = 0
        return JsonHttpResponse(res)
    except Exception as ex:
        logger.error('select fail: %s' % str(ex))
        return JsonHttpResponse([])

@login_required(login_url='/login/')
def get_python_tree_async(request):
    user = request.user

    tree_id = 0
    if "id" in request.GET:
        tree_id = int(request.GET.get("id"))

    if tree_id == 0:
        return JsonHttpResponse([
                {"is_project": 1,
                 "text": global_processor_top_type_map[PROCESSOR_TOP_TYPE.USER_OWNER_PROC],
                 "id": PROCESSOR_TOP_TYPE.USER_OWNER_PROC, "state": "closed"},
                {"is_project": 1,
                 "text": global_processor_top_type_map[PROCESSOR_TOP_TYPE.SHARED_PROC],
                 "id": PROCESSOR_TOP_TYPE.SHARED_PROC, "state": "closed"},
                {"is_project": 2,
                 "text": global_processor_top_type_map[PROCESSOR_TOP_TYPE.PUBLIC_PROC],
                 "id": PROCESSOR_TOP_TYPE.PUBLIC_PROC, "state": "closed", "is_super": is_admin(user.id)}])

    res_list = []
    res_list.append({
        "id": "%s-%s" % (tree_id, 0),
        "text": "样本筛选-DDE1",
        "state": "open",
        "is_project": 0,
        "iconCls": "icon-file"
    })

    res_list.append({
        "id": "%s-%s" % (tree_id, 1),
        "text": "样本筛选-DDE2",
        "state": "open",
        "is_project": 0,
        "iconCls": "icon-file"
    })

    res_list.append({
        "id": "%s-%s" % (tree_id, 2),
        "text": "权重计算-DDE1",
        "state": "open",
        "is_project": 0,
        "iconCls": "icon-file"
    })

    res_list.append({
        "id": "%s-%s" % (tree_id, 3),
        "text": "权重计算-DDE2",
        "state": "open",
        "is_project": 0,
        "iconCls": "icon-file"
    })

    return JsonHttpResponse(res_list)

@login_required(login_url='/login/')
def get_python_data(request):
    python = request.POST.get('python')
    try:
        result = ck_client.execute(python, with_column_types=True)
        fields = []
        for filed in result[1]:
            fields.append({ 'name': filed[0], 'type': "text", 'align': "center", 'width': 90 },)

        tmp_result = []
        for item in result[0]:
            res_item = {}
            for i in range(0, len(item)):
                res_item[result[1][i][0]] = str(item[i])
                
            tmp_result.append(res_item)
        return JsonHttpResponse({'status': 0, 'fileds': fields, 'data': tmp_result})
    except Exception as ex:
        logger.error('select fail: <%s, %s>' % (python, str(ex)))
        return JsonHttpResponse({'status': 1, 'msg': str(ex)})
    return JsonHttpResponse({'status': 1, 'msg': 'msg'})

