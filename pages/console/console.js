var app=getApp();
var request=require('../../utils/request');
var utils=require('../../utils/utils');
var base64=require('../../utils/decodeBase64');
Page({
  data: {
    array:[],
    index:0,
    orgName:'',
    totalresources:[],
    orgDetailData:{},
    totalMemUsed:'',
    totalInstanceUsed:'',
    memPercent:'',
    instancePercent:'',
    totalSpace:[]
  },
  onLoad: function (options) {
    var currentName=wx.getStorageSync('currentUser');
    var userData=utils.getStorage(currentName);
    this.setData({
      currentName:currentName,
      userData:userData
    })
    var access_token=userData.access_token;
    var index=userData.orgIndex;
    if(index){
      this.setData({
        index:index
      })
    }
    // 根据access_token解析到user_guid
 var userMsg=JSON.parse(base64.base64decode(access_token.split('.')[1]));
    var userGuid=userMsg.user_id;
    var orgUrl='/v2/users/'+userGuid+'/organizations';
    // 发请求获取个人的组织信息
    request.getData(orgUrl,'GET').then((data)=>{
      var arr=[];
      if(data.resources.length!==0){
        for(var name of data.resources){
          arr.push(name.entity.name)
        }
      }
      this.setData({
        array:arr,
        totalresources:data.resources
      })
      this.changeOrg(this.data.index);

    },function(err){
      console.log(err);
    })
  },
  // 点击空间跳转
  toSpace:function(e){
    var guid= e.currentTarget.dataset.guid;
    var quota_url=e.currentTarget.dataset.quotaurl;
    var memUsed=e.currentTarget.dataset.memused;
    var name=e.currentTarget.dataset.name;
    wx.navigateTo({
      url: 'space/space?guid='+guid
    })
  },
  // 选择不同的组织
  bindPickerChange:function(e){
    this.setData({
      index: e.detail.value
    });
    var index=e.detail.value;
    this.changeOrg(index);
    // 将选择的组织保存在缓存
    var userData=this.data.userData;
    userData.orgIndex=index;
    utils.setStorage(this.data.currentName,userData)
  },
  // 根据选择的不同来拿到不同组织的值
  changeOrg:function(index){
    var newRes=this.data.totalresources[index];
    if(!newRes){
      return;
    }
    // 拿到当前组织的配额url
    var orgurl=newRes.entity.quota_definition_url;
    var a=request.getData(orgurl,'GET');
    // 拿到当前组织的guid
    var orgGuid=newRes.metadata.guid;
    // 根据不同组织获取不同空间
    var getSpaceUrl='/v2/organizations/'+orgGuid+'/spaces';
    var b=request.getData(getSpaceUrl,'GET');
    // 等全部异步请求完成在计算赋值
    Promise.all([a,b]).then((data)=>{
      var orgDetailData=data[0].entity;
      this.setData({
        orgDetailData:orgDetailData
      })
      // 拿到不同组织的不同空间
      var diffSpaceData=data[1].resources;
      var totalSpace=[];
      var options={};
      var totalMemUsed=0,totalInstanceUsed=0;
      for(let i of diffSpaceData){
        // 根据空间id拿到不同的空间数据
        this.getDiffSpace(i.metadata.guid).then((data)=>{
          var options={
            name:i.entity.name,
            guid:i.metadata.guid,
            quota_url:i.entity.space_quota_definition_url,
            appNum:data[0].total_results,
            instanceNum:data[1].total_results,
            startNum:utils.processAppStyle(data[0].resources).start.length,
            stopNum:utils.processAppStyle(data[0].resources).stop.length,
            crashNum:utils.processAppStyle(data[0].resources).crash.length,
            memUsed:utils.processMemUsed(data[0].resources)
          }
          totalSpace.push(options);
          app.globalData[i.metadata.guid]=options;
          totalMemUsed+=utils.processMemUsed(data[0].resources);
          totalInstanceUsed+=data[1].total_results;
          var memPercent=(((totalMemUsed/orgDetailData.memory_limit))*100).toFixed(2);
          var instancePercent=((totalInstanceUsed/orgDetailData.app_instance_limit))*100;

          this.setData({
            totalSpace:totalSpace,
            totalMemUsed:totalMemUsed,
            totalInstanceUsed:totalInstanceUsed,
            memPercent:memPercent,
            instancePercent:instancePercent
          })
        })
      }
    }).catch((err)=>{
      console.log(err);
    });
  },
  getDiffSpace:function(guid){
    return new Promise((resolve,reject)=>{
      var url_app='/v2/spaces/'+guid+'/apps';
      var a=request.getData(url_app,'GET');
      var url_instance='/v2/spaces/'+guid+'/service_instances';
      var b=request.getData(url_instance,'GET');
      Promise.all([a,b]).then((data)=>{
        resolve(data);
      },(err)=>{
        reject(err);
      })
    })
  }
})
