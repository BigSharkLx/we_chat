var app=getApp();
var request=require('../../../utils/request');
var utils=require('../../../utils/utils');
Page({
  data: {
    activeTab:'app',
    memLimit:'',
    quota:{},
    instance:{},
    name:'',
    guid:'',
    appNum:'',
    instanceNum:'',
    startNum:'',
    stopNum:'',
    crashNum:'',
    memUsed:'',
    usersDetail:[],
    totalAppDetail:[],
    loveApp:false,
    totalSpace:{},
    memPercent:0,
    instancePercent:0,
    routerPercent:0
  },
  onLoad: function (options) {
    var guid=options.guid;
    var totalSpace=app.globalData[guid];
    var quotaurl=totalSpace.quota_url;
    this.setData({
      guid:guid,
      totalSpace:totalSpace
    })
  var a='';
if(typeof(quotaurl)!=="undefined"){
  // 拿到配额
   a=request.getData(quotaurl,'GET');
}
// 拿到应用实例
var getInstance='/v2/spaces/'+guid+'/service_instances';
var b=request.getData(getInstance,'GET');
// 拿到应用路由
var getRouter='/v2/spaces/'+guid+'/routes';
var c=request.getData(getRouter,'GET');
// 拿到应用用户
  var getaDevelop='/v2/spaces/'+guid+'/user_roles';
  var d=request.getData(getaDevelop,'GET');
  // 拿到应用详情
    var getaApp='/v2/spaces/'+guid+'/apps';
    var e=request.getData(getaApp,'GET');
Promise.all([a,b,c,d,e]).then((data)=>{
  // 拿到路由数
  this.setData({
    routerNum:data[2].total_results
  })
  // 如果存在空间配额
  if(data[0]){
    var quota={
      total_services:data[0].entity.total_services,
      total_routes:data[0].entity.total_routes,
      memory_limit:data[0].entity.memory_limit,
      app_task_limit:'~'
    }
    var memPercent=(((this.data.totalSpace.memUsed)/(quota.memory_limit))*100).toFixed(2);
    var instancePercent=(((this.data.totalSpace.instanceNum)/(quota.total_services))*100).toFixed(2);
    var routerPercent=(((this.data.routerNum)/(quota.total_routes))*100).toFixed(2);
    this.setData({
      quota:quota,
      memPercent:memPercent,
      instancePercent:instancePercent,
      routerPercent:routerPercent
    })
  }

  // 遍历服务实例数组
var instanceArr=[];
if(data[1].resources.length){
  for(let i of data[1].resources){
    // 拿到每个服务实例的详细情况
    var service_plan_url='/v2/service_plans/'+i.entity.service_plan_guid+'?inline-relations-depth=1'
    request.getData(service_plan_url,'GET').then((data)=>{
      instanceArr.push({
        instance_name:i.entity.name,
        instance_type:data.entity.name,
        instance_desc:data.entity.description,
        instance_price:data.entity.free?'免费':'收费',
        instance_time:data.metadata.created_at?utils.processTime(data.metadata.created_at):'无',
        instance_img:utils.processInstanceType(data.entity.service.entity.label)
      })
      this.setData({
        instanceArr:instanceArr
      })
    },(err)=>{

    })
  }
}


// 拿到用户信息
var totalUsers=data[3].resources;
if(totalUsers.length!==0){
  var usersDetail=[];
  for(var i=0;i<totalUsers.length;i++){
    usersDetail.push(
      {
        username:totalUsers[i].entity.username,
        space_roles:{
          space_developer:totalUsers[i].entity.space_roles.indexOf("space_developer")!==-1,
          space_manager:totalUsers[i].entity.space_roles.indexOf("space_manager")!==-1,
          space_auditor:totalUsers[i].entity.space_roles.indexOf("space_auditor")!==-1
        }
      }
    )
  }
  this.setData({
    usersDetail:usersDetail
  })
}

// 拿到空间下的所有应用
var appDetail=data[4].resources;
var totalAppDetail=[];
for(let i of appDetail){
var options={
  appName:i.entity.name,
  state:i.entity.state,
  instance:i.entity.instances,
  time:i.metadata.updated_at?utils.processTime(i.metadata.updated_at):'无',
  appguid:i.metadata.guid,
  memory:i.entity.memory,
  buildpack:utils.processBuildpack(i.entity.buildpack)
}
totalAppDetail.push(options)
app.globalData[i.metadata.guid]=options;
}
this.setData({
  totalAppDetail:totalAppDetail
})



},(err)=>{
console.log(err);
})
  },
  onReady: function () {
    // 动态改变导航栏名字
    wx.setNavigationBarTitle({
      title:`空间【${this.data.totalSpace.name}】`
})
  },
  spaceTabTap:function(e){
    // tab栏点击
    this.setData({
      activeTab:e.currentTarget.dataset.name
    })
  },
  toApp:function(e){
    var appguid=e.currentTarget.dataset.appguid;
    wx.navigateTo({
      url: 'app/app?appguid='+appguid
})
}
})
