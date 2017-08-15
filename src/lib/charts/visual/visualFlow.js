/**
 * Created by Administrator on 2017/5/22.
 */
/*
 功能: 职能流动可视化
 输入：

 data - [{name:'上海',value:85},{name:'广州',value:90}]
 */

/*
 *  功能: 职能流动可视化
 *  id : string   -   容器div
 *  data ： [] or {} -   数据，支持数组和字典
 *      参考 WorkFlow.getDemoData();
 *      Example:
 *           [['Medium', 'GA', 86], ...]     or
 *           {'Medium':[['GA', 86],...], ...}
 *  run : bool  -   是否立即运行（绘图）
 *  使用:
 *      Example 1:
 *          var wf = new WorkFlow("view1");
 *          wf.setData(data);
 *          wf.Draw();
 *      Example 2:
 *          var wf = new WorkFlow("view1", data);
 *          wf.Draw();
 *      Example 3:
 *          var wf = new WorkFlow("view1", data, true);
 *
 *  备注：showZero - 是否显示比例为0的标签
 * */

var d3 = window.d3 = require('../d3.v4.min');
require('./viz.v1.1.0.min');

//职能流动
function WorkFlow(id, data, run) {
    var $this = this;
    this.id = id;
    this.data = data;
    this.config = getConfig(id);
    this.dataDict = data;
    this.bp = null;
    this.g = null;
    this.showZero = true; //是否显示0%的标签

    /*
     * 数据设置 - 支持字典和数组两种格式
     * data - [] : [['Medium', 'GA', 86], ...]
     * data - {} : {'Medium':[['GA', 86],...], ...}
     * */
    this.setData = function(dt) {
        var type = Object.prototype.toString.call(dt);
        if (type === '[object Array]') {
            $this.data = dt;
            $this.dataDict = WorkFlow.ListToDict(dt);
        } else if (type === '[object Object]') {
            $this.data = WorkFlow.DictToList(dt);
            $this.dataDict = dt;
        }
    };

    /*
     * 功能：数据类型转换
     * input: [['Medium', 'GA', 86], ...]
     * output: {'Medium':[['GA', 86],...], ...}
     * */
    WorkFlow.ListToDict = function(list) {
        return list.reduce(function(a, b) {
            if (!(b[0] in a)) a[b[0]] = [];
            else a[b[0]].push([b[1], b[2]]);
            return a;
        }, {});
    };
    // 与listToDict()相反
    WorkFlow.DictToList = function(dict) {
        var list = [];
        for (var key in dict) {
            dict[key].forEach(function(d) { list.push([key, d[0], d[1]]); });
        }
        return list;
    };

    //获取自适应各参数
    function getConfig(id) {
        var width = document.getElementById(id).clientWidth,
            height = document.getElementById(id).clientHeight,
            title = "职能流动",
            titleFontSize = 16,
            subtextFontSize = 12,
            titleX = (width - titleFontSize * title.length) / 2 - 5,
            lineL = 150, //标签区域宽度， 线包围区域
            padding = [50, 10, 50, 10],
            graphW = width - padding[1] - padding[3] - lineL * 2,
            graphH = height - padding[0] - padding[2],
            lineRX2 = graphW + lineL,
            lineBY = graphH + 10,
            subtext = ["流出", "流向"],
            subTextRX = graphW + lineL / 2 - subtextFontSize * subtext[1].length / 2 + 5;
        var config = {
            "width": width,
            "height": height,
            "title": {
                "x": titleX,
                "y": 35,
                "text": title,
                "subtext": [{ "x": -50, "y": -8, "text": subtext[0] }, { "x": subTextRX, "y": -8, "text": subtext[1] }]
            },
            "graph": { "width": graphW, "height": graphH },
            "line": [{ "x1": -150, "x2": 0, "y": 0 }, { "x1": graphW, "x2": lineRX2, "y": 0 },
                { "x1": -150, "x2": 0, "y": lineBY }, { "x1": graphW, "x2": lineRX2, "y": lineBY }
            ],
            "color": ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#0099C6", "#339900", "#702398", "#991209", "#8029C6"]
        };
        return config;
    };

    this.Draw = function() {
        $this.color = Object.keys($this.dataDict).reduce(function(a, b, i) { a[b] = $this.config.color[i]; return a; }, {});
        $this.drawMain();
        $this.drawLabel($this.g);
        $this.g.selectAll(".mainBars").on("mouseover", mouseover).on("mouseout", mouseout);
    };

    var g = null,
        bp = null,
        showZero = true;

    //图形主体部分
    this.drawMain = function() {
        document.getElementById(id).innerHTML = "";
        var c = $this.config;
        var svg = d3.select("#" + id).append("svg").attr("width", c.width).attr("height", c.height);

        svg.append("text").attr("x", c.title.x).attr("y", c.title.y).attr("class", "header").text(c.title.text);
        g = svg.append("g").attr("transform", "translate(150, 70)");

        bp = viz.bP().data($this.data).min(12).pad(1).height(c.graph.height).width(c.graph.width)
            .barSize(35)
            .fill(function(d) { return $this.color[d.primary]; });

        g.call(bp);

        c.title.subtext.forEach(function(d) {
            g.append("text").attr("x", d.x).attr("y", d.y).style("text-anchor", "middle").text(d.text);
        });

        c.line.forEach(function(d) {
            g.append("line").attr("y1", d.y).attr("y2", d.y).attr("x1", d.x1).attr("x2", d.x2);
        });
        $this.g = g;
        $this.bp = bp;
    };

    //标签标注、百分比
    this.drawLabel = function(g) {
        g.selectAll(".mainBars").append("text").attr("class", "label")
            .attr("x", function(d) { return (d.part == "primary" ? -30 : 30); })
            .attr("y", function(d) { return 6; })
            .text(function(d) { return d.key; return showLabel(d) ? d.key : ""; })
            .attr("text-anchor", function(d) { return (d.part == "primary" ? "end" : "start"); });
        g.selectAll(".mainBars").append("text").attr("class", "perc")
            .attr("x", function(d) { return (d.part == "primary" ? -150 : 150); })
            .attr("y", function(d) { return 6; })
            .text(function(d) { return d3.format("0.0%")(d.percent); })
            .attr("text-anchor", function(d) { return (d.part == "primary" ? "end" : "start"); });
        setStyle();
    };

    //css class相关
    function setStyle() {
        d3.selectAll(".mainBars rect").style("shape-rendering", "auto")
            .style("fill-opacity", 0)
            .style("stroke-width", "0.5px")
            .style("stroke", 'rgb(0, 0, 0)')
            .style("stroke-opacity", 0);
        d3.selectAll(".edges").style("stroke", "none").style("fill-opacity", 0.5);
        d3.selectAll(".subBars").style("shape-rendering", "crispEdges");
        d3.selectAll("line").style("stroke", "grey");
        d3.selectAll("g>text").style("font-size", "12px").style("font-weight", "normal");
    }

    //相关鼠标事件 - 使用全局变量g
    function changeLabel(d, g) {
        g.selectAll(".mainBars").select(".label").text(function(d) { return showLabel(d) ? d.key : ""; });
        g.selectAll(".mainBars").select(".perc").text(function(d) { return showLabel(d) ? d3.format("0.0%")(d.percent) : ""; });
    }

    function showLabel(d) { return showZero || (d.percent >= 0.01); }

    function mouseover(d) {
        bp.mouseover(d);
        changeLabel(d, g);
    }

    function mouseout(d) {
        bp.mouseout(d);
        changeLabel(d, g);
    }
    this.setShowZero = function(v) { showZero = v; };

    //初始化， 加载数据
    this.Init = function() {
        if (data != undefined) this.setData(data);
        if (run != undefined) this.Draw();
    };
    this.Init();

}
//End Class


