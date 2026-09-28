var toolkit = null;
var renderer = null;
var global_pipe_id = null;
var global_update_node = null;
var global_mm_node = null;
var gloabl_pipename_id_map = new Map();
var gloabl_copy_task_skip_pipe_id = null;
var page_init = true;
var all_task_init_load = true;
var online_choose_val = 0;
var add_new_edge_param = null;
var is_create_edge_called = false;
var choosevalue = 0;

function run_all_task(run_time) {
    console.log("run_all_task 0")
    $("#run_task_busy").show();
    var task_id_list = '';
    $("input[name='task_check']:checked").each(function () {
        task_id_list += $(this).val() + ',';
    });

    //一个都不选就是选全部
    if (task_id_list == '') {
        $("input[name='task_check']").each(function () {
            task_id_list += $(this).val() + ',';
        });
    }

    var ordered_num = $('#ordered_num').val();
    if (ordered_num > 10) {
        $('#messageModal .modal-body p').text('串行并发数不能超过10!');
        $('#messageModal').modal('show');
        $("#run_task_busy").hide();
        return;
    }
    console.log("run_all_task 1")
    task_id_list = task_id_list.substr(0, task_id_list.length - 1);
    var url = "/pipeline/run_tasks/";
    $.ajax({
        type: 'post',
        url: url,
        dataType: 'json',
        data: {"task_id_list": task_id_list, "run_time": run_time, "ordered_num": ordered_num},
        success: function (result) {
            console.log("run_all_task 2")
            $("#run_task_busy").hide();
            if (result.status) {
                onsole.log("run_all_task 3")
                $('#messageModal .modal-body p').html(result.msg);
                $('#messageModal').modal('show');
            }
            else {
                onsole.log("run_all_task 4")
                $('#run_task_model .modal-body p').text('执行成功');
                $('#run_task_model').modal('show');
                $("#execute_task").modal("hide");
                var choose_runhis_value = 0;
                $('#run_task_model').on('hide.bs.modal', function () {
                    if (choose_runhis_value == 1) {
                        var pl_id = $("#pipe_id").val();
                        window.location.href = "/pipeline/history/" + pl_id + "/";
                    }
                });
            }
        }
    });
}

function str_to_date(str) {
    var year = str.substring(0, 4);
    var month = str.substring(4, 6);
    var day = str.substring(6, 8);
    var hour = 0;
    var minute = 0;
    var second = 0;
    var date = new Date(year, month, day, hour, minute, second);
    return date;
}

function runTask() {
    var run_time = $("#run_time").val();
    if (!run_time) {
        $('#messageModal .modal-body p').text('请填写执行时间!');
        $('#messageModal').modal('show');
        return;
    }

    if (run_time.indexOf("-") < 0) {
        run_all_task(run_time);
        return;
    }

    var array = run_time.split("-");
    var begin_len = array[0].length;
    var end_len = array[1].length;
    if (begin_len != end_len) {
        $('#messageModal .modal-body p').text('执行时间填写错误，开始时间长度不等于结束时间长度: ' + array[0] + ":" + array[1]);
        $('#messageModal').modal('show');
        return;
    }

    if (begin_len != 8 && begin_len != 10 && begin_len != 12) {
        $('#messageModal .modal-body p').text('执行时间填写错误，时间长度必须是8，10，12!');
        $('#messageModal').modal('show');
        return;
    }
    var begin_time = array[0].substring(0, 9);
    var begin_date = str_to_date(begin_time).getTime();
    var end_time = array[1].substring(0, 9);
    var end_date = str_to_date(end_time).getTime();
    var days = parseInt(Math.abs(end_date - begin_date) / 1000 / 60 / 60 / 24)
    if (days >= 3) {
        var r=confirm('执行时间跨度超过了 ' + days + ' 天，确定执行这么多任务吗?');
        if (r==true) {
            console.log("noah runTask 6")
            run_all_task(run_time);
        }
    } else {
        run_all_task(run_time);
    }
}

//执行任务
function run_pipeline() {
    $("#execute_task").modal({
        backdrop: false,
        show: true
    });
    var url = "/pipeline/get_tasks/";
    $.ajax({
        type: 'post',
        url: url,
        dataType: 'json',
        data: {"pipeline_id": get_global_pipeline_id()},
        success: function (result) {
            var task_list = result.task_list;
            var tasks = create_task_check(task_list);
            $("#tasks_checkbox").html(tasks);
            $("#check_all_task").attr("checked", false);
        }
    });
}

function create_task_check(task_list) {
    var tasks = '';
    var i = 0;
    var count = 2;

    for (i = 1; i <= task_list.length;) {
        var name = task_list[i - 1].name;
        var id = task_list[i - 1].id;
        if (i % count == 1) {
            tasks += '<tr>';
        }

        tasks += '<td title="' + name + '"><input type="checkbox" value="' + id
            + '" name="task_check"/>' + name
            + '&nbsp;&nbsp;&nbsp;&nbsp;</td>'
        if (i % count == 0) {
            tasks += '</td></tr>';
        }
        else {
            tasks += '</td>';
        }
        i++;

    }
    return tasks;
}

