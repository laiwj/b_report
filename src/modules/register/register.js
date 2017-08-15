var host = require('../../config').requestHost();
var registerVm = avalon.define({
    $id: 'register',
    registerStatus: '注册',
    username: '',
    account: '',
    inviter: '',
    password: '',
    registerClick: function(e) {
        e.preventDefault();
        if (!registerVm.isCorrect(registerVm.account)) {
            var el = document.getElementById('account');
            avalon(el.parentNode).addClass('error');
            return false;
        }
        if (!registerVm.isPassword(registerVm.password)) {
            var el = document.getElementById('password');
            avalon(el.parentNode).addClass('error');
            return false;
        }
        if (!registerVm.isPassword(registerVm.username)) {
            var el = document.getElementById('username');
            avalon(el.parentNode).addClass('error');
            return false;
        }
        if (!registerVm.isPassword(registerVm.inviter)) {
            var el = document.getElementById('inviter');
            avalon(el.parentNode).addClass('error');
            return false;
        }
        avalon.vmodels.root.showLoading = true;
        registerVm.registerStatus = "正在注册...";
        var formData = {
            username: registerVm.username,
            password: registerVm.password,
            account: registerVm.account,
            inviter: registerVm.inviter
        }
        $.post(host + '/user/regist', formData, function(data) {
            registerVm.registerStatus = "注册";
            if (data.code === 0) {
                if (avalon.vmodels.login) {
                    avalon.vmodels.login.form = {
                        account: registerVm.account,
                        password: registerVm.password
                    }
                } else {
                    avalon.vmodels.root.register = {
                        account: registerVm.account,
                        password: registerVm.password
                    }
                }
                avalon.router.go('login');
            } else {
                avalon.vmodels.root.showMessage(data.msg);
            }
            avalon.vmodels.root.showLoading = false;

        })
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
    focus: function() {
        avalon(this.parentNode).addClass('focus').removeClass('error');
    },
    blur: function() {
        avalon(this.parentNode).removeClass('focus');
    },
    validateUs: function() {
        if (!registerVm.isPassword(this.value)) {
            avalon(this.parentNode).addClass('error');
        }
    },
    validateAc: function() {
        if (!registerVm.isCorrect(this.value)) {
            avalon(this.parentNode).addClass('error');
        }
    },
    validatePs: function() {
        if (!registerVm.isPassword(this.value)) {
            avalon(this.parentNode).addClass('error');
        }
    },
    validateNum: function() {
        var a = this.value;
        if (!registerVm.isPassword(a)) {
            avalon(this.parentNode).addClass('error');
        }
    }
});
module.exports = avalon.controller(function($ctrl) {
    // 视图渲染后，意思是avalon.scan完成
    $ctrl.$onRendered = function() {
            var el = document.querySelector('.page_container');
            avalon(el).addClass('page-container').removeClass('page_container');
        }
        // 进入视图
    $ctrl.$onEnter = function() {
            registerVm.inviter = location.hash.split('=')[1] || '';
        }
        // 对应的视图销毁前
    $ctrl.$onBeforeUnload = function() {
            var el = document.querySelector('.page-container');
            avalon(el).addClass('page_container').removeClass('page-container');
        }
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concact(DOM树上下文vmodels)
    $ctrl.$vmodels = []
})