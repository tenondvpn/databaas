#encoding:utf-8
import logging
import numbers
import traceback

from django.contrib.auth.models import User
from django.conf import settings
logger = logging.getLogger(settings.PROJECT_NAME)

def get_admins():
    ''' 获取管理员账号，在系统配置中 '''
    try:
        users = User.objects.filter(is_superuser=1)
        tmp_map = map(lambda x: x.username.strip(), users)
        return tmp_map
    except Exception as ex:
        logger.error('get system noah admins fail, msg: %s' \
                         % traceback.format_exc())
        raise Exception('获取系统管理配置失败')

def is_admin(user):
    ''' @param user: string or User '''
    if isinstance(user, (numbers.Number, str)):
        try:
            user = User.objects.get(pk=user)
        except Exception as ex:
            return False

    name = ''
    if isinstance(user, str):
        name = user

    if isinstance(user, User):
        name = user.username

    if name == settings.SITE_ADMIN or user.is_superuser:
        return True

    admins = []
    try:
        admins = get_admins()
    except:
        pass

    return name in admins
