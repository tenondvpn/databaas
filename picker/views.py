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
import random

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
ck_client = Client(host='localhost', user='default', password='')

@login_required(login_url='/login/')
def picker_index(request):
    return render(request, 'tenon_index.html', {"pipe_id": -1})

@login_required(login_url='/login/')
def chain_block(request):
    return render(request, 'chain_block.html', {"pipe_id": -1})

@login_required(login_url='/login/')
def picker_header_index(request):
    return render(request, 'picker_index.html', {"pipe_id": -1})

@login_required(login_url='/login/')
def get_sql(request):
    id = int(request.POST.get('id'))
    if id == 0:
        return JsonHttpResponse({'status': 0, 'sql': 
            """SELECT DeliveryYear, topKValueT2(ID) from Fut_ContractMain group by DeliveryYear order by DeliveryYear asc;
SELECT 
    ttype, 
    short_name, 
    year, 
    multiIf(ratio > CAST(50., 'DECIMAL(20, 4)'), CAST(50., 'DECIMAL(20, 4)'), t2.max_raitio > CAST(50., 'DECIMAL(20, 4)'), ratio + (((t2.max_raitio - CAST(50., 'DECIMAL(20, 4)')) / t2.sum_more_ratio) * ratio), ratio) AS tratio
FROM EachYearFinalRatio AS t1
LEFT JOIN 
(
    SELECT 
        year, 
        count(1) AS cnt, 
        sum(ratio) AS sum_more_ratio, 
        max(ratio) AS max_raitio
    FROM EachYearFinalRatio
    WHERE ratio < CAST(50., 'DECIMAL(20, 4)')
    GROUP BY year
) AS t2 ON t1.year = t2.year
ORDER BY 
    t1.year ASC, 
    tratio ASC
            """})
    elif id == 1:
        return JsonHttpResponse({'status': 0, 'sql': 
            """SELECT 
    ttype, 
    short_name, 
    t1.year, 
    multiIf(ratio >= CAST(50., 'DECIMAL(20, 4)'), ratio, ratio < CAST(0.1, 'DECIMAL(20, 4)'), CAST(0., 'DECIMAL(20, 4)'), ratio < CAST(1., 'DECIMAL(20, 4)'), CAST(1., 'DECIMAL(20, 4)'), ratio - ((ratio / t3.sum_more_ratio) * t2.more_ratio)) AS ratio
FROM EachYearDecFinalRatio AS t1
LEFT JOIN 
(
    SELECT 
        year, 
        count(1) AS cnt, 
        sum(CAST(1., 'DECIMAL(20, 4)') - ratio) AS more_ratio
    FROM EachYearDecFinalRatio
    WHERE ratio < CAST(1., 'DECIMAL(20, 4)')
    GROUP BY year
) AS t2 ON t1.year = t2.year
LEFT JOIN 
(
    SELECT 
        year, 
        count(1) AS cnt, 
        sum(ratio) AS sum_more_ratio, 
        max(ratio) AS max_raitio
    FROM EachYearDecFinalRatio
    WHERE ratio >= CAST(1., 'DECIMAL(20, 4)')
    GROUP BY year
) AS t3 ON t1.year = t3.year
ORDER BY 
    t1.year ASC, 
    ratio ASC
            """})
    elif id == 2:
        return JsonHttpResponse({'status': 0, 'sql': 
            """SELECT 
    t1.ttype, 
    t1.short_name, 
    t1.year, 
    (t1.final_ratio / t3.sum_ratio) * 100 AS avg_ratio
FROM 
(
    WITH 2010 AS start_year
    SELECT 
        ttype, 
        short_name, 
        year, 
        neighbor(ratio, -2) AS prev_2_r, 
        neighbor(ratio, -1) AS prev_1_r, 
        ratio, 
        ((ratio * CAST(0.5, 'DECIMAL(20, 4)')) + (prev_1_r * CAST(0.3, 'DECIMAL(20, 4)'))) + (prev_2_r * CAST(0.2, 'DECIMAL(20, 4)')) AS final_ratio
    FROM EachYearRatio
) AS t1
LEFT JOIN 
(
    SELECT 
        year, 
        sum(final_ratio) AS sum_ratio
    FROM 
    (
        WITH 2010 AS start_year
        SELECT 
            short_name, 
            year, 
            neighbor(ratio, -2) AS prev_2_r, 
            neighbor(ratio, -1) AS prev_1_r, 
            ratio, 
            ((ratio * CAST(0.5, 'DECIMAL(20, 4)')) + (prev_1_r * CAST(0.3, 'DECIMAL(20, 4)'))) + (prev_2_r * CAST(0.2, 'DECIMAL(20, 4)')) AS final_ratio
        FROM EachYearRatio
    ) AS t2
    GROUP BY year
) AS t3 ON t1.year = t3.year
ORDER BY 
    year ASC, 
    avg_ratio ASC
            """})
    elif id == 3:
        return JsonHttpResponse({'status': 0, 'sql': 
            """SELECT 
    tmpa_1.ttype, 
    tmpb_1.name, 
    tmpa_1.year, 
    tmpa_1.ratio * 100 AS ratio
FROM 
(
    SELECT 
        tmpa.*, 
        tmpb.all_avg, 
        tmpa.avg / tmpb.all_avg AS ratio
    FROM 
    (
        SELECT 
            ttype, 
            year, 
            cnt, 
            sum_in, 
            sum_in / cnt AS avg
        FROM 
        (
            SELECT 
                substr(b.ContractCode, 1, 2) AS ttype, 
                toYear(a.EndDate) AS year, 
                count(1) AS cnt, 
                sum(a.OpenInterest * a.SettlePrice) AS sum_in
            FROM Fut_DailyQuote AS a
            INNER JOIN Fut_ContractMain AS b ON a.InnerCode = b.ContractInnerCode
            WHERE (year >= 2010) AND (a.Exchange IN (10, 11, 13, 15, 20)) AND multiMatchAny(b.ContractCode, ['^CU[0-9]', '^RB[0-9]', '^RU[0-9]', '^ZN[0-9]', '^TA[0-9]', '^AL[0-9]', '^AG[0-9]', '^FG[0-9]', '^JM[0-9]', '^PB[0-9]', '^MA[0-9]', '^FU[0-9]'])
            GROUP BY 
                ttype, 
                year
            UNION ALL
            SELECT 
                substringUTF8(b.ContractCode, 1, 1) AS ttype, 
                toYear(a.EndDate) AS year, 
                count(1) AS cnt, 
                sum(a.OpenInterest * a.SettlePrice) AS sum_in
            FROM Fut_DailyQuote AS a
            INNER JOIN Fut_ContractMain AS b ON a.InnerCode = b.ContractInnerCode
            WHERE (year >= 2010) AND (a.Exchange IN (10, 11, 13, 15, 20)) AND multiMatchAny(b.ContractCode, ['^J[0-9]', '^V[0-9]', '^L[0-9]'])
            GROUP BY 
                ttype, 
                year
        )
        ORDER BY 
            year ASC, 
            ttype ASC
    ) AS tmpa
    LEFT JOIN 
    (
        SELECT 
            year, 
            sum(avg) AS all_avg
        FROM 
        (
            SELECT 
                ttype, 
                year, 
                cnt, 
                sum_in, 
                sum_in / cnt AS avg
            FROM 
            (
                SELECT 
                    substr(b.ContractCode, 1, 2) AS ttype, 
                    toYear(a.EndDate) AS year, 
                    count(1) AS cnt, 
                    sum(a.OpenInterest * a.SettlePrice) AS sum_in
                FROM Fut_DailyQuote AS a
                INNER JOIN Fut_ContractMain AS b ON a.InnerCode = b.ContractInnerCode
                WHERE (year >= 2010) AND (a.Exchange IN (10, 11, 13, 15, 20)) AND multiMatchAny(b.ContractCode, ['^CU[0-9]', '^RB[0-9]', '^RU[0-9]', '^ZN[0-9]', '^TA[0-9]', '^AL[0-9]', '^AG[0-9]', '^FG[0-9]', '^JM[0-9]', '^PB[0-9]', '^MA[0-9]', '^FU[0-9]'])
                GROUP BY 
                    ttype, 
                    year
                UNION ALL
                SELECT 
                    substringUTF8(b.ContractCode, 1, 1) AS ttype, 
                    toYear(a.EndDate) AS year, 
                    count(1) AS cnt, 
                    sum(a.OpenInterest * a.SettlePrice) AS sum_in
                FROM Fut_DailyQuote AS a
                INNER JOIN Fut_ContractMain AS b ON a.InnerCode = b.ContractInnerCode
                WHERE (year >= 2010) AND (a.Exchange IN (10, 11, 13, 15, 20)) AND multiMatchAny(b.ContractCode, ['^J[0-9]', '^V[0-9]', '^L[0-9]'])
                GROUP BY 
                    ttype, 
                    year
            )
        ) AS t
        GROUP BY year
    ) AS tmpb ON tmpa.year = tmpb.year
) AS tmpa_1
LEFT JOIN 
(
    SELECT 
        short_name, 
        name
    FROM ShortNameTable
) AS tmpb_1 ON tmpa_1.ttype = tmpb_1.short_name
            """})
    return JsonHttpResponse({'status': 0, 'sql': "hello world"})

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
        logger.error('select fail: <%s, %s>' % (sql, str(ex)))
        return JsonHttpResponse([])


