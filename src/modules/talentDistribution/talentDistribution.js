require('../../assets/css/chartsPage.css');
var getConfig = require('../../config').getConfig;
var getData = require('../../config').getData;
var throttle = require('../../config').throttle;
var collect = require('../../config').collect;
var clone = require('../../config').cloneObj;


/* 图表依赖 */
var ShowMapTop = require('../../lib/charts/visual/visualMap.js').ShowMapTop;
var ShowPieChina = require('../../lib/charts/visual/visualPie.js').ShowPieChina;
var vm1 = avalon.define({
    $id: 'talentDistribution',
    formData: { //图表收集数据
        industry: '',
        city: '',
        type: '近一个月',
        top: 10,
        cf: '热门城市'
    },
    reportData: { //收藏报告数据
        data_id: '',
        info_id: '',
    },
    noData: true, //显示隐藏分析结果那2行字
    dataTime: {}, //分析结果2行字的数据
    config: {
        industry: [],
        city: '',
        type: ['近一个月', '近三个月', '近一年'],
        cf: ['热门城市', '热门职能']
    }, //PM端配置项
    // reportCommit: '', //pm端添加的评注
    topTurn: function(num) { //top5/top10切换
        if (avalon(this).hasClass('active')) {
            return false;
        }
        $('.button-wrap>.top-button').removeClass('active');
        avalon(this).addClass('active');
        vm1.formData.top = num;
        vm1.getChartsData();
    },
    selectClick: function(e, type, index) { //下拉菜单点选每项
        e.preventDefault();
        if (vm1.formData[type] === vm1.config[type][index]) {
            return false;
        }

        vm1.formData[type] = vm1.config[type][index];
        vm1.getChartsData();
    },
    getSetting: function() {
        getConfig(vm1, '201', vm1.getChartsData);
    },
    getChartsData: function() { //获取图表数据
        var _model = clone(vm1.$model.formData);
        if (_model.type == '近一个月') {
            _model.type = 2
        } else if (_model.type == "近三个月") {
            _model.type = 3
        } else {
            _model.type = 4
        }
        _model.cf = _model.cf === '热门城市' ? 'city' : 'func';
        _model.city = '';
        var url = '/api/talent/distribution';
        throttle(getData(vm1, url, _model, vm1.showCharts), 100);

    },
    showCharts: function(temp, _model) { //显示图表和文字评注以及分析结果
        if (temp.data.data.length === 0) {
            vm1.noData = false;
            document.getElementById('charts_wrap').innerHTML = '  <p class="nullPic">暂无数据！</p>';
        } else {
            vm1.noData = true;
            vm1.dataTime = {
                accord_data: temp.data.accord_data,
                end_time: '2017-07-08', //temp.data.end_time,
                total_data: temp.data.total_data
            };
            vm1.reportData = {
                data_id: temp.data._id,
                info_id: temp.info[0] ? temp.info[0]._id : null
            };
            // vm1.reportCommit = temp.info[0] ? temp.info[0].info : null;
            if (_model.cf === 'city') {
                ShowMapTop('charts_wrap', temp.data.data);
            } else {
                ShowPieChina('charts_wrap', temp.data.data);
            }
        }
        avalon.vmodels.root.showLoading = false;
    },
    reportCollect: function() { //收藏报告
        var _collect = clone(vm1.$model.reportData);
        _collect.report_name = vm1.formData.industry + "从业人员的" + vm1.formData.cf + 'Top' + vm1.formData.top + '报告';
        collect(_collect);
    }
});
module.exports = avalon.controller(function($ctrl) {
    // 进入视图
    $ctrl.$onEnter = function() {
            setTimeout(function() {
                vm1.getSetting();
            }, 500);
        }
        // 对应的视图销毁前
    $ctrl.$vmodels = []
})