var getConfig = require('../../config').getConfig;
var getData = require('../../config').getData;
var throttle = require('../../config').throttle;
var collect = require('../../config').collect;
var cloneObj = require('../../config').cloneObj;
var stringfy = require('../../config').stringify;
var ShowBarJob = require('../../lib/charts/visual/visualBarV').ShowBarJob;


var vm1 = avalon.define({
    $id: 'hotSpotAnalysis',
    formData: {
        industry: '互联网全行业',
        type: '近一个月',
        index: '',
        top: 5,
    },
    config: {
        industry: '',
        type: ['近一个月', '近三个月', '近一年']
    },
    reportData: { //收藏报告数据
        data_id: '',
        info_id: '',
    },
    noData: true, //显示隐藏分析结果那2行字
    dataTime: {}, //分析结果2行字的数据
    // reportCommit: '', //pm端添加的评注
    label_name: '', //点击图的职位名称
    labels: [], //标签
    selectClick: function(e, type, index) {
        e.preventDefault();
        if (vm1.formData[type] === vm1.config[type][index]) {
            return false;
        }
        vm1.formData[type] = vm1.config[type][index];
        vm1.getChartsData();
    },
    getConfig: function() {
        getConfig(vm1, '204', vm1.getChartsData);
    },
    getChartsData: function() {
        var _model = cloneObj(vm1.$model.formData);
        if (_model.type == '近一个月') {
            _model.type = 2
        } else if (_model.type == "近三个月") {
            _model.type = 3
        } else {
            _model.type = 4
        }
        _model.label = vm1.config.supply.join(',');
        _model.index = vm1.config.label[0] || '100-200';
        var url = '/api/talent/salary/analysis';
        throttle(getData(vm1, url, _model, vm1.showChart), 100);
    },
    showChart: function(temp) {
        var arr = temp.data.data;
        if (arr.length === 0) {
            vm1.noData = false;
            document.getElementById('charts-wrap').innerHTML = '  <p class="nullPic">暂无数据！</p>';
        } else {
            vm1.noData = true;
            vm1.dataTime = {
                accord_data: temp.data.accord_data,
                end_time: '2017-07-11', //temp.data.end_time,
                total_data: temp.data.total_data
            };
            vm1.reportData = {
                data_id: temp.data._id,
                info_id: temp.info.length > 0 ? temp.info[0]._id : null
            };
            //vm1.reportCommit = temp.info.length > 0 ? temp.info[0].info : null;
        }
        var stringfyData = stringfy(arr);
        ShowBarJob("charts-wrap", stringfyData.dataArr, stringfyData.tips, function(x, y) {
            vm1.showModal(x, y, arr);
        });
        avalon.vmodels.root.showLoading = false;
    },
    showModal: function(name, pos, data) {
        vm1.labels = [];
        vm1.label_name = name;
        var obj = {},
            label = {};

        for (var o = 0; o < data.length; o++) {
            for (var d in data[o]) {
                if (d == name) {
                    obj = data[o][d];
                }
            }
        }
        for (var f = 0; f < obj.length; f++) {
            if (obj[f].name == pos) {
                label = obj[f].tags;
            }
        }
        for (var i in label) {
            var sum = 0,
                ev = [];
            temp = {};
            for (var j in label[i]) {
                sum += label[i][j];
                ev.push({ name: j, value: label[i][j] });
                temp.text = ev;
            }
            temp.name = i;
            temp.total = sum;
            temp.string = '';
            vm1.labels.push(temp);
        }
        for (var v = 0; v < vm1.labels.length; v++) {
            var str = '';
            for (var b = 0; b < vm1.labels[v].text.length; b++) {
                str += vm1.labels[v].text[b].name + ':' + vm1.percent(vm1.labels[v].text[b].value, vm1.labels[v].total) + ';';
            }
            vm1.labels[v].string = str;
        }

        $('.label-item').each(function(i, el) {
            switch (i) {
                case 0:
                    $(el).css({ 'top': '100px', 'left': '60px' });
                    break;
                case 1:
                    $(el).css({ 'top': '200px', 'left': '60px' });
                    break;
                case 2:
                    $(el).css({ 'top': '100px', 'right': '60px' });
                    break;
                case 3:
                    $(el).css({ 'top': '200px', 'right': '60px' });
                    break;
            }
        })
        $('#showKey').modal('show');
    },
    collection: function() {
        var _collect = cloneObj(vm1.$model.reportData);
        _collect.report_name = vm1.formData.industry + "的热门岗位人群薪酬及特征画像报告";
        collect(_collect);
    },
    percent: function(num, total) {
        num = parseFloat(num);
        total = parseFloat(total);
        if (isNaN(num) || isNaN(total)) {
            return "-";
        }
        return total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00 + "%");
    }
})
module.exports = avalon.controller(function($ctrl) {
    // 视图渲染后，意思是avalon.scan完成
    $ctrl.$onRendered = function() {}
        // 进入视图
    $ctrl.$onEnter = function() {
            setTimeout(function() {
                vm1.getConfig();
            }, 500);
        }
        // 对应的视图销毁前
    $ctrl.$onBeforeUnload = function() {

        }
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concact(DOM树上下文vmodels)
    $ctrl.$vmodels = []
})