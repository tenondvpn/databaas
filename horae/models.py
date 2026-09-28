from django.db import models
from django.contrib.auth.models import User
from horae.perm_history_manager import PermHistoryManager

class Pipeline(models.Model):
    name = models.CharField(max_length=128, unique=True)
    owner_id = models.IntegerField(default=0, db_index=True)
    ct_time = models.CharField(max_length=250)
    update_time = models.DateTimeField('date published')
    enable = models.IntegerField(default=0, db_index=True)
    type = models.IntegerField(default=0, db_index=True)
    email_to = models.CharField(max_length=1024, default="", null=True)
    description = models.CharField(max_length=1024, null=True)
    sms_to = models.CharField(max_length=1024, null=True)
    tag = models.CharField(max_length=1024, default="", null=True)
    life_cycle = models.CharField(max_length=50)
    monitor_way = models.IntegerField(default=0)
    private = models.IntegerField(default=0)
    project_id = models.IntegerField(default=0, db_index=True, null=True)
    graph = models.TextField(null=True)

class Processor(models.Model):
    name = models.CharField(max_length=250, unique=True)
    type = models.IntegerField(default=0, db_index=True)
    template = models.TextField(null=True)
    update_time = models.DateTimeField('update_time')
    description = models.CharField(max_length=1024)
    config = models.TextField(null=True)
    owner_id = models.IntegerField(default=0, db_index=True)
    private = models.IntegerField(default=0, db_index=True, null=True)
    ap = models.IntegerField(default=0, db_index=True, null=True)
    tag = models.CharField(max_length=1024, null=True)
    tpl_files = models.CharField(max_length=1024, null=True)
    project_id=models.IntegerField(default=0, db_index=True, null=True)
    input_config = models.TextField(null=True)
    output_config = models.TextField(null=True)

class Task(models.Model):
    pl_id = models.IntegerField(default=0, db_index=True)
    pid = models.IntegerField(default=0, db_index=True)
    next_task_ids = models.CharField(max_length=10240, default=",", null=True)
    prev_task_ids = models.CharField(max_length=1024, default=",", null=True)
    over_time = models.IntegerField(default=0)
    name = models.CharField(max_length=250)
    config = models.TextField(null=True)
    retry_count = models.IntegerField(default=0, null=True)
    last_run_time = models.CharField(max_length=50, null=True)
    priority = models.IntegerField(default=6, null=False)
    except_ret = models.IntegerField(default=0, null=False)
    description = models.CharField(max_length=1024, null=True)
    server_tag = models.CharField(max_length=50, default='ALL')
    version_id = models.IntegerField(default=0, null=False)

class Schedule(models.Model):
    task_id = models.IntegerField(default=0, db_index=True)
    run_time = models.CharField(max_length=20, db_index=True)
    status = models.IntegerField(default=0)
    pl_id = models.IntegerField(default=0, db_index=True)
    end_time = models.DateTimeField(
            'task terminate time',
            null=True,
            default='2000-01-01 00:00:00')
    start_time = models.DateTimeField(
            'task start time',
            default='2000-01-01 00:00:00')
    init_time = models.DateTimeField(
            'task called time',
            null=True,
            default='2000-01-01 00:00:00')
    ret_code = models.IntegerField(default=0, null=True)

    class Meta:
        unique_together = ("task_id", "run_time")

class RunHistory(models.Model):
    task_id = models.IntegerField(default=0, db_index=True)
    run_time = models.CharField(max_length=20, db_index=True)
    pl_id = models.IntegerField(default=0, db_index=True)
    start_time = models.DateTimeField(
            'task start time',
            null=True,
            default='2000-01-01 00:00:00')
    end_time = models.DateTimeField(
            'task terminate time',
            null=True,
            default='2000-01-01 00:00:00')
    status = models.IntegerField(default=0, db_index=True)
    schedule_id = models.IntegerField(default=0, db_index=True)
    tag = models.IntegerField(default=0, null=True)
    type = models.IntegerField(default=0)
    task_handler = models.CharField(max_length=4096, null=True)
    run_server = models.CharField(max_length=20, null=True)
    server_tag = models.CharField(max_length=50, default='ALL')
    pl_name = models.CharField(max_length=1024, null=False)
    task_name = models.CharField(max_length=1024, null=False)
    cpu = models.IntegerField(default=0, null=True)
    mem = models.IntegerField(default=0, null=True)
    ret_code = models.IntegerField(default=0, null=True)

    class Meta:
        unique_together = ("task_id", "run_time")

