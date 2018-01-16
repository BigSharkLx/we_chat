App({
  globalData:{
    baseUrl:'https://user.truepaas.com',
    token:'',
    userInfo:null
  },
  onLaunch: function () {
    // 获取用户信息
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
            }
          })
  }
})
