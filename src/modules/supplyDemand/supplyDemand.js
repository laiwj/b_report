var config = require('../../config');

//图表js
var ShowBarNeed = require('../../lib/charts/visual/visualBar.js').ShowBarNeed;
var ShowBarIndex = require('../../lib/charts/visual/visualBar.js').ShowBarIndex;
var vm3 = avalon.define({
    $id: 'supplyDemand',
    formData: {
        industry: '互联网全行业',
        fp: '职能',
        na: '供需指数',
        type: '近一个月',
        top: 10,
        city: ''
    },
    noData: true,
    dataTime: {},
    reportData: { //收藏报告数据
        data_id: '',
        info_id: '',
    },
    // reportCommit: '', //pm端添加的评注
    config: {
        industry: [],
        type: ['近一个月', '近三个月', '近一年'],
        na: ['供需指数', '需求量'],
        fp: ['职能', '岗位']
    },
    collection_Data: {},
    selectClick: function(e, type, index) {
        e.preventDefault();
        if (vm3.formData[type] === vm3.config[type][index]) {
            return false;
        }
        vm3.formData[type] = vm3.config[type][index];
        vm3.getChartsData();
    },
    topTurn: function(num) {
        if (avalon(this).hasClass('active')) {
            return false;
        }
        $('.button-wrap>.top-button').removeClass('active');
        avalon(this).addClass('active');
        vm3.formData.top = num;
        vm3.getChartsData();
    },
    getConfig: function() {
        config.getConfig(vm3, '203', vm3.getChartsData);
    },
    getChartsData: function() {
        var _model = config.cloneObj(vm3.$model.formData);
        if (_model.type == '近一个月') {
            _model.type = 2
        } else if (_model.type == "近三个月") {
            _model.type = 3
        } else {
            _model.type = 4
        }
        _model.fp = _model.fp === "职能" ? 'func' : 'position';
        _model.na = _model.na === '需求量' ? 'need' : 'all';
        var url = '/api/talent/exponential';
        config.throttle(config.getData(vm3, url, _model, vm3.showCharts), 100);
    },
    showCharts: function(temp, _model) {
        if (temp.data.data.length === 0) {
            vm3.noData = false;
            document.getElementById('charts-wrap').innerHTML = '  <p class="nullPic">暂无数据！</p>';
        } else {
            vm3.noData = true;
            vm3.dataTime = {
                accord_data: temp.data.accord_data,
                end_time: '2017-07-10', //temp.data.end_time,
                total_data: temp.data.total_data
            };
            vm3.reportData = {
                data_id: temp.data._id,
                info_id: temp.info[0] ? temp.info[0]._id : null
            };
            //vm3.reportCommit = temp.info[0] ? temp.info[0].info : null;
            if (_model.na === 'need') {
                ShowBarNeed('charts-wrap', temp.data.data);
            } else {
                ShowBarIndex('charts-wrap', temp.data.data);
            }
        }
        avalon.vmodels.root.showLoading = false;
    },
    reportCollect: function() { //收藏报告
        var _collect = config.cloneObj(vm3.$model.reportData);
        _collect.report_name = vm3.formData.industry + vm3.formData.na + '排名前' + vm3.formData.top + vm3.formData.fp + '分布';
        config.collect(_collect);
    }
})
module.exports = avalon.controller(function($ctrl) {
    // 视图渲染后，意思是avalon.scan完成
    $ctrl.$onRendered = function() {}
        // 进入视图
    $ctrl.$onEnter = function() {
            setTimeout(function() {
                vm3.getConfig();
            }, 500);
        }
        // 对应的视图销毁前
    $ctrl.$onBeforeUnload = function() {}
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concact(DOM树上下文vmodels)
    $ctrl.$vmodels = []
})