function apply_copy_pipeline() {
    var pl_id = get_global_pipeline_id();
    var pl_name = $("#copy_pl_name").val()

    var project_id = $('#copy_pipeline_project_id').val();
    var url = "/pipeline/copy_pipeline/";
    var text = '复制流程成功！';
    $.ajax({
        type: 'post',
        url: url,
        data: {'pl_id': pl_id, 'pl_name': pl_name, 'project_id': project_id},
        success: function (result) {
            if (result.status) {
                alert("复制流程失败！原因:" + result.msg);
            }
            else {
                $("#copy_pipeline_div").modal("hide");
                $('.modal-backdrop').remove();
                $("body").removeClass("modal-open");

                new PNotify({
                    title: '通知消息',
                    text: '创建成功',
                    addclass: 'custom',
                    type: 'success'
                });

                var t = $('#tt');
                var node = t.tree('find', project_id + "");
                if (node) {
                    t.tree('expand', node.target);
                    var new_node = t.tree('find', project_id + "-" + result.pl_id);
                    if (new_node) {
                        t.tree("select", new_node.target);
                        tree_onclick(new_node);
                    } else {
                        t.tree("append", {
                            parent: node.target,
                            data: {
                                id: project_id + "-" + result.pl_id,
                                text: pl_name,
                                is_project: 0
                            }
                        });

                        var new_node = t.tree('find', project_id + "-" + result.pl_id);
                        t.tree("select", new_node.target);
                        tree_onclick(new_node);
                    }
                }
            }
        }
    });
}

function copy_pipeline() {
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }

    $('#copy_pipeline_project_id').combotree('reload', '/pipeline/get_project_tree/');
    $("#copy_pipeline_div").modal("show");
}

function show_pipeline_history() {
    if (global_pipe_id == null) {
        new PNotify({
            title: '通知',
            text: "请先选中一个流程。",
            type: 'info',
            hide: true,
            closer: true,
            addclass: 'custom'
        });
        return;
    }

    var id = global_pipe_id + "";
    if (id.indexOf('-') < 0) {
        return;
    }

    var id_split = id.split('-');
    //window.open("/pipeline/history/" + id_split[1] + "/");
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }
    var url = "/pipeline/in_history/" + id_split[1] + "/";
    $("#modal_iframe iframe").attr('src', url);
    var pipe_id = get_global_pipeline_id();
    $("#modal_iframe").attr('pipe_id', pipe_id);
    $(".modal_iframe h4").html('选择算子');
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function show_index() {
    if (global_pipe_id == null) {
        new PNotify({
            title: '通知',
            text: "请先选中一个流程。",
            type: 'info',
            hide: true,
            closer: true,
            addclass: 'custom'
        });
        return;
    }

    var id = global_pipe_id + "";
    if (id.indexOf('-') < 0) {
        return;
    }

    var id_split = id.split('-');
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }
    var url = "/pipeline/futures_index/" + id_split[1] + "/";
    $("#modal_iframe iframe").attr('src', url);
    var pipe_id = get_global_pipeline_id();
    $("#modal_iframe").attr('pipe_id', pipe_id);
    $(".modal_iframe h4").html('流程数据详情');
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function get_global_pipeline_id() {
    var id = global_pipe_id + "";
    if (id.indexOf('-') < 0) {
        return null;
    }

    var id_split = id.split('-');
    return id_split[1];
}

function update_pipeline_callback(pipe_id, project_id, name) {
    var old_project_id = $("#modal_iframe").attr("project_id").split('-')[0];
    var t = $('#tt');
    if (project_id == old_project_id) {
        var node = t.tree("find", project_id + "-" + pipe_id);
        if (node != null) {
            t.tree("update", {
                target: node.target,
                text: name
            });

            t.tree("select", node.target);
            tree_onclick(node);
        }
    } else {
        var node = t.tree("find", old_project_id + "-" + pipe_id);
        if (node) {
            t.tree("remove", node.target);
        }

        var new_project_node = t.tree("find", project_id);
        if (new_project_node) {
            t.tree("append", {
                parent: new_project_node.target,
                data: [{id: project_id + "-" + pipe_id, text: name, is_project: 0, iconCls: "icon-filter"}]
            });

            t.tree('expand', new_project_node.target);
            var new_node = t.tree("find", project_id + "-" + pipe_id);
            if (new_node) {
                t.tree("select", new_node.target);
                tree_onclick(new_node);
            }
        }
    }
}

function remove_pipeline() {
    var pipe_id = get_global_pipeline_id();
    if (pipe_id == null) {
        new PNotify({
            title: '通知',
            text: "请先选中一个流程。",
            type: 'info',
            hide: true,
            closer: true,
            addclass: 'custom'
        });
        return;
    }

    if (confirm("确定删除这个流程吗？")) {
        $.post("/pipeline/delete/" + pipe_id + "/", {}, function (result) {
            if (result.status) {
                new PNotify({
                    title: '通知',
                    text: "删除流程失败：" + result.msg,
                    type: 'error',
                    hide: true,
                    closer: true,
                    addclass: 'custom'
                });
            } else {
                var t = $('#tt');
                var new_node = t.tree('find', global_pipe_id);
                t.tree("remove", new_node.target);
                $("#noah_content_header").hide();
                $("#noah_content_dag").hide();
                $("#id_main_create_pipeline").show();
            }
        }, "json");
    }
}

function update_pipeline() {
    var pipe_id = get_global_pipeline_id();
    if (pipe_id == null) {
        new PNotify({
            title: '通知',
            text: "请先选中一个流程。",
            type: 'info',
            hide: true,
            closer: true,
            addclass: 'custom'
        });
        return;
    }

    var url = "/pipeline/update/" + pipe_id + "/";
    $("#modal_iframe iframe").attr('src', url);
    var t = $('#tt');
    var node = t.tree('getSelected');
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }

    $("#modal_iframe").attr("project_id", node.id);
    $(".modal_iframe h4").html("修改流程");
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function search_pipeline() {
    var word = $("#search_content").val();
    if (word.trim() == "") {
        var t = $("#tt");
        t.tree('reload');
        return;
    }
    $.ajax({
        type: 'post',
        url: '/pipeline/search_pipeline/',
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
                var t = $("#tt");
                t.tree('loadData', result);
            }
        }
    });
}