/*--------------------------------------辅助函数·调用示例-------------------------------------------*/
//获取样例数据1
WorkFlow.getDemoData = function() {
    var temp = ["设计", "开发", "运营", "测试", "维护", "管理", "人事", "财务", "行政", "市场", "前端", "后端", "UI"];
    var dts = [];
    ["运营", "测试", "财务", "行政", "市场"].forEach(function(k) {
        var l = parseInt(Math.random() * temp.length);
        for (var i = 0; i < temp.length; i++) {
            if (temp[i] == k) continue;
            if (Math.random() > 0.5) dts.push([k, temp[i], parseInt(Math.random() * 50)]);
        }
    });
    return dts;
};

//样例数据2
WorkFlow.getDemoData2 = function() {
    return {
        "运营": [
            ["维护", 29],
            ["人事", 14],
            ["财务", 30],
            ["行政", 9],
            ["后端", 47],
            ["UI", 42]
        ],
        "测试": [
            ["运营", 21],
            ["维护", 20],
            ["管理", 16],
            ["财务", 49],
            ["行政", 9],
            ["前端", 25],
            ["UI", 16]
        ],
        "财务": [
            ["测试", 45],
            ["维护", 36],
            ["管理", 26],
            ["人事", 17],
            ["前端", 40],
            ["UI", 9]
        ],
        "行政": [
            ["管理", 29],
            ["人事", 13],
            ["前端", 31],
            ["后端", 13],
            ["UI", 6]
        ],
        "市场": [
            ["运营", 12],
            ["财务", 10],
            ["行政", 34]
        ]
    };
};

WorkFlow.Demo = function(id) {
    return new WorkFlow("view1", WorkFlow.getDemoData(), true);
};


//---------------------------------------调用示例-------------------------------------------------
function ShowWorkFlow(id, data) {
    var wf = new WorkFlow(id);
    wf.setData(data);
    //wf.setShowZero(false);
    wf.Draw();
}
module.exports = ShowWorkFlow;