class RerunHistory(models.Model):
    task_id = models.IntegerField(default=0, db_index=True)
    run_time = models.CharField(max_length=20, db_index=True)
    pl_id = models.IntegerField(default=0, db_index=True)
    start_time = models.DateTimeField(
        'task start time',
        null=True,
        default='2000-01-01 00:00:00')
    end_time = models.DateTimeField(
        'task terminate time',
        null=True,
        default='2000-01-01 00:00:00')
    status = models.IntegerField(default=0, db_index=True)
    schedule_id = models.IntegerField(default=0, db_index=True)
    tag = models.IntegerField(default=0, null=True)
    type = models.IntegerField(default=0)
    task_handler = models.CharField(max_length=4096, null=True)
    run_server = models.CharField(max_length=20, null=True)
    server_tag = models.CharField(max_length=50, default='ALL')
    pl_name = models.CharField(max_length=1024, null=False)
    task_name = models.CharField(max_length=1024, null=False)

class ReadyTask(models.Model):
    pl_id = models.IntegerField(default=0, db_index=True)
    schedule_id = models.IntegerField(default=0, db_index=True)
    status = models.IntegerField(default=0)
    update_time = models.DateTimeField('date published', null=True)
    type = models.IntegerField(default=0)
    init_time = models.DateTimeField('task called time', null=True)
    retry_count = models.IntegerField(default=0, null=True)
    retried_count = models.IntegerField(default=0, null=True)
    run_time = models.CharField(max_length=20, db_index=True)
    server_tag = models.CharField(max_length=50, null=True)
    task_id = models.IntegerField(default=0, db_index=True)
    pid = models.IntegerField(default=0, db_index=True)
    owner_id = models.IntegerField(default=0, db_index=True)
    run_server = models.CharField(max_length=20, default='', null=True)
    task_handler = models.CharField(max_length=4096, default='', null=True)
    is_trigger = models.IntegerField(default=0, null=False)
    next_task_ids = models.CharField(max_length=200, default=",", null=True)
    prev_task_ids = models.CharField(max_length=200, default=",", null=True)
    work_dir = models.CharField(max_length=1024, default='', null=True)
    ret_code = models.IntegerField(default=0, null=True)

    class Meta:
        unique_together = ("task_id", "run_time", "schedule_id", "is_trigger")

class UploadHistory(models.Model):
    processor_id = models.IntegerField(default=0, db_index=True)
    # 算子使用状态： 0没用 1使用中
    status = models.IntegerField(default=0)
    update_time = models.DateTimeField('date published', null=True)
    upload_time = models.DateTimeField('date published', null=True)
    upload_user_id = models.IntegerField(default=0, db_index=True)
    version = models.CharField(
            max_length=250,
            null=False,
            unique=False)
    description = models.CharField(max_length=1024, default='', null=True)
    name = models.CharField(max_length=250, null=False)
    git_url = models.CharField(max_length=1024, null=True)
    type = models.IntegerField(default=-1)

    class Meta:
        unique_together = ("processor_id", "name")


class Project(models.Model):
    name = models.CharField(max_length=20)
    owner_id = models.IntegerField(default=0, db_index=True)
    is_default = models.IntegerField(default=0, null=False)  # 默认个人项目
    description = models.CharField(max_length=10240, default='', null=True)
    parent_id = models.IntegerField(default=0, db_index=True)
    type = models.IntegerField(default=0, db_index=True)  # 0 pipeline的项目管理，1 processor的项目管理
    class Meta:
        unique_together = ("name", "type")

