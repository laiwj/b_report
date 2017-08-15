   define([], function() {
       'use strict';
       var xy_select = {
           init: function(settings) {
               if (this.length < 1) { return; };
               // 默认值
               settings = $.extend({
                   containerId: "positionDiv",
                   className: "big-window",
                   nameId: "result",
                   required: true,
                   maxCount: 3,
                   onConfirm: null,
               }, settings);
               this.settings = settings;
               var box_obj = $(this);
               var container = $("#" + settings.containerId);
               var num = settings.containerId;
               var title = "<div class=\"title\"><b>选择职业</b><span class=\"tip\">(最多选择" + settings.maxCount + "项)</span> &nbsp&nbsp;<span class='tip' style='font-weight:bold;' id='tip_" + num + "'></span><a href=\"javascript:void(0)\" ></a></div>";
               var selectedResult = "<div class=\"sele-tag\"><dl><dt>已选择：</dt><dd id='ddResult_" + num + "'><a id='btnSure_" + num + "' href='javascript:void(0)' class='btn'>确定</a></dd></dl></div>";

               if ($("body #" + num + "_bg").length <= 0) {
                   $("body").append("<div id='" + num + "_bg' class='mask-Bg'></div>");
               }
               if (settings.className != null) {
                   container.addClass(settings.className);
               }
               if (settings.source === 'func') {
                   var data = {
                       'positionlist': [
                           { 'p': '核心职能', 'c': [{ 'a': [{ 's': '产品' }, { 's': '设计' }, { 's': '开发' }, { 's': '数据' }, { 's': '测试' }, { 's': 'IT运维' }, { 's': '运营' }, { 's': '市场\&品牌' }, { 's': '销售' }] }] },
                           { 'p': '特殊职能', 'c': [{ 'a': [{ 's': '人力资源' }, { 's': '风控&法务' }, { 's': '财务' }, { 's': '行政\&采购' }, { 's': '公司事务\&投融资' }] }] }
                       ]
                   }
               } else {
                   var data = {
                       'positionlist': [
                           { 'p': '产品', 'c': [{ 'a': [{ 's': '产品经理' }, { 's': '产品助理/产品专员' }, { 's': '产品-管理类' }] }] },
                           { 'p': '设计', 'c': [{ 'a': [{ 's': '网页设计师' }, { 's': '平面设计师' }, { 's': '多媒体设计师' }, { 's': '广告设计师' }, { 's': 'UI设计师' }, { 's': 'UI设计-管理类' }, { 's': '交互设计师' }, { 's': '交互设计－管理类' }, { 's': '用户研究' }, { 's': '用户研究-管理类' }] }] },
                           { 'p': '开发', 'c': [{ 'a': [{ 's': 'web前端开发' }, { 's': '前端开发-html5' }, { 's': 'android工程师' }, { 's': 'ios工程师' }, { 's': '后端开发－java' }, { 's': '后端开发－python' }, { 's': '后端开发－php' }, { 's': '后端开发－c' }, { 's': '后端开发－c++' }, { 's': '全栈工程师' }, { 's': '架构师' }, { 's': '开发-管理类' }, { 's': '项目管理' }] }] },
                           { 'p': '数据', 'c': [{ 'a': [{ 's': '算法工程师' }] }] },
                           { 'p': '测试', 'c': [{ 'a': [{ 's': '测试开发' }, { 's': '测试工程师' }, { 's': '自动化测试' }, { 's': '功能测试' }, { 's': '性能测试' }, { 's': '白盒测试' }, { 's': '灰盒测试' }, { 's': '黑盒测试' }, { 's': '测试－管理类' }] }] },
                           { 'p': 'IT运维', 'c': [{ 'a': [{ 's': '网络运维' }, { 's': '系统工程师' }, { 's': '系统管理员' }, { 's': 'IT支持' }, { 's': '安全运维' }, { 's': '运维工程师' }, { 's': '运维-管理类' }, { 's': 'DBA－oracle' }, { 's': 'DBA－etl' }, { 's': 'DBA' }] }] },
                           { 'p': '运营', 'c': [{ 'a': [{ 's': '产品运营' }, { 's': '内容运营' }, { 's': '主编' }, { 's': '编辑' }, { 's': '记者' }, { 's': '数据运营' }, { 's': '用户运营' }, { 's': '活动运营' }, { 's': '媒体运营' }, { 's': '媒体运营' }, { 's': '海外运营' }, { 's': '运营-综合' }, { 's': '运营-管理类' }, { 's': '售后客服' }, { 's': '售后工程师' }, { 's': '在线客服' }, { 's': '客服经理' }, { 's': '客服-管理类' }] }] },
                           { 'p': '市场&品牌', 'c': [{ 'a': [{ 's': 'SEM' }, { 's': 'SEO' }, { 's': '网络推广' }, { 's': '市场策划' }, { 's': '市场推广' }, { 's': '海外市场' }, { 's': '市场营销' }, { 's': '市场营销-管理类' }, { 's': '品牌推广' }, { 's': '媒介' }, { 's': '公关' }, { 's': '公关-管理类' }] }] },
                           { 'p': '销售', 'c': [{ 'a': [{ 's': '业务开发－BD' }, { 's': '电话销售' }, { 's': '渠道销售' }, { 's': '商务' }, { 's': '售前客服' }, { 's': '售前工程师' }, { 's': '在线销售' }, { 's': '大客户代表' }, { 's': '综合销售' }, { 's': '销售助理' }, { 's': '销售－管理类' }] }] },
                           { 'p': '风控&法务', 'c': [{ 'a': [{ 's': '法务' }, { 's': '律师' }, { 's': '专利' }, { 's': '审计' }, { 's': '风控管理' }] }] },
                           { 'p': '人力资源', 'c': [{ 'a': [{ 's': '薪酬福利' }, { 's': '绩效管理' }, { 's': '招聘' }, { 's': '培训' }, { 's': '组织发展' }, { 's': 'RBP' }, { 's': '员工关系' }, { 's': '企业文化' }, { 's': 'HR-综合' }, { 's': 'HR-管理类' }] }] },
                           { 'p': '行政&采购', 'c': [{ 'a': [{ 's': '文秘' }, { 's': '前台' }, { 's': '行政-综合' }, { 's': '行政-管理类' }, { 's': '供应商管理' }, { 's': '采购' }, { 's': '采购－管理类' }] }] },
                           { 'p': '财务', 'c': [{ 'a': [{ 's': '会计' }, { 's': '出纳' }, { 's': '税务' }, { 's': '结算' }, { 's': '预算' }, { 's': '财务-综合' }, { 's': '财务－管理类' }] }] },
                           { 'p': '公司事务&投融资', 'c': [{ 'a': [{ 's': '公司事务&投资者关系' }, { 's': '融资' }, { 's': '投资' }] }] },
                       ]
                   };
               }
               if ($.trim(container.html()) == "") {
                   container.append(title);
                   container.append(selectedResult);
                   container.append("<div class=\"position-menu\" id='" + num + "_datalist'></div>");
                   var datalist = $("#" + num + "_datalist");
                   datalist.append("<div class='menu' id='firstMenu'></div>");
                   var firstMenu = datalist.find("#firstMenu");
                   firstMenu.append("<ul></ul>");
                   $.each(data.positionlist, function(i, obj) { // 循环第一级
                       $(firstMenu).find("ul").append("<li id='dl_" + i + "' name='" + i + "'>" + obj.p + "</li>");
                   });

                   if (datalist.find("div[class='sub-menu']").length <= 0) {
                       datalist.append("<div class='sub-menu' id='secondMenu'></div>");
                   }
                   var secondMenu = datalist.find("#secondMenu");

                   // 第一级菜单鼠标悬浮事件，弹出二级菜单和三级菜单项
                   $("#" + num + "_datalist #firstMenu ul li").bind("mouseover", function() {
                       secondMenu.html("");
                       $("#" + num + "_datalist #firstMenu ul li").removeClass("sele");
                       $(this).addClass("sele");

                       var index = $(this).attr("name");
                       $.each(data.positionlist[index].c, function(j, item) {
                           secondMenu.append("<dl id='dl_" + j + "'></dl>");
                           // var dtItem = "<dt id='dt_" + j + "'>" + item.n + "</dt>";
                           // secondMenu.find("dl[id='dl_" + j + "']").append(dtItem);
                           secondMenu.find("dl[id='dl_" + j + "']").append("<dd id='dd_" + j + "'></dd>");
                           $.each(data.positionlist[index].c[j].a, function(m, dist) {
                               var threeMenu = "<a href='javascript:void(0)' id='item_" + index + "_" + j + "_" + m + "'>" + dist.s + "</a>";
                               secondMenu.find("dl[id='dl_" + j + "'] dd[id='dd_" + j + "']").append(threeMenu);

                           });
                       });

                       //根据已选择的项，将相同的列表展示项添加样式
                       var resultItems = container.find("#ddResult_" + num + " a");
                       $.each(resultItems, function(n, ritem) {
                           var rid = $(ritem).attr("id").substr(2, $(ritem).attr("id").length);
                           secondMenu.find("a[id='" + rid + "']").addClass("sele");
                       });

                       // 列表项点击事件，选中则在结果容器中显示添加选中样式
                       secondMenu.find("a").bind("click", function(e) {
                           var selectedCount = container.find("#ddResult_" + num + " a").length - 1;

                           if ($(this).hasClass("sele")) {
                               $(this).removeClass("sele");
                               container.find("#ddResult_" + num).find("a[id='c_" + $(this).attr("id") + "']").remove();
                           } else {
                               if (selectedCount >= settings.maxCount) {
                                   container.find("#tip_" + num).html("最多只能选择" + settings.maxCount + "项！").css("color", "red");
                                   setTimeout(function() {
                                       container.find("#tip_" + num).empty();
                                   }, 3000);
                               } else {
                                   $(this).addClass("sele");
                                   container.find("#ddResult_" + num + " #btnSure_" + num).before("<a href='javascript:void(0);' id='c_" + $(this).attr("id") + "'>" + $.trim($(this).html()) + "</a>");
                               }
                           }

                           // 结构容器中选中项点击事件，移除并将列表中的选中样式取消
                           container.find("#ddResult_" + num + " a").bind("click", function() {
                               var rid = $(this).attr("id");
                               if (rid != "btnSure_" + num) {
                                   var sid = rid.substr(2, rid.length);
                                   $(this).remove();
                                   secondMenu.find("a[id='" + sid + "']").removeClass("sele");
                               }
                           });
                       });

                   });

                   // 默认显示第一级
                   $(firstMenu).find("ul li:first").addClass("sele").trigger("mouseover");


                   // 关闭选择框
                   container.find(".title a").bind("click", function() {
                       container.hide();
                       $("#" + num + "_bg").hide();
                   });

                   // 确定
                   container.find("#ddResult_" + num + " a[id='btnSure_" + num + "']").bind("click", function() {
                       var selectedItems = container.find("#ddResult_" + num + " a[id!='btnSure_" + num + "']");
                       var results = "";
                       $.each(selectedItems, function(i, item) {
                           results += $.trim($(item).text()) + ",";
                       });
                       if (results.length > 0) {
                           results = results.substr(0, results.length - 1);
                       }
                       xy_select.setValue(results);
                       container.hide();
                       $("#" + num + "_bg").hide();
                   });

               }
               container.show();
               $("#" + num + "_bg").show();
           },
           setValue: function(value) {
               this.settings.setValue(value);
           }
       }
       return xy_select;
   });