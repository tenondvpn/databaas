$(function() {
    var index_of_content = 1;
    var index_of_type = 2;
    var index_of_read = 3;
    var message_table = null;
    var type_choices = "";


    window.Message = {
        setRead: function(id) {
            var url = "/common/read/";
            result = makeAPost(url, {'id': id});
            if(result.status == 0) {
                $("#set_read_"+id).hide();
                $("#status_"+id).html("已读");
                $("#content_"+id).attr("is_read",1);
            }
        },

        read: function(obj) {
            var id = obj.find("input[type=checkbox]").attr('value');
            var url = "/common/message_content/" + id + "/";
            var is_read = obj.find("#content_"+id).attr("is_read");
            result = makeAPost(url, {});
            PNotify.removeAll();
            if(result.status == 0) {
                new PNotify({
                    title: '消息内容',
                    text: result.content,
                    type: 'notice',
                    addclass: 'custom-content',
                    height: '100px',
                    width: '500px',
                    opacity: 0.8,
                    hide: true
                });
                Message.setRead(id);
            } else {
                ark_notify(result);
            }
        },

        //全部设置已读
        setAllRead: function(){
            if(confirm("确定要设置所有消息为已读吗?")) {
                var url = "/common/read_all/";
                result = makeAPost(url, {});
                ark_notify(result);
                if(result.status == 0) {
                    message_table.draw();
                }
            }
        },

        //删除单条消息
        delete: function(id){
            var url = "/common/delete_message/";
            result = makeAPost(url, {'id': id});
            ark_notify(result);
            if(result.status == 0) {
                message_table.draw();
            }
        },

        //批量删除消息
        deleteMany: function() {
            //获取所有勾选ID
            var ids="";
            $('#message_list').find('tr > td:first-child input:checkbox')
                .each(function () {
                    if (this.checked) {
                        ids+=$(this).val()+",";  
                    }
                });

            //如果没有勾选，提示
            if (ids === "") {
                alert("请选择一条消息！");
                return;
            } else {
                ids = ids.substr(0, ids.length - 1);
            }

            if(confirm("确定要删除所选消息吗?")) {
                var url = "/common/delete_message/";
                result = makeAPost(url, {'id': ids});
                ark_notify(result);
                if(result.status == 0) {
                    message_table.draw();
                }
            }
        }
    }

    window.MessageTable = {

        //生成selector
        createSelector: function(choices){
            var selector = '<select id="type_select" class="form-control"'+
                ' style="width:100%"><option value="">全部</option>';
            for(var i = 0; i < choices.length; i++){
                var type = choices[i][0];
                var value = choices[i][1];
                var se = i == arguments[1] ? 'selected' : '';
                selector += '<option value="'+type+'" ' + se + '>'+value+'</option>';
            }
            selector += '</select>'
            return selector;
        },
        searchEvent: function(colIdx){
            return function(){
                message_table
                    .column( colIdx )
                    .search( this.value )
                    .draw();
            }
        },
        initHeader: function() {
            $('#message_list thead th').each( function (i) {
                if($(this).attr("id") == "read"){
                    $(this).html('<select id="read_select" class="form-control"'+
                                 ' style="width:100%">'+
                                 '<option value="">全部</option><option value="0">已读'+
                                 '</option><option value="1" selected>未读</option><select>');
                }
                if($(this).attr("id") == "content"){
                    $(this).html( '<input class="form-control" style="width:100%"'+
                                  ' type="text" placeholder="Search 通知内容" />' );
                }
                if($(this).attr("id") == "type"){
                    $(this).html(MessageTable.createSelector(type_choices, 1));
                }

            });
            message_table.columns().eq( 0 ).each( function ( colIdx ) {
                var input_type = colIdx == index_of_content ? 'input' : 'select';
                $(input_type, message_table.column( colIdx ).header() ).
                    on( 'change', MessageTable.searchEvent(colIdx));
            });
        },
        refresh: function() {
            //获取后台传过来的消息类型


            message_table = $('#message_list').DataTable({
                "processing": true,
                "serverSide": true,
                "ajax": {
                    "url": "/common/message_list/",
                    "type": "POST",
                },
                "initComplete": function(settings, result) {
                    type_choices = result.type_choices;
                    MessageTable.initHeader();
                },
                "fnDrawCallback": function(oSettings) {
                    $('#message_list tbody tr td:nth-child(2)').click(
                        function () {
                            Message.read($(this).parent());
                        }
                    );
                },
                "ordering": false,
                "columns": [
                    {
                        "searchable": false,
                        "bSortable": false,
                        "data": "id",
                        "render": function(data,type,full) {
                            return '<input type="checkbox" style="margin-left:10px;'+
                                'margin-top: 10px;" class="message_checkbox" value="'+data+'"/>';
                        }
                    },
                    { "data": "content" , "bSortable": false},
                    { "data": "type" , "bSortable": false},
                    { "data": "read" , "bSortable": false},
                    { "data": "create_time", "searchable":false,"bSortable": false }
                ],
                "columnDefs": [
                    //自定义操作列
                    {
                        "targets": [5],
                        "searchable": false,
                        "bSortable": false,
                        "data": "id",
                        "render": function(data,type,full) {
                            if(!full.is_read){
                                return "<a id='set_read_"+data+
                                    "' title='设为已读' href='javascript:void(0)'"+
                                    " onclick='Message.setRead(" +data+ 
                                    ")' ><font class='oper-Font'>"+
                                    "设为已读</font></a>&nbsp;&nbsp;"+
                                    "<a id='delete_message_"+data+
                                    "' title='删除' href='javascript:void(0)'"+
                                    " onclick='Message.delete(" + data +
                                    ")'><font class='oper-Font'>删除</font></a>";
                            }
                            else{
                                return "<a id='delete_message_"+data+
                                    "' title='删除' href='javascript:void(0)'"+
                                    " onclick='Message.delete(" + data +
                                    ")'><font class='oper-Font'>删除</font></a>";

                            }
                        }
                    },
                    
                ],
            });


            //实现全部勾选
            $(document).on('click', 'th input:checkbox', function() {
                var that = this;
                $(this).closest('table').find('tr > td:first-child input:checkbox')
                    .each(function() {
                        this.checked = that.checked;
                        $(this).closest('tr').toggleClass('selected');
                    });
            });

            $("#message_list_filter").hide();

        }
    }
    MessageTable.refresh();
});


