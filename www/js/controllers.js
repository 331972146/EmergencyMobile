
angular.module('controllers', ['ionic','ngResource','services'])
.controller('SignInCtrl', ['$scope', 'Storage', function ($scope, Storage) {
  // Storage.set('initState', 'simple.homepage');
   $scope.DeviceID=ionic.Platform.device().uuid; //获取移动设备
}])
.controller('NewPatientCtrl', ['$scope', '$ionicHistory', function ($scope, $ionicHistory) {

  $scope.goBack = function() {
    console.log("1");
    $ionicHistory.goBack();
  };

}])

// --------登录、注册、修改密码、位置选择、个人信息维护 [熊佳臻]----------------
//登录
.controller('SignInCtrl',['$state','$scope','$ionicLoading','UserInfo','Storage',function($state,$scope,$ionicLoading,UserInfo,Storage){
  $scope.account = {UserID:'',password:''};
  if(Storage.get('USERID')){
    $scope.account.UserID=Storage.get('USERID')
  }
  $scope.signIn = function(account){
    $scope.logStatus="";
    if(account.UserID!='' && account.password!=''){
      if(UserInfo.isPasswdValid(account.password)){
        $ionicLoading.show();
        UserInfo.LogOn(account.UserID,account.password)
        .then(function(data){
          if(data.Result==1){
            $ionicLoading.hide();
            $ionicLoading.show({template:'登录成功',noBackdrop:true,duration:1500});
            Storage.set('RoleCode',data.RoleCode);
            // $scope.logStatus="登录成功";
            Storage.set('USERID',account.UserID);
            $state.go('location');
          }else{
            $ionicLoading.hide();
            $scope.logStatus="登录失败";
          }
        },function(err){
          $ionicLoading.hide();
          $scope.logStatus="登录失败，网络问题";
        });
      }else{
        $scope.logStatus="密码不符合要求"
      }
    }else{
      $scope.logStatus="请完整填写登录信息"
    }
  }
  var t={'DivideLeader':'分流组长','DividePersonnel':'分流人员','EmergencyPersonnel':'急救人员'};
  Storage.set("DictRoleMatch",JSON.stringify(t));
  $scope.toRegister = function(){
    // $rootScope.registerEnterState=true;
    $state.go('register');
  }
}])
//注册 
.controller('RegisterCtrl',['$ionicLoading','$state','$scope','$rootScope','$ionicHistory','UserInfo','Storage',function($ionicLoading,$state,$scope,$rootScope,$ionicHistory,UserInfo,Storage){
  var DictRoles=JSON.parse(Storage.get('DictRoleMatch'));//DictRoleMatch在signinCtrl初始化
  $scope.register={UserId:'',LoginPassword:'' ,LoginPassword0:'',UserName:"",role:"", Occupation: "", Position: "",Affiliaation: ""};
  $scope.Register = function(form){
    $scope.logStatus="";
    if(form.UserId!='' && form.LoginPassword!='' && form.LoginPassword0!='' && form.UserName!=''){
      if(form.LoginPassword!=form.LoginPassword0){
        $scope.logStatus="两次密码的输入不一致";
        return;
      }
      if(UserInfo.isPasswdValid(form.LoginPassword)){
        $ionicLoading.show();
        var sendData={
          "UserId": "",
          "RoleCode": "",
          "UserName": "",
          "Occupation": "",
          "Position": "",
          "Affiliaation": "",
          "LoginPassword": ""
        }
        angular.forEach(DictRoles,function(value,key){
          if(form.role==value){
            form.RoleCode = key;
          }
        });         
        delete form['role'];
        delete form['LoginPassword0'];
        angular.forEach(form,function(value,key){
          sendData[key]=value;
        });          
        UserInfo.UserRegister(sendData)
        .then(function(data){
          $ionicLoading.hide();
          $ionicLoading.show({template:'注册成功',noBackdrop:true,duration:1500})
          Storage.set('RoleCode',sendData.RoleCode);
          // $scope.logStatus="注册成功";
          Storage.set('USERID',sendData.UserId);
          $state.go('location');
        },function(err){
          $ionicLoading.hide();
          $scope.logStatus=err.data.result;
        });
      }else{
        $scope.logStatus="密码格式不符合要求"
      }      
    }else{
      $scope.logStatus="请输入完整信息！"
    }      
  }
  $scope.onClickBackward = function(){
    $ionicHistory.goBack();
  }  
}])
//设置密码
.controller('SetPasswordCtrl',['$scope','$state','$ionicHistory','$ionicLoading','Storage','UserInfo', function($scope, $state,$ionicHistory,$ionicLoading,Storage,UserInfo){
  $scope.ishide=false;
  $scope.change={oldPassword:"",newPassword:"",confirmPassword:""};
  $scope.passwordCheck = function(change){
    if(change.oldPassword){
      if(UserInfo.isPasswdValid(change.oldPassword)){
        $ionicLoading.show();
        UserInfo.LogOn(Storage.get('USERID'),change.oldPassword)
        .then(function(data){
          $ionicLoading.hide();
          $ionicLoading.show({template:'密码验证成功',noBackdrop:true,duration:1500})
          // $scope.logStatus1='验证成功';
          $scope.ishide=true; 
          // Storage.set('RoleCode',data.RoleCode);
          // $scope.logStatus="登录成功";
          // Storage.set('USERID',account.UserID);
          // $timeout($state.go('location'),500);
        },function(err){
          $ionicLoading.hide();
          $scope.logStatus1="验证失败";
        });
      }else{
        $scope.logStatus1="密码格式不符合要求";
      }    
    } 
  }

  $scope.gotoChange = function(change){
    $scope.logStatus2='';
    if((change.newPassword!="") && (change.confirmPassword!="")){
      if(change.newPassword == change.confirmPassword){
        if(UserInfo.isPasswdValid(change.newPassword)){
          $ionicLoading.show();
          UserInfo.ChangePassword(Storage.get('USERID'),change.oldPassword,change.newPassword)
          .then(function(data){
            $ionicLoading.hide();
            $ionicLoading.show({template:'修改成功',noBackdrop:true,duration:1500})
            // $scope.logStatus2="修改成功";
            $state.go('ambulance.mine');
          },function(err){
            $ionicLoading.hide();
            $scope.logStatus2="修改失败，网络错误";
          })
        }else{
          $scope.logStatus2="密码格式不符合要求";
        }
      }else{
        $scope.logStatus2="两次输入的密码不一致";
      }
    }else{
      $scope.logStatus2="请输入两遍新密码"
    }
  }
  $scope.onClickBackward = function(){
    $ionicHistory.goBack();
  }
}])
//我的位置
.controller('LocationCtrl',['$state','$scope','$rootScope',function($state,$scope,$rootScope){
  $scope.myLocation={text:'',value:''};
  $scope.locationList=[];
  $scope.navFlag=false;
  $scope.$on('$ionicView.enter', function() {
    if($rootScope.MY_LOCATION == undefined){
      $scope.isListShown=true;
    }else{
      $scope.myLocation=$rootScope.MY_LOCATION;
      $scope.isListShown=false;
      $scope.navFlag=true;
    }   
  });

  $scope.toggleList = function(){
    $scope.isListShown=!$scope.isListShown;
  }
  $scope.isIconShown = function(){
    return $scope.isListShown?true:false;
  }
  
  for(var i =0;i<5;i++){
    $scope.locationList.push({text:''+i,value:i+'value'});
  }   
  $scope.setLocation = function(){
    $rootScope.MY_LOCATION = $scope.myLocation;
    $scope.isListShown=false;
    $state.go('ambulance.list');
  }
  $scope.onClickBackward = function(){
    if($scope.navFlag){
      $state.go('ambulance.mine')
    }
  }
}])
//设置
.controller('SettingCtrl',['$state','$scope','$ionicPopup','$timeout','$ionicHistory','$rootScope','Storage',function($state,$scope,$ionicPopup,$timeout,$ionicHistory,$rootScope,Storage){
  $scope.$on('$ionicView.enter', function() {
    $scope.myLocation=$rootScope.MY_LOCATION.text;
    $scope.isListShown=false;
  });
  $scope.logOutConfirm = function(){
    var myPopup = $ionicPopup.show({
      template: '<center>确定要退出登录吗?</center>',
      title: '退出',
      //subTitle: '2',
      scope: $scope,
      buttons: [
        { text: '取消',
          type: 'button-small',
          onTap: function(e) {}
        },
        {
          text: '<b>确定</b>',
          type: 'button-small button-calm ',
          onTap: function(e) {
            var USERID=Storage.get('USERID');
            Storage.clear();
            Storage.set('USERID',USERID);
            $timeout(function(){
              $ionicHistory.clearHistory();
              $ionicHistory.clearCache();
              $state.go('signIn');
            },100);
          }
        }
      ]
    });    
  }
}])
.controller('myProfileCtrl',['$state','$scope','$ionicHistory','$ionicLoading','UserInfo','Storage',function($state,$scope,$ionicHistory,$ionicLoading,UserInfo,Storage){
  var DictRoles=JSON.parse(Storage.get('DictRoleMatch'));
  var temp={};
  $scope.$on('$ionicView.enter', function(){
    if(temp){
      $scope.$apply(function(){
        $scope.profile = temp;
      })
    }
  });
  $scope.profile={UserName:'',role:'',Occupation:'',Position:'',Affiliation:''};
  $scope.upload = function(profile){
    $ionicLoading.show();
    angular.forEach(DictRoles,function(value,key){
      if(profile.role==value){
        profile.RoleCode = key;
      }
    });
    UserInfo.ModifyUserInfo(Storage.get('USERID'),profile.RoleCode,profile.UserName,profile.Occupation,profile.Position,profile.Affiliation)
    .then(function(data){
      $ionicLoading.hide();
      temp={UserName:profile.UserName,role:profile.role,Occupation:profile.Occupation,Position:profile.Position,Affiliation:profile.Affiliation};
      $ionicLoading.show({template:'修改成功',noBackdrop:true,duration:1500});
      // $scope.logStatus="修改成功";
    },function(err){
      $scope.logStatus="修改失败";
    })    
  }
  $ionicLoading.show();
  UserInfo.GetModifyUserInfo(Storage.get('USERID'))
  .then(function(data){
    $ionicLoading.hide();
    // $scope.profile.UserName = data.UserName;
    angular.forEach(DictRoles,function(value,key){
      if(data.RoleCode == key){
        data.role=value;
      }
    })
    delete data['RoleCode'];
    temp = data;
    $scope.profile = data;
  },function(err){
    $ionicLoading.hide();
  });
}])
//个人信息维护


// --------急救人员-列表、新建、后送 [赵艳霞]----------------
//已接收病人列表

//新建ID

//后送


// --------急救人员-伤情与处置 [马志彬]----------------
//伤情记录

//生理参数采集

//处置


// --------分流人员-列表、信息查看、分流 [张亚童]----------------
//已后送病人列表

//信息查看

//分流
