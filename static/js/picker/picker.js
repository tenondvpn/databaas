var global_proc_id = null;
var gloabl_pipename_id_map = new Map();
var gloabl_task_id_map = new Map();
var global_proc_detail = null;
var page_init = true;
var codemirror_editor = null;
var show_table_detail = false;
var global_call_code_type = 0;
var now_is_authorities_mode = false;
var toolkit = null;
var all_task_init_load = true;
var global_table_address = "";

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

function delete_proc_version(proc_version_id) {
    if (!confirm("确认删除这个版本吗？")) {
        return;
    }

    var proc_id = get_global_proc_id();
    $.ajax({
        type: 'post',
        url: "/processor/delete_proc_version/",
        data: {"id": proc_version_id, "proc_id": proc_id},
        success: function (result) {
            if (result.status) {
                $('#messageModal .modal-body p').text(result.msg);
                $('#messageModal').modal('show');
            }
            else {
                new PNotify({
                    title: '通知消息',
                    text: '删除成功！',
                    addclass: 'custom',
                    type: 'success'
                });
                showProcHist();
            }
        }
    });
}

function update_proc_version(proc_version_id, name) {
    var data_list = new Array();
    data_list.push({"id": name, "text": name});
    $('#proc_version_name').combobox('loadData', data_list);
    $('#local_pg_proc_version_name').combobox('loadData', data_list);
    $("#proc_version_name").combobox('setValue', name);
    $("#local_pg_proc_version_name").combobox('setValue', name);
    $("#create_new_version").modal("show");
}

function hist_table(list) {
    var content = "";
    for (var i = 0; i < list.length; i++) {
        content += "<tr><td>" + (i + 1) + "</td><td>" +
            list[i].upload_user_name;
        content += "</td><td>" + list[i].name;
        content += "</td><td>" + list[i].update_time;
        content += "</td><td>" + list[i].upload_time;
        content += "</td><td>" + list[i].description;
        content += "</td><td>" +
            "<a href='javascript:void(0)' onclick='delete_proc_version(" + list[i].id + ")'>删除</a>&nbsp;&nbsp;" +
            "<a href='javascript:void(0)' onclick='update_proc_version(" + list[i].id + ",\"" + list[i].name + "\")'>更新</a>" +
            "</td></tr>";
    }
    return content;
}

var choose_value = 0;

function ok_value() {
    choose_value = 1;
}

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

function publish_node(id, info) {
    choose_value = 0;
    var url = '/processor/public_processor/';
    $('#quit_ok_modal').unbind('hide.bs.modal');
    $("#quit_ok_modal").modal('show');
    //添加modal事件
    $("#processor_project_id").combotree('clear');
    if (global_proc_detail.processor.private == 1 && global_proc_detail.is_owner == 1) {
        $("#project_label").html("发布自己的插件，请选择标准库的分类：");
        $("#processor_project_id").combotree('reload', '/processor/get_proc_project_tree?type=-3');
    }

    if (global_proc_detail.processor.private != 1 && global_proc_detail.is_owner == 1) {
        $("#project_label").html("收回公共插件，请选择自己的分类：");
        $("#processor_project_id").combotree('reload', '/processor/get_proc_project_tree?type=-1');
    }

    $("#quit_ok_modal").on('hide.bs.modal', function (e) {
        if (choose_value == 1) {
            var target_project_id = $("#processor_project_id").val();
            $.ajax({
                type: 'post',
                url: url,
                data: {"id": id, "project_id": target_project_id},
                success: function (result) {
                    if (result.status) {
                        $('#messageModal .modal-body p').text(result.msg);
                        $('#messageModal').modal('show');
                    }
                    else {
                        var publish_str = "";
                        if (global_proc_detail.processor.private == 1 && global_proc_detail.is_owner == 1) {
                            publish_str = '开放<a title=\'收回\' onclick=\'publish_node(' + global_proc_detail.processor.id + ', "确定收回此插件的公共权限吗?")\' href=\'javascript:void(0)\'><i class=\'fa fa-share\'></i></a>';
                        }

                        if (global_proc_detail.processor.private != 1 && global_proc_detail.is_owner == 1) {
                            publish_str = '私有<a title=\'发布\' onclick=\'publish_node(' + global_proc_detail.processor.id + ', "发布后所有人都可以使用这个插件，确定开放此插件吗?")\' href=\'javascript:void(0)\'><i class=\'fa fa-share\'></i></a>';
                        }

                        if (global_proc_detail.processor.private == 1 && global_proc_detail.is_owner == 1) {
                            global_proc_detail.processor.private = 0;
                        } else if (global_proc_detail.processor.private != 1 && global_proc_detail.is_owner == 1) {
                            global_proc_detail.processor.private = 1;
                        }

                        $("#processor_public_button").html(publish_str);
                        var proc_tree = $("#proc_tt");
                        var node = proc_tree.tree('find', target_project_id);
                        var old_node = proc_tree.tree('find', global_proc_id);
                        if (node) {
                            proc_tree.tree('append', {
                                parent: node.target,
                                data: [{
                                    id: target_project_id + "-" + get_global_proc_id(),
                                    text: old_node.text
                                }]
                            });
                            proc_tree.tree('expand', node.target);
                            proc_tree.tree('reload', node.target);
                        }

                        proc_tree.tree('remove', old_node.target);
                        global_proc_id = target_project_id + "-" + get_global_proc_id();
                        var new_node = proc_tree.tree('find', global_proc_id);
                        if (new_node) {
                            proc_tree.tree('select', new_node.target);
                        }
                    }
                }
            });
        }
    });
}

