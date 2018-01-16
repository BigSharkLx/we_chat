var app=getApp();
var utils=require('../../utils/utils');
Page({
  data: {
    avatarUrl:'/images/truepaas.png'
  },
  onLoad: function (options) {
    var userName=utils.getStorage('currentUser');
    this.setData({
      userName:userName
    })
    if(app.globalData.userInfo){
      var avatarUrl=app.globalData.userInfo.avatarUrl;
      this.setData({
        avatarUrl:avatarUrl
      })
    }
  },
  toSet:function(e){
    wx.navigateTo({
  url: 'set/set'
})
  },
  toMessage:function(e){
    wx.navigateTo({
  url: 'message/message'
})
},
toFocus:function(e){
  wx.navigateTo({
url: 'focus/focus'
})
},
showBigImg:function(){
  wx.previewImage({
    current: this.data.avatarUrl,
     urls: [this.data.avatarUrl]
  })
},
aboutUs:()=>{
  wx.navigateTo({
url: 'us/us'
})
},
signOut:()=>{
  wx.showModal({
    title: '退出登录',
    content: '确定退出当前登录吗？',
    success: function(res) {
      if (res.confirm) {
        wx.reLaunch({
          url: '/pages/login/login'
        })
      } else if (res.cancel) {
        return;
      }
    }
  })
}
})
