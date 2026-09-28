$(function(){
    window.PipelineStatus = {
        display: function(status) {
            var color_dsp = PipelineStatus.display_color_dsp(status);
            return color_dsp[1];
        },
        display_with_color: function(status) {
            var color_dsp = PipelineStatus.display_color_dsp(status);
            return '<span style="color:' + color_dsp[0] + '">' + color_dsp[1] + '</span>';
        },
        display_color_dsp: function(status) {
            var color = 'blue';
            var dsp = '无效状态';
            switch(status) {
            case 0:
                dsp = '等待中';
                color = '#8da6ce';
                break;
            case 1:
                dsp = '正在执行';
                color = 'blue';
                break;
            case 2:
                dsp = '执行成功';
                color = '#12dc12';
                break;
            case 3:
                dsp = '执行失败';
                color = 'red';
                break;
            case 4:
                dsp = '任务超时';
                color = 'red';
                break;
            case 5:
                dsp = '等待调度';
                color = 'blue';
                break;
            case 6:
                dsp = '被停止';
                color = 'red';
                break;
            case 7:
                dsp = '上游失败';
                color = 'red';
                break;
            }
            return [color, dsp];
        },
    }
});