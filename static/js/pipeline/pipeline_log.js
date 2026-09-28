var pathtotal = "";
var click_that = null;
var global_rerun_id = 0;
var tail_filename = null;

var refresh_tail_kog = function () {
    if (tail_filename != null) {
        readLog(tail_filename, true);
    }
};

function readLog(filename, istail) {
    if (istail == 0) {
        var url = '/pipeline/get_log_content/';
        tail_filename = null;
    } else {
        var url = '/pipeline/get_tail/';
        tail_filename = filename;
        setTimeout(refresh_tail_kog, 2000);
    }

    $.ajax({
        url: url,
        type: 'post',
        data: {'schedule_id': $('#schedule_p').val(), 'file_name': pathtotal + filename, rerun_id: global_rerun_id},
        success: function (result) {
            if (istail == 0) {
                $("#tail_btn").empty();
                if (result.status) {
                    $('.filecontent').text("获取失败");
                }
                else {
                    if (result.file_content) {
                        $("#tail_btn").html('<button class="btn" aria-hidden="true" onclick=readLog("' + filename + '",1)>tail</button>');
                        $('.filecontent').text(result.file_content);
                    }
                    else {
                        $('.filecontent').text("该文件为空");
                    }
                }
            }
            else {
                if (result.res) {
                    $('.filecontent').text(result.res);
                }
                else {
                    $('.filecontent').text('该文件为空');
                }
            }
        }
    });
}

function downloadFile(url) {
    try {
        var elemIF = document.createElement("iframe");
        elemIF.src = url;
        elemIF.style.display = "none";
        document.body.appendChild(elemIF);
    } catch (e) {

    }
}

function downloadLog(filename) {
    window.open('/pipeline/download/' + $('#schedule_p').val() + '&' + pathtotal + filename + '&' + global_rerun_id + '/');
}