class OrderdSchedule(models.Model):
    task_id = models.IntegerField(default=0, db_index=True)
    run_time = models.CharField(max_length=20, db_index=True)
    status = models.IntegerField(default=0)
    pl_id = models.IntegerField(default=0, db_index=True)
    end_time = models.DateTimeField(
            'task terminate time',
            null=True,
            default='2000-01-01 00:00:00')
    start_time = models.DateTimeField(
            'task start time',
            default='2000-01-01 00:00:00')
    init_time = models.DateTimeField(
            'task called time',
            null=True,
            default='2000-01-01 00:00:00')
    ordered_id = models.CharField(max_length=255, db_index=True)
    run_tag = models.IntegerField(default=0, db_index=True)

    class Meta:
        unique_together = ("task_id", "run_time")

class PermHistory(models.Model):
    resource_type = models.CharField(max_length=16)
    resource_id = models.BigIntegerField()
    permission = models.CharField(
        max_length=200,
        verbose_name='seprated by |, like: read|update')
    applicant = models.ForeignKey(User, related_name='proposer_user', on_delete=models.CASCADE)
    grantor = models.ForeignKey(User, related_name='grantor_user', on_delete=models.CASCADE)

    (PENDING_STATUS, ACCEPTED_STATUS, DENIED_STATUS,
     GRANTED_STATUS, REVOKED_STATUS) = range(5)
    status_choices = (
        (PENDING_STATUS, 'pending'),
        (ACCEPTED_STATUS, 'accepted'),
        (DENIED_STATUS, 'denied'),
        (GRANTED_STATUS, 'unsolicited grant'),
        (REVOKED_STATUS, 'unsolicited revoke'),
    )
    status = models.PositiveSmallIntegerField(
        choices = status_choices,
        default = PENDING_STATUS)
    deadline = models.DateTimeField(null=True, blank = True, default='2000-01-01 00:00:00')
    update_time = models.DateTimeField(auto_now=True)
    create_time = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=512)

    # 同项目
    PERM_TYPE_INSIDE_PROJECT = 0
    # 跨项目
    PERM_TYPE_CROSS_PROJECT = 1
    odps_perm_type = models.IntegerField(default=-1, null=True)
    objects = PermHistoryManager(
        PENDING_STATUS, ACCEPTED_STATUS, DENIED_STATUS,
        GRANTED_STATUS, REVOKED_STATUS)

class VisitRecord(models.Model):
    app = models.CharField(max_length = 128)
    uri = models.CharField(max_length = 128)
    param = models.CharField(max_length = 128, default = '')
    user = models.ForeignKey(
        User, null = True, related_name = 'user_view_history', on_delete=models.CASCADE)
    description = models.CharField(max_length = 1024, default = '')
    ip = models.CharField(max_length = 64, default = '')
    visit_time = models.DateTimeField(auto_now_add = True)

    @staticmethod
    def add(app, uri, param = '', user = None, description = '', ip = ''):
        VisitRecord.objects.create(
            app = app, uri = uri, param = param,
            user = user, description = description,
            ip = ip)

    @staticmethod
    def request_add(request, param = '', description = ''):
        items = request.path.split('/')
        app = items[1] if len(items) >= 2 \
            else items[0] if len(items) >= 1 else 'none'

        if not request.user or request.user.is_anonymous:
            user = None
        else:
            user = request.user

        VisitRecord.add(app, request.path, param = param,
            user = user, description = description,
            ip = request.META['REMOTE_ADDR'])

    @staticmethod
    def count(conditions = None):
        # conditions: {'user': user, 'uri': 'uri', 'app': 'app'}
        # key可能为user uri app中的0个或多个
        if not conditions:
            conditions = {}
        return VisitRecord.objects.filter(**conditions).count()

