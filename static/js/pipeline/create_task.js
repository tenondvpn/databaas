//创建数据Ajax
function createTaskAjax() {
    $("#create_busy_icon").show();
    $("#create_task_btn").attr('disabled', "true");
    var pipe_id = $('.modal_iframe', window.parent.document).attr("pipe_id");
    var url = "/pipeline/create_task/" + pipe_id + "/";

    //by xl
    $("#id_server_tag").val($('#server_tag_select').prev().find('input').eq(1).val());
    //
    var param = $("#create_task_form").serialize();
    param += "&type=" + $('.modal_iframe', window.parent.document).attr('proc_type');
    param += "&processor_id=" + $('.modal_iframe', window.parent.document).attr('proc_id');
    var proc_id = $('.modal_iframe', window.parent.document).attr('proc_id');
    if (proc_id == -1) {
        param += "&version_id=-1";
        param += "&use_processor=0";
    } else {
        param += "&version_id=" + $('.modal_iframe', window.parent.document).attr('version_id');
        param += "&use_processor=1";
    }

    $.ajax({
        type: 'post',
        url: url,
        dataType: "json",
        data: param,
        success: function (result) {
            if (result.status) {
                new PNotify({
                    title: '通知',
                    text: result.info,
                    addclass: 'custom',
                    type: 'error'
                });
            } else {
                $('.modal_iframe', window.parent.document).hide();
                $('.modal-backdrop', window.parent.document).remove();
                window.parent.create_task_callback(pipe_id, result.task);
            }
            $("#create_busy_icon").hide();
            $("#create_task_btn").removeAttr('disabled');
        }
    });
}

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
    $.ajax({
        type: 'post',
        url: url,
        dataType: "json",
        data: param,
        success: function (result) {
            if (result.status) {
                $('#messageModal_iframe .modal-body p', window.parent.document).text(result.msg);
                $('#messageModal_iframe', window.parent.document).modal('show');
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

var jobParam = '<option value="_user_key">_user_key</option><option value="_tpl">_tpl</option>';

var odpssqlParam = '<option value="_odps_project">_odps_project</option>'+
                    '<option value="_odps_endpoint">_odps_endpoint</option>'+
                    '<option value="_odps_access_id">_odps_access_id</option>'+
                    '<option value="_odps_access_key">_odps_access_key</option>';

var odpsmrParam = '<option value="_odps_project">_odps_project</option>'+
                    '<option value="_odps_endpoint">_odps_endpoint</option>'+
                    '<option value="_odps_access_id">_odps_access_id</option>'+
                    '<option value="_odps_access_key">_odps_access_key</option>'+
                    '<option value="_odps_mr_conf">_odps_mr_conf</option>'+
                    '<option value="_odps_mr_resources">_odps_mr_resources</option>'+
                    '<option value="_odps_mr_classpath">_odps_mr_classpath</option>'+
                    '<option value="_odps_mr_args">_odps_mr_args</option>'+
                    '<option value="_odps_mr_mainclass">_odps_mr_mainclass</option>'+
                    '<option value="_odps_libjars">_odps_libjars</option>';

var odpsxlibParam = '<option value="_odps_project">_odps_project</option>'+
                    '<option value="_odps_endpoint">_odps_endpoint</option>'+
                    '<option value="_odps_access_id">_odps_access_id</option>'+
                    '<option value="_odps_access_key">_odps_access_key</option>';

var odpssparkParam='<option value="_odps_project">_odps_project</option>'+
                    '<option value="_odps_endpoint">_odps_endpoint</option>'+
                    '<option value="_odps_access_id">_odps_access_id</option>'+
                    '<option value="_odps_access_key">_odps_access_key</option>'+
                    '<option value="_odps_spark_jar">_odps_spark_jar</option>'+
                    '<option value="_odps_spark_mainclass">_odps_spark_mainclass</option>'+
                    '<option value="_odps_spark_args_1">_odps_spark_args_1</option>'+
                    '<option value="_odps_spark_args_2">_odps_spark_args_2</option>';
//参数默认值数组
var param_arr = [script_param, spark_param,jobParam,odpssqlParam,odpsmrParam,odpsxlibParam,odpssparkParam];

//点击添加任务参数
function addTemplate() {
    var param_input_val = '';
    var type = $('.modal_iframe', window.parent.document).attr('proc_type');
    var param_div = "<div class='form-group param_div'" +
        " style='margin-left: 104px;margin-top: 0px;margin-bottom: 0px;'>" +
        "<select style='width:180px'" +
        " class='combobox form-control'>" + param_arr[type - 1] + "</select>&nbsp;" +
        "= <input type='text' value='" + param_input_val + "'" +
        " placeholder='填写参数的值' class='form-control'" +
        " style='width:474px;'/>&nbsp;&nbsp;<a style='cursor:pointer;color:green' id='"+paramIndex+"' onclick='showDataForm("+paramIndex+")'"+
        " href='javascript:void(0)'><i class='fa fa-save' style='cursor:pointer;color:black' href='javascript:void(0)'></i></a>";
    param_div += "&nbsp;&nbsp;<i class='fa fa-plus-square' style='cursor:pointer;color:green' title='添加' onclick='addTemplate()' href='javascript:void(0)'></i>" +
        "&nbsp;<i class='fa fa-minus-square' style='cursor:pointer;color:red' title='删除' onclick='deleteParam(this, " + paramIndex + ")' href='javascript:void(0)'></i></dev>";

    $('#paramDiv').append(param_div);

    //$('.combobox').combobox();
    $("#paramDiv .combobox:last").combobox();
    paramIndex++;

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
var oss,pangulength,text1,text2,minh,day,hour;
var changeindex=0;
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
    //by xl
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

var odpssql_config_param = '_odps_project=\n'+
                    '_odps_endpoint=\n'+
                    '_odps_access_id=\n'+
                    '_odps_access_key=\n'+
                    '_priority=0';
var clickhouse_config_param = '__ck_host=\n'+
                    '__ck_port=\n'+
                    '__ck_user=\n'+
                    '__ck_password=';
var docker_config_param = '__k8s_endpoint=https://10.200.48.64:6443\n'+
    '__k8s_command=\n'+
    '__k8s_docker_image=\n'+
    '__kubectl_path=/usr/local/bin/kubectl\n'+
    '__certificate_authority_data=LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUVDVENDQXZHZ0F3SUJBZ0lDRTNnd0RRWUpLb1pJaHZjTkFRRUxCUUF3YWpFcU1DZ0dBMVVFQ2hNaFl6TTAKT0RWbE1HVTVZamszWlRRMFltSmhaREE0WkRZME4yWmpaamN4WWprNU1SQXdEZ1lEVlFRTEV3ZGtaV1poZFd4MApNU293S0FZRFZRUURFeUZqTXpRNE5XVXdaVGxpT1RkbE5EUmlZbUZrTURoa05qUTNabU5tTnpGaU9Ua3dIaGNOCk1qUXdOVEl5TURnek1EQXdXaGNOTkRRd05URTNNRGd6TlRVNVdqQnFNU293S0FZRFZRUUtFeUZqTXpRNE5XVXcKWlRsaU9UZGxORFJpWW1Ga01EaGtOalEzWm1ObU56RmlPVGt4RURBT0JnTlZCQXNUQjJSbFptRjFiSFF4S2pBbwpCZ05WQkFNVElXTXpORGcxWlRCbE9XSTVOMlUwTkdKaVlXUXdPR1EyTkRkbVkyWTNNV0k1T1RDQ0FTSXdEUVlKCktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQVBZMDVyWkQ3YnI4R1Q5VzJDc29UMTJJL1FBYnM0MHUKaHM1VzB0VmRoY2g4VTEvTzRaYi9WTjY3aDkzTE5LUEkzOVpzSG1uRW8rUG1TTEtVUWlJcHdMY01tNysxMGtNMgpjY3F4UTNHWjAwek1pRVNhSmZaZUtuTFVIMVJ0ditVeTVOQTZ4a0ZlNnB2YW5BWSs3RUJOQ0NnYjNaRmJRL0ROCk4rYXNHK1lmS2dnSk1RMHZsMVN2SWVPVkQxNEhENXE3ZGJOZ3VZOEF1VGhIdSs3TkpmcTNwRXN1blgzMXp5VksKK2Z2TitxVDBSTnA1MGRzcXNnV3g4eFYyQkxLVC9aem1YaDhhbXcrRTM2eXVBNzc3dUpMSWJJTnpWbk54LzVQdApPY1VualhPdGFFRnc4cG5vb2h3SUVudUEyaVlSYUFDek9zSlo2VExXV2VVdWJ0eTV0djFvaVZzQ0F3RUFBYU9CCnVEQ0J0VEFPQmdOVkhROEJBZjhFQkFNQ0Fxd3dEd1lEVlIwVEFRSC9CQVV3QXdFQi96QWRCZ05WSFE0RUZnUVUKaFREMGQ0N1l0azFIVFlQVGRYSU55b1ZDdDU4d1BBWUlLd1lCQlFVSEFRRUVNREF1TUN3R0NDc0dBUVVGQnpBQgpoaUJvZEhSd09pOHZZMlZ5ZEhNdVlXTnpMbUZzYVhsMWJpNWpiMjB2YjJOemNEQTFCZ05WSFI4RUxqQXNNQ3FnCktLQW1oaVJvZEhSd09pOHZZMlZ5ZEhNdVlXTnpMbUZzYVhsMWJpNWpiMjB2Y205dmRDNWpjbXd3RFFZSktvWkkKaHZjTkFRRUxCUUFEZ2dFQkFPQURzUXB0WGlzOEYxSHRrU1dKdGg5V3NINHY4bUFpdTUxa0NSaHE5NDNPNG1HagplR0d0S05QUFBEclZuQzYrbURhYUFWTEo3Y2g5VjROcVM2L0FabHNkcEtwakc5MHVXZVg3L3pYZytPQll2WTIyCksyY2ExbjlJUTBEZFRpNk96M0dkY3NTcUNmd0R5ZlpZdkl4bGdaQzVNTm0vdWRlY3dVOHdCSlQvL0pqdStISnUKazZ4MHFxSS8vYVFCTUk3ZkJtelZTSElJKzREY1hmMXRRQ20zTVVOWWRVUG9ZZ3J0TWkvQVJjYmJoQ0VqNy94RApsc21LZGF3algzRXBkUzE1NlZTRVlsVkpJV0xqaW4zeU5DWXVvRnprMTNOSHE3U2RpUXFIN214b1N6UFY2VkxaCnpXbWNhNWZnQkdNYXJnL2IyTE1UcVdROGJlMGZCVlRJdCtBNE80UT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=\n'+
    '__clusters_name=kubernetes\n'+
    '__contexts_cluster=kubernetes\n'+
    '__contexts_user=270161911701457363\n'+
    '__contexts_name=270161911701457363-c3485e0e9b97e44bbad08d647fcf71b99\n'+
    '__current_context=270161911701457363-c3485e0e9b97e44bbad08d647fcf71b99\n'+
    '__users_name=270161911701457363\n'+
    '__users_client_certificate_data=LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUQ4akNDQXRxZ0F3SUJBZ0lDRjBRd0RRWUpLb1pJaHZjTkFRRUxCUUF3YWpFcU1DZ0dBMVVFQ2hNaFl6TTAKT0RWbE1HVTVZamszWlRRMFltSmhaREE0WkRZME4yWmpaamN4WWprNU1SQXdEZ1lEVlFRTEV3ZGtaV1poZFd4MApNU293S0FZRFZRUURFeUZqTXpRNE5XVXdaVGxpT1RkbE5EUmlZbUZrTURoa05qUTNabU5tTnpGaU9Ua3dIaGNOCk1qUXdPREEyTURZeU1UQXdXaGNOTWpjd09EQTJNRFl5TmpFM1dqQS9NUlV3RXdZRFZRUUtFd3h6ZVhOMFpXMDYKZFhObGNuTXhDVEFIQmdOVkJBc1RBREViTUJrR0ExVUVBeE1TTWpjd01UWXhPVEV4TnpBeE5EVTNNell6TUlJQgpJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBdHBTaWg0TDdkbWNpb1JrRVpvR05TZnJrCm1Ld3RUTTh2ZDlMb3VaMlR3YjU0eC9LYXAwMzFOazJ2Z3BodHkyb1lySWpWNytwaU9Za2Z2dWpYVjZ6bThnNWUKN3piQmRTcjViNWR4Rm56QUFtOXpJS0pZODBzTnd0K0swZGZSWDA5WjhudUUrWjZpUkorV1lPQnVncWIxclA0eAoyaDJTYVZnZ2pPb2JheG94S3VFR01oWVl4MG1tZHFKcUFLcGp1ckJKYkhWNHpxLzVieFJudTl2Vmg1THRLTFh6Clk0SW5nMU9CMmlpV0FmMzJ4VDdhWUQvZ2NRUEJmS2dRalJCRU1pZ1NFMGR6S0h0TWgzaFZjUXpaT0gzYVZ1eS8KZmJXS253NDRzSkNuSkplUWtWUStrSlFkdFcvaXdwQS8wZFpleUQzSyt6ZnJUT2JtZ0p3UFkzUC9aeXpWRFFJRApBUUFCbzRITU1JSEpNQTRHQTFVZER3RUIvd1FFQXdJSGdEQVRCZ05WSFNVRUREQUtCZ2dyQmdFRkJRY0RBakFNCkJnTlZIUk1CQWY4RUFqQUFNQjhHQTFVZEl3UVlNQmFBRklVdzlIZU8yTFpOUjAyRDAzVnlEY3FGUXJlZk1Ed0cKQ0NzR0FRVUZCd0VCQkRBd0xqQXNCZ2dyQmdFRkJRY3dBWVlnYUhSMGNEb3ZMMk5sY25SekxtRmpjeTVoYkdsNQpkVzR1WTI5dEwyOWpjM0F3TlFZRFZSMGZCQzR3TERBcW9DaWdKb1lrYUhSMGNEb3ZMMk5sY25SekxtRmpjeTVoCmJHbDVkVzR1WTI5dEwzSnZiM1F1WTNKc01BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQWVpbWJ1cGg5dG5oOHYKczh0eE1Sa3VyZXhXbGdJUEVYNHVFMDMvS1pvM01sc2xobTJVOHdyN2p2ZEVQVWFGVXpXNDhhdWoxbFlJOEpRaQp1cmZ0ZkEwMDg3cFRwMTFUM2dBL24vdE5jdzhCVjFqR2hPUDIxTlN1WUYwSUM2K1dXNEg0djNsZHRidExQTWhyClg0anVweFc2MnVEMFkzQy9PNHc2aXRUS1AzaFVVUENRTVprQnJFWklVTUVNRlA1UktyUVZUQ1dpaEYxNktySGsKRnowZjVSMjBnQ3pzSTJnRzA5QU9JSTFHUFIyUXhNakNCSmE0RjJNdmNIb08vY1gyRlNqWWFCUm5CU2ZlUnpJUApzdmdQdFNoeEowbUFyTmtNVVFPYUNmVEtzTEtmWmhBZDhXOFM4SExXZm4rZWlNKzNTd0hGbzV3QVE2NytDS3NaCi9waTdEa0lGCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K\n'+
    '__users_client_key_data=LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcEFJQkFBS0NBUUVBdHBTaWg0TDdkbWNpb1JrRVpvR05TZnJrbUt3dFRNOHZkOUxvdVoyVHdiNTR4L0thCnAwMzFOazJ2Z3BodHkyb1lySWpWNytwaU9Za2Z2dWpYVjZ6bThnNWU3emJCZFNyNWI1ZHhGbnpBQW05eklLSlkKODBzTnd0K0swZGZSWDA5WjhudUUrWjZpUkorV1lPQnVncWIxclA0eDJoMlNhVmdnak9vYmF4b3hLdUVHTWhZWQp4MG1tZHFKcUFLcGp1ckJKYkhWNHpxLzVieFJudTl2Vmg1THRLTFh6WTRJbmcxT0IyaWlXQWYzMnhUN2FZRC9nCmNRUEJmS2dRalJCRU1pZ1NFMGR6S0h0TWgzaFZjUXpaT0gzYVZ1eS9mYldLbnc0NHNKQ25KSmVRa1ZRK2tKUWQKdFcvaXdwQS8wZFpleUQzSyt6ZnJUT2JtZ0p3UFkzUC9aeXpWRFFJREFRQUJBb0lCQVFDa0dycHU1SHJTZEdhNgp0M3F1QzdtTGloZFhaa0lkTEllMHdudnRBY1lodU9wa2hSa2VVVUthZVg3TCtlZU5rcUgweWRUSW5EbUhEMG5hClZQdmcwUWFPLy8yeU10djFUUmYvaGZYZVNXaG5oL2JKbVVJc0F3U3VhREFrNWo5STFGQzdVdXcxVkxEeXp5SGgKbHplYzlTWVNSRE5Zb1lYTWE2cHVIYWxoUFp4OXRWZmV0KzJHUEsvMDZ3eXNhZTZ0bmZPdys5eCtIVGhHb3dITwpZZk1tRFNtL3RYWDJBa3UrRnJkM3E2UlpzWnFyU2dtd2ZiSC90NFVQMy9RaGd0Zm1obkU1TFdWbGkwdFpDMUF0CkZuQmtzMXNnVVhWU1FQU2VXYXZCR1FHeUZETlJKY002Z1VmVVlSb3M3NUN2RkIzamEyc3p0K3pndGkwY2RaWFIKZ01UMisxTUJBb0dCQU1jV3NxZGl6bjBUWXZFYVZEendOa3lGSmozT0FYME5wZVpxREowQjMvcTcrUzEzNzJhbQpTcERqcks5QzhtanFNSXVTTGgxanV4QUszYlJ2clROT0pKeXNnYnlTaVM5VW5BQ3FxS2JHZFlKOTFUeldDUDA1CkhCd3FnWHZ3NEltNVJpcURGMllWMmhQb3lPT01mYUwrQmxMT3paMUVJa2lTeDh1c1hZbzRmcmZOQW9HQkFPckYKNExnWXQzbHZCV3VoSkR1eWNlR2RqQThoVGNPdFVlZ2I2RVhuVGRXUmFHb3JqL2JlaHllaU1wTnNkV3FTTmJlZgpsVVlGUklqMXdITnlRNXVrcVNEa0kxeTkxSVhTaFR0K0hwRm9xd2dHM0hWd3FtNmJDaElEQWRxRG4veXFCci9XCjVrSUtQWDJ0SWpURWVNV3paUVJXNThWTVdRbUttMzNqM2J4L0l0SkJBb0dBT2pCdEtUVmM2dnZHbUhlOGxVOFUKWDhzdkFUTjhCZVArVUZsQXRJYyt3dGM4SGtrR3hQYm5wbStWSW1pcjEzUlRtZ2V3eU5CRWRZem5mZnlDSUJPLwo2YmNWK0ZyUUUvQmo1R0g5QnpuTVVNYWNrN3B2U0N2d0JsOTZGeEt4WGkrenpXc2haS29RWW05UWdBbXBFd0d5Ck1YUFdieGZoK1ZwRllVZFEwN3h0ZFNVQ2dZRUFzckJEVnJ0eFFoclBIRms4czdjZzJHREtUbVhCdzNKeWllQmIKeklDOWpCU3RUVW0wdkdnb3BIRGVYN2pJTVlIeElyNXlwaVd5UVRBUzk0dDdpOFlxK0I3TUQzVm9nU1ozUTQyOQpoRjBPK0FBSTRkWUwwajFzejhLOE1XM0hZazZpN25hSk1MQ01sdEFrM2RiQU9YRk9MSnhjc1oxbmsweU5CcWRkCmlHK1h1RUVDZ1lCU1dtdUMySXdVZndqZVBsbCs2MVBZcE0xMExoMC85RmczZHp2cTd1WURVNVIyeHlCcTlzRi8KQld5TVo2VjlNbHY3Y0dXZEhpc0hWSHRGVmp2ODlXOXV2VEIzQmo1bzRJczlIQUdsTkJTa0JTaGk5Mi9LcHF3ZApoT0NoMnlIQVNVVlhJZWQ0WGFqeERkUWNhRzdESHhMRnpXd2FlRElvZTg5d3FpRGxERWdpVWc9PQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=\n'+
    '__metadata_labels_run=helloworld-08161412';

var v100_config_param = '--v100_job_image=\n'+
    '--v100_job_command=\n'+
    '--v100_job_gpu=\n'+
    '--v100_job_cpu=\n'+
    '--v100_job_memory=\n'+
    '--v100_job_userid=\n'+
    '--v100_pending_timeout=';

var shell_config_param = "";

function getParams() {
    var param = '';
    var id = $('.modal_iframe', window.parent.document).attr('proc_id');
    var url = "/pipeline/get_params/";
    $.ajax({
        type: 'post',
        url: url,
        data: {"processor_id": id},
        success: function (result) {
            var config = result.config;
            var proc_type = $('.modal_iframe', window.parent.document).attr('proc_type');
            if(proc_type == 4 && (typeof config === 'undefined' || config == "")){
                config = odpssql_config_param;
            }

            if(proc_type == 7 && (typeof config === 'undefined' || config == "")){
                config = clickhouse_config_param;
            }

            if(proc_type == 6 && (typeof config === 'undefined' || config == "")){
                config = docker_config_param;
            }

            if(proc_type == 8 && (typeof config === 'undefined' || config == "")){
                config = v100_config_param;
            }

            console.log("get config: " + config);
            if (typeof config === 'undefined') {
                console.log("get config test: " + config);
            }
                
            console.log("get config type: " + proc_type);
            add_config_list(config);
            if(proc_type == 4 || proc_type == 7 || proc_type == 5){
                $("#odps_sql").show();
                $("#id_template").val(result.template);
                $("#id_template").attr("disabled", false);
            } else{
                $("#odps_sql").hide();
            }
        }
    });
}

//去除字符串中间空格
function trim(str) {
    return str.replace(/[ ]/g, ""); //去除字符串中的空格
}

//选择已有算子，构造参数列表
function add_config_list(config) {
    var div_str = "<label style='margin-right: 3px;'>" +
        "<font color='red'>*</font>" +
        "任务参数:</label><dev>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;" +
        "<i title='添加' style='color:green;cursor:pointer' class='fa fa-plus-square' onclick='addTemplate()' href='javascript:void(0)'>" +
        "</i></dev>"
    $('#paramDiv').html(div_str);
    console.log(config);
    if (config != undefined && config != '') {
        var temp = config.split('\n');
        var count = temp.length;
        if (count >= 1) {
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

            //config_str_right = config_str_[1];
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

function cancel_add_task() {
    choosevalue = 0;
    $('#modalcheck_iframe', window.parent.document).unbind('hide.bs.modal');
    $('#modalcheck_iframe .modal-body h5', window.parent.document).text('确定要放弃创建task吗?');
    $('.changevalue', window.parent.document).text('确定');
    $('#modalcheck_iframe', window.parent.document).modal('show');
    $('#modalcheck_iframe', window.parent.document).on('hide.bs.modal', function () {
        if (choosevalue == 1) {
            //history.go(-1);
            $('.modal_iframe', window.parent.document).hide();
        }
    });
}

//添加任务的index
var pIndex = 0;

//添加参数的index
var paramIndex = 0;


//改变数据的类型（弹框里）
function changeDataType(taskvalue,text1,text2,minh,day,hour){
    var data_type = $("[name='data_type']:checked").val();
    if(data_type == 1){
        $("#dataPath").html('<label class="radio-inline" style="margin-top:-2px;margin-left:-10px;">'+
                '<input type="radio" class="pangudir" name="data_mode" value="0" checked>目录</label>'+
                '<label class="radio-inline" style="margin-top:-2px;margin-left:-10px;">'+
                '<input type="radio" class="pangufile" name="data_mode" value="1">文件</label>');
    }
    else{
        $("#dataPath").html('<label class="radio-inline" style="margin-top:-2px;">'+
                '<input type="radio" class="odpsproject" name="data_mode" value="2" checked>项目名</label>'+
                '<label class="radio-inline" style="margin-top:-2px;margin-left:-10px;">'+
                '<input type="radio" class="odpstable" name="data_mode" value="3">表名</label>'+
                '<label class="radio-inline" style="margin-top:-2px;margin-left:-10px;">'+
                '<input type="radio" class="odpspart" name="data_mode" value="4">分区</label>');
    }

    //先清空select内容
    $("#data_select").empty();
    var data_str = '';
    var url = "/pipeline/getDatas/";
    $.ajax({
        type:'post' ,
        url:url,
        dataType:'json',
        data:{"data_type":data_type},
        success:function(result){
            data_list = result.data_list;
            
            for(i = 0;i<data_list.length;i++){
                data_str += "<option value='"+data_list[i].id+"' >"+
                data_list[i].name+"</option>";
            }
            //select2初始化选第一个
            //$(".select2-chosen").html(data_list[0].name);
            $("#s2id_data_select span.select2-chosen").html(data_list[0].name);
            $("#data_select").append(data_str);
            //by xiaolin
            
             if(taskvalue!=""&&taskvalue!=undefined){
                console.log(taskvalue);   
            if(text2=="dir"||text2=="file"){
           
            $('.oss').trigger('click');
            $('#data_select option').each(function(){
               
                if($(this).text()==text1){
                    $(this).prop('selected','selected');
                    console.log('oss');
                    console.log($('#data_select option:selected').text());
                    $('#dataDiv .select2-chosen').text($('#data_select option:selected').text());
                    console.log(minh);
                    console.log(day);
                    if(minh!=""&&typeof minh!=undefined){
                        $('#data_offset').val(day);
                        if(hour=="hour"){
                            $('#timeType option:eq(0)').prop('selected','selected');
                        }else{
                            $('#timeType option:eq(1)').prop('selected','selected');
                        }
                    }else{
                        $('#data_offset').val('');
                        $('#timeType option:eq(0)').prop('selected','selected');
                    }
                }
            });
             changeindex=1;     
            
             $('.oss'+text2).trigger('click');

        }else if(text2=="project"||text2=="table"||text2=="part"){
            
            $('.odps').trigger('click');
              $('#data_select option').each(function(){
                
                if($(this).text()==text1){
                    $(this).prop('selected','selected');
                    console.log($('#data_select option:selected').text());
                    $('#dataDiv .select2-chosen').text($('#data_select option:selected').text());
                     if(minh){
                        $('#data_offset').val(day);
                        if(hour=="hour"){
                            $('#timeType option:eq(0)').prop('selected','selected');
                        }else{
                            $('#timeType option:eq(1)').prop('selected','selected');
                        }
                    }else{
                          $('#data_offset').val('');
                           $('#timeType option:eq(0)').prop('selected','selected');

                    }

                }
            });
            changeindex=1;
             $('.odps'+text2).trigger('click');
        }
    }
        }
    });
}


//点击图标弹出数据引用框
function showDataForm(id){
    //by xiaolin
    changeindex=0;
    //  
   $("#choose_data_modal").modal({
        backdrop:false,
        show:true,        
    });
    $("#indexNumber").val(id);

    var text=$('#'+id).prev().val();
    taskvalue=text;
    if(text==""){
        taskvalue="";
        oss="";
        pangulength="";
        text1="";
        text2="";
        minh="";
        day="";
        hour="";

        $('#data_offset').val('');
        $('#timeType option:eq(0)').prop('selected','selected');
        $('.oss').trigger('click');
    }

    if(text!=""){
        text=text.split('@-');
        if(text[1]){
            minh=text[1];
            day=minh.match(/[0-9]+/g);
            hour=minh.match(/\D+$/g);
            day=day[0];
            hour=hour[0];
        }else{
            minh='';
        }
        oss=text[0].replace('%','');
        oss=oss.replace('%','');
        pangulength=oss.split(':');
        text1=pangulength[0];
        text2=pangulength[1];
    }
    changeDataType(taskvalue,text1,text2,minh,day,hour);
}

$(function () {
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
        "任务参数:</label><dev>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;" +
        "<i title='添加' style='color:green;cursor:pointer' class='fa fa-plus-square' onclick='addTemplate()' href='javascript:void(0)'>" +
        "</i></dev>"
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
    get_server_tags($('.modal_iframe', window.parent.document).attr('proc_type'));
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

    $("[name='data_type']").change(function () {
        if (changeindex == 0) {
            changeDataType(taskvalue, text1, text2, minh, day, hour);
        } else if (changeindex == 1) {
            taskvalue = '';
            text1 = '';
            text2 = '';
            minh = '';
            day = '';
            hour = '';
            changeDataType(taskvalue, text1, text2, minh, day, hour);
        }
    });

    var proc_type_list = ['script', 'spark', 'oozie', 'odps', 'shell', 'docker', 'clickhouse', 'v100']
    var proc_id = $('.modal_iframe', window.parent.document).attr('proc_id');
    console.log("proc id: " + proc_id);
    $("#id_choosed_proc").val($('.modal_iframe', window.parent.document).attr('proc_name'));
    $("#id_choosed_version").val($('.modal_iframe', window.parent.document).attr('version_name'));

    if (proc_id == -1) {
        console.log("get proc id: " + proc_id);
        $("#id_choosed_proc").val("自动创建");
        $("#id_choosed_version").val("0.0.0");
    }
    
    var proc_type = $('.modal_iframe', window.parent.document).attr('proc_type');
    $("#id_choosed_proc_type").val(proc_type_list[proc_type - 1]);
    getParams();

    $("#data-choose-button").click(function(){
        var dataId = $("#data_select").val();
        if(dataId == 'choose'){
            $('#messageModal_iframe .modal p').text('请选择数据');
            $('#messageModal_iframe ').modal('show');
            return;
        }
        var dataOffset = "";
        if(!isNaN(Number($("#data_offset").val())) && $("#data_offset").val() != "") {
            dataOffset = $("#data_offset").val()+$("#timeType").val();
        }
        var dataMode = $("[name='data_mode']:checked").val();
        // $.ajax({
        //     type:'post',
        //     url:'/pipeline/getDataExpress/',
        //     data:{'data_id':dataId,'data_mode':dataMode,'data_offset':dataOffset},
        //     dataType:'json',
        //     success:function(result){
        console.log("get data select: " + $("#s2id_data_select span.select2-chosen").html())
                $("#"+$("#indexNumber").val()).prev().val($("#s2id_data_select span.select2-chosen").html());
                $("#choose_data_modal").modal("hide");
            // }
        // });
    });
});
