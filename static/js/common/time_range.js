$(function(){

var startDateTextBox = $('#time-start');
var endDateTextBox = $('#time-end');
var soleDateTextBox = $('#sole-time');

soleDateTextBox.datetimepicker({
    format:'YmdH',
    onShow:function( ct ){
        this.setOptions({
            //maxDate:endDateTextBox.val() ? endDateTextBox.val() : false
        })
    },
});

startDateTextBox.datetimepicker({ 
    format:'YmdH',
    onShow:function( ct ){
        console.log('end:' + endDateTextBox.val());
        this.setOptions({
            maxDate:endDateTextBox.val() ? endDateTextBox.val() : false
        })
    },
});

endDateTextBox.datetimepicker({ 
    format:'YmdH',
    onShow:function( ct ){
        console.log('start:' + startDateTextBox.val());
        this.setOptions({
            //minDate:startDateTextBox.val() ? startDateTextBox.val() : false
            maxDate:endDateTextBox.val() ? endDateTextBox.val() : false
        })
    },
});

});
