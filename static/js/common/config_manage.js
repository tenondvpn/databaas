var text = '<div class="col-sm-9" style="margin-bottom:10px">'+
    '<input class="form-control" id="config_value_val"'+
    ' style="width:100%" placeholder="请填写配置值！" type="text"></div>';
var text_area = '<div class="col-sm-9" style="margin-bottom:10px">'+
    '<textarea class="form-control" id="config_value_val"'+
    ' cols="80" rows="4" style="width:100%;margin-left:0px;"'+
    ' placeholder="请填写配置值！"></textarea></div>';

//创建config的form
function create_config_form(){

    var config_type_choices = $("#config_type_choices").val();
    var value_type_choices = $("#value_type_choices").val();

    config_form = '<div id="modal-dialog" style="width:450px;"><div class="modal-content">'+
        '<div class="modal-body"><div class="form-group" style="margin-bottom:45px">'+
        '<label class="col-sm-3" style="width:20%"><font color="red">*</font>'+
        '键值:</label><div class="col-sm-9" style="margin-bottom:10px"><input id="config_key_val" class="form-control"'+
        ' placeholder="请填写配置键值！" type="text"></div></div>'+

    '<div class="form-group" style="margin-bottom:45px">'+
        '<label class="col-sm-3" style="width:20%"><font color="red">*</font>'+
        '类型:</label><div class="col-sm-9" style="margin-bottom:10px">'+create_type_selector(config_type_choices,form_tag)+
        '</div></div>'+

    '<div class="form-group" style="margin-bottom:45px">'+
        '<label class="col-sm-3" style="width:20%"><font color="red">*</font>'+
        '值类型:</label><div class="col-sm-9" style="margin-bottom:10px">'+create_value_type(value_type_choices,form_tag)+
        '</div></div>'+

    '<div class="form-group" style="margin-bottom:45px">'+
        '<label class="col-sm-3" style="width:20%"><font color="red">*</font>'+
        '值:</label><div id="form_config_value">'+
        '<div class="col-sm-9" style="margin-bottom:10px"><input id="config_value_val" class="form-control"'+
        ' placeholder="请填写配置值！" type="text"></div></div></div>'+

    '<div class="form-group" style="margin-bottom:45px">'+
        '<label class="col-sm-3" style="width:20%"><font color="red"></font>'+
        '描述:</label><div class="col-sm-9" style="margin-bottom:10px"><textarea class="form-control" id="desc" cols="80"'+
        ' rows="4" style="width:100%" placeholder="请填写描述信息！">'+
        '</textarea></div></div>'+
        '</div></div></div>';

    return config_form;
}


//保存时处理
function savaConfig(){
    var key = $("#config_key_val").val();
    var config_type = $("#form_config_type").val();
    var value_type = $("#form_value_type").val();
    var value = $("#config_value_val").val();
    var desc = $("#desc").val();
    if(key==''){
        new PNotify({
            title: '配置类型新增',
            text: '请输入配置键值!',
            addclass: 'custom',
            type: 'error'
        });
        return false;
    }
    else if(value == ''){
        new PNotify({
            title: '配置类型新增',
            text: '请输入配置值!',
            addclass: 'custom',
            type: 'error'
        });
        return false;
    }
    var data = { 'key':key,'config_type':config_type,'value_type':value_type,
                 'value':value,'desc':desc};

    return data;

}

//text_type change
function text_type_change(){
    var value_type = $("#form_value_type").val();
    if(value_type == 0){
        $("#form_config_value").html(text);
    }
    else if(value_type ==1){
        $("#form_config_value").html(text_area);
    }
}

