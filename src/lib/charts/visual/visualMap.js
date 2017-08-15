/**
 * Created by simon on 2017/5/8.
 
依赖：
    china.js            //中国地图
    citys.js            //城市坐标
    echarts.v3.min.js   //图形库
    public.js           //Init3()
    d3.v3.min.js        //d3绘图引擎
    dragTool.js         //addDragTool()
    
 */

/*----------------------------------地图核心程序----------------------------------*/
/*
 描述：整合 人才流动 和 人才分布 图功能
    人才流动：getOptionMap("flowOut") 或 showMapFlow()
    人才分布：getOptionMap("top") 或 showMapTop()
    职能分布：getOptionMap("region")     - 配合饼图，区域放大
    输出图配置项或直接绘图
 输入：
    id - 图形容器div, string
    data - 数据, array with object
        example: [{name:'上海',value:85},{name:'广州',value:90}]
    fDirection - 流动方向， 0-'flowOut' || 1-'flowIn'
    cCity - 中心城市, string
 调用：
    var map = new MapGeo(id, data);
    map.showMapFlow();
    map.showMapTop();
 依赖：
    china.js            //中国地图
    citys.js            //城市坐标
    echarts.v3.min.js   //图形库
    public.js           //Init3()
    d3.v3.min.js        //d3绘图引擎
    dragTool.js         //addDragTool()
 */
require('../china.js');



var getCityPosEx = require('./citys.js');
var province = require('./province.js');
var Init3 = require('./public.js').Init3;
var DragSwitch = require('./dragTool.js');
var ReturnTool = require('./returnTool.js');

