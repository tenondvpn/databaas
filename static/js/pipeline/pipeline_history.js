function cut_str(str) {
    return str.substr(0, 8) + ' ' + str.substr(8, (str.length - 8));
}

function restore_runtime(str) {
    return str.replace(/[ ]/g, ""); //去除字符串中的空格
}

function get_history_list() {
}

var choosevalue;
var g_order_tag = 4;
var g_desc = 1;
var tableT;

function update_pipeline_callback(pipe_id) {
    get_pipeline_detail(global_pipe_id);
}

function update_pipeline(pipe_id) {
    var url = "/pipeline/update/" + pipe_id + "/";
    $("#modal_iframe iframe").attr('src', url);
    if (!$("body").hasClass("modal-open")) {
        $("body").addClass("modal-open");
    }

    $("#modal_iframe").attr("project_id", pipe_id);
    $(".modal_iframe h4").html("修改流程");
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}

function refresh_cur_page() {
    $('#tableT_paginate ul.pagination li').each(function () {
        if ($(this).hasClass('active')) {
            activeindex = $(this).index();
        }
    });
    $('#tableT_paginate ul.pagination li').each(function () {
        if ($(this).index() == activeindex) {
            var that = $(this);
            $(this).trigger('click', function () {
                that.addClass('active');
            });
        }
    });

}

/*
 *	$(function() {....}) 是 jQuery 中的经典用法，
 *	等同于 $(document).ready(function() {....})，
 *	即在页面加载完成后才执行某个函数，如果函数中要操作 DOM，
 *	在页面加载完成后再执行会更安全，所以在使用 jQuery 时这样的写法很常见。
 */