class Edge(models.Model):
    prev_task_id = models.IntegerField(default=0, db_index=False)
    next_task_id = models.IntegerField(default=0, db_index=False)
    stream_type = models.IntegerField(default=0, db_index=False)
    file_name = models.CharField(max_length=1024, default='', null=True)
    rcm_context = models.CharField(max_length=256, default='', null=True)
    rcm_topic = models.CharField(max_length=256, default='', null=True)
    rcm_partition = models.IntegerField(default=0, db_index=False)
    dispatch_tag = models.IntegerField(default=-1, db_index=False)
    pipeline_id = models.IntegerField(default=0, db_index=False)
    last_update_time_us = models.BigIntegerField(default=0, null=True)
    class Meta:
        unique_together = ("prev_task_id", "next_task_id")

class UserInfo(models.Model):
    userid = models.IntegerField(default=0, db_index=False)
    email = models.CharField(max_length=1024, default='', null=True)
    dingding = models.CharField(max_length=256, default='', null=True)

class GlobalStat(models.Model):
    """顶部四个统计卡片"""
    indicator_name = models.CharField(max_length=50, verbose_name="指标名称")
    current_value = models.CharField(max_length=50, verbose_name="当前数值")
    trend_rate = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="涨跌幅")
    icon_class = models.CharField(max_length=50, blank=True, verbose_name="图标样式") # 如 fa-database

    class Meta:
        verbose_name = "总盘统计"
        db_table = 'overview_stats'

class GlobalTrend(models.Model):
    """总盘趋势图数据"""
    TYPE_CHOICES = (
        ('data', '数据总量'),
        ('compute', '算力总量'),
        ('model', '模型总量'),
    )
    metric_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    label = models.CharField(max_length=20, verbose_name="时间标签") # 如 1月, 2月
    value = models.FloatField(verbose_name="数值")
    order = models.IntegerField(default=0, verbose_name="排序")

    class Meta:
        verbose_name = "总盘趋势"
        db_table = 'overview_trends'
        ordering = ['order']

class RealTimeTrade(models.Model):
    """实时交易流水表 - 用于底部列表"""
    ELEMENT_CHOICES = [
        ('data', '数据'),
        ('compute', '算力'),
        ('model', '模型'),
    ]
    name = models.CharField(max_length=100, verbose_name="要素名称")
    category = models.CharField(max_length=50, verbose_name="所属分类") # 交通、医疗、GPU等
    price_label = models.CharField(max_length=50, verbose_name="价格显示") # 如 ¥2,450
    status_text = models.CharField(max_length=20, verbose_name="状态") # 交易中、竞价中
    status_color = models.CharField(max_length=10, default="#4ade80") # 颜色代码
    trade_time = models.DateTimeField(auto_now_add=True, verbose_name="交易时间")

    class Meta:
        db_table = 'realtime_trades'
        ordering = ['-trade_time']

class TradeVolumeTrend(models.Model):
    """交易趋势统计表 - 用于中间折线图"""
    time_point = models.CharField(max_length=10, verbose_name="时间点") # 09:00, 10:00
    data_volume = models.FloatField(verbose_name="数据量(PB)")
    trade_value = models.FloatField(verbose_name="交易额(亿)")

    class Meta:
        db_table = 'trade_volume_trends'
        ordering = ['id']

class DataMarketTrend(models.Model):
    """数据大盘趋势表 - 用于中间折线图"""
    time_label = models.CharField(max_length=20, verbose_name="时间点") # 如: 09:00
    data_volume = models.FloatField(verbose_name="数据量(PB)")
    trade_value = models.FloatField(verbose_name="交易额(亿)")
    create_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'data_market_trends'
        ordering = ['id']

class DataElementDetail(models.Model):
    """数据要素明细表 - 用于底部列表和分类统计"""
    name = models.CharField(max_length=100, verbose_name="数据名称")
    category = models.CharField(max_length=50, verbose_name="行业分类") # 如: 交通、医疗、能源
    price_tag = models.CharField(max_length=50, verbose_name="价格标签") # 如: ¥2,450
    status = models.CharField(max_length=20, verbose_name="交易状态")    # 如: 交易中、竞价中
    status_color = models.CharField(max_length=10, default="#4ade80")   # 颜色代码
    
    class Meta:
        db_table = 'data_element_details'