function MapGeo(id, data, fDirection, cCity, callbackTop) {
    if (id == undefined || data == undefined) { console.error("实例化错误"); return; }
    var $this = this;
    this.id = id; //图形容器div
    this.maxR = 13; //圆最大半径
    this.flowD = fDirection || 0; //流动方向：0-流出，1-流入
    this.zoom = 8; //地图区域放大比例
    this.data = null;
    this.city = cCity || "";
    this.province = "";
    this.center = [];
    this.myEcharts = null;
    this.level = 10; //显示Top级别， 数据过滤
    this.callbackTop = callbackTop;
    this.dragTool = null; //拖动控件
    MapGeo.flowIn = 'flowIn';
    MapGeo.flowOut = 'flowOut';
    MapGeo.regions = 'region';
    MapGeo.top = 'top';

    var flowPath = 'path://M5,1 L8,10 L5,6 L2,10 L5,2'; //箭头样式 - 自带arrow太难看
    var color = { 'points': '#397ACA', 'hover': '#EA899A', 'lines': '#397ACA', 'center': '#C4DCFC', 'area': '#E6ECF2' };


    //中心区域
    this.changeCity = function(city) {
        $this.city = city || '成都';
        $this.province = province.getProvinceByCity($this.city);
        $this.center = [{ name: $this.province, selected: true, label: { emphasis: { show: false }, normal: { show: true } } }, ];
    };

    this.setData = function(dt) {
        $this.data = dt.sort(function(a, b) { return b.value - a.value; });
        $this.maxV = data.reduce(function(a, b) { return a > b.value ? a : b.value; }, 0);
        $this.scaleS = function(v) { return Math.ceil($this.maxR * v / $this.maxV); }; //线性映射，控制节点大小

        //源数据 - 点
        var dataTop = data.map(function(d) {
            var pos = getCityPosEx(d.name),
                line = { name: d.name, value: pos.concat([d.value]) };
            if (d.value === $this.maxV) line['itemStyle'] = { normal: { color: color.points } };
            return line;
        }); //.concat({ name:"成都", value:[103.9526, 30.7617, 100] })
        $this.dataTop = dataTop.sort(function(a, b) { return b.value[2] - a.value[2]; });
        $this.dataFlow = convertData(data);
    };

    //数据规范化，添加经纬度信息
    function convertData(dt) {
        var res = [],
            fromCoord = getCityPosEx($this.city);
        dt.forEach(function(d, i) {
            var toCoord = getCityPosEx(d.name);
            var line = { fromName: $this.city, toName: d.name, coords: [fromCoord, toCoord] };
            if ($this.flowD == 1) line = { fromName: d.name, toName: $this.city, coords: [toCoord, fromCoord] };
            if (toCoord) res.push(line);
        });
        return res;
    }

    //地图区域及高亮颜色
    var itemStyle = {
        normal: { areaColor: color.area, borderColor: '#F5F6F8', borderWidth: 2, }, //区域样式
        emphasis: { areaColor: color.center }
    };

    //核心配置项，区域+点+线
    var regions = {
        name: '中国',
        type: 'map',
        mapType: 'china',
        selectedMode: false,
        label: { normal: { show: true }, emphasis: { show: true } },
        itemStyle: itemStyle,
        center: [],
        zoom: $this.zoom,
        data: [],
        silent: true //禁止鼠标事件
    };

    //点
    this.getSeriesPoint = function() {
        var points = {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            rippleEffect: { brushType: 'stroke' },
            label: { normal: { show: true, position: 'right', formatter: '{b}' } },
            symbolSize: function(val) { return (val == undefined && 1) || $this.scaleS(val[2]); },
            itemStyle: { normal: { color: color.points }, emphasis: { color: color.hover, opacity: 0.8 } }, //标注点样式
            data: $this.dataTop
        };
        $this.points = points;
        return points;
    };

    //线
    this.getSeriesLine = function() {
        var lines = {
            type: 'lines',
            zlevel: 1,
            symbol: ['none', 'arrow'],
            symbolSize: 10,
            effect: { show: true, period: 6, trailLength: 0, symbolSize: 8, symbol: flowPath },
            lineStyle: { normal: { width: 1, opacity: 0.6, curveness: 0.2, color: color.lines } }, //线条样式
            //label: { emphasis: { textStyle: { color: "blue" }, show: true, formatter: function(p){ console.log(p);} } },
            data: $this.dataFlow
        };
        $this.lines = lines;
        return lines;
    };

    this.getOption = function() {
        return {
            title: { text: '', subtext: '', left: 'center', textStyle: { color: '#fff' } },
            tooltip: {
                trigger: 'item',
                formatter: function(p) {
                    if (p.componentSubType != "effectScatter") return; //暂时不做线条提示
                    return p.name + "<br>人数：" + p.data.value[2] + " ";
                }
            },
            geo: {
                map: 'china',
                label: { emphasis: { show: false } },
                selectedMode: false,
                roam: true,
                itemStyle: itemStyle,
                silent: true,
                zoom: 1.2,
            },
            series: []
        };
    };

    //获取配置项
    this.getOptionMap = function(type) {
        type = type || "top";
        var titles = { 'top': '分布', 'flowOut': '流出', 'flowIn': '流入', 'region': '' }; //type选项
        var opt = $this.getOption();
        if (type in titles) opt.title.text += titles[type];
        opt.title.text = ""; //禁用标题
        if ('region' == type) {
            opt.series.push(regions);
        } else {
            opt.series.push($this.points);
        }
        if ('flowOut' == type || 'flowIn' == type) {
            opt.series.push($this.lines);
            opt.geo.regions = $this.center;
        }
        return opt;
    };

    this.loadLevel = function(level) {
        level = level || 5;
        $this.option.series.forEach(function(ser, i) {
            if (ser.type == "effectScatter") ser.data = (level == $this.dataTop.length) ? $this.dataTop : $this.dataTop.slice(0, level);
            if (ser.type == "lines") ser.data = (level == $this.dataFlow.length) ? $this.dataFlow : $this.dataFlow.slice(0, level);
        });
        $this.myEcharts.setOption($this.option);
    };
    this.loadLevel5 = function() { this.loadLevel(5); }
    this.loadLevel10 = function() { this.loadLevel(10); }

    //拖动选择top5-10
    this.addDragTool = function(option) {
        $this.dragTool = new DragSwitch(id, function(d) {
            $this.level = d < 0.5 ? 5 : 10;
            //option.series.forEach(function(ser, i){
            //    if(ser.type=="effectScatter")ser.data = ($this.topLevel==5 ? $this.dataTop5 : $this.dataTop );
            //    if(ser.type=="lines")ser.data = ($this.topLevel==5 ? $this.dataFlow5 : $this.dataFlow );
            //});
            //$this.myEcharts.setOption(option);
            $this.loadLevel($this.level);
        });
        $this.dragTool.setPos(30, 30); //  设置插件位置
    };

    //返回按钮
    this.addReturnTool = function(callback) {
        $this.returnIcon = new ReturnTool($this.id, function() {
            $this.showMapTop();

            if (callback != undefined) callback();
        });
    };

    this.returnIcon = null;
    this.option = this.getOption();
    this.changeCity(cCity);
    this.setData(data);
    this.getSeriesPoint();
    this.getSeriesLine();


    //---------------------------------------内部调用接口----------------------------------------
    /* 调用示例 */
    // 默认流出
    this.showMapFlow = function(key, level) {
        key = key || (!$this.flowD && 'flowOut') || 'flowIn';
        var opt = $this.option = $this.getOptionMap(key);
        $this.myEcharts = Init3(opt, $this.id);

        // $this.addDragTool(opt);
        if (level != undefined && level < data.length) {
            $this.loadLevel(level);
            // $this.dragTool.setLevel(level / data.length);
        }
    };
    this.showMapFlowOut = function(level) {
        this.showMapFlow('flowOut', level);
    };
    this.showMapFlowIn = function(level) {
        this.showMapFlow('flowIn', level);
    };

    this.showMapTop = function(callback, level) {
        if (callback != undefined) $this.callbackTop = callback;
        $this.option = $this.getOptionMap('top'); //top是底层图
        $this.myEcharts = Init3($this.option, $this.id);

        $this.myEcharts.on("click", function(p) {
            if (p.componentSubType !== "effectScatter") return;
            var city = p.name;

            if ($this.callbackTop !== undefined) $this.callbackTop(city, $this);
        });

        // $this.addDragTool($this.option);
        if (level != undefined && level < data.length) {
            //$this.dragTool.setLevel(level / data.length);
            $this.loadLevel(level);
        }
    };

}
var MG = MapGeo;
//-------------------------------End Class Map--------------------------------------------------------



