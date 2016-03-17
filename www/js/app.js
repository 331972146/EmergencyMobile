// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('EmergencyMobile', ['ionic', 'services', 'controllers', 'ngCordova','filters','directives'])

.run(function($ionicPlatform, $rootScope,$ionicLoading,$state, Storage, UserInfo,nfcService) {
  $ionicPlatform.ready(function() {
    console.log(window.localStorage);
    Storage.rm('MY_LOCATION');
    //自动登录
    var userid=Storage.get('USERID');
    var passwd=Storage.get('PASSWD');
    if(userid!=undefined && passwd!=undefined){
        $ionicLoading.show();
        UserInfo.LogOn(userid,passwd)
        .then(function(data){
          if(data.Result==1){
            $ionicLoading.hide();
            Storage.set('RoleCode',data.RoleCode);
            $state.go('location');
          }else{
            $ionicLoading.hide();
          }
        },function(err){
          $ionicLoading.hide();
        });
     
    }

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
      //监听键盘，键盘出现时计算键盘高度----start
      window.addEventListener('native.keyboardshow', keyboardShowHandler);
      function keyboardShowHandler(e){
        document.body.classList.add('keyboard-open');
        window.localStorage['keyboardHeight'] = e.keyboardHeight;
        console.log('Keyboard height is: ' + e.keyboardHeight);
      }
      ///////--------------------------------end
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        alert('掉线啦');
    })
    $rootScope.eraseCard=false;
    $rootScope.NFCmodefy=false;
    Storage.set('UUID',ionic.Platform.device().uuid);
    console.log(nfcService);
    nfcService.start();
    // var openPop = function(){
    //   $ionicPopup.show({
    //     title: '<center>发现NFC卡片</center>',
    //     template: '卡片信息为空，新建患者？',
    //     //subTitle: '2',
    //     scope: $rootScope,
    //     buttons: [
    //       {
    //         text: '确定',
    //         type: 'button-assertive',
    //         onTap: function(e) {
    //             $state.go('ambulance.mine');
    //         }
    //       },{ text: '取消',
    //           type: 'button-calm',
    //         onTap: function(e) {}
    //       }
    //     ]
    //   });      
    // }
    // var writeTag = function(){
    //   nfc.write(
    //     [$rootScope.recordToWrite], 
    //     function () {
    //         $rootScope.recordToWrite='';
    //         $rootScope.NFCmodefy=false;
    //         $ionicLoading.hide();
    //         $ionicLoading.show({template:'NFC卡片写入成功',noBackdrop:true,duration:2000});
    //         console.log("Wrote data to tag.");
    //     }, 
    //     function (reason) {
    //         $ionicLoading.hide();
    //         $ionicPopup.show({
    //           title: '<center>操作失败</center>',
    //           template: '请重新写入信息至NFC卡片',
    //           //subTitle: '2',
    //           scope: $rootScope,
    //           buttons: [
    //             {
    //               text: '确定',
    //               type: 'button-assertive',
    //               onTap: function(e) {
    //               }
    //             }
    //           ]
    //         });
    //         //navigator.notification.alert(reason, function() {}, "There was a problem");
    //         // console.log(reason);
    //     }
    //   );
    // }
    // nfc.addNdefListener(function (nfcEvent) {
    //     if(Storage.get('MY_LOCATION') == undefined){
    //       $ionicLoading.show({template:'请先登录，并提交位置',noBackdrop:true,duration:2000});
    //     }else if($rootScope.eraseCard == true){
    //       nfc.erase(function(){
    //         $ionicLoading.hide();
    //         $ionicLoading.show({template:'NFC卡片擦除成功',noBackdrop:true,duration:2000});
    //         $rootScope.eraseCard=false;
    //       },function(){});
    //     }else{
    //       console.log(JSON.stringify(nfcEvent, null, 4));
    //       console.log(nfcEvent);
    //       $rootScope.$apply(function(){
    //           //angular.copy(nfcEvent.tag, tag);
    //           if(!$rootScope.NFCmodefy && (typeof(nfcEvent.tag.ndefMessage) === 'undefined' || nfcEvent.tag.ndefMessage[0].id=='')){
    //             openPop();
    //           }else if(!$rootScope.NFCmodefy){
    //             var temp= new Array();
    //             temp = nfc.bytesToString(nfcEvent.tag.ndefMessage[0].id).split("|");//取出相应数据
    //             //var pid=temp[0];
    //             //var visit=temp[1];
    //             Storage.set('PatientID',temp[0]);
    //             Storage.set('VisitNo',temp[1]);
    //             if(Storage.get('RoleCode') == EmergencyPersonnel) $state.go('visitInfo');
    //             else  $state.go('viewEmergency');
                
    //           }
    //       });
    //       if($rootScope.NFCmodefy && $rootScope.recordToWrite!=undefined && $rootScope.recordToWrite!=''){
    //         //写信息
    //         writeTag();
    //       }              
    //     }
    // }, function () {
    //     console.log("Listening for any tag type.");
    // }, function (reason) {
    //     alert("Error adding NFC Listener " + reason);
    // });
        
    // nfc.addTagDiscoveredListener(function (nfcEvent) {
    //     console.log(JSON.stringify(nfcEvent, null, 4));
    //     console.log(nfcEvent);
    //     if(Storage.get('MY_LOCATION') == undefined){
    //       $ionicLoading.show({template:'请先登录，并提交位置',noBackdrop:true,duration:2000});
    //     }else if($rootScope.NFCmodefy && $rootScope.recordToWrite!=undefined && $rootScope.recordToWrite!=''){
    //       writeTag();
    //     }else{
    //       var record = ndef.record(ndef.TNF_MIME_MEDIA, "", "", "");
    //       nfc.write(
    //         [record], 
    //         function () {
    //           openPop();                       
    //         }, 
    //         function (reason) {
    //           // console.log(reason);
    //         }
    //       );              
    //     }
    // }, function () {
    //     console.log("Listening for any tag type.");
    // }, function (reason) {
    //     alert("Error adding NFC Listener " + reason);
    // });   
  });
})