function getlogcontent(schedule_id, subpath, that) {
    tail_filename = null;
    pathtotal = subpath;
    $('#nulldocument').css({
        'display': 'none'
    });
    $('.nulldocument').remove();
    $(that).nextAll().remove();
    $('#navultrance a').remove();
    $('#navulstdout a').remove();
    $('#navulconf a').remove();
    $('#navulpy a').remove();
    $('#navulother a').remove();
    $('#navuldir a').remove();


    $('.filecontent').text('');
    var filecontent;
    var contentdown;
    var path = subpath;
    path = path.substr(0, path.length - 1);
    // var schedule_id=parseInt($('#schedule_p').val());
    $.post('/pipeline/get_task_log/', {
        schedule_id: schedule_id,
        subpath: path,
        rerun_id: global_rerun_id
    }, function (data) {
        if (data.status != 0) {
            $('#messageview .modal-body h5').text(data.info);
            $('#messageview').modal('show');
            $('#spanmessage').html('加载失败!');
            $('#navultrance li').remove();
            $('#navulstdout li').remove();
            $('#navulconf li').remove();
            $('#navulpy li').remove();
            $('#navulother li').remove();
            $('#navuldir li').remove();
        } else if (data.status == 0) {
            //清空
            $('#navultrance').empty();
            $('#navulstdout').empty();
            $('#navulconf').empty();
            $('#navulpy').empty();
            $('#navulother').empty();
            $('#navuldir').empty();

            $('#spanmessage').remove();
            var logarr = data.list;
            var tranceArr = [];
            var stdoutArr = [];
            var confArr = [];
            var pyArr = [];
            var other = [];
            var dirArr = [];
            for (var i = 0; i < logarr.length; i++) {
                if (logarr[i] == "trace.log") {
                    tranceArr.push(logarr[i]);
                }
                else if (logarr[i].indexOf('.log') >= 0) {
                    stdoutArr.push(logarr[i]);
                }
                else if (logarr[i].indexOf('.conf') >= 0 || logarr[i].indexOf('.tpl') >= 0) {
                    confArr.push(logarr[i]);
                }
                else if (logarr[i].indexOf('.py') >= 0 || logarr[i].indexOf('.tar.gz') >= 0) {
                    pyArr.push(logarr[i]);
                } else if (logarr[i].charAt(logarr[i].length - 1) == "/") {
                    dirArr.push(logarr[i]);
                } else if (logarr[i] != "") {
                    other.push(logarr[i]);
                }
            }
            if (tranceArr.length == 0) {
                $('#navultrance li').remove();
                $('#navultrance').css('margin-right', '0px');
            } else {
                $('#navultrance').css('margin-right', '40px');
                $('#navultrance').append('<li class="firstli">平台日志:</li>');
            }
            if (stdoutArr.length == 0) {
                $('#navulstdout li').remove();
                $('#navulstdout').css('margin-right', '0px');
            } else {
                $('#navulstdout').css('margin-right', '40px');
                $('#navulstdout').append('<li class="firstli">任务日志:</li>');

            }
            if (confArr.length == 0) {
                $('#navulconf li').remove();
                $('#navulconf').css('margin-right', '0px');
            } else {
                $('#navulconf').css('margin-right', '40px');
                $('#navulconf').append('<li class="firstli">配置文件:</li>');
            }
            if (pyArr.length == 0) {
                $('#navulpy li').remove();
                $('#navulpy').css('margin-right', '0px');
            } else {
                $('#navulpy').css('margin-right', '40px');
                $('#navulpy').append('<li class="firstli">执行文件:</li>');

            }
            if (other.length == 0) {
                $('#navulother li').remove();
                $('#navulother').css('margin-right', '0px');
            } else {
                $('#navulother').css('margin-right', '40px');
                $('#navulother').append('<li class="firstli">其他文件:</li>');

            }
            if (dirArr.length == 0) {
                $('#navuldir li').remove();
                $('#navuldir').css('margin-right', '0px');
            } else {
                $('#navuldir').css('margin-right', '40px');
                $('#navuldir').append('<li class="firstli">子目录:</li>');
            }
            if (tranceArr.length == 0 && stdoutArr.length == 0 && confArr.length == 0 && pyArr.length == 0 && other.length == 0 && dirArr.length == 0) {
                $('#nulldocument').css({
                    'display': 'block'
                });
            }
            for (var i = 0; i < tranceArr.length; i++) {
                $("#navultrance").append("&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=readLog('" + tranceArr[i] + "',0)>" + tranceArr[i] + "</a>");
                $("#navultrance").append("&nbsp;<a href='javascript:void(0)' title='下载' class='fa fa-arrow-down' onclick=downloadLog('" + tranceArr[i] + "')/>");
            }
            for (var i = 0; i < stdoutArr.length; i++) {
                $("#navulstdout").append("&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=readLog('" + stdoutArr[i] + "',0)>" + stdoutArr[i] + "</a>");
                $("#navulstdout").append("&nbsp;<a href='javascript:void(0)' title='下载' class='fa fa-arrow-down' onclick=downloadLog('" + stdoutArr[i] + "')/>");
            }
            for (var i = 0; i < confArr.length; i++) {
                $("#navulconf").append("&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=readLog('" + confArr[i] + "',0)>" + confArr[i] + "</a>");
                $("#navulconf").append("&nbsp;<a href='javascript:void(0)' title='下载' class='fa fa-arrow-down' onclick=downloadLog('" + confArr[i] + "')/>");
            }
            for (var i = 0; i < pyArr.length; i++) {
                $("#navulpy").append("&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=readLog('" + pyArr[i] + "',0)>" + pyArr[i] + "</a>");
                $("#navulpy").append("&nbsp;<a href='javascript:void(0)' title='下载' class='fa fa-arrow-down' onclick=downloadLog('" + pyArr[i] + "')/>");
            }
            for (var i = 0; i < other.length; i++) {
                $("#navulother").append("&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=readLog('" + other[i] + "',0)>" + other[i] + "</a>");
                $("#navulother").append("&nbsp;<a href='javascript:void(0)' title='下载' class='fa fa-arrow-down' onclick=downloadLog('" + other[i] + "')/>");
            }
            for (var i = 0; i < dirArr.length; i++) {
                var dir = "'" + dirArr[i] + "'";
                $("#navuldir").append("&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=addhref(" + dir + "," + schedule_id + ")>" + dirArr[i] + "</a>");
            }
            $('.frontlast').each(function () {
                $(this).click(function () {
                    $('.filecontent').text("");
                    var file_name = $(this).parent().parent().find('button').text();
                    $.post('/pipeline/get_log_content/', {
                        schedule_id: schedule_id,
                        file_name: subpath + file_name,
                        rerun_id: global_rerun_id
                    }, function (data) {
                        if (data.status == 0) {
                            if (data.file_content) {
                                $('.filecontent').text(data.file_content);
                            } else {
                                $('.filecontent').text("该文件为空");
                            }
                            filecontent = data.file_content;
                        } else if (data.status == 1) {
                            $('.filecontent').text(data.info);
                        }
                    }, 'json');
                });
            });
            $('.lastfront').each(function () {
                $(this).click(function () {
                    $('filecontent').text("");

                    var tailfile = $(this).parent().parent().find('button').text();
                    $.post('/pipeline/get_tail/', {
                        schedule_id: schedule_id,
                        file_name: subpath + tailfile
                    }, function (data) {
                        if (data.res) {
                            $('.filecontent').text(data.res);
                        }
                    }, 'json');
                });
            });
            $('.downlog').each(function () {
                $(this).click(function () {
                    var file_name = $(this).parent().parent().find('button').text();
                    $.post('/pipeline/get_log_content/', {
                        schedule_id: schedule_id,
                        file_name: subpath + file_name,
                        rerun_id: global_rerun_id
                    }, function (data) {
                        if (data.status == 0) {
                            if (data.file_content) {
                                contentdown = data.file_content;
                            } else {
                                contentdown = "文件为空";
                            }
                            var content = contentdown;
                            var aLink = document.createElement('a');
                            var blob = new Blob([content]);
                            var evt = document.createEvent("HTMLEvents");
                            evt.initEvent("click", false, false);
                            aLink.download = file_name;
                            aLink.href = URL.createObjectURL(blob);
                            aLink.dispatchEvent(evt);
                        } else {
                            //       alert('二进制文件不能下载');
                            $('#messageview .modal-body h5').text('二进制文件不能下载');
                            $('#messageview').modal('show');

                        }
                    }, 'json');
                });
            });
        }
    }, 'json');
}