$(function () {  //612
    var pid = $('#pipeid').val();
    var taskname = $('#taskname').val();
    /* if(pid){
       $('#tableTinput').val(pid);
       }*/
    var statushistory = $('#statushistory').val();
    if (statushistory) {

        $('#taskli').trigger('click', function () {
        });
        $('#taskli').css({'background-color': '#01579b', 'color': 'white'});
        $('#pipli').css({'background-color': 'gray', 'color': 'black'});
    }
    $('#taskli').on('click', function () {
        $(this).css({'background-color': '#01579b', 'color': 'white'});
        $('#pipli').css({'background-color': 'gray', 'color': 'black'});
    });
    $('#pipli').on('click', function () {
        $(this).css({'background-color': '#01579b', 'color': 'white'});
        $('#taskli').css({'background-color': 'gray', 'color': 'black'});
    });
    var state = 0;
    $('#backhistory').on('click', function () {
        window.history.back();
    });
    $('.changevalue').on('click', function () {
        choosevalue = 1;
        $('#modalcheck').modal('hide');
    });

    $('.downhover').hover(function () {
        $(this).find('option').eq(0).trigger('click', function () {
            alert('1');
        });
    }, function () {
    });
    tableT = $('#tableT').DataTable({
        "bDestroy": true,
        "processing": true,
        "bAutoWidth": true,
        "serverSide": true,

        "ajax": {
            "url": "/pipeline/history_list/4_1/",
            "type": "POST"
        },
        "language": {
            "sLengthMenu": "显示 _MENU_ 条记录",
            "sInfo": "显示第 _START_ 至 _END_ 条记录，共 _TOTAL_ 条",
            "sInfoEmpty": "显示第 0 至 0 条记录，共 0 条"
        },
        columns: [{
            data: "order_tag",
            bSortable: false
        }, {
            data: "run_time",
            bSortable: false
        }, {
            data: "pl_name",
            bSortable: false
        }, {
            data: "task_name",
            bSortable: false
        }, {
            data: "status",
            bSortable: false
        }, {
            data: "start_time",
            bSortable: false
        }, {
            data: "use_time",
            bSortable: false
        }],

        "columnDefs": [
            {
                "targets": [1],
                "render": function (data, type, full) {
                    //return data;
                    return cut_str(data);
                }
            },
            {
                "targets": [0],
                "orderData": [1, 0],
                "render": function (data, type, full) {
                    return "<input type='checkbox' style='margin-left:10px;margin-top: 10px;' class='allcheck' runtime='" + full.run_time + "' taskid='" + full.task_id + "'/>";
                }
            }, {
                "targets": [4],
                "render": function (data, type, full) {
                    state = data;
                    if (data == 0) {
                        return '<h5 style="color:blue" href="javascript:void(0);" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick=""   tid="' + full.task_id + '" class="hover-p text-center" type="button"  data-toggle="tooltip" data-placement="left" >等待中</h5>';
                    } else if (data == 1) {
                        return ' <h5 style="color:#01579b" href="javascript:void(0);" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick="   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left" >正在执行中</h5>';
                    } else if (data == 2) {
                        return '<h5 style="color:green" href="javascript:void(0);" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick=""   tid="' + full.task_id + '" type="button"  class="hover-p text-center" data-toggle="tooltip" data-placement="left">执行成功</h5>';

                    } else if (data == 3) {
                        return '<h5 style="color:red" href="javascript:void(0);" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick=""   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left">执行失败</h5>';
                    } else if (data == 4) {
                        return '<h5 style="color:red" href="javascript:void(0);" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick=""  tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left">任务超时</h5>';
                    } else if (data == 5) {
                        return '<h5 style="color:red" href="javascript:void(0);" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick=""  tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left" >等待调度</h5>';
                    } else if (data == 6) {
                        return '<h5 style="color:red" href="javascript:void(0);" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick=""   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left" >任务被用户禁止</h5>';
                    } else if (data == 7) {
                        return '<h5 style="color:red" href="javascript:void(0);" taskid="' + full.task_id + '" runtime+"' + full.run_time + '" onclick=""   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left">条件不满足</h5>';
                    } else if (data == 8) {
                        return '<h5 style="color:red" href="javascript:void(0);" taskid="' + full.task_id + '" runtime+"' + full.run_time + '" onclick=""   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left">V100-等待提交</h5>';
                    } else if (data == 9) {
                        return '<h5 style="color:#01579b" href="javascript:void(0);" taskid="' + full.task_id + '" runtime+"' + full.run_time + '" onclick=""   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left">v100-执行中</h5>';
                    } else {
                        return ' <h5 style="color:#01579b" href="javascript:void(0);" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick="   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left" >正在执行中</h5>';
                    }
                }
            }, {
                "targets": [2],
                "Width": "150px",
                "render": function (data, type, full) {
                    return "<a class='h5 text-center' target='_blank' href='/pipeline/" + full.pl_id + "/'>" + data + "</a>";
                }
            }, {
                "targets": [3],
                "render": function (data, type, full) {
                    var url_update_task = "show_update_modal('/pipeline/update_task/" + full.task_id + "')";
                    return "<a onclick=" + url_update_task + ">" + data + "</a>";
                }
            }, {
                "targets": [7],

                "render": function (data, type, full) {
                    var task_id = full.task_id;
                    var pl_id = full.pl_id;
                    if (state == 1 || state == 0 || state == 5 || state == 8 || state == 9) {
                        return "<h5 style='color:red;cursor:pointer' class='text-center' onclick='stop_task(this)'  taskid='" + full.task_id + "' runtime='" + full.run_time + "'>停止运行</h5>";
                    } else {
                        return "<select style='border:0' class='selectid form-control' onchange='newrun(this)'><option value='0'>重跑操作</option><option id='option1' value='" + pl_id + "'>完全重跑</option><option  id='option2' value='" + task_id + "'>单跑task</option><option id='option3' value='" + task_id + "'>单跑task和后续</option><option id='option4' value='" + task_id + "'>设为成功</option></select>";
                    }
                }
            }, {
                "targets": [8],
                "render": function (data, type, full) {
                    var id = full.id;
                    var status_check = ("<a class='pipeline-mar text-center' target='_blank' style='color:#01579b;'" +
                        " href='/pipeline/get_status_graph/?pl_id=" + full.pl_id + "&runtime=" + full.run_time + "&taskname=" + full.task_name + "'>状态追踪</a>");
                    if (state == 0 || state == 5) {
                        return status_check;
                    } else {
                        return status_check + "&nbsp;&nbsp;<a class='pipeline-mar text-center' target='_blank' style='color:#01579b;' href='/pipeline/history/getlog/" + id + "/'>查看日志</a>";
                    }
                }
            }, {
                "targets": [6],
                "render": function (data, type, full) {
                    //  var usetime=(parseInt(full.use_time)/3600).toString().substr(0,6)+"h";
                    // return usetime;
                    if (full.use_time <= 60) {
                        return full.use_time + '秒';
                    } else if (full.use_time > 60 && full.use_time < 3600) {
                        var mm = parseInt(full.use_time / 60);
                        var hh = full.use_time - mm * 60;
                        return mm + '分' + hh + '秒';
                    } else if (full.use_time >= 3600) {
                        var h = parseInt(full.use_time / 3600);
                        var lm = full.use_time - h * 3600;
                        var m = parseInt(lm / 60);
                        var sec = lm - m * 60;
                        return h + "小时" + m + "分" + sec + "秒";
                    }
                }
            }]
    });
    $('#tableT_filter').hide();
    /*         function search_eventT(colIdx){
               return function(){
               tableT
               .column( colIdx )
               .search( this.value )
               .draw();
               
               }
               }*/

    tableT.columns().eq(0).each(function (colIdx) {
        if (colIdx == 1 || colIdx == 2 || colIdx == 3 || colIdx == 5) {
            $('input', tableT.column(colIdx).header()).on('change', function () {
                tableT
                    .column(colIdx)
                    .search(this.value)
                    .draw();
                this.index = $(this).val();
            });
            $('input', tableT.column(colIdx).header()).on('keydown', function (event) {
                var event = event || window.event;
                if (event.keyCode == 13 || event.which == 13) {
                    var newval = $(this).val();
                    if (newval == this.index) {
                        $('input', tableT.column(colIdx).header()).triggerHandler('change');
                    }
                }
            });
        } else if (colIdx == 4) {
            $('select', tableT.column(colIdx).header()).on('change', search_eventT(colIdx));
        }

    });


    function search_eventT(colIdx) {
        return function () {
            tableT
                .column(colIdx)
                .search(this.value)
                .draw();
        }
    }

    function chang() {
        tableT.columns().eq(0).each(function (colIdx) {
            if (colIdx == 1) {
                $('input', tableT.column(colIdx).header()).trigger('change', search_eventT(colIdx));
            }

        });
    }


    if (pid && !taskname && !$('#runtime').val()) {
        $('#tableTinput').val(pid);
        // chang();
        $('#tableTinput', tableT.column(2).header()).trigger('change', search_eventT(2));
    }
    if (pid && taskname && $('#runtime').val()) {
        $('#tableTtime').val($('#runtime').val());
        $('#tableTinput').val(pid);
        $('#tableTtask').val(taskname);
        $('#tableTinput', tableT.column(2).header()).trigger('change', search_eventT(2));
        $('#tableTtime', tableT.column(1).header()).trigger('change', search_eventT(1));
        $('#tableTtask', tableT.column(3).header()).trigger('change', search_eventT(3));

    }
    if (statushistory && $('#runtime').val()) {
        console.log(statushistory);
        $('#tableTtime').val($('#runtime').val());
        $('#tableTselect option').each(function () {
            if ($(this).val() == statushistory) {
                console.log($(this).val());
                $(this).prop('selected', 'selected');
            }
        });

        $('#tableTtime', tableT.column(1).header()).trigger('change', search_eventT(1));
        $('#tableTselect', tableT.column(4).header()).trigger('change', search_eventT(4));
    }
    //flush
    var activeindex;
    var timer1;
    $('#checkboxflush').change(function () {
        if ($(this).is(':checked')) {
            timer1 = setInterval(function () {
                refresh_cur_page();
            }, 6000);
        } else {
            clearInterval(timer1);
        }
    });
    var activeindex2;
    //全选
    $('#checkall').on('change', function () {
        if ($(this).is(':checked')) {
            $('.allcheck').each(function () {
                $(this).prop('checked', true);
            });
        } else {
            $('.allcheck').each(function () {
                $(this).prop('checked', false);
            });

        }
    });

    //批量停止
    $("#batch_stop_task").click(function () {
        if (!$('.allcheck:checked').length) {
            $('#messageview .modal-body h5').text('没有选中任务');
            $('#messageview').modal('show');
            return;
        }

        var confirm_msg = '确定停止选中任务？';
        (new PNotify({
            title: '停止确认',
            text: confirm_msg,
            hide: false,
            confirm: {
                confirm: true,
                buttons: [{
                    text: '确认',
                    click: function (notice) {
                        var url = "/pipeline/stop_task/";
                        notice.update({
                            text: '操作中...'
                        });
                        notice.get().find("button").hide();

                        var checkboxlist = $('.allcheck:checked');
                        checkboxlist.each(function () {
                            var data = {
                                'task_id': $(this).attr('taskid'),
                                'run_time': $(this).attr('runtime')
                            };
                            result = makeAPost(url, data, true, function (result) {
                                if (result.status != 0) {
                                    ark_notify(result);
                                }
                            });
                            notice.remove();
                        });
                        ark_notify({
                            'status': 0, 'msg': '提交操作成功'
                        });
                    }
                }, {
                    text: '取消'
                }]
            },
            buttons: {
                closer: false,
                sticker: false
            },
            history: {
                history: false
            },
            addclass: 'stack-modal',
            stack: {'dir1': 'down', 'dir2': 'left', 'modal': true},
            type: 'notice',
        }));
    });

    //批量重跑
    $('#alltask').click(function () {
        if (!$('.allcheck:checked').length) {
            $('#messageview .modal-body h5').text('没有选中任务');
            $('#messageview').modal('show');
        } else {
            choosevalue = 0;
            $('#modalcheck').unbind('hide.bs.modal');
            $('#modalcheck .modal-body h5').text('确定要批量重跑吗?');
            $('.changevalue').text('确定');
            $('#modalcheck').modal('show');
            $('#modalcheck').on('hide.bs.modal', function () {
                if (choosevalue == 1) {
                    var tasklist = "";
                    var runtimelist = "";
                    var checkboxlist = $('.allcheck:checked');
                    checkboxlist.each(function () {
                        tasklist += $(this).attr('taskid') + ",";
                        runtimelist += $(this).attr('runtime') + ",";
                    });
                    runtimelist = runtimelist.substr(0, runtimelist.length - 1);
                    tasklist = tasklist.substr(0, tasklist.length - 1);
                    $.post('/pipeline/run_some_task/', {
                        tasklist: tasklist,
                        runtimelist: runtimelist
                    }, function (data) {
                        if (data.status != 0) {
                            $('#messageview .modal-body h5').text('批量重跑失败:' + data.msg);
                            $('#messageview').modal('show');
                        } else {
                            new PNotify({
                                title: '通知',
                                text: '批量重跑成功',
                                type: 'success',
                                addclass: 'custom'
                            });
                            setTimeout(function () {
                                refresh_cur_page();
                            }, 1000);

                        }
                    }, 'json');
                }
            });
        }
    });

    //复制剪切板
    //var cli = new ZeroClipboard(parent.document.getElementById("copyBtn"));
    var cli = new ZeroClipboard($("#copyBtn", window.parent.document));
    cli.setText($('#upload_cmd', window.frames[0].document).text());
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

});

