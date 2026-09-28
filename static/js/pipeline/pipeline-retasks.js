

//删除连接标记tag
var detach_tag = 0;
var task_list;
//获取该流程的所有任务
function get_tasks(){
    var pipe_id = $("#pipe_id").val();
    var run_time = $('#runtime').val();
    $.post('/pipeline/get_graph/',{
        pipe_id:pipe_id,
        run_time:run_time
    },function(data){
            if(data.status){
                alert(data.msg);
            }else{
                task_list = data.res;
                console.log(task_list);
                jsPlumb.bind("ready", function () {
                    document.onselectstart = function () { return false; };
                    PipelineTasks.init();
                    AutoLayout.init();
                    AutoLayout.run();
                    PipelineTask.init();
                });
                $('.window').each(function(){
                    $(this).on('click',function(){
                        var pipelinemessage="<span>PipelineName:"+$(this).attr('plname')+"</span></br>";
                        var runtimemessage="<span>RunTime:"+$(this).attr('runtime')+"</span></br>";
                        var peoplemessage=$(this).attr('message');
                        $('#messageview .modal-body').html(pipelinemessage+runtimemessage+peoplemessage);
                        $('#messageview').modal('show');
                    });
                    $(this).css({
                    'margin-left':'60px',
                    'height':'60px',
                    'background-color':'linen'
                    }).find('span').eq(0).css({'font-family':'微软雅黑','padding-left':'3px'});
                  //  $(this).append('<div style="height:56px;width:15px;background-color:darkcyan;position:absolute;left:0;top:0;border-radius:6px 0 0 6px"></div>');
                    var taskname=$('#taskname').val();
                    var windowtask=$(this).find('span').text();
                    if(taskname.trim()==windowtask.trim()){
                        $(this).find('span').css({
                            'color':'orange'
                            
                        });
                        $(this).css({
                            'background-color':'mintcream'
                        });
                    }
                    
                 /*   $(this).find('span').css({
                        'display':'block',
                        'width':'90',
                        'height':'15'
                    });*/
                    var failed=$(this).attr('failed');
                    if(failed==0){
                         $(this).css({
                          // "backgroundColor":'rgb(253,245,230)'
                        }).append('<br><span style="font-family:\'微软雅黑\'">等待中</span>');
                       $(this).append('<div style="height:58px;width:15px;background-color:#BC8F8F;position:absolute;left:0;top:0;border-radius:6px 0 0 6px"></div>');
                    }else if(failed==1){
                         $(this).css({
                         //  "backgroundColor":'rgb(255,228,196)'
                        }).append('<br><span style="font-family:\'微软雅黑\'">执行中</span>');
                     $(this).append('<div style="height:58px;width:15px;background-color:#BC8F8F;position:absolute;left:0;top:0;border-radius:6px 0 0 6px"></div>');
                    }else if(failed==2){
                         $(this).css({
                           'border':'2px solid green'
                        }).append('<br><span style="font-family:\'微软雅黑\'">成功</span>');
                       $(this).append('<div style="height:56px;width:15px;background-color:darkcyan;position:absolute;left:0;top:0;border-radius:6px 0 0 6px"></div>');
                    }else if(failed==3){
                        $(this).css({
                           'border':'2px solid red'
                        }).append('<br><span style="font-family:\'微软雅黑\'">失败</span>');
                     $(this).append('<div style="height:56px;width:15px;background-color:red;position:absolute;left:0;top:0;border-radius:6px 0 0 6px"></div>');
                    }else if(failed==4){
                         $(this).css({
                          // "backgroundColor":'rgb(255,231,186)'
                        }).append('<br><span style="font-family:\'微软雅黑\'">超时</span>');
                     $(this).append('<div style="height:58px;width:15px;background-color:#BC8F8F;position:absolute;left:0;top:0;border-radius:6px 0 0 6px"></div>');
                    }else if(failed==5){
                         $(this).css({
                          // "backgroundColor":'rgb(255,193,193)'
                        }).append('<br><span style="font-family:\'微软雅黑\'">等待调度</span>');
                     $(this).append('<div style="height:58px;width:15px;background-color:#BC8F8F;position:absolute;left:0;top:0;border-radius:6px 0 0 6px"></div>');
                    }else if(failed==6){
                         $(this).css({
                            'border':'2px solid red'
                        }).append('<br><span style="font-family:\'微软雅黑\'">被停止</span>');
                       $(this).append('<div style="height:56px;width:15px;background-color:red;position:absolute;left:0;top:0;border-radius:6px 0 0 6px"></div>');
                    }else if(failed==7){
                         $(this).css({
                          // "backgroundColo":'#ff3333'
                             'border':'2px solid red'
                        }).append('<br><span style="font-family:\'微软雅黑\'">条件不满足</span>');
                     $(this).append('<div style="height:56px;width:15px;background-color:red;position:absolute;left:0;top:0;border-radius:6px 0 0 6px"></div>');
                    }
                   /* $(this).hover(function(){
                    if(failed==0){
                        $(this).attr('title','等待中');
                    }else if(failed==1){
                        $(this).attr('title','正在执行');
                    }else if(failed==2){
                        $(this).attr('title','执行成功');
                    }else if(failed==3){
                         $(this).attr('title','执行失败');
                   }else if(failed==4){
                        $(this).attr('title','任务超时');
                    }else if(failed==5){
                        $(this).attr('title','等待调度');
                    }else if(failed==6){
                        $(this).attr('title','任务被用户停止');
                    }else if(failed==7){
                         $(this).attr('title','条件不满足');
                    }
                },function(){
                    $(this).attr('title','');
                });*/
                $(this).find('span').eq(1).css({'color':'#00CED1'});
                $('._jsPlumb_overlay').hide();
                });
            }   
         },'json');
}

