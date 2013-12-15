/**
 * An AngularJS module
 * @version v0.0.0 - 2013-12-04
 * @link https://github.com/DaftMonk/angular-tour
 * @author Tyler Henkel
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function (window, document, undefined) {
  'use strict';
  angular.module('angular-tour', [
    'angular-tour.tpls',
    'angular-tour.tour'
  ]);
  angular.module('angular-tour.tpls', ['tour/tour.tpl.html']);
  angular.module('tour/tour.tpl.html', []).run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('tour/tour.tpl.html', '<div class="tour-tip" style="visibility: visible; display: block; top: 220px; left: 166.5px;">\n' + '    <span class="tour-arrow top"></span>\n' + '    <div class="tour-content-wrapper">\n' + '        <p>tour gives you everything you need to call out new features in your app or website.</p>\n' + '        <a href="#" class="small button tour-next-tip">Next: Steps</a>\n' + '        <a href="#close" class="tour-close-tip">\xd7</a>\n' + '    </div>\n' + '</div>');
    }
  ]);
  angular.module('angular-tour.tour', []).controller('TourController', [
    '$scope',
    function ($scope) {
      var self = this, currentIndex = -1, currentStep = null, steps = self.steps = [];
      self.select = function (nextStep) {
        function goNext() {
          if (currentStep) {
            nextStep.active = true;
            currentStep.active = false;
          }
          currentStep = nextStep;
          currentIndex = nextIndex;
        }
        var nextIndex = steps.indexOf(nextStep);
        if (nextStep && nextStep !== currentStep) {
          goNext();
        }
      };
      self.addStep = function (step) {
        steps.push(step);
        if (steps.length === 1 || step.active) {
          steps[steps.length - 1].active = true;
        } else {
          step.active = false;
        }
      };
      $scope.endTour = function () {
        for (var i = 0; i < steps.length; i++) {
          steps[i].active = false;
        }
      };
      $scope.next = function () {
        var newIndex = currentIndex + 1;
        if (newIndex > steps.length) {
          return $scope.endTour();
        }
        return self.select(steps[newIndex]);
      };
      $scope.prev = function () {
        var newIndex = currentIndex - 1 < 0 ? 0 : currentIndex - 1;
        return self.select(steps[newIndex]);
      };
    }
  ]).directive('tour', function () {
    return {
      controller: 'TourController',
      transclude: true,
      replace: true,
      template: '<div class="tour" ng-transclude></div>',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  }).directive('tourStep', function () {
    return {
      require: '^tour',
      restrict: 'EA',
      scope: {},
      link: function (scope, element, attrs, tourCtrl) {
        tourCtrl.addStep(scope);
        scope.$watch('active', function (active) {
          if (active) {
            tourCtrl.select(scope);
            element.addClass('active');
          } else {
            element.removeClass('active');
          }
        });
      }
    };
  }).directive('tourAction', function () {
    return {
      require: '^tourStep',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        element.text('this is the tour directive');
      }
    };
  }).directive('tourTip', function () {
    return {
      transclude: true,
      replace: true,
      templateUrl: 'tour/tour.tpl.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });
}(window, document));