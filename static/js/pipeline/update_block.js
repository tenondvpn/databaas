function hrefindex(pipe_id) {
    top.location.href = "/pipeline/task/" + pipe_id + "/";
}

//修改数据Ajax
function updateTaskAjax(id) {
    $("#update_busy_icon").show();
    $("#update_task_btn").attr('disabled', "true");
    $("#id_template").removeAttr('disabled');

    var url = "/pipeline/update_task/" + id + "/";
    var param = $("#create_task_form").serialize();
    var version_id = $("#proc_version_select").val();
    param += "&version_id=" + version_id;
    $.ajax({
        type: 'post',
        url: url,
        dataType: "json",
        data: param,
        success: function (result) {
            if (result.status) {
                $('#messageModal .modal-body p').text(result.msg);
                $('#messageModal').modal('show');
            } else {
                $('.modal_iframe', window.parent.document).hide();
                $('.modal-backdrop', window.parent.document).remove();
                window.parent.update_task_callback(result.task);
            }
            $("#update_busy_icon").hide();
            $("#update_task_btn").removeAttr('disabled');
            $("#id_template").attr("disabled", true)
        }
    });
}


//修改数据
function update_task(id) {
    //保存前准备
    var config_str = combineParams("paramDiv");
    $("#id_config").val(config_str);

    //若id_over_time == '' 默认值0
    if ($("#id_over_time").val() == '') {
        $("#id_over_time").val(0);
    }
    //依赖任务
    var task_list = combineTasks();
    $("#id_prev_task_ids").val(task_list);
    //服务标签
    if ($("#server_tag_select").val() != '') {
        $("#id_server_tag").val($('#server_tag_select').prev().find('input').eq(1).val());
    }

    updateTaskAjax(id);
}

var script_param = '';
var spark_param = ('<option value=""></option>' +
    '<option value="--master">--master</option>' +
    '<option value="--driver-memory">--driver-memory</option>' +
    '<option value="--executor-memory">--executor-memory</option>' +
    '<option value="--executor-cores">--executor-cores</option>' +
    '<option value="--py-files">--py-files</option>' +
    '<option value="--files">--files</option>');
//参数默认值数组
var param_arr = [script_param, spark_param];

//点击添加任务参数
function addTemplate() {
    var param_input_val = '';
    var type = $("#type").val();
    var param_div = "<div class='form-group param_div'" +
        " style='margin-left: 82px;margin-top: 0px;margin-bottom: 0px;'>" +
        "from <input type='text' value=" + param_arr[type - 1] + "placeholder='填写参数的值' class='form-control' style='width:327px;'/>&nbsp;" +
        " to <input type='text' value='" + param_input_val + "'" +
        " placeholder='填写参数的值' class='form-control'" +
        " style='width:327px;'/>";
    param_div += "&nbsp;</dev>";

    $('#paramDiv').append(param_div);

    //$('.combobox').combobox();
    $("#paramDiv .combobox:last").combobox();
    paramIndex++;

    //by xl
    if (type == 1) {
        $('#paramDiv .add-on').unbind('click');
    } else {
        var arr = [];
        $('#paramDiv input.combobox').each(function (index) {
            var text = $(this).val();
            // console.log(text);
            arr.push(text);
            this.index = index;
            // console.log(arr);
            $(this).unbind('blur');
            $(this).unbind('blur');
            $(this).on('blur', function () {
                var index = this.index;
                // console.log(index);
                if ($(this).val() == "") {
                    $(this).val(arr[index]);
                    // console.log(arr[index]);
                }
            }).on('change', function () {
                arr[this.index] = $(this).val();
            });
        });
    }
}

var taskvalue;
var text1, text2, minh, day, hour;
var changeindex = 0;

function deleteParam(obj, index) {
    $(obj).parent().remove();
}

