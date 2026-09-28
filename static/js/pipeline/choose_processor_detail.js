var global_proc_id = null;

//操作状态
function status_convert(status) {
    var status_str = '';
    if (status == 0) {
        status_str = '未使用';
    }
    else if (status == 1) {
        status_str = '<font color="red">使用中</font>';
    }
    return status_str;
}

//历史表格
function hist_table(list) {
    var content = "";
    var proc_id = get_global_proc_id();
    for (var i = 0; i < list.length; i++) {
        content += "<tr><td>" + (i + 1) + "</td><td>" +
            list[i].upload_user_name;
        content += "</td><td>" + list[i].name;
        content += "</td><td>" + list[i].update_time;
        content += "</td><td>" + list[i].upload_time;
        content += "</td><td>" + list[i].description;
        var checked = "";
        if (i == 0) {
            checked = "checked";
        }

        var check_val = proc_id + "-" + list[i].id;
        content += '</td><td>' +
            '<button type="button" class="btn btn-info pull-right"  onclick="create_task_now(' + proc_id + ',' + list[i].id + ',' + $("#proc_type").val() + ',\'' + $("#proc_name").val() + '\',\'' + list[i].name + '\')" title="选择这个算子创建任务。" style="margin-right: 1px;">创建任务</button>' +
            '</td></tr>';
    }
    return content;
}

function create_task_now(pid, version_id, type, proc_name, version_name) {
    $('.modal_iframe', window.parent.document).hide();
    $('.modal-backdrop', window.parent.document).remove();
    window.parent.show_choose_proc_window_call_back(pid, version_id, type, proc_name, version_name);
}

//查询操作历史
function showProcHist() {
    var id = $("#proc_id").val();
    $("#view_hist_list").empty();
    var url = "/processor/view_history/" + id + "/";
    $.ajax({
        type: 'post',
        url: url,
        success: function (result) {
            if (result.status) {
                $('#messageModal .modal-body p').text(result.msg);
                $('#messageModal').modal('show');
            } else {
                //展示历史表格
                content = hist_table(result.history_list);
                $("#view_hist_list").html(content);
            }
        }
    });
}


//引用表格
function quote_list_table(list) {
    var content = "";
    for (var i = 0; i < list.length; i++) {
        content += "<tr><td>" + (i + 1) + "</td><td>" +
            "<a  href='/pipeline/" + list[i].pipeline_id + "/' target='_blank'>" +
            list[i].pipeline_name + "</a>";
        content += "</td><td>" + list[i].task_name;
        content += "</td><td>" + list[i].last_run_time;
        content += "</td><td>" + list[i].owner_name;
    }
    return content;
}


//引用信息
function showQuote() {
    var id = $("#proc_id").val();
    $("#quote_list").empty();
    var url = "/processor/view_quote/" + id + "/";
    $.ajax({
        type: 'post',
        url: url,
        success: function (result) {
            if (result.status) {
                $('#messageModal .modal-body p').text(result.msg);
                $('#messageModal').modal('show');

            } else {
                //展示引用信息
                content = quote_list_table(result.quote_list);
                $("#quote_list").html(content);
            }
        }
    });
}

function change_color(obj) {
    for (i = 0; i < sel_s.length; i++) {
        sel_s[i].style.fontWeight = "normal";
    }
    obj.style.fontWeight = "bold";
}

function create_config_table() {
    var config = $("#config_str").val();
    if (config != '') {
        var temp = config.split('\n');
        var count = temp.length;
        if (count > 0) {
            for (var i = 0; i < count; i++) {
                if (temp[i].trim() == "") {
                    continue;
                }

                var config_str = temp[i]
                var config_str_ = config_str.split('=');
                var config_str_left = config_str_[0];
                var config_str_right = temp[i].substring(config_str_left.length + 1);

                var config_right_split = config_str_right.split('\1100')
                var config_state = ""
                if (config_right_split.length >= 2) {
                    config_state = config_right_split[1];
                    config_str_right = config_right_split[0];
                }

                var row = document.createElement("tr");
                document.getElementById("_table").appendChild(row);
                var key_cell = document.createElement("td");
                key_cell.innerText = config_str_left;
                row.appendChild(key_cell);
                var value_cell = document.createElement("td");
                value_cell.innerText = config_str_right;
                row.appendChild(value_cell);
                var state_cell = document.createElement("td");
                state_cell.innerText = config_state;
                row.appendChild(state_cell);
            }
        }
    }
}

function tree_onclick(node) {
    if (node.id == -1 || node.id == -2 || node.id == -3) {
        return;
    }

    global_proc_id = node.id + "";
    if (global_proc_id.indexOf('-') < 0) {
        return;
    }

    $("#btn_op_list").hide();
    $("#id_pipeline_name").html("");
    get_proc_detail(node);
    global_proc_id = node.id;
}

