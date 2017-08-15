/**
 * Created by Administrator on 2017/5/9.
 */


/*
 功能: 获取配置项
 输入：
    data - [{name:'上海',value:85},{name:'广州',value:90}]
 */
var echarts = require('../echarts.v3.min.js');
var Init3 = require('./public.js').Init3;
// 样式一
function getOptionBar1(data, tips) {

    var GDC = function(cls) { //颜色梯度转换
        var cg = [{ offset: 0, color: cls[0] }, { offset: 1, color: cls[1] }];
        return new echarts.graphic.LinearGradient(0, 1, 0, 0, cg)
    };
    var colorCfg = [
        ['#bbdefb', '#bbdefb'],
        ['#64b5f6', '#64b5f6'],
        ['#2196f3', '#2196f3'],
        ['#0277bd', '#0277bd']
    ];
    var color = [GDC(colorCfg[0]), GDC(colorCfg[1]), GDC(colorCfg[2]), GDC(colorCfg[3])];

    var series = data.map(function(d, i) {

        return {
            name: d.name,
            type: 'bar',
            stack: null,
            itemStyle: { normal: { color: color[i] } },
            label: {
                normal: { position: 'top', show: true, textStyle: { color: '#000' } },

            },
            data: d.value.map(function(c) { return c.value; }),
        };
    });

    var legend = data.map(function(d) { return d.name; });
    var x = data.length > 0 ? data[0].value.map(function(d) { return d.name; }) : [];
    var option = {
        tooltip: {
            trigger: 'item',
            textStyle: { fontFamily: "宋体", fontSize: 12 },
            formatter: function(p) {
                var wordC = "";
                var nums = 0;
                if (p.seriesName in tips && p.name in tips[p.seriesName]) wordC = getWordCloudHtml(tips[p.seriesName][p.name]);
                nums = tips[p.seriesName][p.name][0][1];
                return "<p>该岗位热门关键词</p><div>" + wordC + "</div><p align='right'>数据量：" + nums + "</p>";
            }
        },
        legend: { data: legend, show: true },
        xAxis: [{ type: 'category', data: x, splitLine: { show: false } }],
        yAxis: [{ type: 'value', name: "月薪(元)" }],
        series: series
    };
    return option;
}

// 样式二
function getOptionBar2(data, tips) {
    var GDC = function(cls) { //颜色梯度转换
        var cg = [{ offset: 0, color: cls[0] }, { offset: 1, color: cls[1] }];
        return new echarts.graphic.LinearGradient(0, 1, 0, 0, cg)
    };
    var colorCfg = [
        ['#bbdefb', '#bbdefb'],
        ['#64b5f6', '#64b5f6'],
        ['#2196f3', '#2196f3'],
        ['#0277bd', '#0277bd']
    ];
    var color = [GDC(colorCfg[0]), GDC(colorCfg[1]), GDC(colorCfg[2]), GDC(colorCfg[3])];
    var MaxP90 = data.filter(function(v) {
        return v.name === 'p90'
    })[0].value.reduce(function(a, b) { return parseInt(a) > parseInt(b.value) ? a : b.value; }, 0);

    var pre25 = data.filter(function(v) {
        return v.name === 'p25'
    })[0].value.reduce(function(a, b) {
        a[b.name] = b.value / MaxP90;
        return a;
    }, {});

    var series = data.map(function(d, i) {
        var label = {
            normal: {
                show: true,
                offset: [0, 10],
                position: 'insideTop',
                textStyle: { color: "#000" },
                formatter: function(d) {
                    return (pre25[d.name] < 0.025 && d.seriesName !== 'p90') ? "" : d.seriesName + "(" + d.data + ")";
                }
            }
        };
        return {
            name: d.name,
            type: 'bar',
            stack: true,
            itemStyle: { normal: { color: color[i] } },
            label: label,
            data: d.value.map(function(c) { return c.value; }),
        };
    });

    var legend = data.map(function(d) { return d.name; });
    var x = data.length > 0 ? data[0].value.map(function(d) { return d.name; }) : [];
    var option = {
        tooltip: {
            trigger: 'item',
            textStyle: { fontFamily: "宋体", fontSize: 12 },
            formatter: function(p) {
                var wordC = "";
                var nums = 0;
                if (p.seriesName in tips && p.name in tips[p.seriesName]) wordC = getWordCloudHtml(tips[p.seriesName][p.name]);
                nums = tips[p.seriesName][p.name][0][1];
                return "<p>该岗位热门关键词（点击查看详情）</p><div>" + wordC + "</div><p align='right'>数据量:" + nums + "</p>";
            }
        },
        legend: { data: legend, show: false },
        xAxis: [{ type: 'category', data: x, splitLine: { show: false } }],
        yAxis: [{ type: 'value', name: "月薪(元)" }],
        series: series
    };
    return option;
}


