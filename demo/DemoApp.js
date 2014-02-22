'use strict';

angular.module('DemoApp', ['ngRoute', 'angular-tour'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'main.html',
        controller: 'MainCtrl'
      })
      .when('/features', {
        templateUrl: 'features.html',
        controller: 'FeaturesCtrl'
      })
      .when('/example', {
        templateUrl: 'example.html',
        controller: 'ExampleCtrl'
      })
      .when('/howtoinstall', {
        templateUrl: 'howtoinstall.html',
        controller: 'HowToInstallCtrl'
      })
      .when('/github', {
        templateUrl: 'github.html',
        controller: 'GitHubCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }).controller('DemoCtrl', function($scope, $timeout, $location, tourState) {
    tourState.started();
    $scope.showTour = function() {
      $location.path('/');
      $scope.$broadcast('tourshow');
    };

    $scope.init = function() {
      $scope.$on('onTourEnd', function() {
        $location.path('/features');
      });
    };
  }).controller('FeaturesCtrl', function($scope, $location) {
    $scope.init = function() {
      $scope.$on('onTourEnd', function() {
        $location.path('/example');
      });
    }
    
  }).controller('ExampleCtrl', function($scope, $location) {
    $scope.init = function() {
      $scope.$on('onTourEnd', function() {
        $location.path('/howtoinstall');
      });
    }

  }).controller('HowToInstallCtrl', function($scope, $location) {
    $scope.init = function() {
      $scope.$on('onTourEnd', function() {
        $location.path('/github');
      });
    }
    
  }).controller('GitHubCtrl', function($scope, $location) {
    $scope.init = function() {
      $scope.$on('onTourEnd', function() {
        $location.path('/');
      });
    }
  }).controller('MainCtrl', function($scope) {
  });
