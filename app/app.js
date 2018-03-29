var qminder = angular.module('QMinderInstaApplication', ['ui.router', 'master', 'master.profile', 'ngAnimate', 'ui.bootstrap']);
qminder.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
    $stateProvider
		.state('master', {
			abstract: true,
            templateUrl: 'modules/master/master.html',
			controller  : 'masterController'
        })
		.state('master.profile',{
			url: '/profile',
			templateUrl: 'modules/profile/profile.html',
			controller  : 'profileController'
		});
		
		$urlRouterProvider.otherwise('/profile');
		
})
.run(function ($http, $rootScope) {

  'use strict';

  $rootScope.$on('$stateChangeSuccess', function() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  });
  
});