function get_input_output_list(config, input_arr, output_arr) {
    var temp = config.split('\n');
    var count = temp.length;
    for (var j = 0; j < count; j++) {
        var config_str = temp[j]
        var config_str_ = config_str.split('=');
        var config_str_left = config_str_[0].trim();
        var config_str_right = temp[j].substring(config_str_left.length + 1);
        var config_right_split = config_str_right.split('\1100')
        var config_state = ""
        if (config_right_split.length >= 2) {
            config_state = config_right_split[1];
            config_str_right = config_right_split[0];
        }

        if (config_str_left.match(/^input_\d/)) {
            input_arr.push(config_str_right)
        }

        if (config_str_left.match(/^output_\d/)) {
            output_arr.push(config_str_right)
        }
    }
}

function create_task_callback(pipe_id, task_info) {
    var input_arr = new Array();
    var output_arr = new Array();
    $("body").removeClass("modal-open");
    var all_nodes = toolkit.getNodes();
    if (task_info.name == "StreamData") {
        toolkit.addNode({
            "id": task_info.id + "",
            "name": task_info.name,
            "w": 100,
            "h": 30,
        });
    } else {
        toolkit.addNode({
            "id": task_info.id + "",
            "name": task_info.name,
            "w": 100,
            "h": 30,
        });

    }

    var prev_ids = task_info.prev_task_ids.split(',');
    var tmp_set = new Set();
    for (var i = 0; i < all_nodes.length; ++i) {
        tmp_set.add(all_nodes[i].id + '');
    }

    for (var i = 0; i < prev_ids.length; ++i) {
        if (tmp_set.has(prev_ids[i].trim())) {
            toolkit.addEdge({ source: prev_ids[i].trim(), target: task_info.id + '' });
        }
    }
    renderer.relayout();
    renderer.zoomToFit({ fill: 0.5 });
}


function create_new_work() {
    show_choose_sql_window();
}

function tree_onclick(node) {
    var tmp_id = node.id + "";
    if (tmp_id.indexOf('-') < 0) {
        var t = $('#tt');
        var node = t.tree('find', tmp_id);
        if (node) {
            $("#tt").tree('toggle', node.target);
        }

        return;
    }

    $("#btn_op_list").hide();
    $("#id_pipeline_name").html("");
    get_pipeline_detail(node.id);
    global_pipe_id = node.id;
}

function create_null_task() {
    var id_split = global_pipe_id.split('-')
    var pip_id = id_split[1];
    var url = "/pipeline/create_task/" + pip_id + "/";
    $("#id_server_tag").val($('#server_tag_select').prev().find('input').eq(1).val());
    var param = "";
    param += "&type=-1";
    param += "&processor_id=-1";
    param += "&version_id=0";
    param += "&use_processor=false";
    param += "&retry_count=1";
    param += "&over_time=0";
    param += "&priority=6";
    param += "&config=";
    param += "&template=";
    param += "&prev_task_ids=";
    param += "&description=";
    param += "&server_tag=";
    param += "&name=StreamData";

    $.ajax({
        type: 'post',
        url: url,
        dataType: "json",
        data: param,
        success: function (result) {
            if (result.status) {
                new PNotify({
                    title: '通知',
                    text: result.msg,
                    addclass: 'custom',
                    type: 'error'
                });
            } else {
                $('.modal_iframe', window.parent.document).hide();
                $('.modal-backdrop', window.parent.document).remove();
                create_task_callback(pip_id, result.task);
            }
            $("#create_busy_icon").hide();
            $("#create_task_btn").removeAttr('disabled');
        }
    });
}

function show_choose_proc_window_call_back(pid, version_id, type, proc_name, version_name) {
    var pipe_id = get_global_pipeline_id();
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }
    var url = "/pipeline/create_task/" + pipe_id + "/";
    $("#modal_iframe iframe").attr('src', url);
    $("#modal_iframe").attr('pipe_id', pipe_id);
    $("#modal_iframe").attr('proc_id', pid);
    $("#modal_iframe").attr('version_id', version_id);
    $("#modal_iframe").attr('proc_type', type);
    $("#modal_iframe").attr('proc_name', proc_name);
    $("#modal_iframe").attr('version_name', version_name);

    $(".modal_iframe h4").html("添加任务");
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function show_choose_proc_window() {
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }
    var url = "/processor/create_task_choose_proc/";
    $("#modal_iframe iframe").attr('src', url);
    var pipe_id = get_global_pipeline_id();
    $("#modal_iframe").attr('pipe_id', pipe_id);
    $(".modal_iframe h4").html('选择算子');
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function show_python_window() {
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }
    var url = "/pyplugin/";
    var pipe_id = get_global_pipeline_id();
    $("#modal_iframe").attr('pipe_id', pipe_id);
    $("#modal_iframe iframe").attr('src', url);
    $(".modal_iframe h4").html('Python脚本');
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function show_lua_window() {
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }

    var pipe_id = get_global_pipeline_id();
    $("#modal_iframe").attr('pipe_id', pipe_id);
    var url = "/pyplugin/";
    $("#modal_iframe iframe").attr('src', url);
    $(".modal_iframe h4").html('Python脚本');
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function show_choose_sql_window() {
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }
    var url = "/picker/";
    var pipe_id = get_global_pipeline_id();
    $("#modal_iframe").attr('pipe_id', pipe_id);
    $("#modal_iframe iframe").attr('src', url);
    $(".modal_iframe h4").html('SQL计算');
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

//获取该流程的所有任务
function get_tasks(pipe_id) {
    $.ajax({
        type: 'post',
        url: '/pipeline/get_tasks/',
        async: false,
        dataType: "json",
        data: { 'pipeline_id': pipe_id },
        success: function (result) {
            if (result.status) {
                //alert(result.msg);
                $('#messageModal .modal-body p').text(result.msg);
                $('#messageModal').modal('show');
            } else {
                toolkit.clear();
                var task_list = result.task_list;
                for (var i = 0; i < task_list.length; ++i) {
                    if (task_list[i].name == "StreamData") {
                        toolkit.addNode({
                            "id": task_list[i].id + "",
                            "name": task_list[i].name,
                            "w": 100,
                            "h": 30,
                        });
                    } else {
                        toolkit.addNode({
                            "id": task_list[i].id + "",
                            "name": task_list[i].name,
                            "w": 100,
                            "h": 30,
                        });
                    }

                }

                all_task_init_load = true;
                for (var i = 0; i < task_list.length; ++i) {
                    var next_task_ids = task_list[i].next_task_ids.split(',');
                    for (var j = 0; j < next_task_ids.length; ++j) {
                        if (next_task_ids[j].trim() != "") {
                            toolkit.addEdge({ source: '' + task_list[i].id, target: next_task_ids[j].trim() });
                        }
                    }
                }

                all_task_init_load = false;
                renderer.relayout();
                renderer.zoomToFit({ fill: 0.5 });

            }
        }
    });
}