function addPipeTask() {
    var select_str = "";
    var task_id = $('#task_id').val();
    $.ajax({
        type: 'post',
        async: false,
        url: '/pipeline/get_pipelines/',
        data: {'plIndex': pIndex, 'task_id': task_id},
        success: function (result) {
            if (result.status == 0) {
                var pipelines = result.pipeline_list;
                if (pipelines.length > 0) {
                    select_str += "<div class='form-group'" +
                        " style='margin-left: 104px;'><select id='rely_pipeline" + pIndex +
                        "' onchange='get_tasks(" + pIndex + ")' style='width:350px'" +
                        " class='combobox select2-select-00 full-width-fix select2-offscreen'>" +
                        "<option value=''>--请选择流程--</option>";

                    for (var i = 0; i < pipelines.length; i++) {
                        select_str += "<option value='" + pipelines[i].id + "' >" +
                            pipelines[i].name + "</option>";
                    }

                    select_str += "</select>&nbsp<select id='rely_task" + pIndex +
                        "' style='width:350px' class='combobox select2-select-00 full-width-fix select2-offscreen'>" +
                        "<option value=''>--请选择任务--</option></select>&nbsp;" +
                        "<i class='fa fa-plus-square' style='cursor:pointer;color:green;' title='添加' onclick='addPipeTask()' href='javascript:void(0)'></i>&nbsp;" +
                        "<i title='删除' class='fa fa-minus-square' style='cursor:pointer;color:red' onclick='deletePlDiv(this)'" +
                        " href='javascript:void(0)'></i></div>";

                    // console.log(select_str);
                    $("#plDiv").append(select_str);

                    $('#rely_pipeline' + pIndex).select2();
                    $('#s2id_rely_pipeline' + pIndex).css({
                        'width': '346px',
                        'margin-left': '10px'
                    });
                    $('#rely_pipeline' + pIndex).prev().find('.select2-chosen').text('--请选择流程--');
                    // $('#rely_task'+pIndex).combobox();
                    //by xl
                    var addinput = $('#rely_pipeline' + pIndex).prev().find('input').eq(1);
                    var text = addinput.val();
                    addinput.on('blur', function () {
                        if ($(this).val() == "") {
                            $(this).val(text);
                        }
                    });
                    $('#rely_task' + pIndex).select2();
                    $('#rely_task' + pIndex).prev().find('.select2-chosen').text('--请选择任务--');
                    $('#s2id_rely_task' + pIndex).css({

                        'width': '364px',
                        'margin-left': '9px'
                    });
                }
                else {
                    alert("你没有拥有权限的流程，不能添加依赖！");
                }
            }
        }
    });
    pIndex++;
}

function deletePlDiv(obj) {
    $(obj).parent().remove();
}

function get_tasks(index) {
    var id = $("#rely_pipeline" + index).val();
    $('#rely_task' + index).prev().find('.select2-chosen').text('--请选择任务--');

    var url = "/pipeline/get_tasks/";
    var task_select = '';
    if (id != '' && id != null) {
        $.ajax({
            type: 'post',
            url: url,
            async: false,
            dataType: 'json',
            data: {'pipeline_id': id},
            success: function (result) {
                $("#rely_task" + index).empty();
                var task_list = result.task_list;
                if (task_list.length > 0) {
                    for (var i = 0; i < task_list.length; i++) {
                        task_select += "<option value='" + task_list[i].id + "'>" +
                            task_list[i].name + "</option>";
                    }
                }
                else {
                    task_select = "<option value=''>无</option>";
                }

                $("#rely_task" + index).append(task_select);
            }
        });
    }
    else {
        //流程为空
        $("#rely_task" + index).empty();
    }
}

//去除字符串中间空格
function trim(str) {
    return str.replace(/[ ]/g, ""); //去除字符串中的空格
}

//组装参数配置**
function combineParams(id) {
    var config = "";
    var template = "";
    if (id == 'processor_param') {
        $("#" + id + " div").each(function () {
            $(this).find("input[type='text']").each(function (j) {
                if (j == 0 && $(this).val()) {
                    config += $(this).val() + '=';
                }
                if (j == 1) {
                    config += $(this).val() + "\n";
                }
            });
        });
    }
    else {
        $("#" + id + " div.param_div").each(function (i) {
            $(this).find("input[type='text']").each(function (j) {
                if (j == 0) {
                    if ($(this).val() == '') {
                        //alert('请选择参数！');
                        return;
                    }
                    else {
                        config += $(this).val() + '=';
                    }
                }
                else {
                    if ($(this).val() == '') {
                        config += '\n';
                    }
                    else {
                        config += $(this).val() + "\n";
                    }
                }
            })

        });
    }
    //alert(config);
    return config;
}

//组装依赖任务list
function combineTasks() {
    var task_list = '';
    $("#plDiv div").each(function () {
        $(this).find("select").each(function (i) {
            if (i == 1 && $(this).val() != '') {
                task_list += $(this).val() + ',';
            }
        });
    })
    if (task_list.length > 1) {
        task_list = task_list.substr(0, task_list.length - 1);
    }
    return task_list;
}

