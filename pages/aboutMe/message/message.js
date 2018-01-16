var request=require('../../../utils/request');
var utils=require('../../../utils/utils');


Page({
  data: {
  activeTab:'resource',
  username:'',
  urlCount:10,
  appCount:10,
  resourceCount:10,
  resourceArr:[],
  urlArr:[],
  appArr:[],
  resourceArrfinished:false,
  urlArrfinished:false,
  appArrfinished:false
  },
  onLoad: function (options) {
    var userName=utils.getStorage('currentUser');
    this.setData({
      username:userName,
      url:'/message/getRecentMessagesByTypes1/'
    })
    this.getMsg('cpu-mem-disk-orgMem-spaMem-cpu_jsjtt-mem_jsjtt-disk_jsjtt',this.data.resourceCount).then((data)=>{
      this.setData({
        resourceArr:data
      })
    })
  },
  spaceTabTap:function(e){
    var typeName=e.currentTarget.dataset.name;
    this.setData({
      activeTab:e.currentTarget.dataset.name
    })
if('resource'===typeName){
  if(this.data.resourceArr.length){
    return;
  }
this.getMsg('cpu-mem-disk-orgMem-spaMem-cpu_jsjtt-mem_jsjtt-disk_jsjtt',this.data.resourceCount).then((data)=>{
      this.setData({
        resourceArr:data
      })
    });
}else if ('URL'===typeName) {
  if(this.data.urlArr.length){
    return;
  }
    this.getMsg('url',this.data.urlCount).then((data)=>{
      this.setData({
        urlArr:data
      })
    })
}else{
  if(this.data.appArr.length){
    return;
  }
    this.getMsg('app-space-customer',this.data.appCount).then((data)=>{
      this.setData({
        appArr:data
      })
    })
}
  },
  getMsg:function(type,count){
    var url=this.data.url+count;
    var msgArr=[];
    var options={
	"username":this.data.username,
	"type":type
}
return new Promise((resolve,reject)=>{
  request.getData(url,'POST',options).then((data)=>{
  for(var i of data){
  msgArr.push({
    time:i.time,
    msg:i.message
  })
  }
  resolve(msgArr)
  },(err)=>{
    reject(err);
  })
})
},
onReachBottom:function(){
var type=this.data.activeTab;
if('resource'===type){
  if(this.data.resourceArrfinished){
    return;
  }
  this.data.resourceCount+=10;
  this.getMsg('cpu-mem-disk-orgMem-spaMem-cpu_jsjtt-mem_jsjtt-disk_jsjtt',this.data.resourceCount).then((data)=>{
    if(data.length===this.data.resourceArr.length){
      this.setData({
        resourceArrfinished:true
      })
      return;
    }
        this.setData({
          resourceArr:data
        })
      });
}else if ('URL'===type){
  if(this.data.urlArrfinished){
    return;
  }
    this.data.urlCount+=10;
  this.getMsg('url',this.data.urlCount).then((data)=>{
    if(data.length===this.data.urlArr.length){
      this.setData({
        urlArrfinished:true
      })
      return;
    }
    this.setData({
      urlArr:data
    })
  })
}else{
  if(this.data.appArrfinished){
    return;
  }
  this.data.appCount+=10;
  this.getMsg('app-space-customer',this.data.appCount).then((data)=>{
    if(data.length===this.data.appArr.length){
      this.setData({
        appArrfinished:true
      })
      return;
    }
      this.setData({
        appArr:data
      })
  })
}
},
onPullDownRefresh:function(){
  var typeName=this.data.activeTab;
  if('resource'===typeName){
    this.setData({
      resourceCount:10,
      resourceArrfinished:false
    })
  this.getMsg('cpu-mem-disk-orgMem-spaMem-cpu_jsjtt-mem_jsjtt-disk_jsjtt',this.data.resourceCount).then((data)=>{
        this.setData({
          resourceArr:data
        })
        wx.stopPullDownRefresh();
      });
  }else if ('URL'===typeName) {
    this.setData({
      urlCount:10,
      urlArrfinished:false
    })
      this.getMsg('url',this.data.urlCount).then((data)=>{
        this.setData({
          urlArr:data
        })
        wx.stopPullDownRefresh();
      })
  }else{
    this.setData({
      appCount:10,
      appArrfinished:false
    })
      this.getMsg('app-space-customer',this.data.appCount).then((data)=>{
        this.setData({
          appArr:data
        })
        wx.stopPullDownRefresh();
      })
  }

}
})
