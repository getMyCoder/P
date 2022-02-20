function Chess(){
    this.canvas=null
    this.ctx=null
    this.cacheCanvas=null;
    this.cacheCtx=null;
    this.size={
        rows:15,
        columns:15,
        step:40,
        padding:70.5,
        width:700,
        height:700,
        color:"#e2b98e",
        // color:"#fff",
        lineColor:"#666",
        // lineColor:"#f1f1f1",
        hoverColor:"rgba(255,0,0,0.5)"
    }
    this.matrix=[
        // //y
        // [//x
        //     {type: "0", x: 0, y: 0, axisX: 0, axisY: 0},
        //     {type: "0", x: 1, y: 0, axisX: 0, axisY: 0},
        //     {type: "0", x: 2, y: 0, axisX: 0, axisY: 0}
        // ],
        // [//x
        //     {type: "0", x: 0, y: 1, axisX: 0, axisY: 0},
        //     {type: "0", x: 1, y: 1, axisX: 0, axisY: 0},
        //     {type: "0", x: 2, y: 1, axisX: 0, axisY: 0}
        // ],
        // [//x
        //     {type: "0", x: 0, y: 2, axisX: 0, axisY: 0},
        //     {type: "0", x: 1, y: 2, axisX: 0, axisY: 0},
        //     {type: "0", x: 2, y: 2, axisX: 0, axisY: 0}
        // ]
    ];
    this.piece={
        size:10,
        type:{
            "1":{ //我方
                color:"red",
                // color:"#d1d1d1",
            },
            "2":{ //对方
                color:"#000",
                // color:"#f1f1f1",
            }
        }
    }

    // 算法
    this._algorithm=null

}
Chess.prototype={
    init:function (params){
        this._algorithm=this.singletonMode()

        // 标签
        this.canvasLabel()

        // 缓存
        this.cache()

        // 数据结构
        this.handleData()

        // 绘制初始化
        this.drawInit()

        // 事件
        this.evtDraw()
    },
    // 标签
    canvasLabel:function (){
        this.canvas = document.getElementById("canvas");
        this.ctx= this.canvas.getContext("2d");
    },
    // 缓存
    cache:function (){
        this.cacheCanvas=document.createElement('canvas')
        this.cacheCanvas.width=this.size.width
        this.cacheCanvas.height=this.size.height
        this.cacheCtx= this.cacheCanvas.getContext("2d");
    },
    // 绘制初始化
    drawInit:function (params){
        // 绘制棋盘
        this.drawChessDisc(params?params:{})

        // // 棋子
        // this.drawPiece()
    },
    // 初始化数据结构
    handleData(){
        for (var i = 0; i <this.size.rows; i++) {
            this.matrix.push([])
            for (var j = 0; j <this.size.columns; j++) {
                this.matrix[i].push({
                    // type:Math.round(Math.random() * 1)+1,
                    type:null,
                    x: j,
                    y: i,
                    axisX: j*this.size.step,
                    axisY: i*this.size.step
                })
            }
        }
        // this.matrix=dataChess
    },
    // 绘制棋盘
    drawChessDisc:function (params){
        this.cacheCtx.clearRect(0,0,this.cacheCanvas.width,this.cacheCanvas.height)
        this.ctx.clearRect(0,0,this.cacheCanvas.width,this.cacheCanvas.height)

        // 绘制棋盘
        this.cacheCtx.beginPath()
        this.cacheCtx.strokeStyle=this.size.lineColor
        this.cacheCtx.fillStyle=this.size.color
        this.cacheCtx.lineWidth=1
        this.cacheCtx.fillRect(0,0,this.size.width,this.size.height)
        for (var i =0; i <this.size.rows; i++) {
            this.cacheCtx.moveTo(this.size.padding,this.size.padding+this.size.step*i)
            this.cacheCtx.lineTo(this.size.width-this.size.padding,this.size.padding+this.size.step*i)
            this.cacheCtx.strokeText(i, this.size.padding-10,this.size.padding+this.size.step*i+5);//删除
        }
        for (var j =0; j <this.size.columns; j++) {
            this.cacheCtx.moveTo(this.size.padding+this.size.step*j,this.size.padding)
            this.cacheCtx.lineTo(this.size.padding+this.size.step*j,this.size.height-this.size.padding)
            this.cacheCtx.strokeText(j,this.size.padding+this.size.step*j-5,this.size.padding-10);//删除
        }

        this.cacheCtx.stroke()
        this.cacheCtx.fill()
        this.cacheCtx.closePath()

        // 绘制棋子
        this.drawPiece()

        // 其他样式
        if(params.callback){
            params.callback()
        }
        // 绘制
        this.ctx.drawImage(this.cacheCanvas,0,0,this.cacheCanvas.width,this.cacheCanvas.height)

    },
    // 棋子
    drawPiece:function (){
        this.matrix.forEach((v)=>{
            v.forEach((vv)=>{
                // 空的节点
                if(!vv.type) return;

                this.cacheCtx.beginPath()
                this.cacheCtx.fillStyle=this.piece.type[vv.type].color
                this.cacheCtx.moveTo(this.size.padding+vv.axisX-this.piece.size*0.5+5,this.size.padding+vv.axisY-this.piece.size*0.5+5)
                this.cacheCtx.arc(
                        this.size.padding+vv.axisX-this.piece.size*0.5+5,
                        this.size.padding+vv.axisY-this.piece.size*0.5+5,
                        this.piece.size,
                        0,
                        Math.PI*2,
                        false
                    )
                this.cacheCtx.fill()
                this.cacheCtx.closePath()
            })
        })

        this.ctx.drawImage(this.cacheCanvas,0,0,this.cacheCanvas.width,this.cacheCanvas.height)
    },
    // 事件
    evtDraw:function (){
        // 鼠标经过样式
        this.hoverStyle()

        // 定位
        this.point()

    },
    // 鼠标经过样式
    hoverStyle:function (){
        var _this=this,_p={}
        this.canvas.onmousemove=function (e){
            _p.x=e.clientX - _this.canvas.offsetLeft - _this.size.padding
            _p.y=e.clientY - _this.canvas.offsetTop - _this.size.padding
            if(_p.x<0 || _p.x>_this.size.width - _this.size.padding*2 || _p.y<0 || _p.y>_this.size.height- _this.size.padding*2) return
            _p.axisX=Math.round(_p.x / _this.size.step)*_this.size.step
            _p.axisY=Math.round(_p.y / _this.size.step)*_this.size.step

            // 绘制初始化
            _this.drawInit({
                callback:function (){
                    _this.cacheCtx.beginPath()
                    _this.cacheCtx.fillStyle=_this.size.hoverColor
                    _this.cacheCtx.moveTo(_this.size.padding+_p.axisX-_this.piece.size*0.5+5,_this.size.padding+_p.axisY-_this.piece.size*0.5+5)
                    _this.cacheCtx.arc(
                        _this.size.padding+_p.axisX-_this.piece.size*0.5+5,
                        _this.size.padding+_p.axisY-_this.piece.size*0.5+5,
                        _this.piece.size,
                        0,
                        Math.PI*2,
                        false
                    )
                    _this.cacheCtx.fill()
                    _this.cacheCtx.closePath()
                }
            })

        }
        this.canvas.onmouseout=function (){
            _this.drawInit()
        }
    },
    // 定位
    point:function (){
        var _this=this,_p={}
        this.canvas.onclick=function (e){
            _p.x=e.clientX - _this.canvas.offsetLeft - _this.size.padding
            _p.y=e.clientY - _this.canvas.offsetTop - _this.size.padding
            _p.axisX=Math.round(_p.x / _this.size.step)
            _p.axisY=Math.round(_p.y / _this.size.step)
            _this.matrix.forEach(function (v,index){
                if(index!==_p.axisY) return;
                v.forEach(function (vv,i){
                    if(vv.x==_p.axisX && !vv.type){
                        vv.type="1"
                    }
                })
            })

            // AI
            var aiValue=_this.algorithm()
            var x_y_v=aiValue.value
            // console.log(x_y_v);
            // console.log(_this.matrix);
            _this.matrix[x_y_v.y][x_y_v.x].type="2"

            // 重新绘制
            _this.drawInit()

            // 判断输赢
            aiValue.fn.win(function (val){
                document.getElementById('win').innerHTML=((val=="1")?"你赢了":"你输了")
                _this.canvas.onclick=null
                _this.canvas.onmousemove=null
                _this.canvas.onmouseout=null
            })
        }

    },
    // 算法
    algorithm(){
        var calculation=this._algorithm(function (){
            return new Algorithm()
        })
        calculation.init(this.matrix)
        return {
            value:calculation.AiNode(),
            fn:calculation
        }
    },
    // 单例
    singletonMode(){
        var timer=null
        return function (fn){
            if(!timer){
                timer=fn.apply(this,arguments)
            }
            return timer
        }
    },
}

