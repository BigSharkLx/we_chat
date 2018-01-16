var app=getApp();
var request=require('../../utils/request');
var utils=require('../../utils/utils');
var base64=require('../../utils/decodeBase64');
Page({
  data: {
    appData:[],
    noLovedApp:false
  },
  onLoad:function(){
    var currentName=wx.getStorageSync('currentUser');
    this.setData({
      currentName:currentName
    })
    var access_token=wx.getStorageSync(currentName).access_token;
    if(!access_token){
        wx.showLoading({
          title: '请登录···',
          mask:true
        })
      wx.reLaunch({
        url: '/pages/login/login',
        success:()=>{
           wx.hideLoading()
           }
      })
    }
  this.getLovedApp();
  },
  onShow: function() {
    var loveAppChanged=utils.getStorage(this.data.currentName).loveAppChanged;
    if(loveAppChanged){
      this.getLovedApp();
    }
},
  getLovedApp:function(){
    var userData=wx.getStorageSync(this.data.currentName)||{};
    var lovedApp=userData.posts_collected;
    var appGuidArr=[];
    if(lovedApp){
    for(var key in lovedApp){
    if(lovedApp[key]){
    appGuidArr.push(key)
    }
    }
    this.setData({
      appGuidArr:appGuidArr
    })
if(!appGuidArr.length){
this.setData({
  appData:[],
noLovedApp:true
})
wx.stopPullDownRefresh();
userData.loveAppChanged=false;
utils.setStorage(this.data.currentName,userData)
return;
}
    var appData=[];
    for(let i of appGuidArr){
    var url='/v2/apps/'+i;
    request.getData(url,'GET').then((data)=>{
      var options={
        appName:data.entity.name,
        state:data.entity.state,
        instance:data.entity.instances,
        time:utils.processTime(data.metadata.updated_at),
        appguid:data.metadata.guid,
        memory:data.entity.memory,
        buildpack:utils.processBuildpack(data.entity.buildpack)
      }
    appData.push(options)
    app.globalData[data.metadata.guid]=options;
    this.setData({
      appData:appData,
      noLovedApp:false
    })
    wx.stopPullDownRefresh();
    userData.loveAppChanged=false;
    utils.setStorage(this.data.currentName,userData)
    })
    }
  }else{
    this.setData({
    noLovedApp:true
    })
    wx.stopPullDownRefresh();
    userData.loveAppChanged=false;
    utils.setStorage(this.data.currentName,userData)
  }
  },
toApp:function(e){
  var appguid=e.currentTarget.dataset.appguid;
  wx.navigateTo({
    url: '/pages/console/space/app/app?appguid='+appguid
})
},
toFocus:function(){
  wx.navigateTo({
url: "/pages/aboutMe/focus/focus"
})
},
onPullDownRefresh:function(){
  this.getLovedApp();
}
})
