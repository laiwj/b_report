/**
 * Created by oncej on 17/05/29.
 */
var avalon = require("./lib/avalon/avalon.shim");

var host = require('./config').requestHost();
var getCookie = require('./config').getCookie;
require('bootstrap/dist/css/bootstrap.min.css');
require('bootstrap/dist/js/bootstrap.min.js');
require('./assets/css/reset.css');
require('./assets/css/common.css');
require('./assets/css/menu/menu.css');
require("./lib/oniui/mmRequest/mmRequest");
require("./lib/oniui/mmRouter/mmState");
var root = avalon.define({
    $id: "root",
    userName: getCookie('userName') || '',
    message: '',
    menuShow: true,
    showLoading: false,
    isLogin: false,
    register: {
        account: '',
        password: ''
    },
    bodyClick: function() {
        $('.dropDown').removeClass('show');
        $('.menuList>li>a').removeClass('active');
    },
    menuList: [{
            name: '热点分析',
            href: '/',
            children: [
                { name: '人才分布', href: '#!/talentDistribution' },
                { name: '人才供需', href: '#!/supplyDemand' },
                { name: '人才流动', href: '#!/talentFlow' },
                { name: '人才薪酬', href: '#!/hotSpotAnalysis' }
            ]
        },
        {
            name: '薪酬分析',
            href: "/",
            children: [
                { name: '职能薪酬', href: '#!/funcPayAnalysis' },
                { name: '岗位薪酬', href: '#!/stationPayAnalysis' }
            ]
        }
    ],
    menuClick: function(index, e) {
        e.preventDefault();
        e.stopPropagation();
        $('.menuList>li>a').removeClass('active');
        $(this).parent().siblings().find('.dropDown').removeClass('show');
        $(this).toggleClass('active').parent().find('.dropDown').toggleClass('show');
    },
    menuChildrenClick: function(e) {
        e.stopPropagation();
        $('.menuList>li>a').removeClass('active');
        $(this).parent().removeClass('show').parent().children('a').addClass('active');
    },
    loginout: function() {
        $.get(host + "/user/logout", function(data) {
            this.isLogin = false;
            avalon.router.go('login');
        })
    },
    showMessage: function(message) {
        this.message = message;
        setTimeout(function() {
            root.message = '';
        }, 2000);
    },
});

avalon.state("distribution", {
    url: "/talentDistribution",
    views: {
        "": {
            //配置模块模板和控制器
            templateProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function(tt) {
                        rs(require("text!./modules/talentDistribution/talentDistribution.html"))
                    })
                })
            },
            controllerProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function() {
                        rs(require("./modules/talentDistribution/talentDistribution.js"))
                    })
                })
            }
        }
    },

});
avalon.state("homePage", {
    url: "/homePage",
    views: {
        "": {
            //配置模块模板和控制器
            templateProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function(tt) {
                        rs(require("text!./modules/homePage/homePage.html"))
                    })
                })
            },
            controllerProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function() {
                        rs(require("./modules/homePage/homePage.js"))
                    })
                })
            }
        }
    },

});
avalon.state("login", {
    url: "/login",
    views: {
        "": {
            //配置模块模板和控制器
            templateProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function(tt) {
                        rs(require("text!./modules/login/login.html"))
                    })
                })
            },
            controllerProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function() {
                        rs(require("./modules/login/login.js"))
                    })
                })
            }
        }
    },
    onEnter: function() {
        root.menuShow = false;
    },
    onExit: function() {
        this.visited = false;
        root.menuShow = true;

    }

});
avalon.state("register", {
    url: "/register",
    views: {
        "": {
            //配置模块模板和控制器
            templateProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function(tt) {
                        rs(require("text!./modules/register/register.html"))
                    })
                })
            },
            controllerProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function() {
                        rs(require("./modules/register/register.js"))
                    })
                })
            }
        }
    },
    onEnter: function() {
        root.menuShow = false;

    },
    onExit: function() {
        root.menuShow = true;

    }
});
avalon.state("flow", {
    url: "/talentFlow",
    views: {
        "": {
            //配置模块模板和控制器
            templateProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function(tt) {
                        rs(require("text!./modules/talentFlow/talentFlow.html"))
                    })
                })
            },
            controllerProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function() {
                        rs(require("./modules/talentFlow/talentFlow.js"))
                    })
                })
            }
        }
    }

});
avalon.state("exponention", {
    url: "/supplyDemand",
    views: {
        "": {
            //配置模块模板和控制器
            templateProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function(tt) {
                        rs(require("text!./modules/supplyDemand/supplyDemand.html"))
                    })
                })
            },
            controllerProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function() {
                        rs(require("./modules/supplyDemand/supplyDemand.js"))
                    })
                })
            }
        }
    }
});
avalon.state("hotSpotAnalysis", {
    url: "/hotSpotAnalysis",
    views: {
        "": {
            //配置模块模板和控制器
            templateProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function(tt) {
                        rs(require("text!./modules/hotSpotAnalysis/hotSpotAnalysis.html"))
                    })
                })
            },
            controllerProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function() {
                        rs(require("./modules/hotSpotAnalysis/hotSpotAnalysis.js"))
                    })
                })
            }
        }
    }
});
avalon.state("funcPayAnalysis", {
    url: "/funcPayAnalysis",
    views: {
        "": {
            //配置模块模板和控制器
            templateProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function(tt) {
                        rs(require("text!./modules/funcPayAnalysis/funcPayAnalysis.html"))
                    })
                })
            },
            controllerProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function() {
                        rs(require("./modules/funcPayAnalysis/funcPayAnalysis.js"))
                    })
                })
            }
        }
    }
});
avalon.state("stationPayAnalysis", {
    url: "/stationPayAnalysis",
    views: {
        "": {
            //配置模块模板和控制器
            templateProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function(tt) {
                        rs(require("text!./modules/stationPayAnalysis/stationPayAnalysis.html"))
                    })
                })
            },
            controllerProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function() {
                        rs(require("./modules/stationPayAnalysis/stationPayAnalysis.js"))
                    })
                })
            }
        }
    }
});
avalon.state("setting", {
    url: "/setting",
    views: {
        "": {
            //配置模块模板和控制器
            templateProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function(tt) {
                        rs(require("text!./modules/setting/setting.html"));
                    });
                });
            },
            controllerProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function() {
                        rs(require("./modules/setting/setting.js"));
                    });
                });
            }
        }
    }
});
avalon.state("404", {
    url: "/404",
    views: {
        "": {
            //配置模块模板和控制器
            templateProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function(tt) {
                        rs(require("text!./modules/404/404.html"));
                    });
                });
            },
            controllerProvider: function() {
                return new Promise(function(rs) {
                    require.ensure([], function() {
                        rs(require("./modules/404/404.js"));
                    });
                });
            }
        }
    }
});
/**
 * 路由全局配置
 */
avalon.state.config({
    onError: function() {
        console.log(arguments);
    }
});
avalon.history.start({
    basepath: "/#!/",
    root: "/login"
});
avalon.router.get('/', function() {
    avalon.router.go('login');
})
avalon.router.error(function() {
        avalon.router.go('login');
    })
    //开始扫描编译
avalon.scan();