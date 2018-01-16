import NumberAnimate from "../../utils/NumberAnimate";
var request=require('../../utils/request');
var wxCharts=require('../../utils/wxcharts-min');
Page({
  data: {
    totalNum:'',
    baseData:[]
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '正在加载',
      mask:true
    })
    var total_pv_url='/statis/get_total_pv';
    this.setData({
      total_pv_url:total_pv_url
    })
    var that=this;
    // 拿到总访问量
    request.getData(total_pv_url,'GET').then(function(data){
      if(data){
        that.setData({
          totalNum:data.data.total_pv
        })
      }
    },function(err){
        clearInterval(getTotalPvInterval)
      return;
    })
    // 页面加载完数据就开始变化
    this.getbaseDetail().then((res)=>{
      request.getData(this.data.total_pv_url,'GET').then((data)=>{
        that.animate(that.data.totalNum,data.data.total_pv,15000);
        wx.hideLoading()
      },err=>{
        return;
      })
    },err=>{
      clearInterval(getBaseInterval)
      return;
    });
    // 每隔30秒请求一次拿到访问量
    var getTotalPvInterval=setInterval(function() {
      request.getData(total_pv_url,'GET').then(function(data){
        if(data){
          var toNum=data.data.total_pv;
          that.animate(that.data.totalNum,toNum,29900);
        }
      },err=>{
        return;
      })
    },30000);
    // 每隔30秒拿到基本数据
    var getBaseInterval=setInterval(()=>{this.getbaseDetail()},30000)
  },
  animate: function (fromNum,totalNum,speed) {
    let animateNum = new NumberAnimate({
      fromNum: fromNum,//开始时的数字
      toNum:totalNum,//最后的数字
      speed: speed,// 总时间
      decimals: 0,//小数点后的位数
      onUpdate: () => {//更新回调函数
        this.setData({
          totalNum: animateNum.tempValue
        });

      }

    });
  },
  getbaseDetail:function(){
    var count=0;
    var that=this;
    var baseUrl='/statis/base';
    return new Promise((resolve,reject)=>{
      request.getData(baseUrl,'GET').then((data)=>{
        if(data){
          this.setData({
            baseData:[{
              name:'应用总数',
              num:data.data.app_sum,
              img:'/images/bigScreen/app.png'
            },{
              name:'应用实例数',
              num:data.data.instance_sum,
              img:'/images/bigScreen/instance.png'
            }
            ,{
              name:'平均响应时长',
              num:data.data.avg_response_time+'ms',
              img:'/images/bigScreen/time.png'
            }
            ,{
              name:'cpu使用率',
              num:data.data.cpu_usage+'%',
              img:'/images/bigScreen/cpu.png'
            }
            ,{
              name:'内存使用率',
              num:data.data.memory_usage+'%',
              img:'/images/bigScreen/mem.png'
            }
          ]
        })
        resolve(data);
      }
    },(err)=>{
      reject(err)
    })
  })
}

})