@login_required(login_url='/login/')
@add_visit_record
def show_block(request, hash):
    user = request.user
    return render(request, 'show_block.html',
                  {'table_addr': hash})

@login_required(login_url='/login/')
def get_table_detail(request):
    user = request.user
    try:
        db_name = request.POST.get('db')
        table_name = request.POST.get('table')
        show_create_res = ck_client.execute("show create table " + db_name + "." + table_name)
        print(show_create_res)
        res = {}
        res["create"] = show_create_res[0][0]

        show_fileds = ck_client.execute("desc " + db_name + "." + table_name)
        print(show_fileds)

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
        res["table"] = db_name + "." + table_name
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
def get_blocks(request):
    user = request.user
    try:
        table_addr = request.POST.get('table_addr')
        fileds = ck_client.execute("select prehash, hash, timestamp from default.zjc_ck_transaction_table where shard_id=3 and from != '' and to = '" + table_addr + "' order by timestamp desc limit 30;")
        if len(fileds) <= 0:
            return JsonHttpResponse([])
        
        res = {}
        tmp_result = []
        id = 0
        arr = {}
        i = 0
        while i < len(fileds) - 1:
            next_filed = fileds[i + 1]
            field = fileds[i]
            arr[next_filed[1]] = field[1]
            i += 1

        for filed in fileds:
            tmp_ids = ""
            if filed[1] in arr:
                tmp_ids = arr[filed[1]] + ","

            datetime_obj = datetime.datetime.fromtimestamp(filed[2] / 1000 + 8 * 3600)
            datetime_str = datetime_obj.strftime("%Y-%m-%d %H:%M:%S")
            res_item = {
                "id": filed[1],
                "prehash": filed[0],
                "hash": filed[1],
                "timestamp": datetime_str,
                "next_task_ids": tmp_ids
            }

            id += 1
            tmp_result.append(res_item)

        res["fileds"] = tmp_result
        res["status"] = 0
        return JsonHttpResponse(res)
    except Exception as ex:
        logger.error('select fail: %s' % str(ex))
        return JsonHttpResponse([])
    
