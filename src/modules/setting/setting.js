require('../../assets/css/setting/setting.css');
var host = require('../../config').requestHost();
var format = require('../../config').format;
var settingVm = avalon.define({
    $id: 'setting',
    message: '',
    defaultData: {
        industry: "互联网全行业",
        sub_industry: '金融运营'
    },
    collectionList: [],
    downloadList: [],
    count: [],
    noChecked: false,
    downloadItem: '',
    index: 0,
    current: 1,
    allSelect: function() {
        var isChecked = $(this)[0].checked;
        $('#collectTable').find('input[type="checkbox"]').prop('checked', isChecked);
        settingVm.noChecked = !isChecked;
    },
    childSelect: function() {
        var isChecked = true;
        var all = $('#collectTable').children('tbody').find('input[type="checkbox"]');
        all.each(function(i, el) {
            if (!el.checked) {
                $('#all').prop('checked', false);
                isChecked = false;
                return false;
            } else {
                settingVm.noChecked = false;
            }

        });
        isChecked ? $('#all').prop('checked', true) : null;


    },
    selectItem: function(e, type) {
        e.preventDefault();
        var name = type === 1 ? 'industry' : 'sub_industry';
        settingVm.defaultData[name] = $(this).text();
    },
    modifyIndustry: function(e) {
        e.preventDefault();
        $.post(host + '/user/modify/industry?' + new Date().getTime(), {
            industry: settingVm.defaultData.industry
        }, function(result) {
            if (result.code === -10 || result.code === -11) {
                avalon.vmodels.root.showMessage(result.msg);
                avalon.router.go('login');
            }
            if (result.code === 0) {
                avalon.vmodels.root.showMessage('默认行业修改成功!');
            } else {
                avalon.vmodels.root.showMessage(result.msg);
            }
        })
    },
    modifySubIndustry: function(e) {
        e.preventDefault();
        $.post(host + '/user/modify/subindustry?' + new Date().getTime(), {
            sub_industry: settingVm.defaultData.sub_industry
        }, function(result) {
            if (result.code === -10 || result.code === -11) {
                avalon.vmodels.root.showMessage(result.msg);
                avalon.router.go('login');
            }
            if (result.code === 0) {
                avalon.vmodels.root.showMessage('默认子行业修改成功!');
            } else {
                avalon.vmodels.root.showMessage(result.msg);
            }
        })
    },
    getDefaultIndustry: function() {
        $.get(host + '/user/defualt_industry', function(result) {
            if (result.code === -10 || result.code === -11) {
                avalon.vmodels.root.showMessage(result.msg);
                avalon.router.go('login');
            }
            if (result.code === 0) {
                result.data.sub_industry = result.data.sub_industry || '金融运营';
                result.data.industry = result.data.industry || '互联网全行业';
                settingVm.defaultData = result.data;
            } else {
                avalon.vmodels.root.showMessage(result.msg);
            }
        })
        this.getCollectionList(1);
    },
    //获取收藏列表
    getCollectionList: function(page) {
        avalon.vmodels.root.showLoading = true;
        $.post(host + '/report/collect/list', {
            page: page || 1,
            pageSize: 10
        }, function(data) {
            if (data.code === -10 || data.code === -11) {
                avalon.vmodels.root.showMessage(data.msg);
                avalon.router.go('login');
            }
            if (data.code === 0) {
                if (settingVm.index === 0) {
                    var page = Math.ceil(Number(data.data.count) / 10);
                    for (var i = 1; i < page + 1; i++) {
                        settingVm.count.push(i);
                    }
                    settingVm.getDownloadList(1);
                }
                settingVm.current = data.data.page;
                settingVm.index++;
                var temp = data.data.data;
                settingVm.collectionList = [];
                for (var i = 0; i < temp.length; i++) {
                    temp[i].collect_time = format(temp[i].collect_time, 'yyyy-MM-dd HH:mm:ss');
                    settingVm.collectionList.push(temp[i]);
                }

            } else {
                avalon.vmodels.root.showMessage(data.msg);
            }
            avalon.vmodels.root.showLoading = false;
        })
    },
    //获取下载列表
    getDownloadList: function(page) {
        $.post(host + '/report/download/list', {
            page: page || 1,
            pageSize: 10
        }, function(data) {
            if (data.code === 0) {
                var temp = data.data.data;
                for (var i = 0; i < temp.length; i++) {
                    temp[i].download_time = format(temp[i].download_time, 'yyyy-MM-dd HH:mm:ss');
                }
                settingVm.downloadList = temp;
            } else {
                avalon.vmodels.root.showMessage(data.msg);
            }
        })
    },
    //获取选中的信息
    getCheckData: function(arg) {
        var idArr = [],
            dataIdArr = [],
            item = $('#collectTable').children('tbody').find('input[type="checkbox"]:checked');
        if (item.length == 0) {
            return false;
        }
        item.each(function(i, el) {
            idArr.push($(el).attr('id'));
            dataIdArr.push($(el).attr('data-id'));
        });
        switch (arg) {
            case "":
                return true;
            case "id":
                return idArr;
            case "data-id":
                return dataIdArr;
        }
    },
    checkDelete: function() {
        var _result = settingVm.getCheckData("");
        if (_result) {
            $('#deleteItem').modal('show');
        }

    },
    checkDownload: function() {
        var _result = settingVm.getCheckData();
        if (_result) {
            $('#downloadItem').modal('show');
        }
    },
    //删除收藏条目
    deleteCollectionItem: function() {
        var _result = settingVm.getCheckData("id");
        var bean = {
            report_id: _result.join(",")
        }
        $.post(host + '/report/collect/del', bean, function(data) {
            if (data.code === 0) {
                $('#deleteItem').modal('hide');
                avalon.vmodels.root.showMessage('删除成功！');
                settingVm.count = [];
                settingVm.getCollectionList(1);
            }
        })
    },
    //分享收藏条目
    checkShare: function() {
        var _result = settingVm.getCheckData("data-id");
        $("#shareImg").attr("src", host + '/report/share?data_ids=' + _result.join(","));

        $('#erweima').modal('show');

    },
    //下载收藏条目
    DownloadItem: function() {
        var arr = [];
        var item = $('#collectTable').children('tbody').find('input[type="checkbox"]:checked');
        item.each(function(i, el) {
            var temp = {
                report_name: '',
                data_id: '',
                info_id: '',
                type: $('input[name="format"]:checked').val()
            }
            arr.push(temp);
        });
        $.post(host + '/report/download', { report_id: arr }, function(data) {
            if (data.code === 0) {
                $('#downloadItem').modal('hide');
                avalon.vmodels.root.showMessage('删除成功！');
                settingVm.collectionList.splice(settingVm.colletionItem, 1);
            }
        })
    },
    turnPage: function(page, e) {
        e.preventDefault();
        if ($(this).hasClass('active')) {
            return false
        }
        $(this).addClass('active').siblings().removeClass('active');
        settingVm.getCollectionList(page);

    },
    preAndBack: function(e, type) {
        e.preventDefault();
        var current = settingVm.current;

        if (type === 'pre') {
            if (parseInt(current) - 1 === 0) {
                return false
            }
            settingVm.getCollectionList(current - 1);
        } else {
            if (parseInt(current) + 1 > settingVm.count.length) {
                return false
            }
            settingVm.getCollectionList(current + 1);
        }
    }
});
module.exports = avalon.controller(function($ctrl) {
    // 视图渲染后，意思是avalon.scan完成
    $ctrl.$onRendered = function() {}
        // 进入视图
    $ctrl.$onEnter = function() {
        settingVm.index = 0;
        settingVm.count = [];
        settingVm.getDefaultIndustry();

    }

    // 对应的视图销毁前
    $ctrl.$onBeforeUnload = function() {}
        // 指定一个avalon.scan视图的vmodels，vmodels = $ctrl.$vmodels.concact(DOM树上下文vmodels)
    $ctrl.$vmodels = []
})