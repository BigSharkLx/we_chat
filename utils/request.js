var app = getApp();
var utils=require('./utils');
module.exports={
  getData:function(url,method,data,special){
    var username=utils.getStorage('currentUser');
    var access_token=utils.getStorage(username).access_token;
    var header={
      'content-type':special!=='version'?'application/json':'application/x-www-form-urlencoded'
    }
    header.Authorization='Bearer '+access_token;
    data=data?data:'';
    return new Promise(function(resolve,rej){
      wx.request({
        url: app.globalData.baseUrl+url,
        method:method,
        header:header,
        data:data,
        success: function(res) {
          if((res.statusCode>=200)&&(res.statusCode<300)){
              resolve(res.data)
          }else{
            if(res.data.code===1000){
              wx.reLaunch({
                url: '/pages/login/login'
              })
            }else{
              var err = new Error('请求报错');
              rej(err)
            }
          }
        },
        fail:function(err){
          rej(err)
        }
      })
    })
  }
}