//----------------------------------------------------------------------------------------------------------------
// 标签云Html代码生成
// 数据格式 [{"name":"*", "value":n },...]
function getWordCloudHtml(dt, color) {
    var maxFontSize = 20,
        minFontSize = 8,
        maxLineWidth = 180,
        disF = maxFontSize - minFontSize;
    var padding = 10,
        color = color || "#fff"; //标签内右边距， 标签字体颜色
    var tempId = "WorldCloudTemp";
    if ($("#" + tempId).length == 0) $(document.body).append("<div id='WorldCloudTemp' style='position: absolute; top:10px'><label id='" + tempId + "'></label></div>");
    var tpv = dt.map(function(d) { return d[1]; }),
        maxV = Math.max.apply(null, tpv),
        minV = Math.min.apply(null, tpv),
        disV = maxV - minV;

    // 数据值映射字体大小
    var data = dt.map(function(d) { return [d[0], parseInt(1.0 * (d[1] - minV) * disF / disV + minFontSize)]; });

    var div = $("#" + tempId);

    function visualLength(text, size) {
        div.css("font-size", size + "px").css("padding-right", padding + "px");
        div.text(text);
        return div[0].offsetWidth;
    }

    function sortMiddle(_dt) {
        var temp = _dt.sort(function(a, b) { return b[1] - a[1]; }),
            rst = _dt.map(function(d) { return ["", 0]; });
        var mid = Math.ceil(temp.length / 2) - 1;
        temp.forEach(function(d, i) {
            var index = mid + ((i % 2 == 0) ? parseInt(-1 * i / 2) : parseInt((i + 1) / 2));
            rst[index][0] = temp[i][0];
            rst[index][1] = temp[i][1];
        });
        return rst;
    }

    // 判断行最大宽度设置合理性
    if (visualLength(data[0][0], data[0][1]) > maxLineWidth) {
        console.error("The maxLineWidth is set too small, please change it!");
        return;
    }

    // 按布局排序
    data = sortMiddle(data);

    var html = "",
        lsLine = [{ data: [], lineWidth: 0 }],
        j = 0;;
    for (var i = 0; i < data.length; i++) {
        var d = data[i],
            w = visualLength(d[0], d[1]);
        if ((lsLine[j].lineWidth + w) < maxLineWidth) { // 能放下该标签
            lsLine[j].data.push([d[0], d[1], w]);
            lsLine[j].lineWidth += w;
        } else {
            lsLine.push({ data: [], lineWidth: 0 });
            j++;
            i--;
        }
    }

    lsLine.forEach(function(line) {
        var p = "",
            pw = parseInt((maxLineWidth - line.lineWidth) / 2);
        line.data.forEach(function(d) {
            p += "<label style='color:" + color + ";padding-right:" + padding + "px;font-size: " + d[1] + "px'>" + d[0] + "</label>";
        });
        html += "<span style='padding-left: " + pw + "px; padding-right: " + 0 + "px'>" + p + "</span><br>"
    });

    $("#WorldCloudTemp").remove();
    return html;
}

//需求量图
function ShowBarMoney(id, data, tips, num, callbackClick) {
    var option = getOptionBar1(data, tips);
    var e = Init3(option, id);
    e.on("click", function(p) {
        if (callbackClick) callbackClick(p.name, p.seriesName);
    });
    return e;
}

//供需指数图
function ShowBarJob(id, data, tips, callbackClick) {
    var option = getOptionBar2(data, tips);
    var e = Init3(option, id);
    e.on("click", function(p) {
        if (callbackClick) callbackClick(p.name, p.seriesName);
    });
    return e;
}
module.exports = {
    ShowBarJob: ShowBarJob,
    ShowBarMoney: ShowBarMoney
}