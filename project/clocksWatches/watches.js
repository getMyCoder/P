function Watches(){
    this.canvas=null
    this.ctx=null
    this.cacheCanvas=null
    this.cacheCtx=null
    this.size={
        width:500,
        height:500
    }
    this.time=null
}

Watches.prototype={
    init:function (){
        this.real()
        // 缓存
        this.cache()

        // 初始动画
        this.startAnimate()
    },
    // 真实dom
    real:function (){
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
    // 缓存绘制
    cacheDraw:function (params){
        this.ctx.clearRect(0,0,this.size.width,this.size.height)
        this.cacheCtx.clearRect(0,0,this.size.width,this.size.height)
        // 绘制表盘
        this.clockDial()
        // 绘制表盘
        this.clockTime(params)
        // 绘制表盘刻度
        this.clockScale(params)
        // 绘制指针
        this.clockPointer(params)
        this.ctx.drawImage(this.cacheCanvas,0,0,this.size.width,this.size.height)
    },
    // 初始动画
    startAnimate:function (){
        var _this=this
        this.time=this.handleTime()
        var s=_this.time.s/60*360
        var m=_this.time.m/60*360+s/60
        var h=(_this.time.h%12)/12*360+m/60+s/60
        var _h=0,_m=0,_s=0,index=0;
        var timer=setInterval(function (){
            _h=(_h<h)?_h+1:h
            _m=(_m<m)?_m+1:m
            _s=(_s<s)?_s+1:s
            index=(index<360/12)?index+0.2:360/12

            if(_h==h && _m==m && _s==s && index==360/12){
                clearInterval(timer)
                // 缓存绘制
                _this.cacheDrawCon()
            }
            _this.cacheDraw({h:_h,m:_m,s:_s,index})
        },3)
    },
    // 绘制表盘
    clockDial:function (){
        // 绘制表盘
        this.cacheCtx.beginPath()
        this.cacheCtx.strokeStyle='#666'
        this.cacheCtx.lineWidth=0.5
        this.cacheCtx.arc(
            parseInt(this.size.width*0.5)+0.5,
            parseInt(this.size.height*0.5)+0.5,
            parseInt(this.size.width*0.5)-30,
            0,
            Math.PI*2,
            false
        )
        this.cacheCtx.stroke()
        this.cacheCtx.closePath()
    },
    // 绘制表盘时间
    clockTime:function (params){
        var indexV=(params.index && params.index<=30)?(1/30*params.index):1
        this.cacheCtx.save();
        for (var i = 1; i <=12; i++) {
            this.cacheCtx.fillStyle='#000'
            this.cacheCtx.font='24px Arial'
            this.cacheCtx.textAlign='center'
            this.cacheCtx.fillText(
                i,
                this.size.width * 0.5-Math.sin(((i-1)*30)*indexV*Math.PI/180-(150*Math.PI/180))*this.size.width*0.48,
                this.size.width * 0.5+10+Math.cos(((i-1)*30)*indexV*Math.PI/180-(150*Math.PI/180))*this.size.width*0.48,
            )
        }
        this.cacheCtx.restore();
    },
    // 绘制表盘刻度
    clockScale:function (params){
        var indexV=(params.index<=30)?params.index:30
        this.cacheCtx.save();
        for (var i = 0; i <60; i++) {
            this.cacheCtx.beginPath();
            this.cacheCtx.fillStyle='#000'
            this.cacheCtx.strokeStyle='#000'
            this.cacheCtx.lineWidth=1
            this.cacheCtx.translate(this.size.width*0.5,this.size.height*0.5);
            this.cacheCtx.moveTo(0,-this.size.height*0.5+30)
            if(i%5==0){
                this.cacheCtx.lineTo(0,-this.size.height*0.5+30+20)
            }else{
                this.cacheCtx.lineTo(0,-this.size.height*0.5+30+10)
            }
            this.cacheCtx.rotate(((1/30)*indexV)*(360/60)*Math.PI/180);
            this.cacheCtx.translate(-this.size.width*0.5,-this.size.height*0.5);
            this.cacheCtx.stroke()
            this.cacheCtx.closePath()
        }
        this.cacheCtx.restore();
    },
    // 绘制指针
    clockPointer:function (params){
        // 时
        this.pointer({
            value:params.h,
            pos:[[0,10],[-5,3],[0,-this.size.width*0.5*0.35],[5,3],[0,10]]
        })
        // 分
        this.pointer({
            value:params.m,
            pos:[[0,20],[-2,0],[0,-this.size.width*0.5*0.6],[2,0],[0,20]]
        })
        // 秒
        this.pointer({
            value:params.s,
            pos:[[0,25],[-1,0],[0,-this.size.width*0.5*0.85],[1,0],[0,25]]
        })
    },
    // 指针
    pointer:function (params){
        this.cacheCtx.beginPath();
        this.cacheCtx.save();
        this.cacheCtx.translate(this.size.width*0.5,this.size.height*0.5);
        this.cacheCtx.fillStyle='#000'
        this.cacheCtx.strokeStyle='#000'
        this.cacheCtx.rotate(params.value*Math.PI/180);
        this.cacheCtx.moveTo(params.pos[0][0],params.pos[0][1])
        this.cacheCtx.lineTo(params.pos[1][0],params.pos[1][1])
        this.cacheCtx.lineTo(params.pos[2][0],params.pos[2][1])
        this.cacheCtx.lineTo(params.pos[3][0],params.pos[3][1])
        this.cacheCtx.lineTo(params.pos[4][0],params.pos[4][1])
        this.cacheCtx.translate(-this.size.width*0.5,-this.size.height*0.5);
        this.cacheCtx.stroke()
        this.cacheCtx.fill()
        this.cacheCtx.restore();
        this.cacheCtx.closePath();
    },
    // 加载入口
    cacheDrawCon:function (){
        var _this=this,index=0;
        setInterval(function (){
            _this.time=_this.handleTime()
            var s=_this.time.s/60*360
            var m=_this.time.m/60*360+s/60
            var h=(_this.time.h%12)/12*360+m/60+s/60
            _this.cacheDraw({h,m,s})
        },100)
    },
    // 时间数据
    handleTime:function (){
        var date=new Date()
        var time={
            Y:date.getFullYear(),
            M:date.getMonth()+1,
            D:date.getDate(),
            h:date.getHours(),
            m:date.getMinutes(),
            s:date.getSeconds(),
        }
        return time
    }
}

function watches(){
    var _watches=new Watches()
    _watches.init()
    return _watches
}