//保存前设置form参数
function task_attribute() {
    //使用已有算子
    var use_processor = $("#id_use_processor").is(':checked');
    if (use_processor) {
        $("#id_processor_id").val($("#processor_select").val());
        $("#id_config").val(combineParams("processor_param"));
    }
    else {
        $("#id_processor_id").val(0);
        $("#id_config").val(combineParams("paramDiv"));
    }
    $("#id_config").val(combineParams("paramDiv"));
    //若id_over_time == '' 默认值0
    if ($("#id_over_time").val() == '') {
        $("#id_over_time").val(0);
    }

    //服务标签
    if ($("#server_tag_select").val() != '') {
        $("#id_server_tag").val($("#server_tag_select").val());
    }

    //依赖任务
    var task_list = combineTasks();
    $("#id_prev_task_ids").val(task_list);
}

//获取服务器标签
function get_server_tags(task_type) {
    var options = "";
    $.ajax({
        type: "post",
        url: '/pipeline/get_server_tags/',
        async: false,
        dataType: "json",
        data: {'task_type': task_type},
        success: function (result) {
            if (result.status) {
                //alert(result.msg);
                $("#server_tag_div").hide();
                $("#server_tag_select").empty();

            } else {
                $("#server_tag_div").show();
                var server_tags = result.server_tags;
                if (server_tags != '') {
                    var server_tags_arr = server_tags.split(',');
                    for (var i = 0; i < server_tags_arr.length; i++) {
                        options += "<option value='" + server_tags_arr[i] + "' >" +
                            server_tags_arr[i] + "</option>";
                    }
                    $('#server_tag_select option').remove();
                    $("#server_tag_select").append(options);
                }
            }
        }
    });
}

//添加任务的index
var pIndex = 0;

//添加参数的index
var paramIndex = 0;

function init_create_param() {
    $('.changevalue', window.parent.document).on('click', function () {
        choosevalue = 1;
        $('#modalcheck_iframe', window.parent.document).modal('hide');
    });

    //清掉整个Div
    var div_str = "<label style='margin-right: 3px;'>" +
        "<font color='red'>*</font>" +
        "依赖任务:</label><dev>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;" +
        "<i class='fa fa-plus-square' style='color:green;cursor:pointer' title='添加' onclick='addPipeTask()' href='javascript:void(0)'></i></div>";
    $('#plDiv').html(div_str);

    var div_str = "<label style='margin-right: 3px;'>" +
        "<font color='red'>*</font>" +
        "交易列表:</label><dev>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;" +
        "</dev>"
    $('#paramDiv').html(div_str);


    $("#create_task_btn").click(function () {
        //填充所需字段,create前准备
        task_attribute();
        createTaskAjax();
    });


    $('select.combobox').combobox();
    $('input.combobox').each(function () {
        $(this).val($(this).val());
    });
    $('#paramDiv .add-on').unbind('click');

    var reportTo = "";
    $.ajax({
        type: "post",
        url: '/pipeline/get_pipelines/',
        async: false,
        dataType: "json",
        success: function (result) {
            if (result.status) {
            } else {
                var pipelines = result.pipeline_list;
                for (var i = 0; i < pipelines.length; i++) {
                    reportTo += "<option value='" + pipelines[i].id + "' >" +
                        pipelines[i].name + "</option>";
                }
            }
            $("#rely_pipeline1").append(reportTo);
            $('#rely_pipeline1').select2();
            $('#s2id_rely_pipeline1').find('.select2-chosen').text($('#rely_pipeline1 option:selected').text());
            $('#s2id_rely_pipeline1').css({
                'width': '346px',
                'margin-left': '10px'
            });

            $('#rely_task1').select2();
            $('#s2id_rely_task1').find('.select2-chosen').text('--请选择任务--');
            $('#s2id_rely_task1').css({
                'margin-left': '6px',
                'width': '364px'
            });
        }
    });

    //获取服务标签
    get_server_tags($('#id_choosed_proc_type').val());
    $('#server_tag_select').combobox();
    $('#server_tag_select').parent().css({
        'margin-left': '4px',
        'margin-top': '-5px'
    });
    var tagtext = $('#server_tag_select').parent().find('input').eq(1).val();
    $('#server_tag_select').parent().find('input').eq(1).on('blur', function () {
        // console.log(tagtext);
        if ($(this).val() == "") {
            $(this).val(tagtext);
        }

    }).on('change', function () {
        // console.log(tagtext);
        tagtext = $(this).val();
    });
}