function show_owner_pipeline() {
    $("#create_new_task_btn").show();
    $("#show_runhistory_btn").show();
    $("#run_pipeline_btn").show();
    $("#update_pipeline_btn").show();
    $("#delete_pipeline_btn").show();
    $("#pipeline_change_status_btn").show();
}

function hide_owner_pipeline() {
    $("#create_new_task_btn").hide();
    $("#show_runhistory_btn").hide();
    $("#run_pipeline_btn").hide();
    $("#update_pipeline_btn").hide();
    $("#delete_pipeline_btn").hide();
    $("#pipeline_change_status_btn").hide();
}

function check_is_pipeline_owner(user_id, owner_id, owner_list, is_super) {
    if (is_super) {
        return true;
    }

    if (user_id == owner_id) {
        return true;
    }

    for (var i = 0; i < owner_list.length; ++i) {
        if (owner_list[i].id == user_id) {
            return true;
        }
    }

    return false;
}

function get_pipeline_detail(id) {
    id = id + "";
    if (id.indexOf('-') < 0) {
        return;
    }

    var id_split = id.split('-')
    $.ajax({
        type: 'post',
        url: '/pipeline/get_pipeline_detail/',
        data: {'pipe_id': id_split[1]},
        success: function (result) {
            if (result.status) {
                alert(result.msg);
            }
            else {
                $("#id_main_create_pipeline").hide();
                $("#noah_content_dag").show();
                $("#noah_content_header").show();
                $("#btn_op_list").show();
                $("#id_pipeline_name").html(result.name);
                var t = $('#tt');
                var node = t.tree('find', global_pipe_id);
                if (node) {
                    $('#tt').tree('update', {
                        target: node.target,
                        text: result.name
                    });

                    t.tree("select", node.target);
                }
                
                if (check_is_pipeline_owner(result.user_id, result.owner_id, result.owner_list, result.is_super)) {
                    show_owner_pipeline();
                } else {
                    hide_owner_pipeline();
                }
            }
        }
    });

}

