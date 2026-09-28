$(function() {
    window.MultiUserSelector = {
        // users: [{'id': id, 'name': name}, {'id': id, 'name': name}]
        // selected_users: [id1, id2]
        init: function(ele, users, selected_users) {

            var options = "";
            if(users instanceof Array) {
                for(var i = 0; i < users.length; i++){
                    var selected_str = selected_users.indexOf(users[i].id) < 0 ? '' : ' selected ';
                    options += "<option value='" + users[i].id + "'" + selected_str;
                    options += ">" + users[i].name + "</option>";
                }
            } else if (users instanceof Object) {
                for(var id in users) {
                    var selected_str = selected_users.indexOf(id) < 0 ? '' : ' selected ';
                    options += "<option value='" + id + "'" + selected_str;
                    options += ">" + users[id] + "</option>";
                }
            }

            ele.append(options);
            ele.select2();
        }
    }

    $("input.input_with_clear_btn").keyup(function() {
        this.nextSibling.style.visibility = (this.value.length) ? "visible" : "hidden";
    });

    $("span.input_clear_btn").click(function() {
        this.style.visibility = "hidden";
        this.previousSibling.value = "";
        this.previousSibling.focus();
    });

});