function update_new_proc() {
    var prc_type = $("#proc_type").val();
    if (prc_type == 3) {
        var sql = $("#proc_sql").val();
        sql = sql.replace(new RegExp("", "gm"), '<br/>');
        sql = sql.replace(new RegExp(" ", "gm"), '&nbsp;');
        document.getElementById('proc_template').innerHTML = sql;
    }
    var desc = $("#proc_description").val();
    desc = desc.replace(new RegExp(" ", "gm"), '&nbsp;');
    desc = desc.replace(new RegExp("\n", "gm"), '<br/>');

    document.getElementById('proc_desc').innerHTML = desc;

    var user_list = $("#user_name_list").val();
    user_list = user_list.replace(new RegExp(",", "gm"), ',&nbsp;');
    document.getElementById('user_list').innerHTML = user_list;
    create_config_table();
}

function get_proc_detail(node) {
    var node_id = (node.id + "").split('-');
    if (node_id.length == 2) {
        node_id = node_id[1];
    } else if (node_id.length == 3) {
        node_id = node_id[2];
    } else {
        return;
    }

    $.ajax({
        type: 'post',
        url: '/processor/get_processor/',
        dataType: 'json',
        async: false,
        data: {'id': node_id},
        success: function (result) {
            if (result.status == 0) {
                $("#proc_id").val(result.processor.id);
                $("#proc_name").val(result.processor.name);
                $("#proc_type").val(result.processor.type);
                $("#proc_description").val(result.processor.description);
                $("#proc_sql").val(result.processor.template);
                $("#config_str").val(result.config_str);
                $("#user_name_list").val(result.processor.user_list);

                $("#id_proc_detail_name").html(node.text);
                $("#type_name").html(result.type_str);
                console.log("result.type_str: " + result.type_str)

                var proc_type = $("#proc_type").val();
                var proc_name = $("#proc_name").val();
                var proc_tag = result.processor.tag;
                if (proc_tag == null) {
                    proc_tag = "";
                }

                var publish_str = "";
                if (result.processor.private == 1 && result.is_owner == 1) {
                    publish_str = '<a title=\'发布\' onclick=\'publishNode(' + result.processor.id + ', "发布后所有人都可以使用这个算子，确定开放此算子吗?")\' href=\'javascript:void(0)\'><i class=\'fa fa-share\'></i></a>';
                }

                if (result.processor.private != 1 && result.is_owner == 1) {
                    publish_str = '<a title=\'收回\' onclick=\'publishNode(' + result.processor.id + ', "确定收回此算子的公共权限吗?")\' href=\'javascript:void(0)\'><i class=\'fa fa-share\'></i></a>';
                }

                var sql_str = "";
                if (result.processor.type == 3) {
                    sql_str = '<tr><th style="margin-top:20px;margin-left:120px;border=2px solid rgb(205,205,205);background-color: rgb(242,242,242);width:168px;text-align:center;">sql语句</th><td id="proc_template" style="width:730px;"></td></tr>';
                }

                $("#id_proc_detail_detail_info").html('<table class="items table  table-bordered " style="margin-top:-77px;border:1px solid rgb(219, 219, 219);table-layout:fixed;word-break:break-all;word-wrap:break-all;" cellspacing="1" cellpadding="2" border="1">' +
                    '<tbody style="margin-right:20px;">' +
                    '    <tr><th style="margin-top:20px;margin-left:120px;background-color: rgb(242,242,242);width:150px;text-align:center;">创建者</th><td style="width:250px;">' + result.owner_name + '</td>' +
                    '<th style="margin-top:20px;margin-left:120px;border=2px solid rgb(205,205,205);background-color: rgb(242,242,242);width:150px;text-align:center;">标签</th><td style="width:250px;">' + proc_tag + '</td></tr>' +
                    '    <tr><th style="margin-top:20px;margin-left:120px;background-color: rgb(242,242,242);width:150px;text-align:center;">属性</th><td style="width:250px;">' + result.private_str + publish_str +
                    '    </td><th style="margin-top:20px;margin-left:120px;border=2px solid rgb(205,205,205);background-color: rgb(242,242,242);width:150px;text-align:center;">更新时间</th><td style="width:250px;">' + result.processor.update_time + '</td></tr>' +
                    '</tbody>' +
                    '</table>' +
                    '<table id="desc_table" class="items table  table-bordered " style="margin-top:-21px;border:1px solid rgb(219, 219, 219);table-layout:fixed;word-break:break-all;word-wrap:break-all;" cellspacing="1" cellpadding="2" border="1">' +
                    '<tbody>' +
                    '    <tr><th style="margin-top:20px;margin-left:120px;border=2px solid rgb(205,205,205);background-color: rgb(242,242,242);width:146px;text-align:center;">使用人</th><td id=\'user_list\' style="width:630px;"></td></tr>' +
                    sql_str +
                    '    <tr><th style="margin-top:20px;margin-left:120px;border=2px solid rgb(205,205,205);background-color: rgb(242,242,242);width:146px;text-align:center;">描述</th><td id=\'proc_desc\' style="width:630px;"></td></tr>' +
                    '</tbody>' +
                    '</table>' +
                    '<table class="items table  table-bordered" style="margin-top:20px;border:1px solid rgb(219, 219, 219);table-layout:fixed;word-break:break-all; word-wrap:break-all;" cellspacing="1" cellpadding="2" border="1">' +
                    '<tbody id="_table">' +
                    '    <tr><th style="width:158px;background-color: rgb(242,242,242);text-align:center;" >参数名</th><th style="width:300px;background-color: rgb(243,242,240);text-align:center;">默认值</th><th  style="width:300px;background-color: rgb(243,242,240);text-align:center;">参数说明</th></tr>' +
                    '</tbody>' +
                    '</table>');
                update_new_proc();
                if (!$("#view_history").hasClass("active in")) {
                    $("#proc_detail_base_info").removeClass("active");
                    $("#proc_detail_version_info").removeClass("active");
                    $("#proc_detail_quote_info").removeClass("active");
                    $("#proc_detail_version_info").addClass("active");

                    $("#data_info").removeClass("active in");
                    $("#view_history").removeClass("active");
                    $("#relate_message").removeClass("active");
                    $("#view_history").addClass("active in");

                    for (i = 0; i < sel_s.length; i++) {
                        sel_s[i].style.fontWeight = "normal";
                    }

                    sel_s[0].style.fontWeight = "bold";
                }

                showProcHist();
                $("#proc_btn_op_list").show();
                $("#id_proc_all_content").show();
            } else {
                new PNotify({
                    title: '通知',
                    text: result.msg,
                    type: 'error',
                    hide: false,
                    closer: true,
                    addclass: 'custom'
                });
            }
        }
    });
}

