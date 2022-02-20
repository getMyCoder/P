function Topological() {
    this.params = null;
    this.canvas = null;
    this.ctx = null;
    this.cacheCanvas = null;
    this.cacheCtx = null;
    this.size = null;

    this.items = {
        width: 100,
        height: 30,
        nodeR: 8,
        speed: 5
    };

    this.dataStructure = null;

    // 每一级的个数
    this.levelNum = new Object();

    // 当前节点
    this.nodeActive=null
}

Topological.prototype = {
    init: function (params) {
        this.params = params;
        this.dataStructure = this.params.data;

        // 标签
        this.canvasActual();

        // 缓存
        this.cache();

        // 整个node渲染
        this.nodeWhole();

        // 鼠标点击事件
        this.clickEvt();

    },
    // 整个node渲染
    nodeWhole: function () {
        // 节点数据处理
        this.nodeHandle();

        // 绘制动画
        this.drawAnimate();
    },
    // 节点数据处理
    nodeHandle: function () {
        // 当前节点的状态
        this.nodeActive=null
        // 处理数据
        this.levelNum = {};
        this.dataHandle(this.dataStructure, 0);

        // 数据
        this.generateDemandData(this.dataStructure, null);
    },
    // 处理数据
    dataHandle: function (d, index) {
        if (!this.levelNum[index]) {
            this.levelNum[index] = 0;
        }
        for (var i = 0; i < d.length; i++) {
            d[i].level = index;
            d[i].level_index = this.levelNum[index];
            this.levelNum[index]++;
            if (d[i].showChildren && d[i].children && d[i].children.length > 0) {
                this.dataHandle(d[i].children, index + 1);
            }
        }
    },
    // 生成坐标数据
    generateDemandData: function (d, pD) {
        for (var i = 0; i < d.length; i++) {
            /**
             *  临时数据的判断
             *      刚开始创建数据为空
             *          初始化的时候，位置为中间
             *          显示隐藏的节点，位置为父节点的按钮处
             *      已经创建，需要节点移动
             */
            // 临时数据，用于动画
            if (!d[i].coordinate) {
                // 节点不存在
                if (!pD) {
                    // 父节点不存在
                    d[i].coordinate = [parseInt(this.size.width * 0.5) + 0.5, parseInt(this.size.height * 0.5) + 0.5];

                    d[i].size = {
                        width: this.items.width,
                        height: this.items.height,
                        _lc: [
                            parseInt(d[i].coordinate[0] - this.items.width * 0.5) + 0.5,
                            d[i].coordinate[1]
                        ],
                        _rc: [
                            parseInt(d[i].coordinate[0] + this.items.width * 0.5) + 0.5,
                            d[i].coordinate[1]
                        ]
                    };
                } else {
                    // 父节点存在
                    d[i].coordinate = pD.coordinate;
                    d[i].size = {
                        width: this.items.width,
                        height: this.items.height,
                        _lc: pD.size._lc,
                        _rc: pD.size._rc
                    };
                }
            } else {
                // 节点存在
                if (d[i].coordinate[0] != d[i]._coordinate[0] || d[i].coordinate[1] != d[i]._coordinate[1]) {
                    d[i].coordinate = d[i]._coordinate;
                    d[i].size = d[i]._size;
                }
            }
            // 数据
            d[i]._coordinate = [
                parseInt((this.size.width / Object.keys(this.levelNum).length) * 0.5) + 0.5 + d[i].level * (parseInt(this.size.width / Object.keys(this.levelNum).length)),
                parseInt(this.size.height / this.levelNum[d[i].level]) * 0.5 + parseInt((this.size.height / this.levelNum[d[i].level]) * d[i].level_index) + 0.5
            ];
            d[i]._size = {
                width: this.items.width,
                height: this.items.height,
                _lc: [
                    parseInt((this.size.width / Object.keys(this.levelNum).length) * 0.5) + 0.5 + d[i].level * (parseInt(this.size.width / Object.keys(this.levelNum).length)) - this.items.width * 0.5,
                    parseInt(this.size.height / this.levelNum[d[i].level]) * 0.5 + parseInt((this.size.height / this.levelNum[d[i].level]) * d[i].level_index) + 0.5
                ],
                _rc: [
                    parseInt((this.size.width / Object.keys(this.levelNum).length) * 0.5) + 0.5 + d[i].level * (parseInt(this.size.width / Object.keys(this.levelNum).length)) + this.items.width * 0.5,
                    parseInt(this.size.height / this.levelNum[d[i].level]) * 0.5 + parseInt((this.size.height / this.levelNum[d[i].level]) * d[i].level_index) + 0.5
                ]
            };
            d[i].speed = [
                (d[i]._coordinate[0] - d[i].coordinate[0]) / this.items.speed,
                (d[i]._coordinate[1] - d[i].coordinate[1]) / this.items.speed
            ];
            if (d[i].showChildren && d[i].children && d[i].children.length > 0) {
                this.generateDemandData(d[i].children, d[i]);
            }
        }
    },
    // 标签
    canvasActual: function () {
        this.canvas = document.getElementById(this.params.id);
        this.ctx = this.canvas.getContext("2d");
        this.size = {
            width: this.canvas.width,
            height: this.canvas.height
        };
    },
    // 缓存
    cache: function () {
        this.cacheCanvas = document.createElement("canvas");
        this.cacheCanvas.width = this.size.width;
        this.cacheCanvas.height = this.size.height;
        this.cacheCtx = this.cacheCanvas.getContext("2d");
    },
    // 绘制动画
    drawAnimate: function () {
        var index = 0, _this = this;
        var time = setInterval(function () {
            index++;
            _this.animateHandle(_this.dataStructure);
            _this.draw(index);
            if (index == _this.items.speed) {
                clearInterval(time);
            }
        }, 30);
    },
    // 动画数据递归处理
    animateHandle: function (d) {
        for (var i = 0; i < d.length; i++) {
            d[i].coordinate = [
                d[i].speed[0] + d[i].coordinate[0],
                d[i].speed[1] + d[i].coordinate[1]
            ];
            d[i].size._rc = [
                d[i].speed[0] + d[i].size._rc[0],
                d[i].speed[1] + d[i].size._rc[1]
            ];
            d[i].size._lc = [
                d[i].speed[0] + d[i].size._lc[0],
                d[i].speed[1] + d[i].size._lc[1]
            ];
            if (d[i].showChildren && d[i].children && d[i].children.length > 0) {
                this.animateHandle(d[i].children);
            }
        }
    },
    // 绘制
    draw: function (index) {
        this.ctx.clearRect(0, 0, this.size.width, this.size.height);
        this.cacheCtx.clearRect(0, 0, this.size.width, this.size.height);
        this.cacheCtx.textAlign = "center";
        this.cacheCtx.textBaseline = "middle";
        this.cacheCtx.lineWidth = 0.5;
        // 绘制数据
        this.drawData(this.dataStructure, index);
        this.ctx.drawImage(this.cacheCanvas, 0, 0, this.size.width, this.size.height);
    },
    // 绘制数据
    drawData: function (d, index) {
        for (var i = 0; i < d.length; i++) {
            // 绘制节点数据
            this.drawNodeData(d[i]);

            // 绘制线条
            this.drawLine(d[i], index);

            // 绘制节点-连接点
            this.drawNode(d[i]);

            if (d[i].showChildren && d[i].children && d[i].children.length > 0) {
                // 绘制数据
                this.drawData(d[i].children);
            }
        }
    },
    // 绘制节点数据
    drawNodeData: function (data) {
        this.cacheCtx.beginPath();
        this.cacheCtx.fillStyle = "#000";
        this.cacheCtx.strokeStyle = "#000";
        this.cacheCtx.font = "normal 16px arial";
        this.cacheCtx.fillText(data.name, data.coordinate[0], data.coordinate[1]);
        this.cacheCtx.strokeRect(
            data.coordinate[0] - data.size.width * 0.5,
            data.coordinate[1] - data.size.height * 0.5,
            data.size.width,
            data.size.height
        );
        this.cacheCtx.stroke();
        this.cacheCtx.fill();
        this.cacheCtx.closePath();
    },
    // 绘制节点-连接点
    drawNode: function (data) {
        if (data.children && data.children.length > 0) {
            var pointStr = data.showChildren ? "-" : "+";
            this.cacheCtx.beginPath();
            this.cacheCtx.fillStyle = "#000";
            this.cacheCtx.strokeStyle = "#000";
            this.cacheCtx.font = "normal 14px arial";
            this.cacheCtx.moveTo(data.size._rc[0], data.size._rc[1]);
            this.cacheCtx.arc(data.size._rc[0], data.size._rc[1], this.items.nodeR, 0, Math.PI * 2, false);
            this.cacheCtx.stroke();
            this.cacheCtx.fill();
            this.cacheCtx.closePath();

            this.cacheCtx.beginPath();
            this.cacheCtx.fillStyle = "#fff";
            this.cacheCtx.strokeStyle = "#fff";
            this.cacheCtx.fillText(pointStr, data.size._rc[0], data.size._rc[1] + 1);
            this.cacheCtx.stroke();
            this.cacheCtx.fill();
            this.cacheCtx.closePath();
        }
    },
    // 绘制线条
    drawLine: function (data, index) {
        if (data.showChildren && data.children && data.children.length > 0) {
            var _c = data.children;
            this.cacheCtx.beginPath();
            this.cacheCtx.strokeStyle = "#000";
            for (var i = 0; i < _c.length; i++) {
                var _s = [data.size._rc[0], data.size._rc[1]];
                var _e = [_c[i].size._lc[0], _c[i].size._lc[1]];
                this.cacheCtx.moveTo(_s[0], _s[1]);
                var _b = this.curvilinear(_s, _e);
                this.cacheCtx.bezierCurveTo(_b[0][0], _b[0][1], _b[1][0], _b[1][1], _e[0], _e[1]);
            }
            this.cacheCtx.stroke();
            this.cacheCtx.closePath();
        }
    },
    // 曲线坐标处理
    curvilinear: function (s, e) {
        // 两个点位的连线上的控制点的位置
        var p01 = null;
        var p02 = null;
        // 连线的斜率的正负
        var _s = (e[1] - s[1]) > 0 ? -1 : 1;
        p01 = [(e[0] - s[0]) / 4 + s[0], s[1] - _s * (Math.abs(s[1] - e[1])) / 4];
        p02 = [((e[0] - s[0]) / 4) * 3 + s[0], s[1] - _s * (Math.abs(s[1] - e[1])) / 4 * 3];
        // 连线的斜率
        var k = Math.abs(s[0] - e[0]) / 2;
        return [[s[0] + k, s[1]], [e[0] - k, e[1]]];
    },
    // 鼠标点击事件
    clickEvt: function () {
        var _this = this;
        this.canvas.onclick = function (e) {
            _this.clickHandleData(
                document.documentElement.scrollLeft+e.clientX - _this.canvas.offsetLeft,
                document.documentElement.scrollTop+e.clientY - _this.canvas.offsetTop,
                _this.dataStructure
            );
            if(_this.nodeActive){
                _this.nodeWhole();
            }
        };
    },
    // 点击事件的数据
    clickHandleData: function (x, y, d) {
        for (var i = 0; i < d.length; i++) {
            var _x_w = Math.abs(x - d[i].size._rc[0]);
            var _y_w = Math.abs(y - d[i].size._rc[1]);
            var _r = Math.pow(Math.pow(_x_w, 2) + Math.pow(_y_w, 2), 0.5);
            if (_r <= this.items.nodeR) {
                d[i].showChildren = !d[i].showChildren;
                if (d[i].showChildren) {
                    this.removePosData(d[i]);
                }
                this.nodeActive=d[i]

            } else {
                if (d[i].showChildren && d[i].children && d[i].children.length > 0) {
                    this.clickHandleData(x, y, d[i].children);
                }
            }
        }
    },
    // 移除坐标数据
    removePosData: function (d) {
        if (d.children && d.children.length > 0) {
            for (var i = 0; i < d.children.length; i++) {
                d.children[i].coordinate = null;
                d.children[i]._coordinate = null;
                d.children[i].size = null;
                d.children[i]._size = null;
                d.children[i].speed = null;
                this.removePosData(d.children[i]);
            }
        }
    }
};

function topological(params) {
    var _Topological = new Topological();
    _Topological.init(params);
    return _Topological;
}