function change_arrow(that, tag) {
    var $this = $(that);
    var tag_str = "";
    if (tag == 0) {
        if (g_order_tag == 0) {
            if (g_desc == 1) {
                g_desc = 0;
            } else {
                g_desc = 1;
            }
        } else {
            g_desc = 1;
        }
        g_order_tag = 0;
        tag_str = "执行时间";
        $('#history_plname').val("流程名");
        $('#history_taskname').val("任务名");
        $('#history_status').val("状态");
        $('#history_begin_time').val("开始时间");
    } else if (tag == 1) {
        if (g_order_tag == 1) {
            if (g_desc == 1) {
                g_desc = 0;
            } else {
                g_desc = 1;
            }
        } else {
            g_desc = 1;
        }

        g_order_tag = 1;
        tag_str = "流程名";
        $('#history_runtime').val("执行时间");
        $('#history_taskname').val("任务名");
        $('#history_status').val("状态");
        $('#history_begin_time').val("开始时间");
    } else if (tag == 2) {
        if (g_order_tag == 2) {
            if (g_desc == 1) {
                g_desc = 0;
            } else {
                g_desc = 1;
            }
        } else {
            g_desc = 1;
        }

        g_order_tag = 2;
        tag_str = "任务名";
        $('#history_runtime').val("执行时间");
        $('#history_plname').val("流程名");
        $('#history_status').val("状态");
        $('#history_begin_time').val("开始时间");
    } else if (tag == 3) {
        if (g_order_tag == 3) {
            if (g_desc == 1) {
                g_desc = 0;
            } else {
                g_desc = 1;
            }
        } else {
            g_desc = 1;
        }

        g_order_tag = 3;
        tag_str = "状态";
        $('#history_runtime').val("执行时间");
        $('#history_plname').val("流程名");
        $('#history_taskname').val("任务名");
        $('#history_begin_time').val("开始时间");
    } else if (tag == 4) {
        if (g_order_tag == 4) {
            if (g_desc == 1) {
                g_desc = 0;
            } else {
                g_desc = 1;
            }
        } else {
            g_desc = 1;
        }

        g_order_tag = 4;
        tag_str = "开始时间";
        $('#history_runtime').val("执行时间");
        $('#history_plname').val("流程名");
        $('#history_taskname').val("任务名");
        $('#history_status').val("状态");
    } else if (tag == 5) {
        tag_str = "耗时";
    } else {
        tag_str = "开始时间";
    }
    if (g_desc == 1) {
        $this.val(tag_str + "   ▼");
    } else {
        $this.val(tag_str + "   ▲");
    }
    url = "/pipeline/history_list/" + g_order_tag + "_" + g_desc + "/"
    tableT.ajax.url(url).load();
}