function writeObj(obj) {
    var description = "";
    for (var i in obj) {
        var property = obj[i];
        description += i + " = " + property + "\n";
    }
    alert(description);
}

function get_log_list(rerun_id, schedule_id, index) {
    tail_filename = null;
    global_rerun_id = rerun_id;
    $('.nulldocument').remove();
    var tmp_bread = document.getElementById('readdocument');
    $(tmp_bread).nextAll().remove();
    $('#navultrance a').remove();
    $('#navulstdout a').remove();
    $('#navulconf a').remove();
    $('#navulpy a').remove();
    $('#navulother a').remove();
    $('#navuldir a').remove();
    if (click_that != null) {
        $("#left_side_li" + click_that).removeClass("active");
    }
    $("#left_side_li" + index).addClass("active");
    click_that = index;
    getlogcontent(schedule_id, "");
}

function get_retry_history_list(schedule_id) {
    $.ajax({
        url: "/pipeline/get_retry_history_list/",
        type: 'post',
        data: {'schedule_id': $('#schedule_p').val()},
        success: function (result) {
            if (result.status) {
                alert("获取执行状态失败！");
                return;
            }

            var list_html = '<li class=\"header\"><font size="3">历史重跑列表</font> </li>';
            for (var i = 0; i < result.his_list.length; ++i) {
                if (result.his_list[i].status == 3 || result.his_list[i].status == 6) {
                    list_html += '<li id="left_side_li' + i + '"><a onclick="get_log_list(' + result.his_list[i].rerun_id + ',' + schedule_id + ',' + i + ')" style="padding: 10px 1px 0px 15px;" href="javascript:void(0);"><i class="fa fa-circle-o text-red"></i> <font color="red">' + result.his_list[i].start_time + '</font></span></a></li>';
                } else if (result.his_list[i].status == 0 || result.his_list[i].status == 1) {
                    list_html += '<li id="left_side_li' + i + '"><a onclick="get_log_list(' + result.his_list[i].rerun_id + ',' + schedule_id + ',' + i + ')" style="padding: 10px 1px 0px 15px;" href="javascript:void(0);"><i class="fa fa-circle-o text-black"></i> <span><font color="black">' + result.his_list[i].start_time + '</font></span></a></li>';
                } else {
                    list_html += '<li id="left_side_li' + i + '"><a onclick="get_log_list(' + result.his_list[i].rerun_id + ',' + schedule_id + ',' + i + ')" style="padding: 10px 1px 0px 15px;" href="javascript:void(0);"><i class="fa fa-circle-o text-green"></i> <span><font color="#006400">' + result.his_list[i].start_time + '</font></span></a></li>'
                }
            }

            $("#retry_history_log").html(list_html);
        }
    });
}

function addhref(hrefdir, schedule_id) {
    var href = hrefdir;
    var href = "'" + href + "'";
    var total = "";
    $('.breadcrumb li:gt(2)').each(function () {
        total += $(this).find('a').text() + '/';
    });
    total = total + hrefdir;
    var treeview = total;
    total = "'" + total + "'";

    var deleteg = hrefdir;
    deleteg = deleteg.substr(0, deleteg.length - 1);
    $('.breadcrumb').append('<li onclick="getlogcontent(' + schedule_id + ',' + total + ',this)"><a style="cursor:pointer">' + deleteg + '</a></li>');

    $("#navultrance").empty();
    $("#navulstdout").empty();
    $("#navulconf").empty();
    $("#navulpy").empty();
    $("#navulother").empty();
    $("#navuldir").empty();

    getlogcontent(schedule_id, treeview);
}

$(function () {
    window.scrollTo(0, 1);
    $("<li><a href='/pipeline/" + $('#pl_id').val() + "/'>" + $('#task_name').val() + '</li>').insertBefore($('.breadcrumb li:eq(0)'));
    $("<li><a href='/pipeline/" + $('#pl_id').val() + "/'>" + $('#pl_name').val() + '</li>').insertBefore($('.breadcrumb li:eq(0)'));
    var schedule_id = parseInt($('#schedule_p').val());
    get_retry_history_list(schedule_id);
    getlogcontent(schedule_id, '', document.getElementById('readdocument'));

    $('#readdocument').on('click', function () {
        getlogcontent(schedule_id, '', document.getElementById('readdocument'));
    });
});

