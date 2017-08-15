/**
 * Created by Administrator on 2017/5/9.
 * 依赖：
 *      province.js
 *      public.js
 *      visualMap.js
 */

require('../china.js');

var getCityPosEx = require('./citys.js');
var province = require('./province.js');
var Init3 = require('./public.js').Init3;
var MapGeo = require('./visualMap.js').MapGeo;

//饼状图核心配置项
function getOptionPie(data) {
    var colors = ['#2F7FDE', '#3AC2D0', '#FCD240', '#FCAF2F', '#F95669', '#FC8A80', '#DDA2FD', '#8D87FF',
        '#56E1E4', '#9BCA5A'
    ];
    data = data.sort(function(a, b) { return b.value - a.value; });
    var option = {
        color: colors,
        tooltip: { trigger: 'item', formatter: "{a} <br/>{b}: {c} ({d}%)", show: true },
        series: [{
            type: 'pie',
            radius: ['28%', '60%'],
            avoidLabelOverlap: true,
            z: 5,
            zlevel: 5,
            label: {
                normal: { show: true, position: 'outside', textStyle: { color: '#111' } },
                emphasis: { show: true, textStyle: { fontSize: '16', fontWeight: 'normal' }, formatter: "{b}: {c} ({d}%)" }
            },
            labelLine: { normal: { show: true, lineStyle: { color: '#111' } } },
            data: data
        }]
    };
    return option;
}


//单独饼图
function ShowPie(id, data) {
    var option = getOptionPie(data);
    Init3(option, id);
}

//地图和饼状图合并 - 全国
function ShowPieChina(id, data) {
    var map = new MapGeo(id, []);
    map.maxR = 30;
    var option = map.getOptionMap('top');
    var pie = getOptionPie(data);
    pie.series[0].radius = ['16%', '45%'];
    pie.series[0].center = ['54%', '60%'];
    option.color = pie.color;
    option.geo.roam = false;
    option.series.push(pie.series[0]);
    Init3(option, id);
}

/*
 *   地图和饼状图合并 - 城市
 *   输入：city - 城市    //常规城市名，不含“市”字。
 *   功能：以指定城市所在省份为背景，以该城市为中心放大地图，并显示该地区数据分布。
 */
function ShowPieCity(id, data, city) {
    city = city || "成都";
    var p = getProvinceByCity(city);
    var map = new MapGeo(id, []);
    var option = map.getOptionMap(MapGeo.regions);
    option.series[0].center = getCityPosEx(city);
    option.series[0].data = [{ name: p, selected: true }];

    //饼图
    var pie = getOptionPie(data);
    pie.series[0].radius = ['18%', '55%'];
    option.color = pie.color;
    option.series.push(pie.series[0]);

    Init3(option, id);
}

module.exports = {
    ShowPieChina: ShowPieChina
}