var app=getApp();
var request=require('../../utils/request');
var utils=require('../../utils/utils');
Page({
  data: {
    url:'/users/token',
    userName:'',
    showClear:false
  },
  onLoad: function (options) {
    var userName=utils.getStorage('currentUser');
    this.setData({
      userName:userName?userName:''
    })
  },
  loginSubmit: function (e) {
    var that=this;
    var username=e.detail.value.userName;
    wx.setStorageSync('currentUser',username);
    var userData=wx.getStorageSync(username)||{};
    userData.username=username
    var options={
      'username': e.detail.value.userName,
      'password':e.detail.value.passWord
    }
    request.getData(this.data.url,'POST',options).then(function(data){
      if(data.status===0&&data.data.access_token){
        userData.access_token=data.data.access_token;
        wx.setStorageSync(username,userData)
        wx.switchTab({
          url: '../index/index'
        })
      }else{
        wx.showModal({
          title: '登录失败',
          content: data.msg,
          showCancel:false
        })
      }
    },function(err){
      console.log(err);
    })

  },
  inputClear:function(){
this.setData({
  userName:'',
  showClear:false
})
},
userInput:function(e){
  console.log();
  if(e.detail.value){
    this.setData({
      showClear:true
    })
  }else{
    this.setData({
      showClear:false
    })
  }
}
})
