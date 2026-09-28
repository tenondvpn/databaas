$(function() {

    window.Captcha = {

        update: function(img_obj, captcha) {
            var field = img_obj.parents("[name=captcha_field]").first();
            field.find("input[name=captcha_0]").val(captcha.key);
            field.find("input[name=captcha_1]").val('');
            field.find("img.captcha").attr('src', captcha.image_url);
        },

        get: function(captcha_obj) {
            var captcha = {}
            captcha['captcha_0'] = captcha_obj.find("#id_captcha_0").val();
            captcha['captcha_1'] = captcha_obj.find("#id_captcha_1").val();
            return captcha;
        },

        refresh: function(img_obj) {
            var url = "/captcha/refresh/";
            var result = makeAPost(url);
            if(result.image_url && result.key) {
                Captcha.update(img_obj, result);
            } else {
                ark_notify({"status": 1, "msg": "刷新验证码失败"});
            }
        }
    }

    $('img.captcha').each(function() {
        Captcha.refresh($(this));
    });
});
