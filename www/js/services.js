angular.module('services', ['ionic','ngResource'])

// 客户端配置
.constant('CONFIG', {
  baseUrl: 'http://121.43.107.106:8055/Api/v1/',
  //revUserId: "",
  //TerminalName: "",
  //TerminalIP: "",
  //DeviceType: '1',
})

// --------一些公用说明--------
//角色 {'DivideLeader':'分流组长','DividePersonnel':'分流人员','EmergencyPersonnel':'急救人员'}
//伤情等级  {'1':'轻','2':'中','3':'重','4':重危'}


// 本地存储函数
.factory('Storage', ['$window', function ($window) {
  return {
    set: function(key, value) {
      $window.localStorage.setItem(key, value);
    },
    get: function(key) {
      return $window.localStorage.getItem(key);
    },
    rm: function(key) {
      $window.localStorage.removeItem(key);
    },
    clear: function() {
      $window.localStorage.clear();
    }
  };
}])

//公用函数
.factory('Common', ['Storage', function (Storage) {
return{
    // 获取RevisonInfo信息 Common.postInformation().revUserId
    postInformation:function(){
      var postInformation={};
      if(window.localStorage['UID']==null){
        postInformation.revUserId = 'who'
      }
      else{
        postInformation.revUserId = window.localStorage['UID'];
      }
      
      postInformation.TerminalIP = 'IP';
      if(window.localStorage['TerminalName']==null){
        postInformation.TerminalName = 'which';
      }
      else{
        postInformation.TerminalName = window.localStorage['TerminalName'];
      }
      postInformation.DeviceType = 2;
      return postInformation;
    },
    //获取到s的当前时间
    DateTimeNow:function(){
      var date = new Date();
      var dt={};
      dt.year=date.getFullYear().toString();
      dt.year.length==1?dt.year='0'+dt.year:dt.year=dt.year;
      dt.month=(date.getMonth()+1).toString();
      dt.month.length==1?dt.month='0'+dt.month:dt.month=dt.month;
      dt.day=date.getDate().toString();
      dt.day.length==1?dt.day='0'+dt.day:dt.day=dt.day;
      dt.hour=date.getHours().toString();
      dt.hour.length==1?dt.hour='0'+dt.hour:dt.hour=dt.hour;
      dt.minute=date.getMinutes().toString();
      dt.minute.length==1?dt.minute='0'+dt.minute:dt.minute=dt.minute;
      dt.second=date.getSeconds().toString();
      dt.second.length==1?dt.second='0'+dt.second:dt.second=dt.second;
      dt.fullTime=dt.year+'-'+dt.month+'-'+dt.day+' '+dt.hour+':'+dt.minute+':'+dt.second;
      return dt;
    }
  }
}])

