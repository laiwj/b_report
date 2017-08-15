/**
 * Created by Administrator on 2017/5/8.
 */

var echarts = require('../echarts.v3.min.js');




function set() {
    this.data = {};
    this.keys = [];
    this.add = function(e) {
        if (!this.data.hasOwnProperty(e)) this.keys.push(e);
        this.data[e] = 1;
    };
}

function cout(obj) { console.log(obj); }



function Init3(option, id) {
    var myChart = echarts.init(document.getElementById(id), 'dark');
    myChart.setOption(option);
    myChart.hideLoading();
    return myChart;
}
module.exports = { Init3: Init3, set: set, cout: cout }