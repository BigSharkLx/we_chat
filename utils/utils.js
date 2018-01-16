module.exports={
getStorage:function(key){
return wx.getStorageSync(key)
},
setStorage:function(key,data){
  try {
      wx.setStorageSync(key,data)
  } catch (e) {
  }
},
// 统计运行  停止 异常数
processAppStyle:function(data){
var start=[],stop=[],crash=[];
for(var i of data){
  if(i.entity.state==='STARTED'&&i.entity.instances!==0){
start.push(1)
}else if (i.entity.state==='STOPPED') {
stop.push(1)
}else if (i.entity.state==='STARTED'&&i.entity.instances===0) {
crash.push(1)
}
}
return {
  start:start,
  stop:stop,
  crash:crash
}
},
// 相乘得到已用内存数
processMemUsed:function(data){
  var sum=0;
  for(var i of data){
    var num1=i.entity.memory;
    var num2=i.entity.instances;
   sum+=num1*num2
  }
  return sum;
},
// 预处理时间格式
processTime:function(data){
  var date=data.split('T')[0];
  var time1=data.split('T')[1];
  var time2=time1.substring(0,time1.length-1);
  var finalDate=date+' '+time2;
  return finalDate;
},
// 预处理应用动态类型
processAppMsgType:function(data){
  switch (data) {
    case 'app.crash':
    return '应用出现异常';
    break;
    case 'audit.app.create':
    return '创建了应用';
    break;
    case 'audit.app.map-route':
    return '绑定了子域名到应用';
    break;
    case 'audit.app.restage':
    return '重启了应用';
    break;
    case 'audit.app.start':
    return '启动了应用';
    break;
    case 'audit.app.stop':
    return '停止了应用';
    break;
    case 'audit.app.update':
    return '更新了应用';
    break;
    case 'audit.route.create':
    return '创建了路由';
    break;
    default:
    return '';
  }
},
// 预处理获取一个小时段的canvas值
processCanvasTime:function(){
  function formatDateTime(theDate) {
  var _hour = theDate.getHours();
  var _minute = theDate.getMinutes();
  var _second = theDate.getSeconds();
  var _year = theDate.getFullYear()
  var _month = theDate.getMonth();
  var _date = theDate.getDate();
  if(_hour<10){_hour="0"+_hour}
  if(_minute<10){_minute="0"+_minute}
  if(_second<10){_second="0"+_second}
  _month = _month + 1;
  if(_month < 10){_month = "0" + _month;}
  if(_date<10){_date="0"+_date  }
  return  _year + "-" + _month + "-" + _date + " " + _hour + ":" + _minute + ":" + _second ;
  }
  var originNow=new Date();
  var originOld=originNow.getTime()-3600000;
  var formatoldTime = new Date(originOld);
  var finalNow=formatDateTime(originNow);
  var finalOld=formatDateTime(formatoldTime)
return{
  finalNow:finalNow,
  finalOld:finalOld
}
},
processTimeStapToTime:function(s){
        var t;
       if(s > -1){
         var day= Math.floor(s/3600/24);
            t=day+'天'
           var hour = Math.floor(s/3600-24*day);
           var min = Math.floor(s/60) % 60;
           var sec = s % 60;
           if(hour < 10) {
               t += '0'+ hour + "时";
           } else {
               t += hour + "时";
           }
           if(min < 10){t += "0";}
           t += min + "分";
           if(sec < 10){t += "0";}
           t += sec.toFixed(0)+'秒';
       }
       return t;
},
processBuildpack:function(data){
  switch (data) {
    case 'Static':
    return '/images/app/nginx.png'
    break;
    case 'Java':
    return '/images/app/java.png'
    break;
    case 'NodeJS':
    return '/images/app/nodejs.png'
    break;
    default:
    return '/images/app/cloud.png'
  }
},
processInstanceType:function(data){
  switch (data) {
    case 'glusterfs':
    return '/images/app/Glusterfs.png'
    break;
    case 'p-mysql':
    return '/images/app/MySQL.png'
    break;
    case 'memcache':
    return '/images/app/memcached.png'
    break;
    case 'p-MongoDB':
    return '/images/app/mongodb.png'
    break;
    default:
    return '/images/app/Glusterfs.png'
  }
},
 isObjectValueEqual:function(a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
        return false;
    }
    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if (a[propName] !== b[propName]) {
            return false;
        }
    }
    return true;
}
}
