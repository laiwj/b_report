require('../../assets/css/analysis/analysis.css');
require('../../assets/css/position.css');
var getData = require('../../config').getData;
var throttle = require('../../config').throttle;
var collect = require('../../config').collect;
var cloneObj = require('../../config').cloneObj;
var stringfy = require('../../config').stringify;
var xy_select = require('../../lib/jquery.position.select');
var ShowBarMoney = require('../../lib/charts/visual/visualBarV').ShowBarMoney;

var vm1 = avalon.define({
    $id: 'funcPayAnalysis',
    configItem: {
        name: '请选择',
        industry: '请选择',
        city: '请选择',
        type: '请选择',
        experience: '请选择',
        top: 5
    },
    reportData: { //收藏报告数据
        data_id: '',
        info_id: '',
    },
    noData: false, //显示隐藏分析结果那2行字
    dataTime: {}, //分析结果2行字的数据
    // reportCommit: '', //pm端添加的评注
    addStation: function(e) {
        e.preventDefault();
        xy_select.init({
            setValue: function(value) {
                vm1.configItem.name = value;
                $('#result').attr('title', value);
                vm1.getChartsData();
            },
            source: 'func'
        });
    },
    multiSelect: function(e, name) {
        var target = e.target || e.srcElement;
        if (target.nodeName.toLowerCase() === 'button') {
            return false;
        }
        e.preventDefault();
        e.stopPropagation();
        $(target).toggleClass('check');
        var checked = $(this).find('.check');
        if (checked.length > 3) {
            avalon.vmodels.root.showMessage('最多选择3个！');
            $(target).removeClass('check');
            return false;
        }
    },
    sureSelect: function(name) {
        var checked = $(this).parent().parent().find('.check');
        var str = [];
        checked.each(function(i, el) {
            str.push(el.innerHTML);
        })
        vm1.configItem[name] = str.join(',') || '请选择';
        $(this).parent().parent().siblings('#' + name).attr('title', str).parent().removeClass('open');
        vm1.getChartsData();
    },
    selectClick: function(e, type) { //下拉菜单点选每项
        var target = e.target || e.srcElement;
        e.preventDefault();
        if (target.nodeName.toLowerCase() === 'ul') {
            return false
        }
        if (vm1.configItem[type] === target.innerHTML) {
            return false;
        }
        vm1.configItem[type] = target.innerHTML;
        vm1.getChartsData();
    },
    getChartsData: function() {
        var _model = cloneObj(vm1.$model.configItem);
        if (_model.type == '近一个月' || _model.type == '请选择') {
            _model.type = 2
        } else if (_model.type == "近三个月") {
            _model.type = 3
        } else {
            _model.type = 4
        }
        if (_model.name === '请选择') {
            _model.name = 'IT运维,设计';
            vm1.configItem.name = "IT运维,设计";
        }
        if (!_model.name) {
            avalon.vmodels.root.showMessage('请选择职能！');
            return false;
        }
        if (_model.experience === '请选择') {
            _model.experience = '';
        } else if (_model.experience === '12年以上') {
            _model.experience = '12+';
        } else {
            _model.experience = _model.experience.replace(/年/g, '');
        }
        _model.industry = _model.industry === '请选择' ? '' : _model.industry;
        _model.city = _model.city === '请选择' ? '' : _model.city;
        var url = '/api/func/salary/analysis';
        throttle(getData(vm1, url, _model, vm1.showCharts), 100);
    },
    showCharts: function(temp) {
        var arr = temp.data.data;
        if (arr.length === 0) {
            vm1.noData = false;
            document.getElementById('charts-wraps').innerHTML = '  <p class="nullPic">暂无数据！</p>';
        } else {
            vm1.noData = true;
            vm1.dataTime = {
                accord_data: temp.data.accord_data,
                end_time: '2017-07-11', // temp.data.end_time,
                total_data: temp.data.total_data
            };
            vm1.reportData = {
                data_id: temp.data._id,
                info_id: temp.info[0] ? temp.info[0]._id : null
            };
            //vm1.reportCommit = temp.info[0] ? temp.info[0].info : null;
            var stringifyData = stringfy(arr);
            ShowBarMoney("charts-wraps", stringifyData.dataArr, stringifyData.tips, function(x, y) {});
        }
        avalon.vmodels.root.showLoading = false;
    },
    reportCollect: function() { //收藏报告
        var _collect = cloneObj(vm1.$model.reportData);
        if (!_collect.data_id) {
            avalon.vmodels.root.showMessage('暂无数据,无法收藏');
            return false;
        }
        var _model = cloneObj(vm1.$model.configItem);
        if (_model.experience === '请选择') {
            _model.experience = '';
        }
        if (_model.name === '请选择') {
            _model.name = 'IT运维,设计';
        }
        _model.industry = _model.industry === '请选择' ? '' : _model.industry;
        _model.city = _model.city === '请选择' ? '' : _model.city;
        _collect.report_name = _model.name + _model.industry + _model.city + _model.experience + 'Top5职能薪酬分析报告';
        collect(_collect);
    },

})
module.exports = avalon.controller(function($ctrl) {
    // 视图渲染后，意思是avalon.scan完成
    $ctrl.$onRendered = function() {}
        // 进入视图
    $ctrl.$onEnter = function() {
            setTimeout(function() {
                vm1.getChartsData();
            }, 500);
        }
        // 对应的视图销毁前
    $ctrl.$onBeforeUnload = function() {

        }
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concact(DOM树上下文vmodels)
    $ctrl.$vmodels = []
})