function getlogtext(that) {
    var $this = $(that);
    var hrefurl = $this.attr('href');
    window.open(hrefurl);
}

function hide_wait_window() {
    $('#wait_dialog').modal('hide');
}

//stop_task
function stop_task(that) {
    choosevalue = 0;
    var $this = $(that);
    task_id = $this.attr('taskid');
    run_time = $this.attr('runtime');
    $('#modalcheck').unbind('hide.bs.modal');
    $('#modalcheck .modal-body h5').text('确定要停止运行吗?');
    $('.changevalue').text('确定');
    $('#modalcheck').modal('show');
    $('#modalcheck').on('hide.bs.modal', function () {
        if (choosevalue == 1) {
            $('#wait_dialog').unbind('hide.bs.modal');
            $('#wait_dialog .modal-body h5').text('正在停止任务，请稍候......');
            $('#wait_dialog').modal('show');
            $("#wait_icon").show();
            $.post('/pipeline/stop_task/', {
                task_id: task_id,
                run_time: restore_runtime(run_time)
            }, function (data) {
                if (data.status != 0) {
                    $("#wait_icon").hide();
                    $('#wait_dialog .modal-body h5').text('失败信息:' + data.msg);
                } else if (data.status == 0) {
                    $("#wait_icon").hide();
                    $('#wait_dialog .modal-body h5').text('停止运行成功');
                    setTimeout("hide_wait_window()", 1000);
                    $this.parent().parent().find('td').eq(4).find('button').text('等待中');
                    refresh_cur_page();
                }
            }, 'json');
        }
    });
}