@login_required(login_url='/login/')
def get_function_detail(request):
    user = request.user
    try:
        function = request.POST.get('function')
        res = {}
        f = open("/var/lib/clickhouse/user_files/" + function + "/" + function + ".py",encoding = "utf-8")
        res["function"] = f.read()
        res["status"] = 0
        f.close()
        return JsonHttpResponse(res)
    except Exception as ex:
        logger.error('select fail: %s' % str(ex))
        return JsonHttpResponse({"status": 1, "msg": str(ex)})

@login_required(login_url='/login/')
def save_python_function(request):
    user = request.user
    try:
        codes = request.POST.get('codes')
        codes_split = codes.split('\n')
        find = False
        function = None
        for line in codes_split:
            if line.startswith('class'):
                class_split = line.split(' ')
                for item in class_split:
                    str_item = item.strip()
                    if str_item == "":
                        continue

                    if str_item == 'class':
                        find = True

                    if find:
                        name_split = str_item.split('(')
                        function = name_split[0]

        res = {}
        os.makedirs("/var/lib/clickhouse/user_files/" + function)
        f = open("/var/lib/clickhouse/user_files/" + function + "/" + function + ".py", "w", encoding = "utf-8")
        f.write(codes)
        f.close()
        res["status"] = 0
        return JsonHttpResponse(res)
    except Exception as ex:
        logger.error('fail: %s' % str(ex))
        return JsonHttpResponse({"status": 1, "msg": str(ex)})


@login_required(login_url='/login/')
def get_sql_tree_async(request):
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
def get_function_tree_async(request):
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
        "text": "topKValue",
        "state": "open",
        "is_project": 0,
        "iconCls": "icon-file"
    })

    res_list.append({
        "id": "%s-%s" % (tree_id, 1),
        "text": "testAggFunction",
        "state": "open",
        "is_project": 0,
        "iconCls": "icon-file"
    })

    res_list.append({
        "id": "%s-%s" % (tree_id, 2),
        "text": "testArray",
        "state": "open",
        "is_project": 0,
        "iconCls": "icon-file"
    })

    res_list.append({
        "id": "%s-%s" % (tree_id, 3),
        "text": "testDecimal",
        "state": "open",
        "is_project": 0,
        "iconCls": "icon-file"
    })

    res_list.append({
        "id": "%s-%s" % (tree_id, 4),
        "text": "testDecimal2",
        "state": "open",
        "is_project": 0,
        "iconCls": "icon-file"
    })

    res_list.append({
        "id": "%s-%s" % (tree_id, 5),
        "text": "testMoreParam",
        "state": "open",
        "is_project": 0,
        "iconCls": "icon-file"
    })

    res_list.append({
        "id": "%s-%s" % (tree_id, 6),
        "text": "testPython",
        "state": "open",
        "is_project": 0,
        "iconCls": "icon-file"
    })

    return JsonHttpResponse(res_list)

@login_required(login_url='/login/')
def get_sql_data(request):
    sql = request.POST.get('sql')
    try:
        result = ck_client.execute(sql, with_column_types=True)
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
        logger.error('select fail: <%s, %s>' % (sql, str(ex)))
        return JsonHttpResponse({'status': 1, 'msg': str(ex)})
    return JsonHttpResponse({'status': 1, 'msg': 'msg'})