$(function () {
    $('#seachprocess').on('click', function () {
        var url = $(this).attr('url');
        window.open(url);
    });
    init_create_param();
    var type = $("#type").val();
    var quote_num = $("#quote_num").val();
    $("#more_task").show();
    $("#more_task_btn").show();
    $("#more_task_span").show();
    if (type == 3) {
        if (quote_num > 1) {
            $("#click_modify").show();
        }
    }
    //重置参数列表
    if (type != 1) {
        $("[name='type']").change();
    }

    var template = $("#template").val();
    $("#id_template").val(template);
    if (quote_num > 1) {
        $("#id_template").attr("disabled", true);
    }

    //清掉整个Div
    $("#paramDiv").empty();

    $('#paramDiv').html("<label style='margin-right: 3px;'>" +
        "<font color='red'>*</font>" +
        "交易列表:</label><dev>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;" +
        "</dev>");

    //参数配置展示
    var config = $("#config").val();
    if (config != '') {
        var temp = config.split('\n');
        var count = temp.length;
        if (count > 0) {
            for (var i = 0; i <= (count - 1); i++) {
                addTemplate();
            }
        }
        for (var j = 0; j < count; j++) {
            var config_str = temp[j]
            var config_str_ = config_str.split('=');
            var config_str_left = config_str_[0];
            //key-value,value里面有=的情况
            var config_str_right = temp[j].substring(config_str_left.length + 1);
            var config_right_split = config_str_right.split('\1100')
            var config_state = ""
            if (config_right_split.length >= 2) {
                config_state = config_right_split[1];
                config_str_right = config_right_split[0];
            }
            $("#paramDiv div.param_div:eq(" + j + ")").find("input[type='text']").each(function (m) {
                if (m == 0) {
                    $(this).val(config_str_left);
                }
                if (m == 1) {
                    $(this).val(config_str_right);
                }
            });
        }
        var arr = [];
        $('#paramDiv input.combobox').each(function (index) {
            var text = $(this).val();

            arr.push(text);
            this.index = index;
            $(this).unbind('change');
            $(this).unbind('blur');
            $(this).on('blur', function () {
                var index = this.index;
                console.log(index);
                if ($(this).val() == "") {
                    $(this).val(arr[index]);
                    console.log(arr[index]);
                }
            }).on('change', function () {
                arr[this.index] = $(this).val();
            });
        });

    }

    //失败重复次数
    var retry_num = $("#retry_count").val();
    switch (retry_num) {
        case '0':
            $("#id_retry_count").val(1);
            break;
        case '1':
            $("#id_retry_count").val(2);
            break;
        case '5':
            $("#id_retry_count").val(3);
            break;
        case '-1':
            $("#id_retry_count").val(4);
            break;
        default:
            $("#id_retry_count").val(1);
    }


    //清掉整个Div
    var div_str = "<label style='margin-right: 3px;'>" +
        "<font color='red'>*</font>" +
        "依赖任务:</label><dev>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;" +
        "<i class='fa fa-plus-square' style='color:green;cursor:pointer' title='添加' onclick='addPipeTask()' href='javascript:void(0)'></i></div>";
    $('#plDiv').html(div_str);

    var prev_task_ids = $("#prev_task_ids").val();
    //去除两端的逗号，写正则表达式替换
    prev_task_ids = prev_task_ids.replace(/(^,)|(,$)/g, '')
    prev_task_ids = $.trim(prev_task_ids);

    if (prev_task_ids != '') {
        var temp = prev_task_ids.split(',');
        var count = temp.length;
        if (count > 0) {
            for (var i = 0; i <= (count - 1); i++) {
                addPipeTask();
            }
        }
    }

    var rely_tasks = $.parseJSON($("#rely_tasks").val());
    var index = 0;
    for (var key in rely_tasks) {
        $("#rely_pipeline" + index).val(rely_tasks[key]);
        var rely_text = $('#rely_pipeline' + index + ' option:selected').text();
        $('#rely_pipeline' + index).prev().find('.select2-chosen').text(rely_text);
        $("#rely_pipeline" + index).change();
        $("#rely_task" + index).val(key);
        var rely_task_text = $('#rely_task' + index + ' option:selected').text();
        $('#rely_task' + index).prev().find('.select2-chosen').text(rely_task_text);

        index++;
    }

    //更新时服务标签
    var server_tag = $("#server_tag").val();
    // $("#server_tag_select").val(server_tag);

    $('#server_tag_select').prev().find('input').eq(1).val(server_tag);
    $('#server_tag_select').prev().find('input').eq(1).unbind('blur');
    $('#server_tag_select').prev().find('input').eq(1).unbind('change');
    var servertext = $('#server_tag_select').prev().find('input').eq(1).val();
    $('#server_tag_select').prev().find('input').eq(1).on('blur', function () {
        if ($(this).val() == "") {
            $(this).val(servertext);
        }
    }).on('change', function () {
        servertext = $(this).val();
    });

    var cmd = $('#copy_cmd').attr('title');
    $("#upload_cmd").html(cmd);
    //上传包命令
    $("#copy_cmd").click(function () {
        $('#con', window.parent.document).html($('#upload_cmd').html());
        $("#copyModal", window.parent.document).modal('show');
    });
});
















