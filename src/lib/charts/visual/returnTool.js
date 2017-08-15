/**
 * Created by Administrator on 2017/5/23.
 */

/*
 依赖：d3.v4.min.js

 功能：绘制拖动开关小插件
 输入：id - 父容器ID, callback - 拖动触发事件

*/
var d3 = require('../d3.v4.min.js');

function ReturnTool(id, callback, show) {
    "use strict";

    var $this = this;
    this.parentId = id;
    var width = document.getElementById(id).clientWidth;
    var config = { 'x': width - 50, "y": 20, 'width': 50, 'height': 50 };
    var svg = d3.select("#" + $this.parentId).append("svg").style("z-index", 999)
        .attr("width", config.width).attr("height", config.height)
        .style("position", "absolute").style("top", config.y).style("left", config.x)
        .style("cursor", "pointer");
    this.svg = svg;
    this.callback = callback;

    var path = ["M66.915,33.457C66.915,15.009,51.906,0,33.458,0C15.009,0,0,15.009,0,33.457c0,18.449,15.009,33.458,33.458,33.458    C51.907,66.915,66.915,51.906,66.915,33.457z M4,33.457C4,17.215,17.215,4,33.458,4s29.457,13.215,29.457,29.457 c0,16.243-13.214,29.458-29.457,29.458S4,49.7,4,33.457z",
        "M21.761,35.201h28.708c1.104,0,2-0.896,2-2s-0.896-2-2-2H21.512l8.045-7.855c0.781-0.781,0.781-1.952,0-2.733    s-2.048-0.734-2.828,0.047L15.394,32.02c-0.375,0.375-0.586,0.896-0.586,1.426s0.211,1.045,0.586,1.42L26.73,46.203 c0.391,0.391,0.902,0.587,1.414,0.587s1.024-0.194,1.415-0.585c0.781-0.781,0.781-2.237,0-3.018L21.761,35.201z"

    ];

    svg.append("g").selectAll("path").data(path).enter().append("path").attr("d", function(d) { return d; }).attr("stroke", "#ccc")
        .attr("stroke-width", 2).attr("fill", "#111").attr("transform", "scale(0.4)");
    this.show = function() { svg.attr("display", "normal"); };
    this.hide = function() { svg.attr("display", "none"); };
    if (show != undefined) this.hide();
    svg.on('click', function() { $this.hide(); if ($this.callback !== undefined) $this.callback(); });
}
//End Class


function AddReturn(id, callback) {
    var ir = new ReturnTool(id, callback);
    return ir;
}
module.exports = ReturnTool