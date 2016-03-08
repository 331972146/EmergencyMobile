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
  serve.abort = function ($scope) {
  abort.resolve();
  $interval(function () {
    abort = $q.defer();
    serve.Users = Users(); 
    serve.MstType = MstType(); 
    serve.MobileDevice = MobileDevice(); 
    }, 0, 1);
  };
  serve.Users = Users();
  serve.MstType = MstType(); 
  serve.MobileDevice = MobileDevice(); 
  return serve;
}])

//示例
.factory('VitalInfo', ['$q', 'Data', 'extraInfo',function($q, Data, extraInfo){
  var self = this;

  self.PostPatientVitalSigns = function(data){
    var deferred = $q.defer();
    Data.VitalInfo.PostPatientVitalSigns(data,
      function(s){
        deferred.resolve(s);
      },function(e){
        deferred.reject(e);
      });
    return deferred.promise;
  };

  self.VitalSigns = function (UserId,StartDate,EndDate,top,skip) {
    var deferred = $q.defer();
    Data.VitalInfo.VitalSigns({UserId:UserId,StartDate:StartDate,EndDate:EndDate,$top:top,$skip:skip}, function (data, headers) {
      deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
    return deferred.promise;
  };
  
  self.GetLatestPatientVitalSigns = function (data) {
    var deferred = $q.defer();
    Data.VitalInfo.GetLatestPatientVitalSigns(data, function (data, headers) {
      deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
    return deferred.promise;
  };
  return self;
}])

//用户基本操作-登录、注册、修改密码、位置选择、个人信息维护 [熊嘉臻]
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

//急救人员-列表、新建、后送 [赵艳霞]

//急救人员-伤情与处置

//分流人员-列表、信息查看、分流



;
