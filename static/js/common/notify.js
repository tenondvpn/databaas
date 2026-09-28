
function ark_notify(result) {
    var type = result.status != 0 ? 'error' : 'success';
    var title = result.title ? result.title : 
        result.status != 0 ? '失败' : '成功';
    var text = '';
    if(result.msg instanceof Array) {
        var msg_array = []; 
        for(var i=0;i<result.msg.length;i++)
        {
            if(result.msg[i] instanceof Array) {
                // [["name", ["报表名称不能为空"]]]
                msg_array = msg_array.concat(result.msg[i][1]);
            } else {
                msg_array = msg_array.concat(result.msg[i]);
            }
        }
        text = msg_array.join("\r\n");
    } else if(result.msg) {
        text = result.msg;
    }

    new PNotify({
        title: title,
        addclass: 'custom',
        type: type,
        text: text
    });
}