function create_project() {
    var parent_id = $("#createProjectModal").attr("project_id");
    var post_data = {
        'project_name': $("#createProjectModal #inputProjectName").val().trim(),
        'description': $("#createProjectModal #inputProjectDesc").val().trim(),
        'parent_id': parent_id
    };
    $.post('/processor/add_new_project/', post_data, function (result) {
        $(".modal-backdrop").remove();
        if (result.status == 0) {
            var t = $('#tt');
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

function get_pipeline_with_project_tree(pipeline_id) {
    $.ajax({
        type: 'post',
        url: "/pipeline/get_pipeline_with_project_tree/",
        data: {'id': pipeline_id},
        success: function (result) {
            if (result.status) {
                alert("获取流程失败！原因:" + result.msg);
            } else {
                var t = $("#tt");
                t.tree('loadData', result.data);
                var new_node = t.tree('find', result.node_id);
                t.tree("select", new_node.target);
                tree_onclick(new_node);
            }
        }
    });
}

function create_pipeline_callback(project_id, pipeline_id, name) {
    $("body").removeClass("modal-open");

    new PNotify({
        title: '通知',
        text: '新建流程成功',
        type: 'success',
        hide: true,
        closer: true,
        addclass: 'custom'
    });

    get_pipeline_with_project_tree(pipeline_id);
}

function addPipeline() {
    var url = "/pipeline/create/";
    $("#modal_iframe iframe").attr('src', url);
    var t = $('#tt');
    var node = t.tree('getSelected');
    var node_id = 0;
    if (node) {
        node_id = node.id;
    }

    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }

    $("#modal_iframe").attr("project_id", node_id);
    $(".modal_iframe h4").html("新建流程");
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function add_brother_project() {
    var t = $('#tt');
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
    var t = $('#tt');
    var node = t.tree('getSelected');
    $("#createProjectModal").attr("project_id", node.id);
    $("#createProjectModal h4").html("添加子分类");
    $("#createProjectModal").show();
    $("#createProjectModal").modal('show');
}

function delete_project() {
    var t = $('#tt');
    var node = t.tree('getSelected');
    $("#deleteProjectModal").attr("project_id", node.id);
    $("#deleteProjectModal").show();
    $("#deleteProjectModal").modal('show');
}

function do_delete_project() {
    var post_data = {};
    post_data["project_id"] = $("#deleteProjectModal").attr("project_id");
    $.post('/processor/delete_project/', post_data, function (result) {
        $(".modal-backdrop").remove();
        if (result.status == 0) {
            var node = $('#tt').tree("find", $("#deleteProjectModal").attr("project_id"));
            $("#tt").tree("remove", node.target);
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

function change_parent() {
}

function append() {
    var t = $('#tt');
    var node = t.tree('getSelected');
    t.tree('append', {
        parent: (node ? node.target : null),
        data: [{
            text: 'new item1'
        }, {
            text: 'new item2'
        }]
    });
}

function removeit() {
    var node = $('#tt').tree('getSelected');
    $('#tt').tree('remove', node.target);
}

function collapse() {
    var node = $('#tt').tree('getSelected');
    $('#tt').tree('collapse', node.target);
}

function expand() {
    var node = $('#tt').tree('getSelected');
    $('#tt').tree('expand', node.target);
}

function delete_task(info) {
    var id = global_pipe_id + "";
    if (id.indexOf('-') < 0) {
        return;
    }

    var id_split = id.split('-')
    $.post("/pipeline/delete_task/" + id_split[1] + "/", {Task: {id: info.obj.data.id}}, function (result) {
        if (0 == result.status) {
            toolkit.removeNode(info.obj);
        } else {
            alert(result.msg);
        }
    }, "json");
}

function update_task_callback(task_info) {
    $("body").removeClass("modal-open");
    var all_edges = toolkit.getAllEdges();
    var tmp_set = new Set();
    var this_node_id = '' + task_info.id;
    for (var i = 0; i < all_edges.length; ++i) {
        if (all_edges[i].target.id == this_node_id) {
            toolkit.removeEdge(all_edges[i]);
        }
    }
    var all_nodes = toolkit.getNodes();
    var prev_ids = task_info.prev_task_ids.split(',');
    var tmp_set = new Set();
    for (var i = 0; i < all_nodes.length; ++i) {
        tmp_set.add(all_nodes[i].id + '');
    }

    for (var i = 0; i < prev_ids.length; ++i) {
        if (tmp_set.has(prev_ids[i].trim())) {
            toolkit.addEdge({source: prev_ids[i].trim(), target: task_info.id + ''});
        }
    }

    global_update_node.data.name = task_info.name;
    toolkit.updateNode(global_update_node, global_update_node.data);
}

function mm_update_task() {
    update_task(global_mm_node.data);
}

function mm_copy_task_this() {
    var task_id = global_mm_node.data.id;
    var pl_id = get_global_pipeline_id();
    var url = "/pipeline/copy_task/";
    $.ajax({
        type: 'post',
        url: url,
        data: {'task_id': task_id, 'dest_pl_id': pl_id},
        success: function (result) {
            if (result.status) {
                alert("复制流程失败！原因:" + result.msg);
            }
            else {
                var task = result.data;
                create_task_callback(pl_id, task);
            }
        }
    });
}

function mm_copy_task_other() {
    $("#copy_task_hid").show();
    $("#copy_task_sure").show();
    $("#copy_task_hint").hide();
    $("#button_to_other").hide();
    $("#copy_task_div").hide();

    $("#copy_task_div").show();
    var task_id = global_mm_node.data.id;
    //获取应用列表
    $("#task_id").val(task_id);
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }
    $("#copy_task_div").modal("show");
}

function mm_remove_task() {

}

function mm_show_task_runhistory() {

}

function update_task(node_data) {
    if (node_data.name == "StreamData") {
        return;
    }

    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }

    var url = "/pipeline/update_task/" + node_data.id + "/";
    $("#modal_iframe iframe").attr('src', url);
    $("#modal_iframe").attr('task_id', node_data.id);
    $(".modal_iframe h4").html("修改任务");
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function writeObj(obj) {
    var description = "";
    for (var i in obj) {
        var property = obj[i];
        description += i + " = " + property + "\n";
    }
    console.log(description);
}

function create_edge_cancel_callback() {
    toolkit.removeEdge(add_new_edge_param);
}

function model_close_call_cancel_add_edge() {
    if (is_create_edge_called) {
        toolkit.removeEdge(add_new_edge_param);
        is_create_edge_called = false;
    }
}

function create_edge(from_task_id, to_task_id) {
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }

    var url = "/pipeline/create_edge?prev_task_id=" + from_task_id + "&next_task_id=" + to_task_id;
    $("#modal_iframe iframe").attr('src', url);
    $(".modal_iframe h4").html("新建数据流");
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function jsplumb_init() {
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-49979015-1', 'auto');
    ga('send', 'pageview');


    document.oncontextmenu = function (ev) {
        return false;    //屏蔽右键菜单
    }

    jsPlumbToolkit.ready(function () {
        // 1. declare some JSON data for the graph. This syntax is a JSON equivalent of GraphML.
        var data = {};
        var connectorPaintStyle = {
                strokeWidth: 2,
                stroke: "#61B7CF",
                joinstyle: "round",
                outlineStroke: "white",
                outlineWidth: 2
            },
        // .. and this is the hover style.
            connectorHoverStyle = {
                strokeWidth: 3,
                stroke: "#216477",
                outlineWidth: 5,
                outlineStroke: "white"
            },
            endpointHoverStyle = {
                fill: "#216477",
                stroke: "#216477"
            }
        var view = {
            nodes: {
                "default": {
                    template: "tmplNode",
                    events: {
                        dblclick: function (param) {
                            global_update_node = param.node;
                            update_task(param.node.data);
                        },
                        contextmenu: function (param) {
                            global_mm_node = param.node;
                            param.e.preventDefault();
                            $('#task_mm').menu('show', {
                                left: param.e.pageX,
                                top: param.e.pageY
                            });
                        }
                    }
                },
                "connector": {
                    template: "connectorNode",
                    events: {
                        dblclick: function (param) {
                            global_update_node = param.node;
                            update_task(param.node.data);
                        },
                        contextmenu: function (param) {
                            global_mm_node = param.node;
                            param.e.preventDefault();
                            $('#task_mm').menu('show', {
                                left: param.e.pageX,
                                top: param.e.pageY
                            });
                        }
                    }
                },
                "inout": {
                    template: "tmplNode",
                    events: {
                        dblclick: function (param) {
                            global_update_node = param.node;
                            update_task(param.node.data);
                        },
                        contextmenu: function (param) {
                            global_mm_node = param.node;
                            param.e.preventDefault();
                            $('#task_mm').menu('show', {
                                left: param.e.pageX,
                                top: param.e.pageY
                            });
                        }
                    }
                },

            },
            ports: {
                "start": {
                    edgeType: "default"
                },
                "source": {
                    maxConnections: -1,
                    edgeType: "connection"
                },
                "target": {
                    maxConnections: -1,
                    isTarget: true,
                    dropOptions: {
                        hoverClass: "connection-drop"
                    }
                }
            },
            edges: {
                "default": {
                    anchor:"AutoDefault",
                    paintStyle: { strokeWidth: 2, stroke: "rgb(97,183,207)", outlineWidth: 3, outlineStroke: "transparent" },	//	paint style for this edge type.
                    hoverPaintStyle: { strokeWidth: 2, stroke: "rgb(67,67,67)" }, // hover paint style for this edge type.
                    events: {
                        click: function (params) {
                            if (confirm("删除该链接?")) {
                                var fromId = params.edge.source.id;
                                var toId = params.edge.target.id;
                                $.post("/pipeline/unlink_task/", {
                                    Link: {
                                        from: fromId,
                                        to: toId
                                    }
                                }, function (result) {
                                    if (result.status) {
                                        $('#messageModal .modal-body p').text('删除连接失败');
                                        $('#messageModal').modal('show');
                                    } else {
                                        toolkit.removeEdge(params.edge);
                                    }
                                }, "json");
                            }
                        }
                    },
                    reattach: true, // 拖动端点可以解绑并可移动连接到别的节点
                    allowLoopback: false, //防止环回连接
                    allowNodeLoopback: false,

                    connectorStyle: connectorPaintStyle,
                    hoverPaintStyle: endpointHoverStyle,
                    connectorHoverStyle: connectorHoverStyle,
                    dragOptions: {},
                    overlays: [
                        [ "Label", {
                            location: [0.5, 1.5],
                            label: "Drag",
                            cssClass: "endpointSourceLabel",
                            visible:false
                        } ]
                    ]
                }
            }
        };

        // 2. get a jsPlumbToolkit instance. provide a groupFactory; when you drag a Group on to the Surface we
        // set an appropriate title for the new Group.
        toolkit = window.toolkit = jsPlumbToolkit.newInstance({
            nodeFactory: function (type, data, callback) {
                data.name = (toolkit.getNodeCount() + 1);
                callback(data);
            },
            beforeConnect: function (source, target) {
                console.log("before: " + source.id + ":" + target.id);
                                return true;

                var all_edges = toolkit.getAllEdges();
                var tmp_set = new Set();
                for (var i = 0; i < all_edges.length; ++i) {
                    var tmp_key = all_edges[i].source.id + ":" + all_edges[i].target.id;
                    tmp_set.add(tmp_key);
                }

                var tmp_key = source.id + ":" + target.id;
                if (tmp_set.has(tmp_key)) {
                    return false;
                }
                return true;
            },
        });

        // get the various dom elements
        var mainElement = document.querySelector("#jtk-demo-absolute"),
            canvasElement = mainElement.querySelector(".jtk-demo-canvas"),
            miniviewElement = mainElement.querySelector(".miniview");

        // 3. load the data, and then render it to "main" with an "Absolute" layout, in which the
        // data is expected to contain [left,top] values.
        renderer = window.renderer = toolkit.render({
            container: canvasElement,
            view: view,
            layout: {
                "type": "Hierarchical",
                "parameters": {
                    "orientation": "vertical",
                    "padding": [
                        70,
                        100
                    ]
                }
            },
            jsPlumb: {
                Anchor: "Continuous",
                Endpoint: "Blank",
                Connector: ["StateMachine", {cssClass: "connectorClass", hoverClass: "connectorHoverClass"}],
                PaintStyle: {strokeWidth: 1, stroke: '#89bcde'},
                HoverPaintStyle: {stroke: "orange"},
                Overlays: [
                    ["Arrow", {fill: "#09098e", width: 10, length: 10, location: 1}]
                ]
            },
            miniview: {
                container: miniviewElement
            },
            lassoFilter: ".controls, .controls *, .miniview, .miniview *",
            dragOptions: {
                filter: ".delete *, .group-connect *",
                magnetize: true
            },
            events: {
                canvasClick: function (e) {
                    toolkit.clearSelection();
                    //toolkit.addEdge({source: "225.225_output_0_port", target: "226.226_input_0_port"});
                },
                modeChanged: function (mode) {
                    jsPlumb.removeClass(jsPlumb.getSelector("[mode]"), "selected-mode");
                    jsPlumb.addClass(jsPlumb.getSelector("[mode='" + mode + "']"), "selected-mode");
                },
                edgeAdded: function (params) {
                    console.log(params.edge.source.id + ":" + params.edge.target.id);
                    if (all_task_init_load) {
                        return;
                    }

                    var fromId = params.edge.source.id;
                    var toId = params.edge.target.id;
                    if (params.edge.source.data.name == "StreamData") {
                        create_edge(fromId, toId);
                        is_create_edge_called = true;
                    } else {
                        $.post("/pipeline/link_task/", { Link: { from: fromId, to: toId } }, function (result) {
                            if (result.status) {
                                return;
                                alert('连接失败！');
                                toolkit.removeEdge(params.edge);
                            } else {
                                var all_edges = toolkit.getAllEdges();
                                var tmp_set = new Set();
                                for (var i = 0; i < all_edges.length; ++i) {
                                    var tmp_key = all_edges[i].source.id + ":" + all_edges[i].target.id;
                                    if (tmp_set.has(tmp_key)) {
                                        toolkit.removeEdge(all_edges[i]);
                                    } else {
                                        tmp_set.add(tmp_key);
                                    }
                                }
                            }
                        }, "json");
                    }
                }
            },
            consumeRightClick: false,
            zoomToFit: true
        });

        toolkit.load({type: "json", data: data});

        // pan mode/select mode
        jsPlumb.on(".controls", "tap", "[mode]", function () {
            renderer.setMode(this.getAttribute("mode"));
        });

        // on home button tap, zoom content to fit.
        jsPlumb.on(".controls", "tap", "[reset]", function () {
            toolkit.clearSelection();
            renderer.relayout();
            renderer.zoomToFit({fill: 0.5});
        });
        renderer.zoomToFit({fill: 0.5});

        //
        // use event delegation to attach event handlers to
        // remove buttons. This callback finds the related Node and
        // then tells the toolkit to delete it.
        //
        jsPlumb.on(canvasElement, "tap", ".delete", function (e) {
            if (confirm("删除该task?")) {
                var info = toolkit.getObjectInfo(this);
                delete_task(info);
            }
        });

        jsPlumb.on(canvasElement, "tap", ".group-title .expand", function (e) {
            var info = toolkit.getObjectInfo(this);
            if (info.obj) {
                renderer.toggleGroup(info.obj);
            }
        });

        jsPlumb.on(canvasElement, "tap", ".group-delete", function (e) {
            var info = toolkit.getObjectInfo(this);

            toolkit.removeGroup(info.obj, true);
        });

        //
        // Here, we are registering elements that we will want to drop onto the workspace and have
        // the toolkit recognise them as new nodes.
        //
        //  typeExtractor: this function takes an element and returns to jsPlumb the type of node represented by
        //                 that element. In this application, that information is stored in the 'jtk-node-type' attribute.
        //
        //  dataGenerator: this function takes a node type and returns some default data for that node type.
        //
        renderer.registerDroppableNodes({
            droppables: jsPlumb.getSelector(".node-palette li"),
            dragOptions: {
                zIndex: 50000,
                cursor: "move",
                clone: true
            },
            dataGenerator: function () {
                return arguments[3];
            }
        });

        var datasetView = new jsPlumbSyntaxHighlighter(toolkit, ".jtk-demo-dataset");
    });
}

function setNav() {
    var demosubmenu = $('#demo-submenu');
    if (demosubmenu.length) {
        if ($(window).width() < 450) {
            demosubmenu.find('a:last').hide();
        } else {
            demosubmenu.find('a:last').show();
        }
    }
    if ($(window).width() < 767) {
        $('.navigation-toggle').each(function () {
            $(this).show();
            var target = $(this).attr('data-target');
            $(target).hide();
            setDemoNav();
        });
    } else {
        $('.navigation-toggle').each(function () {
            $(this).hide();
            var target = $(this).attr('data-target');
            $(target).show();
        });
    }
}

function setDemoNav() {
    $('.navigation-toggle').each(function () {
        var target = $(this).attr('data-target');
        if (target == '#navbar-demo') {
            if ($(target).is(':visible')) {
                $(this).css('margin-bottom', 0);
            } else {
                $(this).css('margin-bottom', '2.3em');
            }
        }
    });
}


function onLoad(data) {
    data = data.replace(/(\r\n|\r|\n)/g, '\n');
    data = data.replace(/\t/g, '    ');
    $('#code').html('<pre name="code" class="prettyprint linenums" style="border:0"></pre>');
    $('#code').find('pre').text(data);
    prettyPrint();
}

function onChangeTheme(theme) {
    var link = $('#content').find('link:first');
    link.attr('href', '/easyui/themes/' + theme + '/easyui.css');
}

var currPlugin = 'ComboTree';
var currPageItem = 'Basic';

function open1(url, a) {
    currPageItem = $(a).text();
    $('body>div.menu-top').menu('destroy');
    $('body>div.window>div.window-body').window('destroy');
    $('#demo').panel('refresh', url);
}

function open2(plugin) {
    if (plugin) {
        currPlugin = plugin;
        currPageItem = '';
    }
    var href = '?plugin=' + currPlugin + '&theme=' + $('#cb-theme').combobox('getValue');
    href += '&dir=' + ($('#ck-rtl').is(':checked') ? 'rtl' : 'ltr');
    href += '&pitem=' + currPageItem;
    href += '&sort=asc';
    location.href = href;
}

function init_pipeline_select() {
    $.ajax({
        type: 'post',
        url: '/pipeline/search_pipeline/',
        async: true,
        dataType: "json",
        data: {'word': "", 'with_project': 0, 'limit': 10},
        success: function (result) {
            if (result.status) {
            } else {
                $('#pipeline_select').combobox('loadData', result.pipes);
                update_gloabl_pipename_id_map(result.pipes);
            }
        }
    });
}

function skip_copy_pipeline() {
    tmp_id = "pre-" + gloabl_copy_task_skip_pipe_id
    get_pipeline_detail(tmp_id);
    $("#copy_task_div").modal("hide");
    $('.modal-backdrop').remove();
}

function apply_copy_task() {
    $("#copy_busy_icon").show()
    $("#copy_task_hid").hide()
    $("#copy_task_sure").hide()

    var task_id = global_mm_node.data.id;
    var pl_name = $("#pipeline_select").combobox('getValue');
    var pl_id = gloabl_pipename_id_map.get(pl_name) + "";
    var src_pl_id = get_global_pipeline_id() + "";
    if (src_pl_id == pl_id) {
        mm_copy_task_this();
        return;
    }

    var url = "/pipeline/copy_task/";
    $.ajax({
        type: 'post',
        url: url,
        data: {'task_id': task_id, 'dest_pl_id': pl_id},
        success: function (result) {
            $("#copy_busy_icon").hide()
            if (result.status) {
                alert("复制任务失败！" + result.msg);
                $("#copy_task_hid").show();
                $("#copy_task_sure").show();
                $("#copy_task_hint").hide();
                $("#button_to_other").hide();
                $("#copy_task_div").hide();
            }
            else {
                if (src_pl_id == pl_id) {
                    task = result.data;
                    PipelineTasks.addTask(task);
                    $("#copy_task_hid").show();
                    $("#copy_task_sure").show();
                    $("#copy_task_hint").hide();
                    $("#button_to_other").hide();
                    $("#copy_task_div").hide();
                } else {
                    $("#copy_task_hint").show();
                    $('#copy_task_hint').text('拷贝任务成功！');

                    $("#button_to_other").show();
                    $("#delete-task").hide();
                    gloabl_copy_task_skip_pipe_id = pl_id;
                }
            }
        }
    });
}

function update_gloabl_pipename_id_map(pipes) {
    gloabl_pipename_id_map.clear();
    for (var i = 0; i < pipes.length; ++i) {
        gloabl_pipename_id_map.set(pipes[i].text, pipes[i].id);
    }
}

function tree_before_load(node, param) {
    if (page_init) {
        page_init = false;
        if ($("#render_pipeline_id").val() > 0) {
            $("#id_main_create_pipeline").hide();
            $("#noah_content_dag").show();
            $("#noah_content_header").show();
            get_pipeline_with_project_tree($("#render_pipeline_id").val());
            return false;
        } else {
            $("#id_main_create_pipeline").show();
            $("#noah_content_dag").hide();
            $("#noah_content_header").hide();
        }
    }

    return true;
}

function ok_value() {
    online_choose_val = 1;
}

function changeStatus(pipe_id, on_line, is_super) {
    online_choose_val = 0;
    var confirm_str = '';
    var text = '';
    var url = "/pipeline/on_line/";
    if (on_line) {
        confirm_str = "确定要上线该流程吗?";
        text = '上线成功！';
    } else {
        confirm_str = "确定要下线该流程吗?";
        text = '下线成功！';
    }

    $('#online_modal').unbind('hide.bs.modal');
    $("#modal_content").html(confirm_str);
    $("#online_modal").modal('show');
    //添加modal事件
    $("#online_modal").on('hide.bs.modal', function (e) {
        if (online_choose_val == 1) {
            $.ajax({
                type: 'post',
                url: url,
                data: {'pipe_id': pipe_id, 'on_line': on_line},
                success: function (result) {
                    if (result.status) {
                        alert("失败：" + result.msg);
                    }
                    else {
                        $("#id_change_status").empty();
                        var enable = '未上线&nbsp;<a title=\'点击上线\' onclick=\'changeStatus(' + pipe_id + ', 1, ' + is_super + ')\' href=\'javascript:void(0)\'><i class=\'fa fa-arrow-up\' style="color: rgb(253,181,50);"></i></a>';
                        if (on_line) {
                            enable = '已上线&nbsp;<a title=\'点击下线\' onclick=\'changeStatus(' + pipe_id + ', 0, ' + is_super + ')\' href=\'javascript:void(0)\'><i class=\'fa fa-arrow-down\' style="color: rgb(253,181,50);"></i></a>';
                        }

                        $("#id_change_status").html(enable);
                    }
                }
            });
        }
    })
}

var global_last_timestamp = 0;
var index_line = null;

function refresh_data() {
    $.ajax({
        type: 'post',
        async: false,
        url: "/pipeline/futures_datas/",
        data: { "pipe_id": 2, "limit": "100", "last_timestamp": global_last_timestamp },
        success: function (result) {
            if (result.status == 0) {
                index_line = new Morris.Line({
                    element: 'line-chart',
                    resize: true,
                    data: result.value,
                    xkey: 'y',
                    ykeys: ['item1'],
                    ymin: result.min,
                    ymax: result.max,
                    labels: ['Item 1', 'y'],
                    lineColors: ['#efefef'],
                    lineWidth: 2,
                    hideHover: 'auto',
                    gridTextColor: '#fff',
                    gridStrokeWidth: 0.4,
                    pointSize: 4,
                    pointStrokeColors: ['#efefef'],
                    gridLineColor: '#efefef',
                    gridTextFamily: 'Open Sans',
                    gridTextSize: 10
                });
            }
        }
    });
}

function calculateMA(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += +data[i - j][1];
        }
        result.push(sum / dayCount);
    }
    return result;
}

function init_grid_data() {
    $.ajax({
        type: 'post',
        async: false,
        url: '/picker/get_sql_data/',
        data: { 'sql': "select timestamp, index from IndexRealTime order by timestamp desc limit 100;" },
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
            }
        }
    });

    $.ajax({
        type: 'post',
        async: false,
        url: '/picker/get_sql_data/',
        data: { 'sql': "select * from EachYearAllRatio order by year,ratio desc limit 100;" },
        dataType: "json",
        success: function (result) {
            if (result.status == 0) {
                $("#jsGrid2").jsGrid({
                    height: "auto",
                    width: "100%",
                    sorting: true,
                    paging: true,
                    autoload: true,
                    data: result.data,
                    fields: result.fileds
                });
            }
        }
    });

    $.ajax({
        type: 'post',
        async: false,
        url: '/picker/get_sql_data/',
        data: { 'sql': "select * from MainContract order by px desc limit 100;" },
        dataType: "json",
        success: function (result) {
            if (result.status == 0) {
                $("#jsGrid3").jsGrid({
                    height: "auto",
                    width: "100%",
                    sorting: true,
                    paging: true,
                    autoload: true,
                    data: result.data,
                    fields: result.fileds
                });
            }
        }
    });
}

$(function () {
    $('.changevalue', window.parent.document).on('click', function () {
        choosevalue = 1;
        $('#modalcheck_iframe', window.parent.document).modal('hide');
    });

    //alert(md5(md5(md5("qincai5211"))));
    $('#search_content').bind('keypress', function (event) {
        if (event.keyCode == "13") {
            search_pipeline();
        }
    });

    $("#btn_op_list").hide();

    var refresh_table = function () {
        refresh_data();
        init_grid_data();
        setTimeout(refresh_table, 3000);
    };
    // We could use setInterval instead, but I prefer to do it this way
    refresh_data();
    init_grid_data();
    var Height = $(window).height();
    $("#aside_tree_control").height(Height - 220);
    setTimeout(refresh_table, 3000);
});

