function get_url_param(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}


function md5(e) {
    var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 32, n = e;

    function u(e, t) {
        return e << t | e >>> 32 - t
    }

    function l(e, t) {
        var n, r, o, i, a;
        return o = 2147483648 & e, i = 2147483648 & t, a = (1073741823 & e) + (1073741823 & t), (n = 1073741824 & e) & (r = 1073741824 & t) ? 2147483648 ^ a ^ o ^ i : n | r ? 1073741824 & a ? 3221225472 ^ a ^ o ^ i : 1073741824 ^ a ^ o ^ i : a ^ o ^ i
    }

    function r(e, t, n, r, o, i, a) {
        var s;
        return l(u(e = l(e, l(l((s = t) & n | ~s & r, o), a)), i), t)
    }

    function o(e, t, n, r, o, i, a) {
        var s;
        return l(u(e = l(e, l(l(t & (s = r) | n & ~s, o), a)), i), t)
    }

    function i(e, t, n, r, o, i, a) {
        return l(u(e = l(e, l(l(t ^ n ^ r, o), a)), i), t)
    }

    function a(e, t, n, r, o, i, a) {
        return l(u(e = l(e, l(l(n ^ (t | ~r), o), a)), i), t)
    }

    function s(e) {
        var t, n = "", r = "";
        for (t = 0; t <= 3; t++) n += (r = "0" + (e >>> 8 * t & 255).toString(16)).substr(r.length - 2, 2);
        return n
    }

    var c, f, p, d, h, v, m, y, g, b = Array();
    for (b = function (e) {
        for (var t, n = e.length, r = n + 8, o = 16 * ((r - r % 64) / 64 + 1), i = Array(o - 1), a = 0, s = 0; s < n;) a = s % 4 * 8, i[t = (s - s % 4) / 4] = i[t] | e.charCodeAt(s) << a, s++;
        return a = s % 4 * 8, i[t = (s - s % 4) / 4] = i[t] | 128 << a, i[o - 2] = n << 3, i[o - 1] = n >>> 29, i
    }(n), v = 1732584193, m = 4023233417, y = 2562383102, g = 271733878, c = 0; c < b.length; c += 16) m = a(m = a(m = a(m = a(m = i(m = i(m = i(m = i(m = o(m = o(m = o(m = o(m = r(m = r(m = r(m = r(p = m, y = r(d = y, g = r(h = g, v = r(f = v, m, y, g, b[c + 0], 7, 3614090360), m, y, b[c + 1], 12, 3905402710), v, m, b[c + 2], 17, 606105819), g, v, b[c + 3], 22, 3250441966), y = r(y, g = r(g, v = r(v, m, y, g, b[c + 4], 7, 4118548399), m, y, b[c + 5], 12, 1200080426), v, m, b[c + 6], 17, 2821735955), g, v, b[c + 7], 22, 4249261313), y = r(y, g = r(g, v = r(v, m, y, g, b[c + 8], 7, 1770035416), m, y, b[c + 9], 12, 2336552879), v, m, b[c + 10], 17, 4294925233), g, v, b[c + 11], 22, 2304563134), y = r(y, g = r(g, v = r(v, m, y, g, b[c + 12], 7, 1804603682), m, y, b[c + 13], 12, 4254626195), v, m, b[c + 14], 17, 2792965006), g, v, b[c + 15], 22, 1236535329), y = o(y, g = o(g, v = o(v, m, y, g, b[c + 1], 5, 4129170786), m, y, b[c + 6], 9, 3225465664), v, m, b[c + 11], 14, 643717713), g, v, b[c + 0], 20, 3921069994), y = o(y, g = o(g, v = o(v, m, y, g, b[c + 5], 5, 3593408605), m, y, b[c + 10], 9, 38016083), v, m, b[c + 15], 14, 3634488961), g, v, b[c + 4], 20, 3889429448), y = o(y, g = o(g, v = o(v, m, y, g, b[c + 9], 5, 568446438), m, y, b[c + 14], 9, 3275163606), v, m, b[c + 3], 14, 4107603335), g, v, b[c + 8], 20, 1163531501), y = o(y, g = o(g, v = o(v, m, y, g, b[c + 13], 5, 2850285829), m, y, b[c + 2], 9, 4243563512), v, m, b[c + 7], 14, 1735328473), g, v, b[c + 12], 20, 2368359562), y = i(y, g = i(g, v = i(v, m, y, g, b[c + 5], 4, 4294588738), m, y, b[c + 8], 11, 2272392833), v, m, b[c + 11], 16, 1839030562), g, v, b[c + 14], 23, 4259657740), y = i(y, g = i(g, v = i(v, m, y, g, b[c + 1], 4, 2763975236), m, y, b[c + 4], 11, 1272893353), v, m, b[c + 7], 16, 4139469664), g, v, b[c + 10], 23, 3200236656), y = i(y, g = i(g, v = i(v, m, y, g, b[c + 13], 4, 681279174), m, y, b[c + 0], 11, 3936430074), v, m, b[c + 3], 16, 3572445317), g, v, b[c + 6], 23, 76029189), y = i(y, g = i(g, v = i(v, m, y, g, b[c + 9], 4, 3654602809), m, y, b[c + 12], 11, 3873151461), v, m, b[c + 15], 16, 530742520), g, v, b[c + 2], 23, 3299628645), y = a(y, g = a(g, v = a(v, m, y, g, b[c + 0], 6, 4096336452), m, y, b[c + 7], 10, 1126891415), v, m, b[c + 14], 15, 2878612391), g, v, b[c + 5], 21, 4237533241), y = a(y, g = a(g, v = a(v, m, y, g, b[c + 12], 6, 1700485571), m, y, b[c + 3], 10, 2399980690), v, m, b[c + 10], 15, 4293915773), g, v, b[c + 1], 21, 2240044497), y = a(y, g = a(g, v = a(v, m, y, g, b[c + 8], 6, 1873313359), m, y, b[c + 15], 10, 4264355552), v, m, b[c + 6], 15, 2734768916), g, v, b[c + 13], 21, 1309151649), y = a(y, g = a(g, v = a(v, m, y, g, b[c + 4], 6, 4149444226), m, y, b[c + 11], 10, 3174756917), v, m, b[c + 2], 15, 718787259), g, v, b[c + 9], 21, 3951481745), v = l(v, f), m = l(m, p), y = l(y, d), g = l(g, h);
    return 32 == t ? s(v) + s(m) + s(y) + s(g) : s(m) + s(y)
}