//只看流程中给任务信息传递pl_id
function getplid(that) {
    var $this = $(that);
    pl_id = $this.attr('plid');
    run_time = $this.attr('runtime');


    tabletaskret = $('#tabletask').DataTable({

        "bDestroy": true,
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/pipeline/pipelineTaskList/",
            "type": "POST",
            "data": {
                pl_id: pl_id,
                run_time: restore_runtime(run_time),
                length: 100
            }
        },
        "language": {
            "sLengthMenu": "显示 _MENU_ 条记录",
            "sInfo": "显示第 _START_ 至 _END_ 条记录，共 _TOTAL_ 条",
            "sInfoEmpty": "显示第 0 至 0 条记录，共 0 条",
        },
        columns: [{
            data: "run_time",
            bSortable: false
        }, {
            data: "task_name",
            bSortable: false
        }, {
            data: "status",
            bSortable: false
        }, {
            data: "start_time",
            bSortable: false
        }, {
            data: "use_time",
            bSortable: false
        }, {
            data: "",
            bSortable: false
        }],
        "columnDefs": [
            {
                "targets": [1],
                "render": function (data, type, full) {
                    return "<a href='/pipeline/" + full.pl_id + "'>" + data + "</a>";
                }
            },
            {
                "targets": [2],
                "render": function (data, type, full) {
                    /*            if (data == 0) {
                                  return '<button  tid="'+full.task_id+'" class="hover-p btn btn-primary text-danger center-block " type="button"  data-toggle="tooltip" data-placement="left" >等待中</button>';
                                  } else if(data==1) {
                                  return ' <button  tid="'+full.task_id+'" type="button" class="hover-p btn btn-primary center-block" data-toggle="tooltip" data-placement="left" >正在执行中</button>'
                                  }else if(data==2){
                                  return '<button tid="'+full.task_id+'" type="button"  class="hover-p center-block  btn btn-success" data-toggle="tooltip" data-placement="left">执行成功</button>';

                                  }else if(data==3){
                                  return '<button  tid="'+full.task_id+'" type="button" class="hover-p btn btn-danger center-block" data-toggle="tooltip" data-placement="left">执行失败</button>'
                                  }else if(data==4){
                                  return '<button  tid="'+full.task_id+'" type="button" class="hover-p btn btn-danger center-block" data-toggle="tooltip" data-placement="left">任务超时</button>';
                                  }else if(data==5){
                                  return '<button tid="'+full.task_id+'" type="button" class="hover-p btn btn-info center-block" data-toggle="tooltip" data-placement="left" >等待调度</button>';
                                  }else if(data==6){
                                  return '<button tid="'+full.task_id+'" type="button" class="hover-p btn btn-danger" data-toggle="tooltip" data-placement="left" >任务被用户禁止</button>';
                                  }else if(data==7){
                                  return '<button tid="'+full.task_id+'"type="button" class="hover-p btn btn-danger center-block" data-toggle="tooltip" data-placement="left">条件不满足</button>';
                                  }*/
                    if (data == 0) {
                        return '<h5 style="color:blue" href="/pipeline/gettaskphoto/?pl_id=' + full.pl_id + '&runtime=' + full.run_time + '&taskname=' + full.task_name + '" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick="message(this)"   tid="' + full.task_id + '" class="hover-p text-center" type="button"  data-toggle="tooltip" data-placement="left" >等待中</h5>';
                    } else if (data == 1) {
                        return ' <h5 style="color:#01579b" href="/pipeline/gettaskphoto/?pl_id=' + full.pl_id + '&runtime=' + full.run_time + '&taskname=' + full.task_name + '" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick="message(this)"   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left" >正在执行中</h5>';
                    } else if (data == 2) {
                        return '<h5 style="color:#01579b" href="/pipeline/gettaskphoto/?pl_id=' + full.pl_id + '&runtime=' + full.run_time + '&taskname=' + full.task_name + '" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick="message(this)"   tid="' + full.task_id + '" type="button"  class="hover-p text-center" data-toggle="tooltip" data-placement="left">执行成功</h5>';

                    } else if (data == 3) {
                        return '<h5 style="color:red" href="/pipeline/gettaskphoto/?pl_id=' + full.pl_id + '&runtime=' + full.run_time + '&taskname=' + full.task_name + '" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick="message(this)"   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left">执行失败</h5>';
                    } else if (data == 4) {
                        return '<h5 style="color:red" href="/pipeline/gettaskphoto/?pl_id=' + full.pl_id + '&runtime=' + full.run_time + '&taskname=' + full.task_name + '" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick="message(this)"  tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left">任务超时</h5>';
                    } else if (data == 5) {
                        return '<h5 style="color:red" href="/pipeline/gettaskphoto/?pl_id=' + full.pl_id + '&runtime=' + full.run_time + '&taskname=' + full.task_name + '" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick="message(this)"  tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left" >等待调度</h5>';
                    } else if (data == 6) {
                        return '<h5 style="color:red" href="/pipeline/gettaskphoto/?pl_id=' + full.pl_id + '&runtime=' + full.run_time + '&taskname=' + full.task_name + '" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick="message(this)"   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left" >任务被用户禁止</h5>';
                    } else if (data == 7) {
                        return '<h5 style="color:red" href="javascript:void(0);" taskid="' + full.task_id + '" runtime+"' + full.run_time + '" onclick=""   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left">条件不满足</h5>';
                    } else if (data == 8) {
                        return '<h5 style="color:red" href="javascript:void(0);" taskid="' + full.task_id + '" runtime+"' + full.run_time + '" onclick=""   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left">V100-等待提交</h5>';
                    } else if (data == 9) {
                        return '<h5 style="color:#01579b" href="javascript:void(0);" taskid="' + full.task_id + '" runtime+"' + full.run_time + '" onclick=""   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left">v100-执行中</h5>';
                    } else {
                        return ' <h5 style="color:#01579b" href="javascript:void(0);" taskid="' + full.task_id + '" runtime="' + full.run_time + '" onclick="   tid="' + full.task_id + '" type="button" class="hover-p text-center" data-toggle="tooltip" data-placement="left" >正在执行中</h5>';
                    }


                }
            },
            {
                "targets": [5],
                "render": function (data, type, full) {
                    if (full.status != 2 && full.status != 3 && full.status != 6) {
                        return "<h5 onclick='stoptaskpip(this)' style='color:red;cursor:pointer' type='button' runtime='" + full.run_time + "' class='text-center' taskid='" + full.task_id + "'>停止运行</h5>";
                    } else {
                        return "<h5 onclick='againruntask(this)' style='color:blue;cursor:pointer' type='button'  runtime='" + full.run_time + "' class='text-center' taskid='" + full.task_id + "'>重跑</h5>";
                    }
                }
            }, {
                "targets": [4],
                "render": function (data, type, full) {
                    // var usetime=(parseInt(full.use_time)/3600).toString().substr(0,6)+"h";
                    // return usetime;
                    if (full.use_time <= 60) {
                        return full.use_time + '秒';
                    } else if (full.use_time > 60 && full.use_time < 3600) {
                        var mm = parseInt(full.use_time / 60);
                        var hh = full.use_time - mm * 60;
                        return mm + '分' + hh + '秒';
                    } else if (full.use_time >= 3600) {
                        var h = parseInt(full.use_time / 3600);
                        var lm = full.use_time - h * 3600;
                        var m = parseInt(lm / 60);
                        var sec = lm - m * 60;
                        return h + "小时" + m + "分" + sec + "秒";
                    }

                }
            }
        ]
    });
    $('#tabletask_filter').hide();
    $('#tabletask_info').hide();
    $('#tabletask_paginate').hide();
    $('#tabletask_wrapper label').hide();
}

