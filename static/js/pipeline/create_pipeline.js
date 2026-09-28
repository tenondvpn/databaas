//创建数据Ajax
var choosevalue = 0;
var max_date = '';

function hrefindex() {
    choosevalue = 1;
}

function createPipeAjax() {
    var project_id = $("#create_pipeline_project_id").val();
    if ($("#id_name").val().trim() == "") {
        new PNotify({
            title: '通知',
            text: '请填写流程名',
            type: 'warn',
            hide: true,
            closer: true,
            addclass: 'custom'
        });
        return;
    }

    if (project_id == null || project_id == undefined || project_id <= 0) {
        new PNotify({
            title: '通知',
            text: '请选择项目',
            type: 'warn',
            hide: true,
            closer: true,
            addclass: 'custom'
        });
        return;
    }

    $("#create_busy_icon").show();
    $("#create_pipeline_btn").attr('disabled', "true");
    var url = "/pipeline/create/";
    var param = $("#create_pipeline_form").serialize();

    param = param.replace(/project_id=&/, "");
    param = param.replace(/project_id=0/, "");
    param += "&project_id=" + project_id
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
                window.parent.create_pipeline_callback(project_id, result.pipeline_id, $("#id_name").val().trim());
            }

            $("#create_busy_icon").hide();
            $("#create_pipeline_btn").removeAttr('disabled');
        }
    });
}

$(function () {
    //by xl
    var curDate = new Date();
    var d = new Date(curDate.getTime() + 24 * 7 * 60 * 60 * 1000);
    //  var d=new Date();
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var year_max = curDate.getFullYear;
    var month_max = curDate.getMonth() + 1 + 6;
    if (month_max > 12) {
        year_max = year + 1;
        month_max = month_max % 12;
        if (month_max < 10) {
            month_max = "0" + month_max;
        }
    }
    max_date = year_max.toString() + month_max.toString() + curDate.getDate();
    if (month < 10) {
        month = "0" + month;
    } else {
        month = month.toString();
    }
    var day = d.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    var fullDate = year.toString() + month + day.toString();

    var project_id = $('.modal_iframe', window.parent.document).attr("project_id");
    if (project_id > 0) {
        $("#create_pipeline_project_id").combotree('setValue', {id: project_id});
    }
    $('#id_life_cycle').val(fullDate);
    //可输入selector
    //by xl
    $('select.combobox').combobox();
    $('input.combobox').val('');
    var text = $('select.combobox option:selected').text();
    $('input.combobox').on('blur', function () {
        if ($(this).val() == "") {
            $('input.combobox').val(text);
        }
    });
    //
    $("#create_pipeline_btn").click(function () {
        var project_group = ''
        $("#project_id").find("input[type='text']").each(function (j) {
            if (j == 0) {
                if ($(this).val() != '') {
                    project_group = $("#select_project_list").val();
                }
            }
        })
        $("#id_project_id").val(project_group);
        createPipeAjax();
    });

    $("#principal").change(function () {
        $("#id_principal").val($("#principal").val());
    });

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

    $('#id_life_cycle').change(function () {
        if ($('#id_life_cycle').val() > max_date) {
            $('.xdsoft_datetimepicker').hide();
            $('#id_life_cycle').val(max_date);
            $('#messageModal .modal-body p').text("有效期最多至六个月");
            $('#messageModal').modal('show');
        }
    });
});













