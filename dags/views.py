# coding=utf-8
import sys

sys.setrecursionlimit(10000)
from django.shortcuts import render
from horae.http_helper import *
from django.contrib import auth
from django.contrib.auth.models import User
import django
from django.contrib.auth import logout as auth_logout
import pymysql
from django.contrib.auth.decorators import login_required
from horae.models import UserInfo
from django.contrib.auth import authenticate

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.decorators import authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

def exchange(request):
    return render(request, 'vue2/index.html', {})

@api_view(['POST'])
@permission_classes([AllowAny])
def rest_register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    phone = request.data.get('phone')

    if not username or not password:
        return Response({'message': '用户名和密码不能为空'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        user = authenticate(username=username, password=password)
        if user:
            try:
                user.auth_token.delete()
            except:
                pass
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'message': '登录成功', 'created': created}, status=status.HTTP_200_OK)
        else:
            return Response({'message': '用户名或密码错误: ' + username}, status=status.HTTP_401_UNAUTHORIZED)
        
    user = User.objects.create_user(username=username, password=password, email=email)
    try:
        user.auth_token.delete()
    except:
        pass
    token, created = Token.objects.get_or_create(user=user)
    return Response({'message': '注册成功'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def rest_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user:
        user.auth_token.delete()
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'message': '登录成功', 'created': created}, status=status.HTTP_200_OK)
    else:
        return Response({'message': '用户名或密码错误'}, status=status.HTTP_401_UNAUTHORIZED)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rest_logout(request):
    request.session.flush()
    return Response({'message': '成功退出'}, status=status.HTTP_200_OK)

def check_owl_user_valid(username, password):
    payload = {"account": username, "password": password}
    r = requests.post("https://owl.aidigger.com/api/v1/session", json=payload)
    res_json = r.json()
    if "next" in res_json:
        return True

    return False

def get_owl_user_info(username):
    try:
        db = pymysql.connect("rm-bp1pyu5wq71ufm9a5.mysql.rds.aliyuncs.com", "owl", "owleigen123", "owl")
        cursor = db.cursor()
        cursor.execute("select code, id, realname, email, phone, avatar from profile where username='%s';" % username)
        data = cursor.fetchone()
        db.close()
        return data
    except Exception as ex:
        return None

@django.db.transaction.atomic
def login(request):
    if request.method == 'POST':
        username = request.POST.get("username")
        password = request.POST.get("password")
        next = request.POST.get("next", "").strip()
        auth_users = User.objects.filter(username=username)
        if len(auth_users) <= 0:
            first_name = ""
            email = ""
            avatar = ""
            return JsonHttpResponse({'status': 1, 'msg': "用户不存在，请先注册.", 'next': next})

        user = auth.authenticate(username=username, password=password)
        if user is not None and user.is_active:
            auth.login(request, user)
            return JsonHttpResponse({'status': 0, 'msg': "OK", 'next': next})
        else:
            first_name = ""
            email = ""
            User.objects.create_user(username, email, password, first_name=first_name)
            user = auth.authenticate(username=username, password=password)
            auth.login(request, user)
            return JsonHttpResponse({'status': 0, 'msg': "OK", 'next': next})
    else:
        return render(request, 'login.html', {})

@django.db.transaction.atomic
def register(request):
    if request.method == 'POST':
        username = request.POST.get("username").strip()
        password = request.POST.get("password")
        email = request.POST.get("email").strip()
        dingding = request.POST.get("dingding").strip()
        next = request.POST.get("next", "").strip()
        if '@' not in email:
            return JsonHttpResponse({'status': 1, 'msg': "邮箱格式不正确", 'next': next})
        
        if username == "":
            return JsonHttpResponse({'status': 1, 'msg': "用户名不能为空", 'next': next})

        auth_users = User.objects.filter(username=username)
        if len(auth_users) <= 0:
            first_name = ""
            avatar = ""
            user = User.objects.create_user(username, email, password, first_name=first_name, last_name=avatar)
            user_info = UserInfo(userid=user.id, email=email, dingding=dingding)
            user_info.save()
        else:
            return JsonHttpResponse({'status': 1, 'msg': "用户已经存在，请直接登录.", 'next': '/login?next=' + next})

        user = auth.authenticate(username=username, password=password)
        if user is not None and user.is_active:
            auth.login(request, user)
            return JsonHttpResponse({'status': 0, 'msg': "OK", 'next': next})
        else:
            first_name = ""
            email = ""
            User.objects.create_user(username, email, password, first_name=first_name)
            user = auth.authenticate(username=username, password=password)
            auth.login(request, user)
            return JsonHttpResponse({'status': 0, 'msg': "OK", 'next': next})
    else:
        return render(request, 'register.html', {})
    
def logout(request):
    auth_logout(request)
    next = request.GET.get('next', '')
    return JsonHttpResponse({'status': 0, 'msg': "OK", 'next': '/login?next=' + next})

@login_required(login_url='/login/')
def get_user_info(request):
    user = request.user
    auth_users = User.objects.filter(id=user.id)
    if len(auth_users) <= 0:
        return JsonHttpResponse({'status': 1, 'msg': "用户未登录，或者用户信息出错！"})

    realname = auth_users[0].first_name
    if realname is None or realname.strip() == "":
        realname = auth_users[0].username

    ret_map = {
        "status": 0,
        "msg": "OK",
        "username": auth_users[0].username,
        "realname": realname,
        "id": user.id,
        "email": auth_users[0].email,
        "date_joined": auth_users[0].date_joined.strftime("%Y年%m月%d日 %H点")
    }

    return JsonHttpResponse(ret_map)
