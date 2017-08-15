require('../../assets/css/login/login.css');
var host = require('../../config').requestHost();
var setCookie = require('../../config').setCookie;
var loginVm = avalon.define({
    $id: 'login',
    loginStatus: '登录',
    form: {
        account: '',
        password: ''
    },
    isCorrect: function(value) {
        var isNum = /^\d{11}$/;
        if (value.trim().length === 0) {
            return false
        } else {
            if (isNum.test(value)) {
                var reg = /^1((3[0-9]|4[57]|5[0-35-9]|7[0678]|8[0-9])\d{8}$)/;
                if (!reg.test(value)) {
                    return false
                }
            } else {
                var email = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if (!email.test(value)) {
                    return false
                }
            }
        }
        return true;
    },
    isPassword: function(value) {
        var pass = /[`~!@#\$%\^\&\*\(\)_\+<>\?:"\{\},\.\\\/;'\[\]]/im;
        if (value.trim().length === 0) {
            return false
        }
        if (pass.test(value)) {
            return false
        } else {
            return true;
        }
    },
    validate: function(type, e) {
        var parent = this.parentNode;
        var value = this.value;
        if (type === 'account') {
            if (!loginVm.isCorrect(value)) {
                avalon(parent).addClass('error');
                return false;
            }
        } else {
            if (!loginVm.isPassword(value)) {
                avalon(parent).addClass('error');
            }
        }
    },

    focus: function(e) {
        avalon(this.parentNode).addClass('focus').removeClass('error');
    },
    blur: function(e) {
        avalon(this.parentNode).removeClass('focus');
    },
    submitHandler: function(e) {
        e.preventDefault();
        if (!loginVm.isCorrect(loginVm.form.account)) {
            var el = document.getElementById('account');
            avalon(el.parentNode).addClass('error');
            return false
        }
        if (!loginVm.isPassword(loginVm.form.password)) {
            var el = document.getElementById('password');
            avalon(el.parentNode).addClass('error');
            return false
        }
        var a = {
            account: loginVm.form.account,
            password: loginVm.form.password
        }
        avalon.vmodels.root.showLoading = true;
        this.loginStatus = "正在登录...";
        $.post(host + '/user/login', a, function(data) {
            if (data.code === 0) {
                setCookie('userName', data.data.username);
                avalon.vmodels.root.userName = data.data.username;
                avalon.vmodels.root.isLogin = true;
                avalon.router.go('homePage');
            } else {
                avalon.vmodels.root.showMessage(data.msg);
            }
            this.loginStatus = "登录";
            avalon.vmodels.root.showLoading = false;
        })
    }
});
module.exports = avalon.controller(function($ctrl) {
    // 视图渲染后，意思是avalon.scan完成
    $ctrl.$onRendered = function() {
            avalon.vmodels.root.menuShow = false;
            $('.page_container').addClass('page-container').removeClass('page_container');
        }
        // 进入视图
    $ctrl.$onEnter = function() {
            loginVm.form.account = loginVm.form.account || avalon.vmodels.root.register.account;
            loginVm.form.password = loginVm.form.password || avalon.vmodels.root.register.password;
        }
        // 对应的视图销毁前
    $ctrl.$onBeforeUnload = function() {
            $('.page-container').addClass('page_container').removeClass('page-container');
        }
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concact(DOM树上下文vmodels)
    $ctrl.$vmodels = []
})