// 算法
function Algorithm(){
    this.dataChess=null
}
Algorithm.prototype={
    init(params){
        this.dataChess=params
        // 循环节点
        this.loopNode(false)
    },
    // 循环节点
    loopNode(params){
        var _this=this
        this.dataChess.forEach(function (v) {
            v.forEach(function (vv) {
                _this.conditionChess(vv,params);
            });
        });
    },
    // 判断输赢
    win (callback){
        // 循环节点
        this.loopNode(callback)
    },
    // 返回AI节点
    AiNode(){
        // 提取节点数据
        var extractData=this.extract(this.dataChess)
        var res=this.analysisNode(extractData)
        return res
    },
    // 成立的条件
    conditionChess(params,f) {
        // x轴->
        this.loopChess(params, 1, 0,f);
        // 负y轴->
        this.loopChess(params,0,1,f)
        // x轴->、负y轴->斜线
        this.loopChess(params,1,1,f)
        // 负x轴->、负y轴->斜线
        this.loopChess(params,-1,1,f)
    },
    // 遍历当前节点
    loopChess(params, x, y,f) {
        /*
        * params当前节点的数据
        * x:x轴方向，-1,0,1
        * y:y轴方向,-1,0,1
        * */
        var dataChess=this.dataChess
        var isEmpty=this.isEmpty

        // 判断当前节点和下一个节点的type为空
        var currentNext =(isEmpty(parseInt(params["y"]) + y,dataChess.length) && isEmpty(parseInt(params["x"]) + x,dataChess.length))?dataChess[parseInt(params["y"]) + y][parseInt(params["x"]) + x]:null;
        if (!currentNext || (currentNext && !params.type && !currentNext.type)) return;

        // 当前节点类型
        var _type = params.type ? params.type : currentNext.type;

        // 空节点数组、当前节点
        var currentArray = [];//所有节点
        var emptyArray=[];//所有空节点
        var existenceArray=[];//所有有数据的节点
        var current = null;//当前节点
        for (var i = 0; i < 5; i++) {
            // 在遍历分析当前节点，判断是否形成可判断的条件，否 break
            // current = ((parseInt(params["y"]) + y * i)<dataChess.length && (parseInt(params["x"]) + x * i)<dataChess.length)?dataChess[parseInt(params["y"]) + y * i][parseInt(params["x"]) + x * i]:null;
            current = (isEmpty(parseInt(params["y"]) + y * i,dataChess.length) && isEmpty(parseInt(params["x"]) + x * i,dataChess.length))?dataChess[parseInt(params["y"]) + y * i][parseInt(params["x"]) + x * i]:null;
            if (current && (current.type == _type || !current.type)) {
                currentArray.push(current);
                if(!current.type){
                    emptyArray.push(current)
                }else{
                    existenceArray.push(current)
                }
            } else {
                currentArray=null;
                break;
            }
        }

        // 判断输赢
        if(f){
            if(existenceArray.length==5){
                f(existenceArray[0].type)
            }
            return;
        }

        // 条件不成立
        if(!currentArray) return;

        // 处理形成的条件

        // 当前节点的上一个节点
        // var previous=(parseInt(params["y"]) - y>=0 && parseInt(params["x"]) - x>=0)?dataChess[parseInt(params["y"]) - y][parseInt(params["x"]) - x]:null
        var previous=(isEmpty(parseInt(params["y"]) - y,dataChess.length) && isEmpty(parseInt(params["x"]) - x,dataChess.length))?dataChess[parseInt(params["y"]) - y][parseInt(params["x"]) - x]:null

        // 当前形成条件的最后的一个节点的下一个节点
        // var lastOne=((parseInt(currentArray[currentArray.length-1]["y"]) + y)<dataChess.length && (parseInt(currentArray[currentArray.length-1]["x"]) + x)<dataChess.length)?dataChess[parseInt(currentArray[currentArray.length-1]["y"]) + y][parseInt(currentArray[currentArray.length-1]["x"]) + x]:null
        var lastOne=(isEmpty(parseInt(currentArray[currentArray.length-1]["y"]) + y,dataChess.length) && isEmpty(parseInt(currentArray[currentArray.length-1]["x"]) + x,dataChess.length))?dataChess[parseInt(currentArray[currentArray.length-1]["y"]) + y][parseInt(currentArray[currentArray.length-1]["x"]) + x]:null

        // 总的空节点的个数
        var levelLength=emptyArray.length
        if((previous && (!previous.type || previous.type==_type)) || (lastOne && (!lastOne.type || lastOne.type==_type))){
            levelLength=levelLength-1
        }

        // 判断非空节点的中间是否存在空节点
        var _currentArray=JSON.parse(JSON.stringify(currentArray))

        // 处理非空节点之前的空节点
        var middleBefore=0
        for (var k = 0; k<_currentArray.length - 1;k++) {
            if(_currentArray[k].type){
                break;
            }
            if (!_currentArray[k].type) {
                _currentArray[k].middlePar=k
                _currentArray[k].middlePos='before'
                middleBefore++
            }
        }

        // 处理非空节点之后的空节点
        var middleAfter=0
        for (var j = _currentArray.length - 1; j > 0;j--) {
            if(_currentArray[j].type){
                break;
            }
            if (!_currentArray[j].type) {
                _currentArray[j].middlePar=_currentArray.length-1-j
                _currentArray[j].middlePos='after'
                middleAfter++
            }
        }

        var emptyNodeFlage=false
        // 判断非空节点之间是否有空节点
        for (var n= middleBefore; n < _currentArray.length-middleAfter;n++) {
            if(!_currentArray[n].type){
                emptyNodeFlage=true
            }
        }

        // 非空节点的中间的空节点
        _currentArray.forEach(function (v){
            var _level=levelLength
            if(!v.type){
                if(!v.middlePos){
                    // 中间
                    v.level=levelLength
                }else if(v.middlePos=='before'){
                    // before
                    if(!previous || (previous && previous.type && previous.type!=_type)){
                        _level=emptyArray.length
                    }

                    v.difference=_level

                    v.level=emptyNodeFlage?((_level+1)+middleBefore-1-v.middlePar):(_level+middleBefore-1-v.middlePar)

                }else if(v.middlePos=='after'){
                    // after
                    if(!lastOne || (lastOne && lastOne.type && lastOne.type!=_type)){
                        // _level=_level+1
                        _level=emptyArray.length
                    }
                    v.difference=_level
                    v.level=emptyNodeFlage?((_level+1)+middleAfter-1-v.middlePar):(_level+middleAfter-1-v.middlePar)

                }
            }
        })

        // 非空节点两端的空节点
        // 数据赋值
        _currentArray.forEach(function (v) {
            if(!v.type){
                // 判断从属级别对象
                if (!v.subordinate) {
                    v.subordinate = {};
                }

                // 级别
                if(!dataChess[v["y"]][parseInt(v["x"])].subordinate){
                    dataChess[v["y"]][parseInt(v["x"])].subordinate={}
                }

                // 空缺差值
                if(!dataChess[v["y"]][parseInt(v["x"])].difference){
                    dataChess[v["y"]][parseInt(v["x"])].difference={}
                }

                // 类型
                if(!dataChess[v["y"]][parseInt(v["x"])].mode){
                    dataChess[v["y"]][parseInt(v["x"])].mode={}
                }

                // 类型值
                if(!dataChess[v["y"]][parseInt(v["x"])].mode[_type]){
                    dataChess[v["y"]][parseInt(v["x"])].mode[_type]={}
                }

                // 级别
                if(dataChess[v["y"]][parseInt(v["x"])].subordinate[_type]==null || dataChess[v["y"]][parseInt(v["x"])].subordinate[_type] > v.level){
                    dataChess[v["y"]][parseInt(v["x"])].subordinate[_type] = v.level;
                    dataChess[v["y"]][parseInt(v["x"])].mode[_type][x+"-"+y]=v.level;
                }else if(dataChess[v["y"]][parseInt(v["x"])].subordinate[_type] == v.level){
                    if(dataChess[v["y"]][parseInt(v["x"])].mode!=x+"-"+y){
                        dataChess[v["y"]][parseInt(v["x"])].mode[_type][x+"-"+y]=v.level;
                    }
                }

                // 差值
                if(dataChess[v["y"]][parseInt(v["x"])].difference[_type]==null || dataChess[v["y"]][parseInt(v["x"])].difference[_type] > v.difference){
                    dataChess[v["y"]][parseInt(v["x"])].difference[_type] = v.difference;
                }

            }
        })
    },
    // 提取节点数据
    extract(data){
        // 节点对象
        var _extractData={
            '1':[],
            '2':[],
        }
        data.forEach(function (v) {
            v.forEach(function (vv) {
                if(vv.subordinate && !vv.type){
                    if(vv.subordinate['1'] || vv.subordinate['1']==0){
                        _extractData['1'].push(vv)
                    }
                    if(vv.subordinate['2'] || vv.subordinate['2']==0){
                        _extractData['2'].push(vv)
                    }
                }
            })
        });
        return _extractData
    },
    // 分析节点
    analysisNode(data){
        /*
        * 提取各个方成立的等级级别较高的点位
        * */

        // ----------拆分双方数据、根据优先级筛选数据-----------
        // 我方
        var node_1=[],node_1_index=null,difference_1_index=null;
        data['1'].forEach(function (v){
            if(node_1_index==null || (node_1_index!=null && node_1_index>=v.subordinate['1'])){
                node_1_index=v.subordinate['1']
                node_1.push(v)
            }
            if(difference_1_index==null || (difference_1_index!=null && difference_1_index>=v.difference['1'])){
                difference_1_index=v.difference['1']
            }

            if(node_1_index!=null || node_1.length>0){
                node_1=node_1.filter(function (vv){
                    return vv.subordinate['1']==node_1_index && vv.difference['1']==difference_1_index
                })
            }
        })

        // 敌方
        var node_2=[],node_2_index=null,difference_2_index=null;
        data['2'].forEach(function (v){
            if(node_2_index==null || (node_2_index!=null && node_2_index>=v.subordinate['2'])){
                node_2_index=v.subordinate['2']
                node_2.push(v)
            }
            if(difference_2_index==null || (difference_2_index!=null && difference_2_index>=v.difference['2'])){
                difference_2_index=v.difference['2']
            }

            if(node_2_index || node_2.length>0){
                node_2=node_2.filter(function (vv){
                    return vv.subordinate['2']==node_2_index && vv.difference['2']==difference_2_index
                })
            }
        })

        // --------------分析优先级--------------------------------
        var highLevel_1=null,frequency_1=null;
        node_1.forEach(function (v){
            var modeIndex=0,allEachIndex=0
            for (var items in v.mode){
                for (var icon in v.mode[items]){
                    if(v.mode[items][icon]==v.subordinate['1']){
                        modeIndex++
                    }
                    allEachIndex++
                }
            }
            v.modeNumber=modeIndex
            v.allEachNumber=allEachIndex

            // 查找最高级别
            if(!highLevel_1){
                highLevel_1=v
            }
            if(v.modeNumber>highLevel_1.modeNumber){
                highLevel_1=v
            }

            // 查找最高次数
            if(!frequency_1){
                frequency_1=v
            }
            if(v.allEachNumber>frequency_1.allEachNumber){
                frequency_1=v
            }

        })

        var highLevel_2=null,frequency_2=null;
        node_2.forEach(function (v){
            var modeIndex=0,allEachIndex=0
            for (var items in v.mode){
                for (var icon in v.mode[items]){
                    if(v.mode[items][icon]==v.subordinate['2']){
                        modeIndex++
                    }
                    allEachIndex++
                }
            }
            v.modeNumber=modeIndex
            v.allEachNumber=allEachIndex

            // 查找最高级别
            if(!highLevel_2){
                highLevel_2=v
            }
            if(v.modeNumber>highLevel_2.modeNumber){
                highLevel_2=v
            }

            // 查找最高次数
            if(!frequency_2){
                frequency_2=v
            }
            if(v.allEachNumber>frequency_2.allEachNumber){
                frequency_2=v
            }

        })

        // ---------------根据等级别个数筛选优先级----------------
        if(node_1.length>1){
            node_1.forEach(function (v,index){
                if(v.modeNumber<highLevel_1.modeNumber){
                    node_1.splice(index,1)
                }
            })
        }

        if(node_2.length>1){
            node_2.forEach(function (v,index){
                if(v.modeNumber<highLevel_2.modeNumber){
                    node_2.splice(index,1)
                }
            })
        }

        // ---------------根据调用次数筛选优先级----------------
        if(node_1.length>1){
            node_1.forEach(function (v,index){
                if(v.allEachNumber<frequency_1.allEachNumber){
                    node_1.splice(index,1)
                }
            })
        }

        if(node_2.length>1){
            node_2.forEach(function (v,index){
                if(v.allEachNumber<frequency_2.allEachNumber){
                    node_2.splice(index,1)
                }
            })
        }

        // ---------------如果两边还是多个数组\随机抽取（后期优化）----------------
        var _node_1;
        if(node_1.length>1){
            _node_1=node_1[parseInt(node_1.length*Math.random())]
        }else{
            _node_1=node_1[0]
        }

        var _node_2;
        if(node_2.length>1){
            _node_2=node_2[parseInt(node_1.length*Math.random())]
        }else{
            _node_2=node_2[0]
        }

        // ---------------分析、判断我方和敌方的棋子----------------
        var node=null

        if(!_node_1 && !_node_2){
            node = dataChess[parseInt(dataChess.length / 2)][parseInt(dataChess.length / 2)]
        }else if(_node_1 && !_node_2){
            node=_node_1
        }else if(_node_2 && !_node_1){
            node=_node_2
        }else{
            if(_node_1.subordinate['1']<_node_2.subordinate['2']){
                node=_node_1
            }else if(_node_1.subordinate['1']>_node_2.subordinate['2']){
                node=_node_2
            }else{
                if(_node_1.modeNumber>_node_2.modeNumber){
                    node=_node_1
                }else if(_node_1.modeNumber<_node_2.modeNumber){
                    node=_node_2
                }else{
                    if(_node_2.modeNumber<=1){
                        node=_node_2
                    }else{
                        if(_node_1.allEachNumber>_node_2.allEachNumber){
                            node=_node_1
                        }else if(_node_1.allEachNumber<_node_2.allEachNumber){
                            node=_node_2
                        }else{
                            if(_node_1.subordinate['1']>2){
                                node=_node_2
                            }else{
                                node=_node_1
                            }
                        }
                    }
                }
            }
        }

        return node
    },
    // 判断节点是否存在
    isEmpty(length,dataLength){
        return (length>=0 && length<dataLength)?true:false
    },
}

