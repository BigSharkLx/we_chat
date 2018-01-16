var app=getApp();
var utils=require('../../../utils/utils');
var request=require('../../../utils/request');
Page({

  /**
  * 页面的初始数据
  */
  data: {
    appData:[],
    collectedData:{}
  },

  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    var currentName=wx.getStorageSync('currentUser');
    this.setData({
      currentName:currentName
    })
    var collectedData=utils.getStorage(currentName).posts_collected?utils.getStorage(currentName).posts_collected:{};
    this.setData({
      collectedData:collectedData,
      oldcollectedData:collectedData
    })
this.getAppFocus()
  },
onLoveTap:function(e){
var guid=e.currentTarget.dataset.guid;
var collectedData=this.data.collectedData;
if(!collectedData[guid]){
  collectedData[guid]=true;
}else{
delete collectedData[guid];
}
this.setData({
  collectedData:collectedData
})
var userData=utils.getStorage(this.data.currentName);
userData.posts_collected=collectedData;
utils.setStorage(this.data.currentName,userData)
wx.showToast({
  title: collectedData[guid]?'关注成功':'取消成功',
  icon: 'success',
  duration: 2000
})
},
getAppFocus:function(){
  var collectedData=this.data.collectedData;
  var url='/v2/apps'
  request.getData(url,'GET').then(data=>{
    if(data.resources.length){
      var appData=[];
      for(var i of data.resources){
        appData.push({
          name:i.entity.name,
          guid:i.metadata.guid,
          state:i.entity.state
        })
      }
appData.map((item,index)=>{
if(collectedData[item.guid]){
  appData.splice(index,1);
  appData.unshift(item)
}
})
  this.setData({
        appData:appData
      })
      wx.stopPullDownRefresh();
    }
  })
},
onPullDownRefresh:function(){
  this.getAppFocus()
},
onUnload:function(){
if(!utils.isObjectValueEqual(this.data.oldcollectedData,this.data.collectedData)){
  var userData=utils.getStorage(this.data.currentName);
  userData.loveAppChanged=true;
utils.setStorage(this.data.currentName,userData)
}
}
})