/*
    人才流动图 - 统一调用
    输入：fDirection: 'flowOut' || 'flowIn'
    流动方向：0-流出，1-流入
*/
function ShowMapFlow(id, data, fDirection, cCity, level) {
    var map = new MapGeo(id, data, fDirection, cCity);
    map.showMapFlow(level);


    return map;
}

//流出
function ShowMapFlowOut(id, data, cCity, level) {
    var map = new MapGeo(id, data, 0, cCity);
    map.showMapFlowOut(level);

    //console.log(map.level);
    //map.loadLevel5();

    return map;
}

//流入
function ShowMapFlowIn(id, data, cCity, level) {
    var map = new MapGeo(id, data, 1, cCity);
    map.showMapFlowIn(level);

    return map;
}

//人才分布图
function ShowMapTop(id, data, callback, level) {
    var map = new MapGeo(id, data, 0);
    map.maxR = 30;
    map.showMapTop(callback, level);

    return map;
}

module.exports = {
    MapGeo: MapGeo,
    ShowMapTop: ShowMapTop,
    ShowMapFlowIn: ShowMapFlowIn,
    ShowMapFlowOut: ShowMapFlowOut,
    ShowWorkFlow: ShowMapFlow
}

/*
var visualMap = {
    left: 'right', top: '10%', dimension: 2,
    min: 0, max: 250,
    itemWidth: 30, itemHeight: 120, calculable: true, precision: 0.1,
    text: ['Top：5-10'], textGap: 30, textStyle: { color: '#fff' },
    inRange: { symbolSize: [10, 70] },
    outOfRange: { symbolSize: [10, 70], color: ['rgba(255,255,255,.2)'] },
    controller: {
        inRange: { color: ['#c23531'] }, outOfRange: { color: ['#444']}
    }
};

*/