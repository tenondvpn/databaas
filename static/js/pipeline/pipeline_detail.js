//构建图表区[{'runtime':201507070000,'use_time':2640},{...}]
function query_data_chart(run_history,cpu_history,mem_history){
    //构建x轴和数据
    category = []
    run_history_data = []
    cpu_history_data = []
    mem_history_data = []
    for(var i = 0;i<run_history.length;i++){
        category.push(run_history[i].runtime);
        run_history_data.push(run_history[i].use_time);
    }
    for(var i = 0;i<cpu_history.length;i++){
        cpu_history_data.push(cpu_history[i].cpu);
    }
    for(var i = 0;i<mem_history.length;i++){
        mem_history_data.push(mem_history[i].mem);
    }
    

    $('#flot_chart').highcharts({
        title: {
            text: '流程运行统计',
            x: -20 //center
        },
        xAxis: {
            categories:category
        },
        yAxis: [{
            labels: {
                format: '{value}s'
            },
            title: {
                text: '运行时间(s)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },{
            title: {
                text: 'cpu/内存'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }],
            opposite: true
        }],
        tooltip: {
            shared: true
            //valueSuffix: '°C'
            //valueSuffix:'s'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0        
        },
        /*
        series: [{
            name: 'Tokyo',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        },{
            name: 'New York',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
        },{
            name: 'Berlin',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
        },{
            name: 'London',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
        */
        series:[{
            name:'运行时间',
            type: 'spline',
            data:run_history_data,
            tooltip: {
                valueSuffix: ' s'
            }
        },{
            name:'cpu/内存',
            color: '#4572A7',
            type: 'spline',
            yAxis: 1,
            data:cpu_history_data
        }]
    });
}

function pn_notice(pl_id) {                
    window.open('/pipeline/'+pl_id+'/');
    location.href = '/pipeline/'+pl_id+'/';
}
//申请ajax
function apply_copy_pipeline() {
    var pl_id = $("#pipe_id").val();
    var pl_name = $("#copy_pl_name").val()

    var project_id = $('#copy_pl_select option:selected').val();
    var url = "/pipeline/copy_pipeline/";
    text = '复制流程成功！';
    $.ajax({
        type:'post',
        url:url,
        data:{'pl_id':pl_id,'pl_name':pl_name, 'project_id': project_id},
        success:function(result){
            if(result.status){
                alert("复制流程失败！原因:" + result.msg);
            }
            else{
                new PNotify({
                    title: '通知消息',
                    text: '创建成功，即将为你跳转到新流程......',
                    addclass: 'custom',
                    type: 'success'
                });
                setTimeout("pn_notice(" + result.pl_id + ")", 1500);
            }
        }
    });
}

function copy_pipeline(pipe_id, pipe_name) {
    $("#copy_pipeline_div").modal({
        backdrop:false,
        show:true,        
    });
}

//历史表格
/*
function hist_table(list){
    var content = "";
    for(var i=0;i<list.length;i++){
        content += "<tr><td>" + (i+1) + "</td><td>" + 
            list[i].upload_user_name;
        content += "</td><td>" + list[i].upload_time;
        content += "</td><td>" + status_convert(list[i].status);
        content += "</td><td><a id='refresh_"+i+
            "' href='javascript:void(0)'"+
            " onclick='reback("+list[i].id+")'>回滚</a>"+
            "<img id='busy_"+i+"' src='/static/images/busy.gif' "+
            " style='display:none'></td></tr>";
    }
    return content;
}
*/


//查询历史详情
function showFlot(id,type){
    $("#hist_busy_icon").show();
    $("#check_hist").attr('disabled',"true");

    var timeStart = $("[name=time-start]").val();
    var timeEnd = $("[name=time-end]").val();
    $("#flot_chart").empty();
    $("#view_hist_list").empty();
    var url = "/pipeline/viewHistory/" + id + "/";
    $.ajax({
        type :'post',
        url : url,
        data: { 'timeStart': timeStart,'timeEnd':timeEnd },
        success : function(result){
            if(result.status){
                alert(result.msg);
            }else{
                //展示图表区
                run_history = result.run_history;
                cpu_history = result.cpu_history;
                mem_history = result.mem_history;
                if(run_history.length == 0 && cpu_history.length == 0 && mem_history.length == 0){
                    if(type == 1){
                        alert('此段时间内，该流程无运行统计。');
                    }
                }
                else{
                    query_data_chart(run_history,cpu_history,mem_history);
                }
            }
            $("#hist_busy_icon").hide();
            $("#check_hist").removeAttr('disabled');
        }
    });
}


//时间初始化
function curent_time(time_tag,frequency){
    var now = new Date();
    if(time_tag == 'start'){
        if(frequency =='day'){
            //若是天级数据，往前推14天
            now.setDate(now.getDate()-7)
        }
        else if(frequency =='hour'){
            //若是小时级数据，往前推2天
            now.setDate(now.getDate()-1)
        }
    }
    var year = now.getFullYear();//年
    var month = now.getMonth() + 1;//月
    var day = now.getDate();//日
    var hh = now.getHours();//时
    var mm = now.getMinutes();//时

    var clock = year + "";
    if(month < 10)
        clock += "0";
    clock += month;
    if(day < 10)
        clock += "0";
    clock += day;
    if(hh < 10)
        clock += "0";
    clock += hh;
    if(mm < 10)
        clock += "0";
    clock += mm;
    return(clock);
}