class DataCategory(models.Model):
    """数据要素明细表 - 用于分类数据统计"""
    name = models.CharField(max_length=100, verbose_name="要素名称")
    # 核心字段：用于分类
    category_name = models.CharField(max_length=50, verbose_name="行业分类") # 医疗, 交通, 能源, 金融等
    data_size = models.FloatField(verbose_name="数据大小(GB)", default=0)
    create_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'data_category_detail'
        verbose_name = "数据分类明细"

class DataDetail(models.Model):
    """数据要素详细信息表"""
    element_id = models.CharField(max_length=50, unique=True, verbose_name="要素编号")
    name = models.CharField(max_length=255, verbose_name="数据名称")
    category = models.CharField(max_length=100, verbose_name="分类") # 医疗、交通等
    provider = models.CharField(max_length=255, verbose_name="提供方")
    price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="交易价格")
    unit = models.CharField(max_length=20, default="元/次", verbose_name="计价单位")
    status = models.CharField(max_length=50, verbose_name="状态") # 正常、维护、已下架
    status_code = models.IntegerField(default=1) # 1: 正常, 0: 异常
    last_update = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    class Meta:
        db_table = 'data_element_detail_list'
        ordering = ['-last_update']

class ComputeMarketTrend(models.Model):
    """算力大盘趋势表 - 用于算力消耗折线图"""
    time_label = models.CharField(max_length=20, verbose_name="时间点") # 如: 09:00
    compute_power = models.FloatField(verbose_name="算力输出(EF)")
    active_tasks = models.IntegerField(verbose_name="活跃任务数")
    create_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'compute_market_trends'
        ordering = ['id']

class ComputeResourceOverview(models.Model):
    """算力总览明细表 - 用于算力列表和资源占比统计"""
    resource_name = models.CharField(max_length=100, verbose_name="资源名称") # 如: A100集群, 昇腾910B
    provider = models.CharField(max_length=100, verbose_name="服务商")    # 如: 阿里云, 华为云
    compute_type = models.CharField(max_length=50, verbose_name="算力类型")  # 如: 通用算力, 智算算力
    core_type = models.CharField(max_length=50, verbose_name="核心型号")    # 如: 国产, 进口
    utilization = models.FloatField(verbose_name="使用率(%)")
    status = models.CharField(max_length=20, default="运行中")
    status_color = models.CharField(max_length=10, default="#4ade80")

    class Meta:
        db_table = 'compute_resource_overview'

class ComputeCategoryDetail(models.Model):
    """算力资源分类明细表"""
    resource_id = models.CharField(max_length=50, unique=True, verbose_name="资源编号")
    name = models.CharField(max_length=100, verbose_name="资源名称")
    # 分类维度1: 算力用途分类
    compute_type = models.CharField(max_length=50, verbose_name="算力类型") # 如: 智算算力, 通用算力, 超算算力
    # 分类维度2: 核心架构分类
    arch_type = models.CharField(max_length=50, verbose_name="核心架构")    # 如: GPU, CPU, NPU
    # 分类维度3: 品牌/来源分类
    brand_type = models.CharField(max_length=50, verbose_name="算力来源")   # 如: 国产, 进口
    
    capacity = models.FloatField(verbose_name="算力容量(PFLOPS)")
    create_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'compute_category_detail'
        verbose_name = "算力分类明细"

