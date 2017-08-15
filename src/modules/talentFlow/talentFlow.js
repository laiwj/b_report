var config = require('../../config');

/*图表js*/
var ShowMapTop = require('../../lib/charts/visual/visualMap').ShowMapTop;
var ShowMapFlowIn = require('../../lib/charts/visual/visualMap').ShowMapFlowIn;
var ShowMapFlowOut = require('../../lib/charts/visual/visualMap').ShowMapFlowOut;
var ShowWorkFlow = require('../../lib/charts/visual/visualFlow');
var vm2 = avalon.define({
    $id: 'talentFlow',
    noData: true,
    formData: {
        industry: '互联行业',
        direction: '人才流入',
        city: '',
        type: '近一个月',
        top: 10,
        cf: '热门城市'
    },
    dataTime: {},
    reportData: { //收藏报告数据
        data_id: '',
        info_id: '',
    },
    dataTime: {}, //分析结果2行字的数据
    // reportCommit: '', //pm端添加的评注
    collection_Data: {},
    config: {
        industry: [],
        direction: ['人才流出', '人才流入'],
        cf: ['热门城市', '热门职能'],
        type: ['近一个月', '近三个月', '近一年']
    },
    selectClick: function(e, type, index) {
        e.preventDefault();
        if (vm2.formData[type] === vm2.config[type][index]) {
            return false;
        }
        vm2.formData[type] = vm2.config[type][index];
        vm2.getChartsData();
    },
    topTurn: function(num) {
        if (avalon(this).hasClass('active')) {
            return false;
        }
        $('.button-wrap>.top-button').removeClass('active');
        avalon(this).addClass('active');
        vm2.formData.top = num;
        vm2.getChartsData();
    },
    getConfig: function() {
        config.getConfig(vm2, '202', vm2.getChartsData);
    },
    getChartsData: function() {
        var _model = config.cloneObj(vm2.$model.formData);
        if (_model.type == '近一个月') {
            _model.type = 2
        } else if (_model.type == "近三个月") {
            _model.type = 3
        } else {
            _model.type = 4
        }
        _model.direction = _model.direction === "人才流入" ? 'in' : 'out';
        _model.cf = _model.cf === '热门城市' ? 'city' : 'func';
        var url = '/api/talent/flow';
        config.throttle(config.getData(vm2, url, _model, vm2.showCharts), 100);
    },
    showCharts: function(temp, model) {
        if (temp.data.data.length === 0) {
            vm2.noData = false;
            document.getElementById('charts_wrap').innerHTML = '  <p class="nullPic">暂无数据！</p>';
        } else {
            vm2.noData = true;
            vm2.dataTime = {
                accord_data: temp.data.accord_data,
                end_time: '2017-07-09', // temp.data.end_time,
                total_data: temp.data.total_data
            };
            vm2.reportData = {
                data_id: temp.data._id,
                info_id: temp.info[0] ? temp.info[0]._id : null
            };
            // vm2.reportCommit = temp.info[0] ? temp.info[0].info : null;
        }
        if (model.cf === 'city') {
            ShowMapTop('charts_wrap', temp.data.data, function(city, obj) {
                avalon.vmodels.root.showLoading = true;
                $.post(config.requestHost() + '/api/talent/flow', {
                    city: city,
                    industry: model.industry,
                    type: model.type,
                    direction: model.direction,
                    top: model.top,
                    cf: 'city'
                }, function(result) {
                    var a = result.data.data.data;
                    if (model.direction === 'in') {
                        ShowMapFlowIn('charts_wrap', a, city);
                    } else {
                        ShowMapFlowOut('charts_wrap', a, city);
                    }
                    avalon.vmodels.root.showLoading = false;
                    obj.addReturnTool();
                })

            })

        } else {
            var temp2 = {},
                temp1 = temp.data.data;
            for (var i = 0; i < temp1.length; i++) {
                for (var j in temp1[i]) {
                    temp2[j] = temp1[i][j];
                }
            }
            for (var s in temp2) {
                for (var w = 0; w < temp2[s].length; w++) {
                    temp2[s][w] = [temp2[s][w].name, temp2[s][w].value]
                }
            }
            ShowWorkFlow("charts_wrap", temp2);
        }
        avalon.vmodels.root.showLoading = false;
    },
    reportCollect: function() { //收藏报告
        var _collect = config.cloneObj(vm2.$model.reportData);
        _collect.report_name = vm2.formData.industry + vm2.formData.direction + vm2.formData.cf + '分布Top' + vm2.formData.top;
        config.collect(_collect);
    }

})
module.exports = avalon.controller(function($ctrl) {
    // 视图渲染后，意思是avalon.scan完成
    $ctrl.$onRendered = function() {}
        // 进入视图
    $ctrl.$onEnter = function() {
            setTimeout(function() {
                vm2.getConfig();
            }, 500);
        }
        // 对应的视图销毁前
    $ctrl.$onBeforeUnload = function() {

        }
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concact(DOM树上下文vmodels)
    $ctrl.$vmodels = []
})