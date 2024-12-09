
function makeAPost(url, post_data, async, callback, arg, arg1) {
    if(typeof(async) == 'undefined') {
        async = false;
    }
    var result_data;
    $.ajax({
        url: url,
        type: "POST",
        async: async,
        dataType: "json",
        traditional: true,
        data: post_data,
        success: function(result) {
            result_data = result;
            if(typeof(callback) != 'undefined')
            {   
                callback(result, arg, arg1);
            }
        },
        error: function(XMLHttpRequest, textStatus, error) {
            result_data = {'status':1,'msg':'系统出错'};
            if(typeof(callback) != 'undefined')
            {   
                callback(result_data, arg);
            }
        }
    });
    return result_data;
}