class ComputeDetail(models.Model):
    """算力资源明细表"""
    node_id = models.CharField(max_length=50, unique=True, verbose_name="节点编号")
    node_name = models.CharField(max_length=100, verbose_name="节点名称")
    provider = models.CharField(max_length=100, verbose_name="供应商")
    
    # 核心规格
    gpu_model = models.CharField(max_length=50, verbose_name="核心型号") # 如: NVIDIA A100, 昇腾910B
    gpu_count = models.IntegerField(verbose_name="核心数量")
    mem_size = models.IntegerField(verbose_name="显存/内存(GB)")
    
    # 状态与定价
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="租用单价(元/时)")
    status = models.CharField(max_length=20, verbose_name="当前状态") # 使用中, 待机, 维护
    load_factor = models.FloatField(verbose_name="实时负载(%)") # 0-100
    
    last_ping = models.DateTimeField(auto_now=True, verbose_name="最后在线时间")

    class Meta:
        db_table = 'compute_node_details'
        ordering = ['-load_factor'] # 默认按负载排序

class ModelMarketTrend(models.Model):
    """模型大盘趋势表 - 用于模型新增数量折线图"""
    time_label = models.CharField(max_length=20, verbose_name="时间点") # 如: 1月, 2月
    model_count = models.IntegerField(verbose_name="累计模型数")
    active_requests = models.IntegerField(verbose_name="调用频次(万次)")
    create_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'model_market_trends'
        ordering = ['id']

class ModelAssetOverview(models.Model):
    """模型资产总览表 - 用于模型列表和热度统计"""
    model_name = models.CharField(max_length=100, verbose_name="模型名称") # 如: GPT-4o, 文心一言
    provider = models.CharField(max_length=100, verbose_name="发布厂商")   # 如: OpenAI, 百度
    model_type = models.CharField(max_length=50, verbose_name="技术领域")   # 如: NLP, CV, 多模态
    parameters = models.CharField(max_length=50, verbose_name="参数规模")   # 如: 175B, 7B
    license_type = models.CharField(max_length=50, verbose_name="开源协议") # 如: Apache-2.0, 商用授权
    rating = models.FloatField(verbose_name="市场热度/评分") # 0-5.0
    status = models.CharField(max_length=20, default="可调用")
    status_color = models.CharField(max_length=10, default="#60a5fa")

    class Meta:
        db_table = 'model_asset_overview'

class ModelCategoryDetail(models.Model):
    """模型分类明细表 - 用于统计不同领域的模型分布和价格"""
    model_name = models.CharField(max_length=100, verbose_name="模型名称")
    # 分类维度：如 医疗、交通、能源、金融等
    category_name = models.CharField(max_length=50, verbose_name="所属领域") 
    # 技术类型：如 大语言模型(LLM)、计算机视觉(CV)、音频处理等
    tech_type = models.CharField(max_length=50, verbose_name="技术类型")
    # 价格指标
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="模型价格(万元)")
    
    create_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'model_category_detail'
        verbose_name = "模型分类明细"

class ModelDetail(models.Model):
    """模型资产详细明细表"""
    model_id = models.CharField(max_length=50, unique=True, verbose_name="模型编号")
    name = models.CharField(max_length=100, verbose_name="模型名称")
    provider = models.CharField(max_length=100, verbose_name="模型来源/厂商")
    
    # 技术详情
    framework = models.CharField(max_length=50, verbose_name="算法框架") # 如: PyTorch, TensorFlow, MindSpore
    task_type = models.CharField(max_length=50, verbose_name="任务类型") # 如: 文本生成, 图像识别, 语义分割
    parameter_scale = models.CharField(max_length=50, verbose_name="参数量级") # 如: 7B, 175B, 1.5T
    
    # 商业与状态
    billing_method = models.CharField(max_length=50, verbose_name="计费方式") # 如: 按Token计费, 按次计费, 独占部署
    price_tag = models.CharField(max_length=50, verbose_name="价格显示") # 如: ¥0.02/1k Tokens
    status = models.CharField(max_length=20, verbose_name="服务状态") # 如: 运行中, 极速响应, 维护中
    health_score = models.IntegerField(default=100, verbose_name="健康度") # 0-100
    
    update_time = models.DateTimeField(auto_now=True, verbose_name="最后更新时间")

    class Meta:
        db_table = 'model_asset_details'
        ordering = ['-update_time']