// --------路由, url模式设置----------------
.config(['$stateProvider','$urlRouterProvider','$ionicConfigProvider', function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
  $ionicConfigProvider.platform.android.tabs.position('bottom');
  $ionicConfigProvider.platform.android.navBar.alignTitle('center');

  //注册与登录
  $stateProvider
    .state('signIn', {
      cache: false,
      url: '/signIn',
      templateUrl: 'templates/signIn/signIn.html',
      controller: 'SignInCtrl'
    })
    .state('register',{
      url:'/register',
      templateUrl:'templates/signIn/register.html',
      controller:'RegisterCtrl'
    })
    .state('location',{
      url:'/location',
      templateUrl:'templates/signIn/location.html',
      controller:'LocationCtrl'
    });

  //急救人员与分流人员
  $stateProvider
    .state('ambulance', {
      url: '/ambulance',
      abstract: true,
      templateUrl: 'templates/ambulance/tabs.html'
    })
    //急救人员
    .state('ambulance.list',{
      url: '/list',
      views:{
        'ambulance':{
        templateUrl: 'templates/ambulance/list.html',
        controller:'AmbulanceListCtrl'
        }
      }
    })  
    .state('newPatient',{
      url: '/newPatient',
      templateUrl: 'templates/ambulance/newPatient.html',
      cache: false,
      controller:'NewPatientCtrl'
    })
    .state('patientInfo',{
      url: '/patientInfo',
      templateUrl: 'templates/ambulance/patientInfo.html',
      cache: false,
      controller:'PatientInfoCtrl'
    })
    .state('newVisit',{
      url: '/newVisit',
      templateUrl: 'templates/ambulance/newVisit.html',
      cache: false,
      controller:'NewVisitCtrl'
    })
    .state('visitInfo',{
      url: '/visitInfo',
      templateUrl: 'templates/ambulance/visitInfo.html',
      cache: false,
      controller:'VisitInfoCtrl'
    })
    .state('viewEmergency',{
      url: '/viewEmergency',
      templateUrl: 'templates/ambulance/viewEmergency.html',
      cache: false,
      controller:'ViewEmergencyCtrl'
    })
    .state('injury',{
      url: '/injury',
      templateUrl: 'templates/ambulance/injury.html',
      controller:'InjuryCtrl'
    })
    .state('ambulance.mine',{
      url: '/mine',
      views:{
       'mine':{
          templateUrl: 'templates/mine/setting.html',
          controller:'SettingCtrl'
        }
      }
    })
    .state('ambulance.myProfile',{
      cache: false,
      url: '/myprofile',
      views:{
       'mine':{
          templateUrl: 'templates/mine/myProfile.html',
          controller:'myProfileCtrl'
        }
      }
    })   
    .state('ambulance.setPassword', {
      cache:false,
      url: '/setPassword',
      views:{
       'mine':{
          templateUrl: 'templates/signIn/setPassword.html',
          controller: 'SetPasswordCtrl'
        }
      }      
    });

    //起始页
    $urlRouterProvider.otherwise('/signIn');
  }])