// 数据模型函数, 具有取消(cancel/abort)HTTP请求(HTTP request)的功能
.factory('Data',['$resource', '$q','$interval' ,'CONFIG','Storage' , function($resource,$q,$interval ,CONFIG,Storage){
  var serve={};
  var abort = $q.defer();
  var getToken=function(){
    return Storage.get('TOKEN') ;
  }

  var Users = function(){
    return $resource(CONFIG.baseUrl + ':path/:route',{path:'UserInfo',},{
      LogOn:{method:'POST', params:{route: 'LogOn',UserID:'@UserID',LoginPassword:'@LoginPassword'}, timeout: 10000},
      UserRegister:{method:'POST', params:{route: 'UserRegister'}, timeout: 10000},
      ChangePassword:{method:'POST',params:{route:'ChangePassword',UserID:'@UserID',OldPassword:'@OldPassword',NewPassword:'@NewPassword'},timeout: 10000},
      UID:{method:'GET',params:{route:'UID',Type:'@Type',Name:'@Name'},timeout:10000},
      ModifyUserInfo:{method:'POST',params:{route:'ModifyUserInfo',UserID:'@UserID',RoleCode:'@RoleCode',UserName:'@UserName',Occupation:"@Occupation",Position:'@Position',Affiliation:'@Affiliation'},timeout:10000},
      SetUserInfo:{method:'POST',params:{route:'SetUserInfo'},timeout:10000},
      GetModifyUserInfo:{method:'GET',params:{route:'GetModifyUserInfo',UserID:'@UserID'},timeout:10000},
    });
  };
  var MstType = function(){
    return $resource(CONFIG.baseUrl + ':path/:route',{path:'MstType',},{
      GetMstType:{method:'GET',isArray:true, params:{route: 'GetMstType',Category:'@Category'}, timeout: 10000}
    });
  }; 
  var MobileDevice = function(){
    return $resource(CONFIG.baseUrl + ':path/:route',{path:'MobileDevice',},{
      SetMobileDevice:{method:'POST', params:{route: 'SetMobileDevice'}, timeout: 10000}
    });
  };  
  var PatientInfo = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'PatientInfo'},
      {
        SetPatientInfo: {method:'POST',params:{route: 'SetPatientInfo'}, timeout:10000},
        GetNewPatientID: {method:'GET',params:{route: 'GetNewPatientID'}, timeout:10000},
        GetPsPatientInfo: {method:'GET',params:{route: 'GetPsPatientInfo',strPatientID:'@strPatientID'}, timeout:10000},
        CheckPatientID: {method:'POST',params:{route: 'CheckPatientID',PatientID:'@PatientID'}, timeout:10000},
      });
  };
  var PatientVisitInfo = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'PatientVisitInfo'},
      {
        GetPatientsbyStatus: {method:'GET',isArray: true,params:{route: 'GetPatientsbyStatus', strStatus:'@strStatus'}, timeout:10000},
        GetPatientbyPID: {method:'GET',params:{route: 'GetPatientbyPID', strPatientID:'@strPatientID'}, timeout:10000},
        GetNewVisitNo: {method:'GET',params:{route: 'GetNewVisitNo', patientID:'@patientID'}, timeout:10000},
        UpdateInjury: {method:'POST',params:{route: 'UpdateInjury'}, timeout:10000},
        UpdateEva: {method:'POST',params:{route: 'UpdateEva'}, timeout:10000},
        GetPatientVisitInfo: {method:'GET',params:{route: 'GetPatientVisitInfo', strPatientID:'@strPatientID',strVisitNo:'@strVisitNo'}, timeout:10000},
        SetPsPatientVisitInfo: {method:'POST',params:{route: 'SetPsPatientVisitInfo'}, timeout:10000},
        UpdateTriage: {method:'POST', params:{route:'UpdateTriage'}, timeout:10000},
      });
  };
  var VitalSignInfo = function(){
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'VitalSignInfo'}, {
      GetVitalSignInfos: {method:'GET', params:{route:'GetVitalSignInfos', PatientID:'@PatientID', VisitNo:'@VisitNo'}, isArray:true, timeout:10000},
    });
  };
  var EmergencyInfo = function(){
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'EmergencyInfo'}, {
      GetEmergencyInfos: {method:'GET', params:{route:'GetEmergencyInfos', PatientID:'@PatientID', VisitNo:'@VisitNo'}, isArray:true, timeout:10000},
    });
  };
  serve.abort = function ($scope) {
  abort.resolve();
  $interval(function () {
    abort = $q.defer();
    serve.Users = Users(); 
    serve.MstType = MstType(); 
    serve.MobileDevice = MobileDevice(); 
    serve.PatientInfo = PatientInfo(); 
    serve.PatientVisitInfo = PatientVisitInfo(); 
    serve.VitalSignInfo = VitalSignInfo();
    serve.EmergencyInfo = EmergencyInfo();
    }, 0, 1);
  };
  serve.Users = Users();
  serve.MstType = MstType(); 
  serve.MobileDevice = MobileDevice(); 
  serve.PatientInfo = PatientInfo(); 
  serve.PatientVisitInfo = PatientVisitInfo(); 
  serve.VitalSignInfo = VitalSignInfo();
  serve.EmergencyInfo = EmergencyInfo();
  return serve;
}])