function message(that) {
    $('#modalcheck').unbind('hide.bs.modal');
    $("#wait_busy_icon").show();
    $('#modalcheck .modal-body h5').text("");
    $('#mcontent').html("正在获计算据，请稍候......");
    $('#modalcheck').modal('show');
    choosevalue = 0;
    var $this = $(that);
    urls = $this.attr('href');
    //   $this.attr('href','#');
    var taskid = $this.attr('taskid');
    var run_time = $this.attr('runtime');
    $.post('/pipeline/get_message/', {
        taskid: taskid,
        run_time: restore_runtime(run_time)
    }, function (data) {
        var message = "";
        if (data.prev == "error") {
            message = "<span>得出等待结果出错<span></br>";
        } else if (data.check == 1) {
            if (data.prev[3]) {
                message = message + "<span>执行失败的任务信息如下:</span></br>";
                if (data.prev[3].length > 5) {
                    for (var i = 0; i < 5; i++) {
                        var manager = data.prev[3][i].manager_list;
                        var list = "";
                        for (var j = 0; j < manager.length; j++) {
                            list += "(" + manager[j][0] + "," + manager[j][1] + ")";
                        }

                        message += "<span>对应流程名:" + data.prev[3][i].pipeline_name + "</span><br>" + "<span>对应任务名:" + data.prev[3][i].task_name + "</span><br>" + "<span>对应执行时间:" + data.prev[3][i].run_time + "</span><br><span>负责人:" + list + "</span></br>";

                    }
                } else {
                    for (var i = 0; i < data.prev[3].length; i++) {

                        var manager = data.prev[3][i].manager_list;
                        var list = "";
                        for (var j = 0; j < manager.length; j++) {
                            list += "(" + manager[j][0] + "," + manager[j][1] + ")";
                        }


                        message += "<span>对应流程名:" + data.prev[3][i].pipeline_name + "</span><br>" + "<span>对应任务名:" + data.prev[3][i].task_name + "</span><br><span>对应执行时间:" + data.prev[3][i].run_time + "</span><br><span>负责人:" + list + "</span></br>";
                    }
                }
            } else if (data.prev[6]) {
                message = message + "<span>任务被用户停止信息如下:<span></br>";
                if (data.prev[6].length > 5) {
                    for (var i = 0; i < 5; i++) {

                        var manager = data.prev[6][i].manager_list;
                        var list = "";
                        for (var j = 0; j < manager.length; j++) {
                            list += "(" + manager[j][0] + "," + manager[j][1] + ")";
                        }


                        message += "<span>对应流程名:" + data.prev[6][i].pipeline_name + "</span><br><span>对应任务名:" + data.prev[6][i].task_name + "</span><br><span>对应执行时间:" + data.prev[6][i].run_time + "</span><br><span>负责人:" + list + "</span></br>";
                    }
                } else {
                    for (var i = 0; i < data.prev[6].length; i++) {

                        var manager = data.prev[6][i].manager_list;
                        var list = "";
                        for (var j = 0; j < manager.length; j++) {
                            list += "(" + manager[j][0] + "," + manager[j][1] + ")";
                        }


                        message += "<span>对应流程名:" + data.prev[6][i].pipeline_name + "</span><br><span>对应任务名:" + data.prev[6][i].task_name + "</span><br><span>对应执行时间:" + data.prev[6][i].run_time + "</span><br><span>负责人:" + list + "</span></br>";
                    }
                }

            } else {
                if (data.prev[0]) {
                    if (data.prev[0].length > 5) {
                        for (var i = 0; i < 5; i++) {
                            var manager = data.prev[0][i].manager_list;
                            var list = "";
                            for (var j = 0; j < manager.length; j++) {
                                list += "(" + manager[j][0] + "," + manager[j][1] + ")";
                            }
                            message += "<span>获取等待中的任务信息如下:</span>" + "</br>";
                            message += "<span>对应流程名:" + data.prev[0][i].pipeline_name + "</span><br><span>对应任务名:" + data.prev[0][i].task_name + "</span><br><span>对应执行间:" + data.prev[0][i].run_time + "</span><br><span>负责人:" + list + "</span><br>";
                        }
                    } else {
                        for (var i = 0; i < data.prev[0].length; i++) {
                            var manager = data.prev[0][i].manager_list;
                            var list = "";
                            for (var j = 0; j < manager.length; j++) {
                                list += "(" + manager[j][0] + "," + manager[j][1] + ")";
                            }

                            message += "<span>获取等待中的任务信息如下:</span><br>";
                            message += "<span>对应流程名:" + data.prev[0][i].pipeline_name + "</span><br><span>对应任务名:" + data.prev[0][i].task_name + "</span><br><span>对应执行时间:" + data.prev[0][i].run_time + "</span><br><span>负责人" + list + "</span><br>";
                        }
                    }
                }
                else if (data.prev[5]) {
                    if (data.prev[5].length > 5) {
                        for (var i = 0; i < 5; i++) {

                            var manager = data.prev[5][i].manager_list;
                            var list = "";
                            for (var j = 0; j < manager.length; j++) {
                                list += "(" + manager[j][0] + "," + manager[j][1] + ")";
                            }

                            message += "<span>获取等待调度的任务信息如下:</span>" + "</br>";
                            message += "<span>对应流程名:" + data.prev[5][i].pipeline_name + "</span><br><span>对应任务名:" + data.prev[5][i].task_name + "</span><br><span>对应执行间:" + data.prev[5][i].run_time + "</span><br><span>负责人:" + list + "</span></br>";
                        }
                    } else {
                        for (var i = 0; i < data.prev[5].length; i++) {

                            var manager = data.prev[5][i].manager_list;
                            var list = "";
                            for (var j = 0; j < manager.length; j++) {
                                list += "(" + manager[j][0] + "," + manager[j][1] + ")";
                            }


                            message += "<span>获取等待调度的任务信息如下:</span>" + "</br>";
                            message += "<span>对应流程名:" + data.prev[5][i].pipeline_name + "</span><br><span>对应任务名:" + data.prev[5][i].task_name + "</span><br><span>对应执行间:" + data.prev[5][i].run_time + "</span><br><span>负责人:" + list + "</span></br>";
                        }

                    }
                } else if (data.prev[1]) {
                    if (data.prev[1].length > 5) {
                        for (var i = 0; i < 5; i++) {

                            var manager = data.prev[1][i].manager_list;
                            var list = "";
                            for (var j = 0; j < manager.length; j++) {
                                list += "(" + manager[j][0] + "," + manager[j][1] + ")";
                            }


                            message += "<span>获取正在执行的任务信息如下:</span>" + "</br>";
                            message += "<span>对应流程名:" + data.prev[1][i].pipeline_name + "</span><br><span>对应任务名:" + data.prev[1][i].task_name + "</span><br><span>对应执行间:" + data.prev[1][i].run_time + "</span><br><span>负责人:" + list + "</span></br>";
                        }
                    } else {
                        for (var i = 0; i < data.prev[1].length; i++) {

                            var manager = data.prev[1][i].manager_list;
                            var list = "";
                            for (var j = 0; j < manager.length; j++) {
                                list += "(" + manager[j][0] + "," + manager[j][1] + ")";
                            }


                            message += "<span>获取正在执行的任务信息如下:</span>" + "</br>";
                            message += "<span>对应流程名:" + data.prev[1][i].pipeline_name + "</span><br><span>对应任务名:" + data.prev[1][i].task_name + "</span><br><span>对应执行间:" + data.prev[1][i].run_time + "</span><br><span>负责人:" + list + "</span></br>";
                        }

                    }


                }
            }
            // $this.attr('title',message);
        } else if (data.check == 0) {
            // $this.attr('title',data.infomessage);
            message = message + data.infomessage;
        }

        /* if(confirm(message)){
           window.location.href=urls;
           }*/

        $('#modalcheck .modal-body h5').text("");
        $('#mcontent').html(message);
        $("#wait_busy_icon").hide();
        $('.changevalue').text('查看');

        $('#modalcheck').on('hide.bs.modal', function () {
            $('#mcontent').html("");
            if (choosevalue == 1) {
                //      window.location.href=urls;
                window.open(urls);
            }
        });
        /* that.onmouseout=function(){
           $this.attr('title','');
           alert(urls);
           if(confirm('是否需要查看流程下任务依赖关系')){
           window.location.href=urls;
           }else{
           that.onmouseout=null;
           }
           
           }*/
    }, 'json');
}

