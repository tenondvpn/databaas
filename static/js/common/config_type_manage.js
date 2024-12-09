var desc = '<div style="width:430px;">&nbsp;'+
    '<font color="red">*</font>配置名称:</div>' + 
    '<div style="width:430px;"><input class="form-control"'+
    ' id="config_type_name" style="width:400px;"'+
    ' placeholder="请填写配置类型名称！" type="text"></div>';


//keep notify when reload page
function notify() {
    var hash = window.location.hash;

    if(~hash.indexOf('!PNotify')) {
        new PNotify({
            title: '配置类型消息',
            text: hash.replace('#!PNotify:', ''),
            addclass: 'custom',
            type: 'success'
        });
        location.hash = "";
    }
};
function reload(text) {
    var location = window.location;

    location.hash = "!PNotify:" + text;
    location.reload();
}
$(notify);

function updateTypeAjax(id,name) {
    var url = "/common/updateConfigType/";
    $.ajax({
        type : 'post',
        url : url,
        data : {'id':id , 'name':name },
        dataType : 'json',
        success : function(result) {
            if(result.status){
                new PNotify({
                    title: '配置类型修改',
                    text: result.msg,
                    addclass: 'custom',
                    type: 'error'
                });
            }else{
                //提示notify后刷新页面
                reload(result.msg);
            }
        }
    });
}

//修改配置类型



//datatable生成
$(function(){

    $('#config_type_list thead th').each( function (i) {
        if($(this).attr("id") == "type_name"){
            $(this).html( '<input class="form-control" style="width:100%"'+
                          ' type="text" placeholder="Search 类型名称" />' );
        }
    } );
    
    var table = $('#config_type_list').DataTable({
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/common/configTypeList/2/",
            "type": "POST",
        },
        "ordering": false,
        "columns": [
            { "data": "name" ,"bSortable": false},
            { "data": "update_time","searchable":false,"bSortable": false }
        ],
        "columnDefs": [
            //自定义操作列
            {
                "targets": [2],
                "searchable": false,
                "bSortable": false,
                "data": "id",
                "render": function(data,type,full) {
                    return "<a id='update_config_type_"+data+
                        "' title='修改' name='"+full.name+
                        "' href='javascript:void(0)'"+
                        " onclick='ConfigType.update(" + 
                        data +",this)'><font class='oper-Font'>修改</font>"+
                        "</a>&nbsp;&nbsp;"+
                        "<a id='delete_config_type_"+data+
                        "' title='删除' href='javascript:void(0)'"+
                        " onclick='ConfigType.delete(" + data +
                        ")'><font class='oper-Font'>删除</font></a>";

                }
            },
        ],
    });

    var index_of_key = 0;
    
    function search_event(colIdx){
        return function(){
            table
                .column( colIdx )
                .search( this.value )
                .draw();
        }
    }

    table.columns().eq( 0 ).each( function ( colIdx ) {
        if(colIdx == index_of_key){
            $( 'input', table.column( colIdx ).footer() ).
                on( 'change', search_event(colIdx));
        }
    });

    $("#config_type_list_filter").hide();

    window.ConfigType = {
        update: function (id,obj) {
            name = obj.name;
            desc = '<div style="width:430px;">&nbsp;'+
                '<font color="red">*</font>配置名称:</div>' + 
                '<div style="width:430px;"><input class="form-control"'+
                ' id="config_type_name" style="width:400px;" '+
                ' placeholder="请填写配置类型名称！" type="text" value="'+
                name+'"></div>';
            var d = dialog({
                title : '创建',
                content : desc,
                okValue: '确定',
                ok: function () {
                    var name = $("#config_type_name").val();
                    if(name==''){
                        new PNotify({
                            title: '配置类型修改',
                            text: '请输入配置类型名称!',
                            addclass: 'custom',
                            type: 'error'
                        });
                        return false;
                    }
                    var url = "/common/updateConfigType/";
                    data = {'id':id, 'name':name};
                    result = makeAPost(url, data);
                    ark_notify(result);
                    if(result.status == 0) {
                        table.draw();
                    }
                },
                cancelValue: '取消',
                cancel: true
            });
            d.showModal();
        },
        //删除配置类型
        delete: function(id) {
            if(confirm("确定要删除这条数据吗?")) {
                var url = "/common/deleteConfigType/";
                result = makeAPost(url, { 'id' : id,'type':2 });
                ark_notify(result);
                if(result.status == 0) {
                    table.draw();
                }
            }
        },
        create: function(){
            var d = dialog({
                title : '创建',
                content : desc,
                okValue: '确定',
                ok: function () {
                    var url = "/common/createConfigType/";
                    var name = $("#config_type_name").val();
                    result = makeAPost(url, {'name': name});
                    ark_notify(result);
                    if(result.status == 0) {
                        table.draw();
                    }
                },
                cancelValue: '取消',
                cancel: true
            });
            d.showModal();

        }

    }
})




