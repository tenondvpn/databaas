var choosevalue = 0;

function hrefindex() {
    choosevalue = 1;
}

//修改数据Ajax
function updatePipeAjax(id) {
    $("#update_busy_icon").show();
    $("#update_pipeline_btn").attr('disabled', "true");
    var url = "/pipeline/update/" + id + "/";
    var param = $("#update_pipeline_form").serialize();
    param += "&project_id=" + $("#create_pipeline_project_id").val();
    $.ajax({
        type: 'post',
        url: url,
        dataType: "json",
        data: param,
        success: function (result) {
            if (result.status) {
                $('#messageModal .modal-body p').text(result.msg);
                $('#messageModal').modal('show');
            } else {
                $('.modal_iframe', window.parent.document).hide();
                $('.modal-backdrop', window.parent.document).remove();
                window.parent.update_pipeline_callback(id, $("#create_pipeline_project_id").val(), $("#id_name").val());
            }
            $("#update_busy_icon").hide();
            $("#update_pipeline_btn").removeAttr('disabled');
        }
    });
}

//修改数据
function updatePipe(id) {
    var project_group = ''
    $("#project_id").find("input[type='text']").each(function (j) {
        if (j == 0) {
            if ($(this).val() != '') {
                project_group = $("#select_project_list").val();
            }
        }
    })
    $("#id_project_id").val(project_group);

    updatePipeAjax(id);
}

$(function () {
    //获取应用分组
    $("#create_pipeline_project_id").combotree('setValue', {
        id: $("#project_id_hidden_manual").val(),
    });

    var project_group = $("#project_id_hidden_manual").val();
//    $("#id_project_id").val(project_group);
    $("#select_project_list").val(project_group);

    //可输入selector
    //  $('.combobox').combobox();
    //by xl
    $('select.combobox').combobox();
    var text = $('input.combobox').val();
    $('input.combobox').on('blur', function () {
        if ($(this).val() == "") {
            $('input.combobox').val(text);
        }
    });

    $("#id_principal").val($("#principal").val());

    $("#principal").change(function () {
        $("#id_principal").val($("#principal").val());
    });

    // $("#id_send_sms").change(function () {
    //     if ($(this).is(':checked')) {
    //         var url = '/pipeline/check_sms_phone/';
    //         $.ajax({
    //             type: "post",
    //             url: url,
    //             success: function (result) {
    //                 if (result.status) {
    //                     alert("未配置手机号！");
    //                     $("#id_send_sms").prop("checked", false);
    //                 }
    //                 else {
    //                 }
    //             }
    //         });
    //     }
    // });

    var dateTextBox = $("#id_life_cycle");
    dateTextBox.datetimepicker({
        format: 'Ymd',
        timepicker: false,
        onShow: function (ct) {
            this.setOptions({
                //maxDate:'+1970/01/31'
                minDate: '0'
            })
        },
    });

});





