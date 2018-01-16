var app=getApp();
var utils=require('../../../../utils/utils');
var wxCharts = require('../../../../utils/wxcharts-min');
var request=require('../../../../utils/request');
Page({
  data: {
    tabData: [{ type:0, name: '应用信息' }, { type:1, name: '实例状态' }, { type:2, name: '日志信息' }, { type:3, name: '版本信息' }, { type:4, name: '服务信息' }, { type:5, name: '域名信息' }, { type:6, name: '环境变量' }],
    activeTab:0,
    scrollLeft:0,
    appBaseData:{},
    activeData:[],
    cpuArr:[],
    timeArr:[],
    memArr:[],
    versionData:[],
    exampleData:'',
    logData:[],
    bindServiceData:[],
    domainData:[],
    envData:{},
    collected:false,
    appActivePage:6,
    activeDataFinished:false,
    oldPostsCollected:{}
  },
  onLoad: function (options) {
    var appguid=options.appguid;
    var appBaseData=app.globalData[appguid];
    var currentName=wx.getStorageSync('currentUser');
    var userData=utils.getStorage(currentName);
    this.setData({
      currentName:currentName,
      userData:userData
    })
    var oldPostsCollected=userData.posts_collected?userData.posts_collected:{};
    this.setData({
      appguid:appguid,
      appBaseData:appBaseData,
      oldPostsCollected:oldPostsCollected
    })
    var that = this;
  this.getAppData();
  this.getCollected();
  },
  onReady: function () {
    // 动态改变导航栏名字
    wx.setNavigationBarTitle({
      title:`应用【${this.data.appBaseData.appName}】`
    })
  },
  scrollTabTap: function (e) {
    var activeTab=e.currentTarget.dataset.type;
    this.setData({
      activeTab:activeTab
    })
    switch (activeTab) {
      case 0:
      this.getAppData();
      break;
      case 1:
      this.getExampleData();
      break;
      case 2:
      this.getlogData();
      break;
      case 3:
      this.getVersionData();
      break;
      case 4:
      this.getBindServiceData();
      break;
      case 5:
      this.getDomainData();
      break;
      case 6:
      this.getEnvData();
      break;
      default:
      return;
    }
if(activeTab>2&&activeTab<5){
  this.setData({
  scrollLeft:300
  })
}else if (activeTab>4) {
  this.setData({
  scrollLeft:600
  })
}else{
  this.setData({
  scrollLeft:0
  })
}


  },
  // 应用基本信息
getAppData:function(){
  if(this.data.cpuArr.length&&this.data.timeArr.length){
    return;
  }
  // 拿到应用动态
  var appActiveUrl='/v2/events?order-direction=desc&q=actee:'+this.data.appguid+'&results-per-page='+this.data.appActivePage;
  var a=request.getData(appActiveUrl,'GET');

  // 只有运行中的应用才能得到运行状态
  var b='';
  if(this.data.appBaseData.state==='STARTED' && this.data.appBaseData.instance!==0){
    var appStats='/log/getAppsByAppIdAndTime/'+this.data.appguid+'/'+utils.processCanvasTime().finalOld+'/'+utils.processCanvasTime().finalNow+'/6';
    b=request.getData(appStats,'GET','','appStats');
  }
  Promise.all([a,b]).then((data)=>{
    if(data[0].resources.length!==0){
      var activeData=[];
      for(var i of data[0].resources){
        activeData.push({
          timestamp:utils.processTime(i.entity.timestamp),
          actor_name:i.entity.actor_name,
          type:utils.processAppMsgType(i.entity.type),
          actee_name:i.entity.actee_name
        })
      }
      this.setData({
        activeData:activeData
      })
    }
    // 设置cpu和内存
    if(data[1]){
      this.getStats(data[1])
    }else{
      this.setData({
        timeArr:['~'],
        cpuArr:[0],
        memArr:[0]
      })
    }
    // 定义canvas
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    };
    new wxCharts({
      canvasId: 'cpuCanvas',
      type: 'line',
      categories:this.data.timeArr,
      series: [{
        name: 'cpu利用率（%）',
        data: this.data.cpuArr,
        format:function(val){
          return val.toFixed(3)
        },
        color:'#F6A459'
      }],
      yAxis: {
        format:function(val){
          return val.toFixed(2);
        },
        min:0
      },
      width: windowWidth,
      height: 200
    });
    new wxCharts({
      canvasId: 'storageCanvas',
      type: 'line',
      categories:this.data.timeArr,
      series: [{
        name: '内存利用量（MB）',
        data: this.data.memArr,
        format:function(val){
          return val.toFixed(2)
        },
        color:'#7CB5EC'
      }],
      yAxis: {
        format:function(val){
          return val.toFixed(2)
        },
        min:0
      },
      width: windowWidth,
      height: 200
    });
  },(err)=>{
    console.log(err);
  })
},
onReachBottom:function(){
  if(this.data.activeDataFinished){
    return;
  }
  this.data.appActivePage+=6;
  var appActiveUrl='/v2/events?order-direction=desc&q=actee:'+this.data.appguid+'&results-per-page='+this.data.appActivePage;
  request.getData(appActiveUrl,'GET').then(data=>{
    if(data.resources.length===this.data.activeData.length){
      this.setData({
        activeDataFinished:true
      })
      return;
    }else{
      var activeData=[];
      for(var i of data.resources){
        activeData.push({
          timestamp:utils.processTime(i.entity.timestamp),
          actor_name:i.entity.actor_name,
          type:utils.processAppMsgType(i.entity.type),
          actee_name:i.entity.actee_name
        })
      }
      this.setData({
        activeData:activeData,
      })
    }
  })
},

  // 赋值画canvas
  getStats:function(data){
    var cpuArr=this.data.cpuArr,timeArr=this.data.timeArr,memArr=this.data.memArr;
    if(cpuArr.length>6){
      cpuArr.shift()
    }
    if(timeArr.length>6){
      timeArr.shift()
    }
    if(memArr.length>6){
      memArr.shift()
    }
    for(var i of data){
      var mem=parseFloat(i.memory_bytes);
      var time=i.time.split(' ')[1].substr(0,5);
      var cpu=parseFloat(i.cpu_percentage);
      cpuArr.push(cpu);
      timeArr.push(time);
      memArr.push(mem);
    }
    this.setData({
      cpuArr:cpuArr,
      timeArr:timeArr,
      memArr:memArr
    })
  },
  // 版本
  getVersionData:function(){
    if(this.data.versionData.length){
      return
    }else{
      var versionUrl='/file/Appversionquery';
      var data={
        output:JSON.stringify({
          AppId:this.data.appguid
        })
      }
      request.getData(versionUrl,'POST',data,'version').then((data)=>{
        var versionData=[];
        for(var i of data.outlist){
          var originTime=i.SeqNO.substring(0,8);
          var finalTime=originTime.substring(0,4)+'-'+originTime.substring(4,6)+'-'+originTime.substring(6,8);
          versionData.push({
            VersionNo:i.VersionNo,
            Description:i.Description,
            Time:finalTime,
            CreatePerson:i.CreatePerson,
            IsUse:i.IsUse
          })
        }
        this.setData({
          versionData:versionData
        })
      })
    }
  },
  // 实例状态
  getExampleData:function(){
    if(this.data.exampleData){
      return
    }else{
      if(this.data.appBaseData.state==='STARTED' && this.data.appBaseData.instance!==0){
        var exampleUrl='/v2/apps/'+this.data.appguid+'/stats';
        request.getData(exampleUrl,'GET').then((data)=>{
          var newData=data[0];
          this.setData({
            exampleData:{
              name:newData.stats.name,
              state:newData.state,
              host:newData.stats.host,
              port:newData.stats.port,
              uptime:utils.processTimeStapToTime(newData.stats.uptime),
              mem_quota:newData.stats.mem_quota/(1024*1024),
              disk_quota:newData.stats.disk_quota/(1024*1024),
              cpu:newData.stats.usage.cpu.toFixed(2),
              mem:(newData.stats.usage.mem/(1024*1024)).toFixed(2),
              disk:(newData.stats.usage.disk/(1024*1024)).toFixed(2)
            }
          })
        })
      }
    }
  },
  // 日志消息
  getlogData:function(){
    if(this.data.logData.length){
      return
    }
    if(this.data.logData.length!==0){
      return;
    }else{
      var logUrl='/log/getOpersByAppId/'+this.data.appguid;
      request.getData(logUrl,'GET','','log').then((data)=>{
        var logData=[];
        for(var i of data){
          logData.push({
            msg:i.msg,
            time:i.time
          })
        }
        this.setData({
          logData:logData
        })
      })
    }
  },
  // 绑定服务
  getBindServiceData:function(){
    if(this.data.bindServiceData.length){
      return
    }
    var bindUrl='/v2/apps/'+this.data.appguid+'/service_bindings?inline-relations-depth=1';
    request.getData(bindUrl,'GET').then((data)=>{
      if(data.resources.length!==0){
        var instanceUrl=[];
        for(var i of data.resources){
          instanceUrl.push({
            name:i.entity.service_instance.entity.name,
            url:'/v2/service_plans/'+i.entity.service_instance.entity.service_plan_guid+'?inline-relations-depth=1'
          })
        }
        for(let j of instanceUrl){
          var bindServiceData=[];
          request.getData(j.url,'GET').then((data)=>{
            bindServiceData.push({
              name:j.name,
              desc:data.entity.description,
              free:data.entity.free,
              plan:data.entity.name
            })
            this.setData({
              bindServiceData:bindServiceData
            })
          })
        }
      }
    })
  },
  // 域名
  getDomainData:function(){
    if(this.data.domainData.length){
      return
    }
    var domainUrl='/v2/apps/'+this.data.appguid+'/routes';
    request.getData(domainUrl,'GET').then((data)=>{
      var domainData=[];
      if(data.resources.length){
        for(var i of data.resources){
          domainData.push({
            time:utils.processTime(i.metadata.created_at),
            host:i.entity.host
          })
        }
        this.setData({
          domainData:domainData
        })
      }
    })
  },
  // 环境变量
  getEnvData:function(){
if(this.data.envData.length){
  return
}
    var envUrl='/v2/apps/'+this.data.appguid+'/env';
    request.getData(envUrl,'GET').then((data)=>{
      if(data.environment_json){
        var newData=data.environment_json;
        var envData=[];
        for(var key in newData){
          envData.push({
            key:key,
            value:newData[key]
          })
        }
        this.setData({
          envData:envData
        })
      }
    })
  },
  // 点击关注
  onLoveTap:function(e){
      var userData=this.data.userData;
    var postsCollected=userData.posts_collected?userData.posts_collected:{};
    var guid=this.data.appguid;
    if(!postsCollected[guid]){
      postsCollected[guid]=true;
    }else{
    delete postsCollected[guid];
    }
    this.setData({
      collected:postsCollected[guid]?postsCollected[guid]:false,
      postsCollected:postsCollected
    });
    wx.showToast({
      title: this.data.collected?'关注成功':'取消成功',
      icon: 'success',
      duration: 2000
    })

    userData.posts_collected=postsCollected;
    wx.setStorageSync(this.data.currentName,userData)
},
getCollected:function(){
  var postId=this.data.appguid;
  var userData=utils.getStorage(this.data.currentName);
  var postsCollected=userData.posts_collected;
  if(!postsCollected){
      userData.postsCollected={}
    wx.setStorageSync(this.data.currentName,userData)
  }
  this.setData({
    collected:postsCollected[postId],
    postsCollected:postsCollected
  });
},
onUnload:function(){
if(!utils.isObjectValueEqual(this.data.oldPostsCollected,this.data.postsCollected)){
  var userData=utils.getStorage(this.data.currentName);
    userData.loveAppChanged=true;
utils.setStorage(this.data.currentName,userData)
}else{
  return;
}
}
})