//keep notify when reload page
function notify() {
    var hash = window.location.hash;

    if(~hash.indexOf('!PNotify')) {
        new PNotify({
            title: '配置消息',
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

//生成值类型selector
function create_value_type(str,tag){
    var choices = str.split(',');
    if(tag == table_tag){
        var selector = '<select class="form-control" style="width:100%">'+
            '<option value="">全部</option>';
    }
    else{
        var selector = '<select id="form_value_type" class="form-control" '+
            'style="width:100%">';
    }
    for(var i = 0;i<choices.length;i++){
        selector += '<option value="'+i+'">'+choices[i]+'</option>';
    }
    selector += '</select>'
    return selector;

}

//生成配置类型select,(json数据)
function create_type_selector(data,tag){

    if(tag == table_tag){
        var selector = '<select class="form-control" style="width:100%">'+
            '<option value="">全部</option>';
    }
    else{
        var selector = '<select id="form_config_type" class="form-control"'+
            ' style="width:100%">';
    }
    var json = $.parseJSON(data);

    for(var i = 0;i<json.length;i++){
        selector += '<option value="'+json[i].id+'">'+json[i].name+'</option>';
    }
    selector += '</select>'
    return selector;
}


//表格select
var table_tag = 1;
//表单select
var form_tag = 2;

//datatable生成
$(function(){

    //获取后台传过来的消息类型
    var value_type_choices = $("#value_type_choices").val();
    var config_type_choices = $("#config_type_choices").val();

    $('#config_list thead th').each( function (i) {
        //alert($(this).attr('id'));
        if($(this).attr("id") == "config_key"){
            $(this).html( '<input class="form-control" style="width:100%"'+
                          ' type="text" placeholder="Search 配置键值" />' );
        }
        if($(this).attr("id") == "config_value"){
            $(this).html( '<input class="form-control" style="width:100%"'+
                          ' type="text" placeholder="Search 配置值" />' );
        }
        if($(this).attr("id") == "value_type"){
            $(this).html(create_value_type(value_type_choices,table_tag));
        }
        if($(this).attr("id") == "config_type"){
            $(this).html(create_type_selector(config_type_choices,table_tag));
        }
    } );
    
    var table = $('#config_list').DataTable({
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/common/configList/1/",
            "type": "POST",
        },
        "ordering": false,
        "columns": [
            { "data": "key" ,"bSortable": false},
            { "data": "value" ,"bSortable": false, 
              "mRender": function(data, type, full) {
                  var len = 200;
                  var str = data.substring(0, len);
                  if(data.length > len) {
                      str += ' ...';
                  }
                  return str;
              }
            },
            { "data": "value_type" ,"bSortable": false },
            { "data": "config_type","searchable":false,"bSortable": false},
            { "data": "update_time","searchable":false,"bSortable": false }
        ],
        "columnDefs": [
            //自定义操作列
            {
                "targets": [5],
                "searchable": false,
                "bSortable": false,
                "data": "id",
                "render": function(data,type,full) {
                    return "<a id='update_config_"+data+"' title='修改配置'"+
                        " key='"+full.key+
                        "' value='"+full.value+"' value_type='"+
                        full.value_type_id+"' config_type='"+
                        full.config_type_id+"' desc='"+full.description+
                        "' href='javascript:void(0)'"+
                        " onclick='Config.update(" + data +
                        ",this)'><font class='oper-Font'>修改</font>"+
                        "</a>&nbsp;&nbsp;"+
                        "<a id='delete_config_"+data+
                        "' title='删除配置' href='javascript:void(0)'"+
                        " onclick='Config.delete(" + data +
                        ")'><font class='oper-Font'>删除</font></a>";

                }
            },
        ],
    });

    var index_of_key = 0;
    var index_of_value = 1;
    var index_of_value_type = 2;
    var index_of_config_type = 3;
    
    function search_event(colIdx){
        return function(){
            table
                .column( colIdx )
                .search( this.value )
                .draw();
        }
    }

    table.columns().eq( 0 ).each( function ( colIdx ) {
        var type = colIdx == index_of_key || colIdx == index_of_value ? 'input' : 'select';
        $(type, table.column( colIdx ).header() ).
            on( 'change', search_event(colIdx));
    });

    $("#config_list_filter").hide();


    window.Config = {

        //删除配置
        delete: function (id) {
            var url = "/common/deleteConfig/";
            if(confirm("确定要删除这条数据吗?")) {
                result = makeAPost(url, { 'id' : id,'type':1 });
                ark_notify(result);
                if(result.status == 0) {
                    table.draw();
                }
            }
        },
        create: function (){

            config_form = create_config_form();

            var d = dialog({
                title : '创建',
                content : config_form,
                okValue: '确定',
                ok: function () {
                    data = savaConfig(); 
                    if(!data){
                        return false;
                    }

                    var url = "/common/createConfig/";
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
            $("#form_value_type").change(text_type_change);
        },
        //修改配置类型
        update: function(id,obj) {

            config_form = create_config_form();

            var d = dialog({
                title : '创建',
                content : config_form,
                okValue: '确定',
                ok: function () {
                    data = savaConfig(); 
                    if(!data){
                        return false;
                    }

                    var url = "/common/updateConfig/";
                    data['id'] = id;
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
            $("#form_value_type").change(text_type_change);

            if($(obj).attr("value_type") == 1){
                $("#form_config_value").html(text_area);
            }

            $("#config_key_val").val($(obj).attr("key"));
            $("#form_config_type").val($(obj).attr("config_type"));
            $("#form_value_type").val($(obj).attr("value_type"));
            $("#config_value_val").val($(obj).attr("value"));
            $("#desc").val($(obj).attr("desc"));

            //键值不能改
            $("#config_key_val").attr("readonly","readonly");
        }


    }


    
})