function showCopyModal() {
    $('#copyModal').modal('show');
}


function pn_notice(pl_id) {
    window.open('/pipeline/task/' + pl_id + '/');
    location.href = '/pipeline/task/' + pl_id + '/';
}

function goto_new_pipeline() {
    window.open('/pipeline/noah_index/');
}

function apply_new_pipeline() {
    var proc_id = $("#proc_id").val();
    var pl_id = $("#pipe_id").val();
    var pl_name = $("#new_pl_name").val()

    var project_id = $('#new_pl_select').val();
    var url = "/pipeline/new_pipeline_by_proc/";
    var text = '创建DAG流成功！';
    $.ajax({
        type: 'post',
        url: url,
        data: {'proc_id': proc_id, 'pl_name': pl_name, 'project_id': project_id},
        success: function (result) {
            if (result.status) {
                alert("创建DAG流失败！原因:" + result.msg);
            } else {
                $("#new_pipeline_div").modal('hide');
                $('.modal-backdrop').remove();
                $("body").removeClass("modal-open");

                new PNotify({
                    title: '通知消息',
                    text: '创建成功，即将为你跳转到新DAG流......',
                    addclass: 'custom',
                    type: 'success'
                });
                setTimeout("goto_new_pipeline()", 1500);
            }
        }
    });
}

function create_new_pipeline() {
    var id = $("#proc_id").val();
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }
    $("#new_pipeline_div").modal('show');
}

function create_new_task() {
    $.ajax({
        type: "post",
        url: '/pipeline/get_pipelines/',
        async: false,
        dataType: "json",
        data: {"task_id": 1},
        success: function (result) {
            if (result.status) {
                console.log(result.msg);
            } else {
                data_list = result.pipeline_list;
                var data_str = '';
                for (i = 0; i < data_list.length; i++) {
                    data_str += "<option value='" + data_list[i].id + "' >" +
                        data_list[i].name + "</option>";
                }
                //select2初始化选第一个
                //$(".select2-chosen").html(data_list[0].name);
                $("#s2id_pipeline_select span.select2-chosen").html(data_list[0].name);
                $("#pipeline_select").append(data_str);
            }
        }
    });

    var id = $("#proc_id").val();

    $("#new_task_hid").show();
    $("#new_task_sure").show();
    $("#new_task_hint").hide();
    $("#button_to_other").hide();
    $("#new_task_div").hide();

    $("#new_task_div").show();
    //获取应用列表
    $("#new_task_div").modal({
        backdrop: false,
        show: true
    });
}

function skip_new_pipeline() {
    var pl_name = $("#pipeline_select").combobox('getValue');
    var pl_id = gloabl_pipename_id_map.get(pl_name) + "";
    window.open('/pipeline/noah_index/');
}

function update_gloabl_pipename_id_map(pipes) {
    gloabl_pipename_id_map.clear();
    for (var i = 0; i < pipes.length; ++i) {
        gloabl_pipename_id_map.set(pipes[i].text, pipes[i].id);
    }
}