//-------用户基本操作-登录、注册、修改密码、位置选择、个人信息维护-------- [熊嘉臻]
.factory('UserInfo', ['$q', 'Data',function($q, Data){
  var self = this;
  var RevUserId="xxx";
  var TerminalName = 'X-PC' , TerminalIP = '10.110.110.110';
  self.isPasswdValid = function(passwd){
    var patrn=/^(\w){6,20}$/;    
    if (patrn.exec(passwd)){
      return true; 
    } 
    return false;
  }
  self.UserRegister = function(form){
    var deferred = $q.defer();
    form.RevUserId = RevUserId; 
    form.TerminalName = TerminalName; 
    form.TerminalIP = TerminalIP;
    Data.Users.UserRegister(form,
      function(s){
        deferred.resolve(s);
      },function(e){
        deferred.reject(e);
      });
    return deferred.promise;
  };

  self.ChangePassword = function (UserID,OldPassword,NewPassword) {
    var deferred = $q.defer();
    Data.Users.ChangePassword({UserID:UserID,OldPassword:OldPassword,NewPassword:NewPassword}, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  };
  
  self.LogOn = function (UserID,LoginPassword) {
    var deferred = $q.defer();
    Data.Users.LogOn({UserID:UserID,LoginPassword:LoginPassword}, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  };

  self.ModifyUserInfo = function (UserID,RoleCode,UserName,Occupation,Position,Affiliation) {
    var deferred = $q.defer();
    Data.Users.ModifyUserInfo({UserID:UserID,RoleCode:RoleCode,UserName:UserName,Occupation:Occupation,Position:Position,Affiliation:Affiliation}, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  };  
  self.SetUserInfo = function (UserID,PassWord,UserName,RoleCode,UnitCode,Location) {
    var deferred = $q.defer();
    Data.Users.SetUserInfo({UserID:UserID,PassWord:PassWord,UserName:UserName,RoleCode:RoleCode,UnitCode:UnitCode,Location:Location}, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  };
  self.GetModifyUserInfo = function (UserID) {
    var deferred = $q.defer();
    Data.Users.GetModifyUserInfo({UserID:UserID}, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  };
  self.GetMstType = function(key){
    var deferred = $q.defer();
    Data.MstType.GetMstType({Category:key}, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;    
  }
  self.SetMobileDevice = function(form){
    var deferred = $q.defer();
    form.TerminalName = TerminalName;
    form.TerminalIP = TerminalIP;
    Data.MobileDevice.SetMobileDevice(form, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;    
  }  
  return self;
}])

//-------急救人员-列表、新建、后送--------- [赵艳霞]
//获取字典表MstType数据
.factory('MstType', ['$q','$http', 'Data', function($q,$http, Data){
  var self = this;

  self.GetMstType = function(Category){
    var deferred = $q.defer();
    Data.MstType.GetMstType({Category:Category},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  return self;
}])

//病人基本信息
.factory('PatientInfo', ['$q','$http', 'Data', function($q,$http, Data){
  var self = this;

  self.SetPatientInfo = function(sendData){
    var deferred = $q.defer();
    Data.PatientInfo.SetPatientInfo(sendData,
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };

  self.GetNewPatientID = function(){
    var deferred = $q.defer();
    Data.PatientInfo.GetNewPatientID(
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  self.GetPsPatientInfo = function(strPatientID){
    var deferred = $q.defer();
    Data.PatientInfo.GetPsPatientInfo({strPatientID:strPatientID},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  
  self.CheckPatientID = function(strPatientID){
    var deferred = $q.defer();
    Data.PatientInfo.CheckPatientID({PatientID:strPatientID},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };

  return self;
}])

//病人就诊信息
.factory('PatientVisitInfo', ['$q','$http', 'Data', function($q,$http, Data){
  var self = this;

  self.GetPatientsbyStatus = function(strStatus){
    var deferred = $q.defer();
    Data.PatientVisitInfo.GetPatientsbyStatus({strStatus:strStatus},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  self.GetPatientbyPID = function(strPatientID){
    var deferred = $q.defer();
    Data.PatientVisitInfo.GetPatientbyPID({strPatientID:strPatientID},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  self.GetNewVisitNo = function(patientID){
    var deferred = $q.defer();
    Data.PatientVisitInfo.GetNewVisitNo({patientID:patientID},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };

  self.UpdateInjury = function(sendData){
    var deferred = $q.defer();
    Data.PatientVisitInfo.UpdateInjury(sendData,
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };

   self.UpdateEva = function(sendData){
    var deferred = $q.defer();
    Data.PatientVisitInfo.UpdateEva(sendData,
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };

  self.GetPatientVisitInfo = function(strPatientID, strVisitNo){
    var deferred = $q.defer();
    Data.PatientVisitInfo.GetPatientVisitInfo({strPatientID:strPatientID, strVisitNo:strVisitNo},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  
  self.SetPsPatientVisitInfo = function(sendData){
    var deferred = $q.defer();
    Data.PatientVisitInfo.SetPsPatientVisitInfo(sendData,
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  self.UpdateTriage = function(PatientID, VisitNo, Status, TriageDateTime, TriageToDept){
    var deferred = $q.defer();
    Data.PatientVisitInfo.UpdateTriage({PatientID:PatientID, VisitNo:VisitNo, Status:Status, TriageDateTime:TriageDateTime, TriageToDept:TriageToDept, UserID:'', TerminalName:'', TerminalIP:''}, function(data, headers){
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])

//-------急救人员-伤情与处置-------- [马志彬]

//-------分流人员-列表、信息查看、分流-------- [张亚童]
.factory('VitalSignInfo', ['$q', '$http', 'Data', function( $q, $http, Data ){
  var self = this;
  // 获取某一病人体征信息（供分流使用）--张桠童
  self.GetVitalSignInfos = function(PatientID, VisitNo){
    var deferred = $q.defer();
    Data.VitalSignInfo.GetVitalSignInfos({PatientID:PatientID, VisitNo:VisitNo}, function(data, headers){
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])

.factory('EmergencyInfo', ['$q', '$http', 'Data', function( $q, $http, Data ){
  var self = this;
  // 获取某一病人伤情/处置/等级（供分流使用）--张桠童
  self.GetEmergencyInfos = function(PatientID, VisitNo){
    var deferred = $q.defer();
    Data.EmergencyInfo.GetEmergencyInfos({PatientID:PatientID, VisitNo:VisitNo}, function(data, headers){
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])
;