function initChess(params){
    var _initChess=new Chess()
    _initChess.init(params)
    return _initChess
}

if(!document.getElementById("canvas")){
    var dataChess = [
        [
            {"type": null, "x": 0, "y": 0, "axisX": 0, "axisY": 0},
            {"type": null, "x": 1, "y": 0, "axisX": 40, "axisY": 0},
            {"type": null, "x": 2, "y": 0, "axisX": 80, "axisY": 0},
            {"type": null, "x": 3, "y": 0, "axisX": 120, "axisY": 0},
            {"type": null, "x": 4, "y": 0, "axisX": 160, "axisY": 0},
            {"type": null, "x": 5, "y": 0, "axisX": 200, "axisY": 0},
            {"type": null, "x": 6, "y": 0, "axisX": 240, "axisY": 0},
            {"type": null, "x": 7, "y": 0, "axisX": 280, "axisY": 0},
            {"type": null, "x": 8, "y": 0, "axisX": 320, "axisY": 0},
            {"type": null, "x": 9, "y": 0, "axisX": 360, "axisY": 0}
        ],
        [
            {"type": null, "x": 0, "y": 1, "axisX": 0, "axisY": 40},
            {"type": null, "x": 1, "y": 1, "axisX": 40, "axisY": 40},
            {"type": null, "x": 2, "y": 1, "axisX": 80, "axisY": 40},
            {"type": null, "x": 3, "y": 1, "axisX": 120, "axisY": 40},
            {"type": 1, "x": 4, "y": 1, "axisX": 160, "axisY": 40},
            {"type": null, "x": 5, "y": 1, "axisX": 200, "axisY": 40},
            {"type": null, "x": 6, "y": 1, "axisX": 240, "axisY": 40},
            {"type": null, "x": 7, "y": 1, "axisX": 280, "axisY": 40},
            {"type": null, "x": 8, "y": 1, "axisX": 320, "axisY": 40},
            {"type": null, "x": 9, "y": 1, "axisX": 360, "axisY": 40}
        ],
        [
            {"type": null, "x": 0, "y": 2, "axisX": 0, "axisY": 80},
            {"type": null, "x": 1, "y": 2, "axisX": 40, "axisY": 80},
            {"type": null, "x": 2, "y": 2, "axisX": 80, "axisY": 80},
            {"type": null, "x": 3, "y": 2, "axisX": 120, "axisY": 80},
            {"type": 1, "x": 4, "y": 2, "axisX": 160, "axisY": 80},
            {"type": null, "x": 5, "y": 2, "axisX": 200, "axisY": 80},
            {"type": null, "x": 6, "y": 2, "axisX": 240, "axisY": 80},
            {"type": null, "x": 7, "y": 2, "axisX": 280, "axisY": 80},
            {"type": null, "x": 8, "y": 2, "axisX": 320, "axisY": 80},
            {"type": null, "x": 9, "y": 2, "axisX": 360, "axisY": 80}
        ],
        [
            {"type": null, "x": 0, "y": 3, "axisX": 0, "axisY": 120},
            {"type": null, "x": 1, "y": 3, "axisX": 40, "axisY": 120},
            {"type": null, "x": 2, "y": 3, "axisX": 80, "axisY": 120},
            {"type": null, "x": 3, "y": 3, "axisX": 120, "axisY": 120},
            {"type": 1, "x": 4, "y": 3, "axisX": 160, "axisY": 120},
            {"type": null, "x": 5, "y": 3, "axisX": 200, "axisY": 120},
            {"type": 2, "x": 6, "y": 3, "axisX": 240, "axisY": 120},
            {"type": null, "x": 7, "y": 3, "axisX": 280, "axisY": 120},
            {"type": null, "x": 8, "y": 3, "axisX": 320, "axisY": 120},
            {"type": null, "x": 9, "y": 3, "axisX": 360, "axisY": 120}
        ],
        [
            {"type": null, "x": 0, "y": 4, "axisX": 0, "axisY": 160},
            {"type": null, "x": 1, "y": 4, "axisX": 40, "axisY": 160},
            {"type": null, "x": 2, "y": 4, "axisX": 80, "axisY": 160},
            {"type": null, "x": 3, "y": 4, "axisX": 120, "axisY": 160},
            {"type": 1, "x": 4, "y": 4, "axisX": 160, "axisY": 160},
            {"type": 2, "x": 5, "y": 4, "axisX": 200, "axisY": 160},
            {"type": null, "x": 6, "y": 4, "axisX": 240, "axisY": 160},
            {"type": null, "x": 7, "y": 4, "axisX": 280, "axisY": 160},
            {"type": null, "x": 8, "y": 4, "axisX": 320, "axisY": 160},
            {"type": null, "x": 9, "y": 4, "axisX": 360, "axisY": 160}
        ],
        [
            {"type": null, "x": 0, "y": 5, "axisX": 0, "axisY": 200},
            {"type": null, "x": 1, "y": 5, "axisX": 40, "axisY": 200},
            {"type": null, "x": 2, "y": 5, "axisX": 80, "axisY": 200},
            {"type": null, "x": 3, "y": 5, "axisX": 120, "axisY": 200},
            {"type": 2, "x": 4, "y": 5, "axisX": 160, "axisY": 200},
            {"type": null, "x": 5, "y": 5, "axisX": 200, "axisY": 200},
            {"type": null, "x": 6, "y": 5, "axisX": 240, "axisY": 200},
            {"type": null, "x": 7, "y": 5, "axisX": 280, "axisY": 200},
            {"type": null, "x": 8, "y": 5, "axisX": 320, "axisY": 200},
            {"type": null, "x": 9, "y": 5, "axisX": 360, "axisY": 200}
        ],
        [
            {"type": null, "x": 0, "y": 6, "axisX": 0, "axisY": 240},
            {"type": null, "x": 1, "y": 6, "axisX": 40, "axisY": 240},
            {"type": null, "x": 2, "y": 6, "axisX": 80, "axisY": 240},
            {"type": null, "x": 3, "y": 6, "axisX": 120, "axisY": 240},
            {"type": null, "x": 4, "y": 6, "axisX": 160, "axisY": 240},
            {"type": null, "x": 5, "y": 6, "axisX": 200, "axisY": 240},
            {"type": null, "x": 6, "y": 6, "axisX": 240, "axisY": 240},
            {"type": null, "x": 7, "y": 6, "axisX": 280, "axisY": 240},
            {"type": null, "x": 8, "y": 6, "axisX": 320, "axisY": 240},
            {"type": null, "x": 9, "y": 6, "axisX": 360, "axisY": 240}
        ],
        [
            {"type": 2, "x": 0, "y": 7, "axisX": 0, "axisY": 280},
            {"type": 2, "x": 1, "y": 7, "axisX": 40, "axisY": 280},
            {"type": 2, "x": 2, "y": 7, "axisX": 80, "axisY": 280},
            {"type": 2, "x": 3, "y": 7, "axisX": 120, "axisY": 280},
            {"type": 2, "x": 4, "y": 7, "axisX": 160, "axisY": 280},
            {"type": null, "x": 5, "y": 7, "axisX": 200, "axisY": 280},
            {"type": null, "x": 6, "y": 7, "axisX": 240, "axisY": 280},
            {"type": null, "x": 7, "y": 7, "axisX": 280, "axisY": 280},
            {"type": null, "x": 8, "y": 7, "axisX": 320, "axisY": 280},
            {"type": null, "x": 9, "y": 7, "axisX": 360, "axisY": 280}
        ],
        [
            {"type": null, "x": 0, "y": 8, "axisX": 0, "axisY": 320},
            {"type": null, "x": 1, "y": 8, "axisX": 40, "axisY": 320},
            {"type": null, "x": 2, "y": 8, "axisX": 80, "axisY": 320},
            {"type": null, "x": 3, "y": 8, "axisX": 120, "axisY": 320},
            {"type": null, "x": 4, "y": 8, "axisX": 160, "axisY": 320},
            {"type": null, "x": 5, "y": 8, "axisX": 200, "axisY": 320},
            {"type": null, "x": 6, "y": 8, "axisX": 240, "axisY": 320},
            {"type": null, "x": 7, "y": 8, "axisX": 280, "axisY": 320},
            {"type": null, "x": 8, "y": 8, "axisX": 320, "axisY": 320},
            {"type": null, "x": 9, "y": 8, "axisX": 360, "axisY": 320}
        ],
        [
            {"type": null, "x": 0, "y": 9, "axisX": 0, "axisY": 360},
            {"type": null, "x": 1, "y": 9, "axisX": 40, "axisY": 360},
            {"type": null, "x": 2, "y": 9, "axisX": 80, "axisY": 360},
            {"type": null, "x": 3, "y": 9, "axisX": 120, "axisY": 360},
            {"type": null, "x": 4, "y": 9, "axisX": 160, "axisY": 360},
            {"type": null, "x": 5, "y": 9, "axisX": 200, "axisY": 360},
            {"type": null, "x": 6, "y": 9, "axisX": 240, "axisY": 360},
            {"type": null, "x": 7, "y": 9, "axisX": 280, "axisY": 360},
            {"type": null, "x": 8, "y": 9, "axisX": 320, "axisY": 360},
            {"type": null, "x": 9, "y": 9, "axisX": 360, "axisY": 360}
        ]
    ];
    var _calculation=new Algorithm()
    _calculation.init(dataChess)
}