function stoptaskpip(that) {
    choosevalue = 0;
    var $this = $(that);
    task_id = $this.attr('taskid');
    run_time = $this.attr('runtime');
    $('#modalcheck').unbind('hide.bs.modal');
    $('#modalcheck .modal-body h5').text('确定要停止运行吗?');
    $('.changevalue').text('确定');
    $('#modalcheck').modal('show');
    $('#modalcheck').on('hide.bs.modal', function () {
        if (choosevalue == 1) {
            $.post('/pipeline/stop_task/', {
                task_id: task_id,
                run_time: restore_runtime(run_time)
            }, function (data) {
                if (data.status != 0) {
                    $('#messageview .modal-body h5').text('失败信息:' + data.msg);
                    $('#messageview').modal('show');
                } else if (data.status == 0) {
                    //  $('#messageview .modal-body h5').text('停止运行成功');
                    // $('#messageview').modal('show');
                    //  $this.parent().parent().find('td').eq(2).find('h5').text('等待中');
                    new PNotify({
                        title: '通知',
                        text: '停止运行成功,请刷新',
                        type: 'success',
                        addclass: 'custom'
                    });
                }
            }, 'json');
        }
    });

}

function confirm_op(msg, callback, arg, arg1) {
    $('#modalcheck').unbind('hide.bs.modal');
    $('#modalcheck .modal-body h5').text(msg);
    $('.changevalue').text('确定');
    $('#modalcheck').modal('show');

    $('#modalcheck').on('hide.bs.modal', function () {
        if (choosevalue == 1) {
            callback(arg, arg1);
        }
    })
}

function set_success(task_id, run_time) {
    console.log('setting success, task_id=' + task_id);
    result = makeAPost(
        '/pipeline/history/set_task_success/',
        {'task_id': task_id, 'run_time': run_time});
    ark_notify(result);
    if (result.status == 0) {
        refresh_cur_page();

    }
}