function apply_new_task() {
    $("#new_busy_icon").show()
    $("#new_task_hid").hide()
    $("#new_task_sure").hide()

    var pl_name = $("#pipeline_select").combobox('getValue');
    var pl_id = gloabl_pipename_id_map.get(pl_name) + "";
    var proc_id = $("#proc_id").val();
    var url = "/pipeline/new_task_by_proc/";
    $.ajax({
        type: 'post',
        url: url,
        data: {'proc_id': proc_id, 'dest_pl_id': pl_id},
        success: function (result) {
            $("#new_busy_icon").hide()
            if (result.status) {
                alert("创建任务失败！" + result.msg);
                $("#new_task_hid").show();
                $("#new_task_sure").show();
                $("#new_task_hint").hide();
                $("#button_to_other").hide();
                $("#new_task_div").hide();
            } else {
                $("#new_task_hint").show();
                $('#new_task_hint').text('创建任务成功！');

                $("#button_to_other").show();
                $("#delete-task").hide();
            }
        }
    });
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

function table_tree_onclick(node) {
    var tmp_id = node.id + "";
    if (tmp_id.indexOf('-') < 0) {
        $("#table_tt").tree('toggle', node.target);
        return;
    }

    var tmp_str = node.id + "-" + node.next;
    var pk_bytes = hexToBytes(tmp_str.toString(16) + tmp_str.toString(16))
    var address = keccak256(pk_bytes)

    global_table_address = address.slice(address.length - 40, address.length)
    console.log("get pk_bytes: " + pk_bytes + " address: " + address + ", global_table_address: " + global_table_address)
    get_table_detail(node);
}

function function_tree_onclick(node) {
    var tmp_id = node.id + "";
    if (tmp_id.indexOf('-') < 0) {
        $("#table_tt").tree('toggle', node.target);
        return;
    }

    get_function_detail(node);
}

function get_function_detail(node) {
    $.ajax({
        type: 'post',
        url: '/picker/get_function_detail/',
        dataType: 'json',
        async: false,
        data: { 'function': node.text },
        success: function (result) {
            if (result.status == 0) {
                $("#id_proc_detail_name").html(node.text);
                $("#id_main_create_proc").hide();
                $("#id_proc_all_content").show();
                init_python_codemirror(result.function);
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

function get_table_detail(node) {
    var parent = $('#table_tt').tree('getParent', node.target);
    $.ajax({
        type: 'post',
        url: '/picker/get_table_detail/',
        dataType: 'json',
        async: false,
        data: { 'table': node.text, 'db': 'default' },
        success: function (result) {
            if (result.status == 0) {
                show_table_info(open, result);
                init_codemirror("select * from " + result.table + " limit 100;");
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

function tree_onclick(node) {
    if (node.id == -1 || node.id == -2 || node.id == -3) {
        $("#proc_tt").tree('toggle', node.target);

        return;
    }

    var tmp_id = node.id + "";
    if (tmp_id.indexOf('-') < 0) {
        $("#proc_tt").tree('toggle', node.target);

        return;
    }

    $("#btn_op_list").hide();
    $("#id_pipeline_name").html("");
    get_proc_detail(node);
    global_proc_id = node.id;
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
        url: '/picker/get_sql/',
        dataType: 'json',
        async: false,
        data: {'id': node_id},
        success: function (result) {
            if (result.status == 0) {
                global_proc_detail = result;
                $("#id_proc_detail_name").html(node.text);
                $("#id_main_create_proc").hide();
                $("#id_proc_all_content").show();
                init_codemirror(result.sql);
                $("#top_button1").show();
                $("#top_button2").show();
                $("#top_button3").show();
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

function add_brother_project() {
    var t = $('#proc_tt');
    var node = t.tree('getSelected');
    var parent_node = t.tree('getParent', node.target);
    var parent_id = 0;
    if (parent_node != null) {
        parent_id = parent_node.id;
    }

    $("#createProjectModal").attr("project_id", parent_id);
    $("#createProjectModal h4").html("添加同级分类");
    $("#createProjectModal").show();
    $("#createProjectModal").modal('show');
}

function add_child_project() {
    var t = $('#proc_tt');
    var node = t.tree('getSelected');
    $("#createProjectModal").attr("project_id", node.id);
    $("#createProjectModal h4").html("添加子分类");
    $("#createProjectModal").show();
    $("#createProjectModal").modal('show');
}

function delete_project() {
    var t = $('#proc_tt');
    var node = t.tree('getSelected');
    $("#deleteProjectModal").attr("project_id", node.id);
    $("#deleteProjectModal").show();
    $("#deleteProjectModal").modal('show');
}

function create_project() {
    var parent_id = $("#createProjectModal").attr("project_id");
    var post_data = {
        'project_name': $("#createProjectModal #inputProjectName").val().trim(),
        'description': $("#createProjectModal #inputProjectDesc").val().trim(),
        'parent_id': parent_id,
        'type': 1
    };
    $.post('/processor/add_new_project/', post_data, function (result) {
        $(".modal-backdrop").remove();
        if (result.status == 0) {
            var t = $('#proc_tt');
            if (parent_id == 0) {
                t.tree("insert", {
                    data: {
                        id: result.id,
                        text: $("#createProjectModal #inputProjectName").val().trim(),
                        is_project: 1
                    }
                })
            } else {
                var node = t.tree("find", parent_id);
                if (node != null) {
                    t.tree("append", {
                        parent: node.target,
                        data: {
                            id: result.id,
                            text: $("#createProjectModal #inputProjectName").val().trim(),
                            is_project: 1
                        }
                    })
                }
            }

            var node = t.tree('find', $("#createProjectModal").attr("project_id"));
            $("#createProjectModal").hide();
            new PNotify({
                title: '通知',
                text: '新建项目成功',
                type: 'success',
                hide: true,
                closer: true,
                addclass: 'custom'
            });
        }
        else {
            new PNotify({
                title: '通知',
                text: result.msg,
                type: 'error',
                hide: false,
                closer: true,
                addclass: 'custom'
            });
        }
    }, 'json');
}

function do_delete_project() {
    var post_data = {};
    post_data["project_id"] = $("#deleteProjectModal").attr("project_id");
    $.post('/processor/delete_project/', post_data, function (result) {
        $(".modal-backdrop").remove();
        if (result.status == 0) {
            var node = $('#proc_tt').tree("find", $("#deleteProjectModal").attr("project_id"));
            $("#proc_tt").tree("remove", node.target);
            $("#deleteProjectModal").hide();
            new PNotify({
                title: '通知',
                text: '删除项目成功',
                type: 'success',
                hide: true,
                closer: true,
                addclass: 'custom'
            });
        }
        else {
            new PNotify({
                title: '通知',
                text: result.msg,
                type: 'error',
                hide: false,
                closer: true,
                addclass: 'custom'
            });
            ;
        }
    }, 'json');
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

function create_processor_callback(project_id, pid, name) {
    $("body").removeClass("modal-open");
    new PNotify({
        title: '通知',
        text: '新建插件成功',
        type: 'success',
        hide: true,
        closer: true,
        addclass: 'custom'
    });

    var t = $('#proc_tt');
    var node = t.tree("find", project_id);
    if (node != null) {
        t.tree('expand', node.target);
        t.tree("append", {
            parent: node.target,
            data: {
                id: project_id + "-" + pid,
                text: name,
                is_project: 0
            }
        });

        var new_node = t.tree('find', project_id + "-" + pid);
        t.tree("select", new_node.target);
        tree_onclick(new_node);
    } else {
        get_proc_with_project_tree(pid);
    }
}

function create_processor() {
    var url = "/processor/create/";
    $("#modal_iframe iframe").attr('src', url);
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }

    var t = $('#proc_tt');
    var node = t.tree('getSelected');
    if (node) {
        $("#modal_iframe").attr("project_id", node.id);
    } else {
        $("#modal_iframe").attr("project_id", -1);
    }

    $(".modal_iframe h4").html("新建插件");
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
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

function update_processor_callback(project_id, pid, name) {
    $("body").removeClass("modal-open");
    new PNotify({
        title: '通知',
        text: '修改插件成功',
        type: 'success',
        hide: true,
        closer: true,
        addclass: 'custom'
    });

    var old_project_id = $("#modal_iframe").attr("project_id");
    var t = $('#proc_tt');
    if (project_id == old_project_id) {
        var node = t.tree("find", project_id + "-" + pid);
        if (node != null) {
            t.tree("update", {
                target: node.target,
                text: name
            });

            t.tree("select", node.target);
            tree_onclick(node);
        }
    } else {
        var node = t.tree("find", old_project_id + "-" + pid);
        if (node != null) {
            t.tree("remove", node.target);
        }

        var new_project_node = t.tree("find", project_id);
        if (new_project_node) {
            t.tree("append", {
                parent: new_project_node.target,
                data: [{id: project_id + "-" + pid, text: name, is_project: 0, iconCls: "icon-file"}]
            });

            t.tree('expand', new_project_node.target);
            var new_node = t.tree("find", project_id + "-" + pid);
            if (new_node) {
                t.tree("select", new_node.target);
                tree_onclick(new_node);
            }
        }
    }
}

function update_processor() {
    var proc_id = get_global_proc_id();
    var url = "/processor/update/" + proc_id + "/";
    $("#modal_iframe iframe").attr('src', url);
    var t = $('#proc_tt');
    var node = t.tree('find', global_proc_id);
    var p_node = t.tree('getParent', node.target)
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }

    $("#modal_iframe").attr("project_id", p_node.id);
    $(".modal_iframe h4").html("更新插件");
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function add_new_version() {
    var id = $("#proc_id").val();
    var url = "/processor/view_history/" + id + "/";
    $.ajax({
        type: 'post',
        url: url,
        success: function (result) {
            if (result.status) {
                $('#messageModal .modal-body p').text(result.msg);
                $('#messageModal').modal('show');
            } else {
                $("#proc_version_name").empty();
                $("#local_pg_proc_version_name").empty();
                var data_list = new Array();
                for (var i = 0; i < result.history_list.length; i++) {
                    data_list.push({"id": result.history_list[i].name, "text": result.history_list[i].name})
                }

                $('#proc_version_name').combobox('loadData', data_list);
                $('#local_pg_proc_version_name').combobox('loadData', data_list);
                $("#create_new_version").modal("show");
            }
        }
    });
}

function upload_package() {
    var type = 0;
    if ($("#tab_1").hasClass("active")) {
        upload_with_git();
    } else if ($("#tab_2").hasClass("active")) {
        file_upload();
    } else {
        $("#create_new_version").modal("hide");
        $('.modal-backdrop').remove();
    }

}

function upload_with_git() {
    $("#update_busy_icon").show();
    var form_data = new FormData();
    var proc_id = get_global_proc_id();
    form_data.append('proc_id', proc_id);
    var version_name = $("#proc_version_name").combobox('getValue');
    form_data.append('version_name', version_name);
    form_data.append('type', 0);
    form_data.append('desc', $("#proc_version_desc").val());
    form_data.append('git_url', $("#git_url").val());

    $.ajax({
        url: '/processor/upload_package_with_local/',
        type: 'POST',
        data: form_data,
        processData: false,  // tell jquery not to process the data
        contentType: false, // tell jquery not to set contentType
        success: function (result) {
            $("#update_busy_icon").hide();
            if (result.status == 0) {
                $("#create_new_version").modal("hide");
                $('.modal-backdrop').remove();
                showProcHist();
            } else {
                new PNotify({
                    title: '错误',
                    text: '创建或者更新插件版本失败。[' + result.msg + "]",
                    type: 'error',
                    hide: true,
                    closer: true,
                    addclass: 'custom'
                });
            }
        }
    });
}

function file_upload() {
    $("#update_busy_icon").show();
    var form_data = new FormData();
    var file_info = $('#file_upload')[0].files[0];
    form_data.append('file', file_info);
    var proc_id = get_global_proc_id();
    form_data.append('proc_id', proc_id);
    var version_name = $("#local_pg_proc_version_name").combobox('getValue');
    form_data.append('version_name', version_name);
    form_data.append('type', 1);
    form_data.append('desc', $("#local_proc_version_desc").val());

    $.ajax({
        url: '/processor/upload_package_with_local/',
        type: 'POST',
        data: form_data,
        processData: false,  // tell jquery not to process the data
        contentType: false, // tell jquery not to set contentType
        success: function (result) {
            $("#update_busy_icon").hide();
            if (result.status == 0) {
                $("#create_new_version").modal("hide");
                $('.modal-backdrop').remove();
                showProcHist();
            } else {
                new PNotify({
                    title: '错误',
                    text: '创建或者更新插件版本失败。[' + result.msg + "]",
                    type: 'error',
                    hide: true,
                    closer: true,
                    addclass: 'custom'
                });
            }
        }
    });
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

//删除数据
function delete_proc() {
    var proc_id = get_global_proc_id();
    var url = "/processor/delete/" + proc_id + "/";
    if (confirm("确定要删除这个插件吗?")) {
        $.ajax({
            type: 'post',
            url: url,
            success: function (result) {
                if (result.status) {
                    new PNotify({
                        title: '通知',
                        text: "失败：" + result.msg,
                        type: 'warn',
                        hide: true,
                        closer: true,
                        addclass: 'custom'
                    });
                } else {
                    new PNotify({
                        title: '通知',
                        text: "删除插件成功！",
                        type: 'info',
                        hide: true,
                        closer: true,
                        addclass: 'custom'
                    });
                }
            }
        });
    }
}

function get_proc_with_project_tree(proc_id) {
    $.ajax({
        type: 'post',
        url: "/processor/get_proc_with_project_tree/",
        data: {'id': proc_id},
        success: function (result) {
            if (result.status) {
                alert("获取插件失败！原因:" + result.msg);
            } else {
                var t = $("#proc_tt");
                t.tree('loadData', result.data);
                var new_node = t.tree('find', result.node_id);
                t.tree("select", new_node.target);
                tree_onclick(new_node);
            }
        }
    });
}

function new_tx() {
    
}

function change_sidebar_type(type) {
    console.log("DDDDDDDD: " + type);
    if (type == 0) {
        $(".panel-title").html("SQL计算");
        $("#top_button1").show();
        $("#top_button1").html("执行SQL");
        $("#top_button2").show();
        $("#top_button3").show();
        global_call_code_type = 0;
    }

    if (type == 1) {
        $(".panel-title").html("函数管理");
        $("#top_button1").show();
        $("#top_button1").html("部署函数");
        $("#top_button2").show();
        $("#top_button3").show();
        global_call_code_type = 1;
    }

    if (type == 2) {
        $(".panel-title").html("取数");
        $("#top_button1").show();
        $("#top_button1").html("执行SQL");
        $("#top_button2").show();
        $("#top_button3").show();
        global_call_code_type = 0;
    }

    $("#top_button4").hide();
    $("#top_button5").hide();
}

function proc_tree_before_load() {
    if (page_init) {
        page_init = false;
        if ($("#render_proc_id").val() > 0) {
            $("#id_main_create_proc").hide();
            get_proc_with_project_tree($("#render_proc_id").val());
            return false;
        } else {
            $("#id_main_create_proc").show();
        }
    }

    return true;
}

function autoFormatSelectionMain() {
    var value = sqlFormatter.format(codemirror_editor.getValue().trim(), {
        language: "sql",
        uppercase: false,
    });
    codemirror_editor.setValue(value);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
//创建数据Ajax
function createTaskAjax() {
    $("#top_button3").attr('disabled', "true");
    var pipe_id = $('.modal_iframe', window.parent.document).attr("pipe_id");
    var url = "/pipeline/create_task/" + pipe_id + "/";

    var param = "name=SQL计算" + getRandomInt(1000);
    param += "&type=1";
    param += "&processor_id=-1";
    param += "&version_id=5";
    param += "&use_processor=False";
    param += "&config=";
    param += "&template=sql";
    param += "&retry_count=1";
    param += "&over_time=0";
    param += "&priority=6";
    param += "&prev_task_ids=";
    param += "&description=test_sql";
    param += "&server_tag=test";

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
            $("#top_button3").removeAttr('disabled');
        }
    });
}

function save_sql() {
    createTaskAjax();
}

function show_table_info(open, result) {
    if (open) {
        $("#right_side_bar").removeClass('control-sidebar-close');
        $("#right_side_bar").addClass('control-sidebar-open');
        $("#right_side_bar").width(500);
        $("#jsGrid3").jsGrid({
            height: "auto",
            width: "100%",
            sorting: true,
            paging: true,
            autoload: true,
            toppager: true,
            pageSize: 20,
            data: result.fileds,
            fields: [
                { name: "name", type: "text", width: 100 },
                { name: "type", type: "text", width: 90 },
                { name: "comment", type: "text", width: 100 },
                { name: "ttl", type: "text", width: 80 },
            ]
        });
        $("#jsGrid2").jsGrid({
            height: "auto",
            width: "100%",
            pageSize: 20,
            sorting: true,
            paging: true,
            autoload: true,
            data: result.datas,
            fields: result.data_fields,
            toppager: true
        });

        var value = sqlFormatter.format(result.create.trim(), {
            language: "sql",
            uppercase: false,
        });
        $("#table_create").val(value);
        $("#top_button1").hide();
        $("#top_button2").hide();
        $("#top_button3").hide();
        $("#top_button4").hide();
        $("#top_button5").hide();

    } else {
        $("#right_side_bar").removeClass('control-sidebar-open');
        $("#right_side_bar").addClass('control-sidebar-close');
        $("#right_side_bar").width(0);
        $("#top_button1").show();
        $("#top_button2").show();
        $("#top_button3").show();
        $("#top_button4").show();
        $("#top_button5").show();
    }
}

function init_python_codemirror(sql) {
    if (codemirror_editor == null) {
        codemirror_editor = CodeMirror.fromTextArea(document.getElementById("code"), {
            lineNumbers: true,
            extraKeys: { "Tab": "autocomplete" },
            mode: { name: "text/x-mysql", globalVars: true }
        });

        if (typeof Promise !== "undefined") {
            var comp = [
                ["here", "hither"],
                ["asynchronous", "nonsynchronous"],
                ["completion", "achievement", "conclusion", "culmination", "expirations"],
                ["hinting", "advise", "broach", "imply"],
                ["function", "action"],
                ["provide", "add", "bring", "give"],
                ["synonyms", "equivalents"],
                ["words", "token"],
                ["each", "every"],
            ]

            function synonyms(cm, option) {
                return new Promise(function (accept) {
                    setTimeout(function () {
                        var cursor = cm.getCursor(), line = cm.getLine(cursor.line)
                        var start = cursor.ch, end = cursor.ch
                        while (start && /\w/.test(line.charAt(start - 1)))--start
                        while (end < line.length && /\w/.test(line.charAt(end)))++end
                        var word = line.slice(start, end).toLowerCase()
                        for (var i = 0; i < comp.length; i++) if (comp[i].indexOf(word) != -1)
                            return accept({
                                list: comp[i],
                                from: CodeMirror.Pos(cursor.line, start),
                                to: CodeMirror.Pos(cursor.line, end)
                            })
                        return accept(null)
                    }, 100)
                })
            }
        }
    }

    codemirror_editor.setValue(sql);
    $("#top_sql_data").show();
    $("#buttom_sql_data").show();
}

function init_codemirror(sql) {
    if (codemirror_editor == null) {
        codemirror_editor = CodeMirror.fromTextArea(document.getElementById("code"), {
            lineNumbers: true,
            extraKeys: { "Tab": "autocomplete" },
            mode: { name: "text/x-mysql", globalVars: true }
        });

        if (typeof Promise !== "undefined") {
            var comp = [
                ["here", "hither"],
                ["asynchronous", "nonsynchronous"],
                ["completion", "achievement", "conclusion", "culmination", "expirations"],
                ["hinting", "advise", "broach", "imply"],
                ["function", "action"],
                ["provide", "add", "bring", "give"],
                ["synonyms", "equivalents"],
                ["words", "token"],
                ["each", "every"],
            ]

            function synonyms(cm, option) {
                return new Promise(function (accept) {
                    setTimeout(function () {
                        var cursor = cm.getCursor(), line = cm.getLine(cursor.line)
                        var start = cursor.ch, end = cursor.ch
                        while (start && /\w/.test(line.charAt(start - 1)))--start
                        while (end < line.length && /\w/.test(line.charAt(end)))++end
                        var word = line.slice(start, end).toLowerCase()
                        for (var i = 0; i < comp.length; i++) if (comp[i].indexOf(word) != -1)
                            return accept({
                                list: comp[i],
                                from: CodeMirror.Pos(cursor.line, start),
                                to: CodeMirror.Pos(cursor.line, end)
                            })
                        return accept(null)
                    }, 100)
                })
            }
        } 
    }

    codemirror_editor.setValue(sql);
    $("#top_sql_data").show();
    $("#buttom_sql_data").show();
}

function CallSql() {
    if (global_call_code_type == 0) {
        var sql_str = codemirror_editor.getValue().trim();
        if (sql_str == '') {
            return;
        }

        if (codemirror_editor.getSelection().trim() != '') {
            sql_str = codemirror_editor.getSelection().trim();
        }

        $.ajax({
            type: 'post',
            async: true,
            url: '/picker/get_sql_data/',
            data: { 'sql': sql_str },
            dataType: "json",
            success: function (result) {
                if (result.status == 0) {
                    $("#jsGrid1").jsGrid({
                        height: "auto",
                        width: "100%",
                        sorting: true,
                        paging: true,
                        autoload: true,
                        data: result.data,
                        fields: result.fileds
                    });
                } else {
                }
            }
        });
    }
    
    if (global_call_code_type == 1) {
        var codes = codemirror_editor.getValue().trim();
        if (codes == '') {
            return;
        }

        $.ajax({
            type: 'post',
            async: true,
            url: '/picker/save_python_function/',
            data: { 'codes': codes },
            dataType: "json",
            success: function (result) {
                if (result.status == 0) {
                    new PNotify({
                        title: '通知',
                        text: '部署函数成功！',
                        addclass: 'custom',
                        type: 'success'
                    });
                } else {
                    new PNotify({
                        title: '通知',
                        text: '部署函数失败！',
                        addclass: 'custom',
                        type: 'error'
                    });
                }
            }
        });
    }
}

function reload_pages() {
   
}

function check_click_on_table_info() {
    $('body').click(function (e) {
        let inner = document.getElementById('right_side_bar');
        if (inner.contains(event.target)) {
        } else {
            if (e.target.nodeName == 'A') {
                return;
            }
            show_table_info(false, null);
        }
    })

    $(window).resize(reload_pages);
}

function show_chain_block() {
    get_blocks(7);
}

function show_auth() {
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }

    $("#top_button1").hide();
    $("#top_button2").hide();
    $("#top_button3").hide();
    $("#top_button4").hide();
    $("#top_button5").hide();
    var url = "/pipeline/show_block/" + global_table_address + "/";
    $("#modal_iframe iframe").attr('src', url);
    $("#modal_iframe").attr('hash', global_table_address);
    $(".modal_iframe h4").html("数据-确权和溯源");
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function update_block(node_data) {
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }

    var url = "/pipeline/update_block/" + node_data.id + "/";
    $("#modal_iframe iframe").attr('src', url);
    $("#modal_iframe").attr('task_id', node_data.id);
    $(".modal_iframe h4").html("确权详情");
    $("#modal_iframe").show();taskname
    $("#modal_iframe").modal('show');
}


const isHexadecimal = str => /^[A-F0-9]+$/i.test(str);

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function str_to_hex(str) {
    var arr1 = [];
    for (var n = 0; n < str.length; n++) {
        var hex = Number(str.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join('');
}

function GetValidHexString(uint256_bytes) {
    var str_res = uint256_bytes.toString(16)
    while (str_res.length < 64) {
        str_res = "0" + str_res;
    }

    return str_res;
}

function show_compute_auth() {
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }

    $("#top_button1").hide();
    $("#top_button2").hide();
    $("#top_button3").hide();
    $("#top_button4").hide();
    $("#top_button5").hide();
    var url = "/pipeline/get_status_graph/?pl_id=4&runtime=202303110840&taskname=模型数据导出";
    $("#modal_iframe iframe").attr('src', url);
    $("#modal_iframe").attr('hash', global_table_address);
    $(".modal_iframe h4").html("数据-计算溯源");
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function create_tx(self_private_key, self_public_key, to, amount, gas_limit, gas_price) {
    var gid = GetValidHexString(Secp256k1.uint256(randomBytes(32)));
    var tx_type = 0;
    var frompk = '04' + self_public_key.x.toString(16) + self_public_key.y.toString(16);
    const MAX_UINT32 = 0xFFFFFFFF;
    var amount_buf = new ethereumjs.Buffer.Buffer(8);
    var big = ~~(amount / MAX_UINT32)
    var low = (amount % MAX_UINT32) - big
    amount_buf.writeUInt32LE(big, 4)
    amount_buf.writeUInt32LE(low, 0)

    var gas_limit_buf = new ethereumjs.Buffer.Buffer(8);
    var big = ~~(gas_limit / MAX_UINT32)
    var low = (gas_limit % MAX_UINT32) - big
    gas_limit_buf.writeUInt32LE(big, 4)
    gas_limit_buf.writeUInt32LE(low, 0)

    var gas_price_buf = new ethereumjs.Buffer.Buffer(8);
    var big = ~~(gas_price / MAX_UINT32)
    var low = (gas_price % MAX_UINT32) - big
    gas_price_buf.writeUInt32LE(big, 4)
    gas_price_buf.writeUInt32LE(low, 0)
    var step_buf = new ethereumjs.Buffer.Buffer(8);
    var big = ~~(tx_type / MAX_UINT32)
    var low = (tx_type % MAX_UINT32) - big
    step_buf.writeUInt32LE(big, 0)
    step_buf.writeUInt32LE(low, 0)

    var message_buf = ethereumjs.Buffer.Buffer.concat(
        [ethereumjs.Buffer.Buffer.from(gid, 'hex'),
         ethereumjs.Buffer.Buffer.from(frompk, 'hex'),
         ethereumjs.Buffer.Buffer.from(to, 'hex'),
        amount_buf, gas_limit_buf, gas_price_buf, step_buf]);
    var kechash = keccak256(message_buf)
    var digest = Secp256k1.uint256(kechash, 16)
    const sig = Secp256k1.ecsign(self_private_key, digest)
    const sigR = Secp256k1.uint256(sig.r, 16)
    const sigS = Secp256k1.uint256(sig.s, 16)
    const pubX = Secp256k1.uint256(self_public_key.x, 16)
    const pubY = Secp256k1.uint256(self_public_key.y, 16)
    return {
        'gid': gid,
        'pubkey': '04' + self_public_key.x.toString(16) + self_public_key.y.toString(16),
        'to': to,
        'amount': amount,
        'gas_limit': gas_limit,
        'gas_price': gas_price,
        'type': tx_type,
        'shard_id': 3,
        'sign_r': sigR.toString(16),
        'sign_s': sigS.toString(16),
        'sign_v': sig.v,
    }
}

$(function () {
    check_click_on_table_info();
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
        $('#add_proc_new_version').css('margin-top', (-$(document).scrollTop()).toString() + 'px');
    });
    $('a[class="history_tab"]').on('click', function (e) {
        showProcHist();
    })

    $('a[class="relate_tab"]').on('click', function (e) {
        showQuote();
    })

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

    $("#buttom_sql_data").hide();
});




