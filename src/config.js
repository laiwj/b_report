var avalon = require("./lib/avalon/avalon.shim");
var $ = window.$ = require('jquery');
var config = {
    //本地开发调试请求服务的域名
    requestHost: function() {
        if (NODE_ENV === 'production') {
            var origin = location.origin;
            if (!origin) {
                origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port : '');
            }
        } else {
            origin = "http://10.101.1.171:10111";
        }
        return origin;
    },
    //保存cookie
    setCookie: function(name, value, expires) {
        var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
        // 设置默认过期时间为七天
        if (expires == undefined) {
            var date = new Date();
            date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
            expires = date;
        }
        if (expires instanceof Date) {
            cookieText += "; expires=" + expires.toGMTString();
        }
        document.cookie = cookieText;
    },
    //取cookie
    getCookie: function(name) {
        var start = document.cookie.indexOf(encodeURIComponent(name));
        var end = document.cookie.indexOf(';', start);
        if (end == -1) {
            end = document.cookie.length;
        }
        return decodeURIComponent(document.cookie.substring(start + name.length + 1, end));
    },
    //日期格式化
    format: function(time, format) {
        var t = new Date(time);
        var tf = function(i) { return (i < 10 ? '0' : '') + i };
        return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a) {
            switch (a) {
                case 'yyyy':
                    return tf(t.getFullYear());
                case 'MM':
                    return tf(t.getMonth() + 1);
                case 'mm':
                    return tf(t.getMinutes());
                case 'dd':
                    return tf(t.getDate());
                case 'HH':
                    return tf(t.getHours());
                case 'ss':
                    return tf(t.getSeconds());
            }
        });
    },
    //深度克隆对象和数组
    cloneObj: function(obj) {
        var str, newobj = obj.constructor === Array ? [] : {};
        if (typeof obj !== 'object') {
            return;
        } else if (window.JSON) {
            str = JSON.stringify(obj), //系列化对象
                newobj = JSON.parse(str); //还原
        } else {
            for (var i in obj) {
                newobj[i] = typeof obj[i] === 'object' ?
                    cloneObj(obj[i]) : obj[i];
            }
        }
        return newobj;
    },
    //获取图表数据方法
    getData: function(context, url, model, callback) {
        avalon.vmodels.root.showLoading = true;
        $.post(config.requestHost() + url, model).success(function(result) {
            if (result.code < 0) {
                avalon.vmodels.root.showMessage(result.msg);
                if (result.code === -10 || result.code === -11) {
                    avalon.router.go('login');
                } else if (result.code === -6) {
                    context.noData = false;
                    var el = document.getElementById('charts-wraps');
                    if (el) {
                        el.innerHTML = '  <p class="nullPic">没有权限！</p>';
                    } else {
                        if (document.getElementById('charts-wrap')) {
                            document.getElementById('charts-wrap').innerHTML = '  <p class="nullPic">没有权限！</p>';
                        } else {
                            document.getElementById('charts_wrap').innerHTML = '  <p class="nullPic">没有权限！</p>';
                        }
                    }
                }
                avalon.vmodels.root.showLoading = false;
            } else {
                context.noData = true;
                callback(result.data, model);
            }
        })
    },
    //获取配置信息
    getConfig: function(context, type, callback) {
        $.post(config.requestHost() + '/report/config/all', { report_type: type }, function(data) {
            if (data.code === -10 || data.code === -11) {
                avalon.vmodels.root.showMessage(data.msg);
                avalon.router.go('login');
            } else if (data.code === 0) {
                var temp = data.data;
                for (var i = 0; i < temp.length; i++) {
                    if (temp[i].config_type === 'industry') {
                        temp[i].checks.unshift('互联网全行业');
                    }
                    context.config[temp[i].config_type] = temp[i].checks;
                    context.formData[temp[i].config_type] = temp[i].checks[0];
                }
                callback();
            } else {
                avalon.vmodels.root.showMessage(data.msg);
            }
        }).error(function() {
            alert('请求失败,请检查网络设置！');

        })
    },
    collect: function(data) {
        if (!data.data_id) {
            avalon.vmodels.root.showMessage('暂无数据,无法收藏');
            return false;
        }
        $.post(config.requestHost() + '/report/collect', data, function(result) {
            if (result.code < 0) {
                avalon.vmodels.root.showMessage(result.msg);
                if (result.code === -10 || result.code === -11) {
                    avalon.router.go('login');
                }
            } else {
                $('#collectSuccess').modal('show'); //收藏成功
            }
        })
    },
    throttle: function(fn, delay, immediate, debounce) {
        var curr = +new Date(), //当前事件
            last_call = 0,
            last_exec = 0,
            timer = null,
            diff, //时间差
            context, //上下文
            args,
            exec = function() {
                last_exec = curr;
                fn.apply(context, args);
            };
        return function() {
            curr = +new Date();
            context = this,
                args = arguments,
                diff = curr - (debounce ? last_call : last_exec) - delay;
            clearTimeout(timer);
            if (debounce) {
                if (immediate) {
                    timer = setTimeout(exec, delay);
                } else if (diff >= 0) {
                    exec();
                }
            } else {
                if (diff >= 0) {
                    exec();
                } else if (immediate) {
                    timer = setTimeout(exec, -diff);
                }
            }
            last_call = curr;
        }
    },
    stringify: function(arr) {
        var dataArr = [
            { name: 'p25', value: [] },
            { name: 'p50', value: [] },
            { name: 'p75', value: [] },
            { name: 'p90', value: [] }
        ];
        var tips = {};
        for (var i = 0; i < arr.length; i++) { //i data
            for (var j in arr[i]) {
                if (j === 'position_nums') { // j key
                    continue;
                }
                for (var p = 0; p < dataArr.length; p++) {
                    for (var x = 0; x < arr[i][j].length; x++) { //x p100 p25...
                        if (arr[i][j][x].name === 'p100') {
                            arr[i][j][x].name = 'p90'
                        }
                        if (dataArr[p].name === arr[i][j][x].name) {

                            dataArr[p].value[i] = {};
                            dataArr[p].value[i].name = j;
                            dataArr[p].value[i].value = arr[i][j][x].max_salary;
                            tips[arr[i][j][x].name] = tips[arr[i][j][x].name] || {};
                            tips[arr[i][j][x].name][j] = [];
                            for (var y = 0; y < arr[i][j][x].keywords.length; y++) { //  y keywords
                                tips[arr[i][j][x].name][j][y] = new Array(2);
                                tips[arr[i][j][x].name][j][y][0] = arr[i][j][x].keywords[y];
                                tips[arr[i][j][x].name][j][y][1] = arr[i][j][x].keywords_num;
                            }
                        }
                    }
                }
            }
        }
        return {
            dataArr: dataArr,
            tips: tips
        }
    }
};

/*
 * 频率控制 返回函数连续调用时，fn 执行频率限定为每多少时间执行一次
 * @param fn {function}  需要调用的函数
 * @param delay  {number}    延迟时间，单位毫秒
 * @param immediate  {bool} 给 immediate参数传递false 绑定的函数先执行，而不是delay后后执行。
 * @return {function}实际调用函数
 */

module.exports = config