function login() {
    var url = "/login/";
    $.ajax({
        type: 'post',
        url: url,
        dataType: 'json',
        data: {
            "username": $("#username").val(),
            "password": md5(md5(md5($("#password").val()))),
            "next": get_url_param("next")
        },
        success: function (result) {
            if (result.status) {
                new PNotify({
                    title: '通知',
                    text: "登录失败：" + result.msg,
                    type: 'error',
                    hide: true,
                    closer: true,
                    addclass: 'custom'
                });
            } else {
                window.location = result.next ? result.next : get_url_param("next") || "/pipeline/index/";
            }
        }
    });
}

function register() {
    var url = "/register/";
    $.ajax({
        type: 'post',
        url: url,
        dataType: 'json',
        data: {
            "username": $("#username").val(),
            "password": md5(md5(md5($("#password").val()))),
            "email": $("#email").val(),
            "dingding": $("#dingding").val(),
            "next": get_url_param("next")
        },
        success: function (result) {
            if (result.status) {
                new PNotify({
                    title: '通知',
                    text: "登录失败：" + result.msg,
                    type: 'error',
                    hide: true,
                    closer: true,
                    addclass: 'custom'
                });
            } else {
                window.location = result.next ? result.next : get_url_param("next") || "/pipeline/index/";
            }
        }
    });
}

$(function () {
    $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' /* optional */
    });
});