;(function() {
      
    $('#returnbtn').click(function(){
        window.history.back();

    }).hover(function(){
        $(this).css('opacity',1);
    },function(){
        $(this).css('opacity',0.5);
    });
    get_tasks();
    var pipe_id = $("#pipe_id").val();

    var DIV_ID_CONTAINER = 'pipeline-tasks';
    var TAG_PREFIX = 'w';
    var LAYOUT_ENGINE = 'dot';
    var LAYOUT_ENGINE_SRC = LAYOUT_ENGINE + '-src';
    var formType = 'add';
        //构建task图
    window.AutoLayout = {
        init : function() {
            var tasks = task_list;
            var layoutString = "digraph chargraph {node[shape=box, margin=0, width=2, height=1];";
            for(var i = 0; i < tasks.length; i++) {                
                var next_tags = tasks[i].next_task_ids;
                if(null != next_tags && undefined != typeof(next_tags)) {
                    var tag_from = TAG_PREFIX + tasks[i].id;
                    next_tags = next_tags.split(',');
                    for(var j = 0; j < next_tags.length; j++) {
                        if(next_tags[j]) {
                            var tag_to = TAG_PREFIX + next_tags[j];
                            layoutString += " " + tag_from + " -> " + tag_to;
                        }
                    }
                }
            }
            layoutString += "}";
            console.log(layoutString);
            $("#" + LAYOUT_ENGINE_SRC).html(layoutString);
        },
        run : function() {
            w_launch();
        }
    };



    //task 增删改查
    window.PipelineTask = {
        init : function() {
            PipelineTask.initModal();
          /*  PipelineTask.initWindow();*/
            PipelineTask.initOp();
        },
        initWindow: function() {
            //双击修改task
            $(".window").on('dblclick', function(e) {
                //formType = 'update';    
                location.href = "/pipeline/update_task/"+ $(e.target).attr('taskId')+"/";

                /*
                $.post("/pipeline/update_task/"+ $(e.target).attr('taskId')+"/", function(result){
                    console.log(result);
                },"json");*/

                /*
                $.ajaxSetup({async : false}); 
                $("#modal-task-form").modal({
                    remote : "/pipeline/update_task/" + $(e.target).attr('taskId'),
                    keyboard: false,
                    backdrop: 'static'
                });*/
            });
        },
        initOp: function() {
            //add task
            $('#add-task').on('click', function(e){
                formType = 'create';
                $.ajaxSetup({async : false});  
                $("#modal-task-form").modal({
                    remote : "/pipeline/create_task/" +pipe_id+"/",
                    keyboard: false,
                    backdrop: 'static'
                });
                Task.autoFillTpl("modal-task-form");
            });
            $('#auto-layout').on('click', function(e){
                e.preventDefault();
                w_launch();
            });
        },
        initModal: function() {
            $('body').on('hidden', '.modal', function () {
                $(this).removeData('modal');
            });
            $("#task-form-submit").on('click', function(e){
                e.preventDefault();
                if(!$('#Task_name').val()) {
                    alert('名称不能为空');
                }else {
                    combineParams();
                    $('#task-form').ajaxSubmit({
                        dataType:'json',
                        type:'POST',
                        beforeSend:function(){
                            if(($("[name='Processor[type]']:checked").val()==2) && !$("[name='Processor[config]']").val()) {
                                alert("sql语句不能为空");
                                return false;
                            }else {
                                return true;
                            }
                        },
                        success:function(result){
                            if(result.status != 0)
                                alert(result.msg);
                            else {
                                var task = result.data;
                                if('create' == formType)
                                    PipelineTasks.addTask(task);
                                else if('update' == formType)
                                    PipelineTasks.update_task(task);
                                $("#modal-task-form").modal('hide');
                            }
                        },
                        error:function(){alert('请求异常')}
                    });

                }
            });
        },
    };

    //操作，删除、连接、断连接
    window.PipelineTasks = {
        makeWindows : function() {

            var windows = jsPlumb.getSelector(".window");
            jsPlumb.makeSource(windows, {
                filter:".ep",               // only supported by jquery
               /* anchor:"Continuous",*/
                connector:[ "StateMachine", { curviness:20 } ],
                connectorStyle:{ strokeStyle:"#5c96bc", lineWidth:2, outlineColor:"transparent", outlineWidth:4 },
            });                     

            // initialise all '.window' elements as connection targets.
            jsPlumb.makeTarget(windows, {
                dropOptions:{ hoverClass:"dragHover", },
                beforeDrop:function(params) { 
                    var conn1 = jsPlumb.select({source:params.sourceId, target:params.targetId});
                    var conn2 = jsPlumb.select({source:params.targetId, target:params.sourceId});
                    return 0 == (conn1.length + conn2.length);
                },
                anchor:"Continuous"             
            });
            
            jsPlumb.draggable(windows);
        },

        init : function() { 
            
            var tasks = task_list;
            jsPlumb.importDefaults({
                Endpoint : ["Dot", {radius:2}],
                HoverPaintStyle : {strokeStyle:"#216477", lineWidth:4,outlineWidth:2,outlineColor:"white" },
                ConnectionOverlays:[
                    [ "Arrow", { 
                        location:1
                    } ],
                    ["Label", {
                        label: "X",
                        location: 0.5
                    }]
                ],
                DragOptions : { cursor: "pointer", zIndex:2000, containment:"#pipeline-tasks" }
            });

            for(var i = 0; i < tasks.length; i++) {
                var taskid=tasks[i].id;
                var status=tasks[i].status;
                var plname=tasks[i].pl_name;
                var runtime=tasks[i].run_time;
                var taskname=tasks[i].task_name;
                var tag = TAG_PREFIX + tasks[i].id;
                var pos = 100 * i;
                var message="";
                var people=tasks[i].manager_list;
                for(var j=0;j<people.length;j++){
                    var onepeople=people[j];
                    message+='<span>负责人信息:'+onepeople[0]+","+onepeople[1]+"</span><br>";
                }
                $("#" + DIV_ID_CONTAINER).append("<div id='" + tag + "' taskId='"+taskid +"' class='window' failed='"+status+"' type='button' plname='"+plname+"' runtime='"+runtime+"' message='"+message+"'  data-toggle='tooltip' data-placement='bottom' title=''><span> " + taskname+ "</span></div>"); 
                
          
                var elm = document.getElementById(tag);
                elm.style.left = pos + "px";
            }

            //点击连线，删除连接
           /* jsPlumb.bind("click", function(c) { 
                jsPlumb.detach(c,{
                        fireEvent:true,
                        forceDetach: false
                    }); 
            });*/

            //连接前询问
            jsPlumb.bind("beforeDetach", function(conn) {
                //return confirm("删除连接？");
            });

            //连接task
            jsPlumb.doWhileSuspended(function() {
                PipelineTasks.makeWindows();
                for(var i = 0; i < tasks.length; i++) {
                    tag = TAG_PREFIX + tasks[i].id;
                    next_tags = tasks[i].next_task_ids.split(',');
                    for(var j = 0; j < next_tags.length; j++)
                        if(next_tags[j]) {
                            next_tag = TAG_PREFIX + next_tags[j];
                            if($("#" + next_tag).length > 0)
                                jsPlumb.connect({
                                    source:tag,
                                    target:next_tag
                                });
                            else
                                console.log('task不存在 from=' + tasks[i].id + ' to=' + next_tags[j]);
                        }
                } 

                //添加连接
                jsPlumb.bind("connection", function(info, originalEvent) {
                    var fromId = info.source.attr('taskId');
                    var toId = info.target.attr('taskId');
                    $.post("/pipeline/link_task/", { Link: {from: fromId, to: toId} }, function(result){
                        if(result.status){
                            detach_tag = 1;
                            alert('连接失败！');
                            jsPlumb.detach(info,{
                                    fireEvent:false,
                                    forceDetach: true
                                }); 

                            //jsPlumb.detach(info,{fireEvent:false,forceDetach: false});
                        }
                        else{
                            console.log(result);
                        }
                    },"json");
                });

                //删除连接
             /*   jsPlumb.bind("connectionDetached", function(info, originalEvent) {
                    var fromId = info.source.attr('taskId');
                    var toId = info.target.attr('taskId');
                    if(detach_tag == 0){
                        $.post("/pipeline/unlink_task/", { Link: {from: fromId, to: toId} }, function(result){
                            if(result.status){
                                alert('删除连接失败！');
                            }
                            else{
                                console.log(result);
                            }
                        },"json");
                    }
                });*/
            });
        },

        //删除任务
        deleteTask : function(taskId) {
            $.post("/pipeline/deleteTask/"+pipe_id+"/", { Task: {id: taskId} }, function(result){
                if(0 == result.status) {
                    var $window = $("#" + TAG_PREFIX + taskId);
                    jsPlumb.detachAllConnections($window,{fireEvent:false});
                    $window.remove();
                } else {
                    alert(result.msg);
                }
            },"json");
        },

        //添加任务
        addTask : function(task) {
            console.log('addTask');
            $("#" + DIV_ID_CONTAINER).append("<div id='" + TAG_PREFIX + task.id + "' taskId=" + task.id + " class='window'>" + task.name + "<div class='ep'></div></div>");
            var elem = document.getElementById(TAG_PREFIX + task.id);
            elem.style.top = "100px";
            PipelineTasks.makeWindows();
            PipelineTask.initWindow();
        },

        //修改任务
        update_task : function(task) {
            console.log('update_task');
            $("#" + DIV_ID_CONTAINER + " #" + TAG_PREFIX + task.id).html(task.name + "<div class='ep'></div>");
        }
    };

    //jsPlumb初始化


    var $contextMenu = $("#contextMenu");
    var $taskSelected;

    $("body").on("contextmenu", ".window", function (e) {
        $taskSelected = $(this);
        $contextMenu.css({
            display: "block",
            left: e.pageX,
            top: e.pageY
        });
        return false;
    });
    $contextMenu.on("click", "a", function (e) {
        e.preventDefault();
        $contextMenu.hide();
        if ('delete-task' == $(this).attr("op") && confirm("删除该task?")) {
            var taskId = $taskSelected.attr('taskId');
            PipelineTasks.deleteTask(taskId);
        }

        if ('copy-task' == $(this).attr("op")) {
            var taskId = $taskSelected.attr('taskId');
            alert(taskId);
            // PipelineTasks.copyTask(taskId);
        }

    });

    $(document).click(function () {
        $contextMenu.hide();
    });


})();