var choose_value = 0;
function ok_value(){
    choose_value = 1;
}

//申请权限
function reject_pipe_online(id){
    desc = '<div style="width:430px;">&nbsp;<font color="red">*</font>'+
            '拒绝上线原因:</div><br/>' + 
            '<div style="width:430px;"><textarea rows="4"'+
            ' cols="65" id="propose_reason"' +
            'style="width:400px;" placeholder="'+
            '请说明拒绝上线的原因，如调度时间错误等信息将会邮件给用户！">'+
            '</textarea></div>';

    var d = dialog({
        title : '申请权限拒绝上线',
        content : desc,
        okValue: '确定',
        ok: function () {
            var reason = $("#propose_reason").val();
            if(reason==''){
                alert('请输入拒绝流程上线原因!'); 
                return false;
            }
            apply_reject_pipe_online(id, reason);
        },
        cancelValue: '取消',
        cancel: true
    });
    d.showModal();
}

//申请ajax
function apply_reject_pipe_online(id, reason) {
    var url = "/pipeline/on_line/";
    text = '下线成功！';
    $.ajax({
        type:'post',
        url:url,
        data:{'pipe_id':id,'on_line':0,'reason':reason},
        success:function(result){
            if(result.status){
                alert(result.msg);
            }
            else{
                new PNotify({
                    title: '拒绝流程上线通知！',
                    text: text,
                    addclass: 'custom',
                    type: 'success'
                });
                change_status_str(id, 0, 1);
            }
        }
    });
}

function changeStatus(pipe_id,on_line,is_super){
    choosevalue = 0;
    var url = "/pipeline/on_line/";
    if(on_line){
        confirm_str = "确定要上线该流程吗?";
        if(is_super == 1){
            text = '上线成功！';
        }
        else{
            text = '申请上线成功！';
        }
    }
    else{
        confirm_str = "确定要下线该流程吗?";
        text = '下线成功！';
        if (is_super == 1) {
            reject_pipe_online(pipe_id);
            return;
        }
    }


    $('#online_modal').unbind('hide.bs.modal');
    $("#modal_content").html(confirm_str);
    $("#online_modal").modal('show');
    //添加modal事件
    $("#online_modal").on('hide.bs.modal',function(e){
        if(choose_value == 1){
            $.ajax({
                type:'post',
                url:url,
                data:{'pipe_id':pipe_id,'on_line':on_line},
                success:function(result){
                    if(result.status){
                        alert(result.msg);
                    }
                    else{
                        alert(text);
                        location.reload();
                    }
                }
            });
        }
    })
}


$(function(){
    //tab show事件
    $('a[class="history_tab"]').on('shown.bs.tab', function (e) {
        //$("#check_hist").click();
        showFlot($("#pipe_id").val(),0);
    })


    var pipe_desc = $.trim($("#pipe_desc").html());
    if(pipe_desc == ''){
        $("#pipe_desc").hide();
    }
    else{
        $("#pipe_desc").attr("disabled","disabled");
    }

    //时间控件
    var startDateTextBox = $('#start_time');
    var endDateTextBox = $('#end_time');

    startDateTextBox.datetimepicker({ 
        format:'YmdHi',
        onShow:function( ct ){
            console.log('end:' + endDateTextBox.val());
            this.setOptions({
                maxDate:endDateTextBox.val() ? endDateTextBox.val() : false
            })
        },
    });

    endDateTextBox.datetimepicker({ 
        format:'YmdHi',
        onShow:function( ct ){
            console.log('start:' + startDateTextBox.val());
            this.setOptions({
                //minDate:startDateTextBox.val() ? startDateTextBox.val() : false
                maxDate:endDateTextBox.val() ? endDateTextBox.val() : false
            })
        },
    });
    

    //timepicker时间初始化
    var start_time = curent_time('start','day');
    var current_time = curent_time();

    $("[name=time-start]").val(start_time);
    $("[name=time-end]").val(current_time);

    var url = "/pipeline/get_project/";
    $.ajax({
        type:'post' ,
        url:url,
        dataType:'json',
        data:{"tag":0},
        success:function(result){
            project_list = result.project_list;
            var obj = document.getElementById('copy_pl_select');
            for(var i=obj.options.length-1;i>=0;i--) {
                obj.options.remove(i);
            }
            var select_option = document.createElement("OPTION");
            obj.options.add(select_option);
            select_option.innerText = '我的默认项目';
            select_option.value = 0;

            for(var i = 0; i < project_list.length; i++) {
                if (project_list[i].is_default == 1) {
                    continue;
                }
                name = project_list[i].name;
                id = project_list[i].id;
                var select_option = document.createElement("OPTION");
                obj.options.add(select_option);
                select_option.innerText = name;
                select_option.value = id;
            }
        }
    });

});