function newrun(that) {
    choosevalue = 0;
    var $this = $(that);
    var id = $this.find('option:selected').attr('id');
    console.log($this);
    var thisindex;
    var run_time = $this.parent().parent().find('td').eq(1).text();
    if (id == "option4") {
        var task_id = $this.find('option:selected').val();
        confirm_op('确定设置状态为成功吗？', set_success, task_id, restore_runtime(run_time));
    } else if (id == "option1") {
        $('#modalcheck').unbind('hide.bs.modal');
        $('#modalcheck .modal-body h5').text('确定要完全重跑吗?');
        $('.changevalue').text('确定');
        $('#modalcheck').modal('show');
        $('#modalcheck').on('hide.bs.modal', function () {
            if (choosevalue == 1) {
                var pl_id = parseInt($this.find('option:selected').val());
                $.post('/pipeline/run_one_pipeline/', {
                    pl_id_list: pl_id,
                    run_time: restore_runtime(run_time)
                }, function (data) {
                    if (data.status == 1) {
                        $('#messageview .modal-body h5').text("完全重跑失败:" + data.msg);
                        $('#messageview').modal('show');
                    } else {
                        //   $('#messageview .modal-body h5').text("完全重跑成功");
                        // $('#messageview').modal('show');
                        new PNotify({
                            title: '通知',
                            text: '完全重跑成功',
                            type: 'success',
                            addclass: 'custom'
                        });

                        refresh_cur_page();

                    }
                }, 'json');

            }
        });
    } else if (id == "option2") {
        $('#modalcheck').unbind('hide.bs.modal');
        $('#modalcheck .modal-body h5').text('确定要单跑task吗?');
        $('.changevalue').text('确定');
        $('#modalcheck').modal('show');
        $('#modalcheck').on('hide.bs.modal', function () {
            if (choosevalue == 1) {
                var task_id = $this.find('option:selected').val();
                $.post('/pipeline/run_one_task/', {
                    task_id_list: task_id,
                    run_time: restore_runtime(run_time)
                }, function (data) {
                    if (data.status == 1) {
                        $('#messageview .modal-body h5').text('单跑task失败:' + data.msg);
                        $('#messageview').modal('show');
                    } else {
                        //   $('#messageview .modal-body h5').text('单跑task成功');
                        // $('#messageview').modal('show');
                        new PNotify({
                            title: '通知',
                            text: '单跑任务成功',
                            type: 'success',
                            addclass: 'custom'
                        });
                        refresh_cur_page();

                    }
                }, 'json');

            }
        });
    } else if (id == "option3") {
        $('#modalcheck').unbind('hide.bs.modal');
        $('#modalcheck .modal-body h5').text('确定要单跑task和后续吗?');
        $('.changevalue').text('确定');
        $('#modalcheck').modal('show');
        $('#modalcheck').on('hide.bs.modal', function () {
            if (choosevalue == 1) {
                var task_id = $this.find('option:selected').val();
                $.post('/pipeline/run_task_with_all_successors/', {
                    task_id_list: task_id,
                    run_time: restore_runtime(run_time)
                }, function (data) {
                    if (data.status == 1) {
                        $('#messageview .modal-body h5').text('重跑任务和后续失败:' + data.msg);
                        $('#messageview').modal('show');
                    } else {
                        // $('#messageview .modal-body h5').text('重跑任务和后续成功');
                        // $('#messageview').modal('show');
                        new PNotify({
                            title: '通知',
                            text: '重跑任务和后续成功',
                            type: 'success',
                            addclass: 'custom'
                        });
                        refresh_cur_page();

                    }
                }, 'json');
            }
        });
    }
}

function showrun(that) {
    $('#modalcheck').unbind('hide.bs.modal');
    choosevalue = 0;
    var $this = $(that);
    var pl_id = $this.attr('pl');

    var run_time = $this.parent().parent().find('td').eq(0).text();
    $('#modalcheck .modal-body h5').text('确定要完全重跑吗?');
    $('.changevalue').text('确定');
    $('#modalcheck').modal('show');
    $('#modalcheck').on('hide.bs.modal', function () {
        if (choosevalue == 1) {
            $.post('/pipeline/run_one_pipeline/', {
                pl_id_list: pl_id,
                run_time: restore_runtime(run_time)
            }, function (data) {
                if (data.status == 1) {
                    $('#messageview .modal-body h5').text('完全重跑失败:' + data.msg);
                    $('#messageview').modal('show');
                } else {
                    new PNotify({
                        title: '通知',
                        text: '完全重跑成功',
                        type: 'success',
                        addclass: 'custom'
                    });
                    setTimeout(function () {
                        window.location.reload();
                    }, 2000);
                }
            }, 'json');
        }
    });


}

//任务重跑
function againruntask(that) {
    choosevalue = 0;
    var $this = $(that);
    var run_time = $this.attr('runtime');
    var task_id = $this.attr('taskid');
    $('#modalcheck .modal-body h5').text('确定要重跑任务吗?');
    $('.changevalue').text('确定');
    $('#modalcheck').modal('show');
    $('#modalcheck').unbind('hide.bs.modal');
    $('#modalcheck').on('hide.bs.modal', function () {
        if (choosevalue == 1) {
            $.post('/pipeline/run_one_task/', {
                task_id_list: task_id,
                run_time: restore_runtime(run_time)
            }, function (data) {
                if (data.status == 1) {
                    $('#messageview .modal-body h5').text('重跑任务失败:' + data.msg);
                    $('#messageview').modal('show');
                } else {

                    // $this.parent().parent().find('td').eq(2).find('h5').text('等待中');
                    //    $('#messageview .modal-body h5').text('重跑成功');
                    // $('#messageview').modal('show');
                    new PNotify({
                        title: '通知',
                        text: '重跑成功,请重新刷新页面',
                        type: 'success',
                        addclass: 'custom'
                    });
                }
            }, 'json');
        }
    });
}

function show_update_modal(url) {
    $("#modal_iframe iframe").attr('src', url);
    $("#modal_iframe h4").html("修改任务");
    $("#modal_iframe").show();
    $("#modal_iframe").modal('show');
}