function get_global_proc_id() {
    var node_id = (global_proc_id + "").split('-');
    if (node_id.length == 2) {
        node_id = node_id[1];
    } else if (node_id.length == 3) {
        node_id = node_id[2];
    } else {
        return null;
    }

    return node_id;
}

function search_processor() {
    var word = $("#id_search_processor").val();
    if (word.trim() == "") {
        var t = $("#proc_tt");
        t.tree('reload');
        return;
    }
    $.ajax({
        type: 'post',
        url: '/processor/search_processor/',
        async: false,
        dataType: "json",
        data: {'word': word, 'with_project': 1, 'limit': 100},
        success: function (result) {
            if (result.status) {
                new PNotify({
                    title: '通知',
                    text: result.msg,
                    type: 'error',
                    hide: false,
                    closer: true,
                    addclass: 'custom'
                });
            } else {
                var t = $("#proc_tt");
                t.tree('loadData', result);
            }
        }
    });
}

$(function () {
    $('#id_search_processor').bind('keypress', function (event) {
        if (event.keyCode == "13") {
            search_processor();
        }
    });

    $(document).scroll(function () {
        $("#proc_btn_op_list a:lt(5)").each(function () {
            $(this).css('margin-top', (-$(document).scrollTop()).toString() + 'px');
        });
        $('#type_name').css('margin-top', (-$(document).scrollTop()).toString() + 'px');
        $("#tip").hide();
        $("#proc_detail_change_tab").css('margin-top', (-$(document).scrollTop()).toString() + 'px');
    });
    //tab show事件
    $('a[class="history_tab"]').on('click', function (e) {
        showProcHist();
    })

    $('a[class="relate_tab"]').on('click', function (e) {
        showQuote();
    })

    //复制剪切板
    var cli = new ZeroClipboard(document.getElementById("copyBtn"));
    cli.setText($('#upload_cmd').text());
    cli.on("ready", function (readyEvent) {
        cli.on("aftercopy", function (event) {
            new PNotify({
                title: '通知',
                text: '复制成功！',
                addclass: 'custom',
                type: 'success'
            });
        });
    });

    var options = "";
    $("#pipeline_select").empty();

    $("#id_create_new_task").click(function () {
        $("#tip").hide();
    });

    $(window).resize(function () {
        var Height = $(window).height();
        $("#aside_proc_tree_control").height(Height - 100);
    });

    var Height = $(window).height();
    $("#aside_proc_tree_control").height(Height - 100);

    $('#proc_version_name').combobox({
        editable: true,
        valueField: 'text',
        textField: 'text',
    });

    $('#local_pg_proc_version_name').combobox({
        editable: true,
        valueField: 'text',
        textField: 'text',
    });
});




