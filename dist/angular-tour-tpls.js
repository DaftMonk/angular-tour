/**
 * An AngularJS directive for showcasing features of your website
 * @version v0.1.1 - 2014-03-19
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
      $templateCache.put('tour/tour.tpl.html', '<div class="tour-tip">\n' + '    <span class="tour-arrow tt-{{ ttPlacement }}"></span>\n' + '    <div class="tour-content-wrapper">\n' + '        <p ng-bind="ttContent"></p>\n' + '        <a ng-click="setCurrentStep(getCurrentStep() + 1)" ng-bind="ttNextLabel" class="small button tour-next-tip"></a>\n' + '        <a ng-click="closeTour()" class="tour-close-tip">\xd7</a>\n' + '    </div>\n' + '</div>');
    }
  ]);
  angular.module('angular-tour.tour', []).constant('tourConfig', {
    placement: 'top',
    animation: true,
    nextLabel: 'Next',
    scrollSpeed: 500,
    offset: 28
  }).controller('TourController', [
    '$scope',
    'orderedList',
    function ($scope, orderedList) {
      var self = this, steps = self.steps = orderedList();
      self.postTourCallback = angular.noop;
      self.postStepCallback = angular.noop;
      self.currentStep = 0;
      $scope.$watch(function () {
        return self.currentStep;
      }, function (val) {
        self.select(val);
      });
      self.select = function (nextIndex) {
        if (!angular.isNumber(nextIndex))
          return;
        self.unselectAllSteps();
        var step = steps.get(nextIndex);
        if (step) {
          step.ttOpen = true;
        }
        if (self.currentStep !== nextIndex) {
          self.currentStep = nextIndex;
        }
        if (nextIndex >= steps.getCount()) {
          self.postTourCallback();
        }
        self.postStepCallback();
      };
      self.addStep = function (step) {
        if (angular.isNumber(step.index) && !isNaN(step.index)) {
          steps.set(step.index, step);
        } else {
          steps.push(step);
        }
      };
      self.unselectAllSteps = function () {
        steps.forEach(function (step) {
          step.ttOpen = false;
        });
      };
      self.cancelTour = function () {
        self.unselectAllSteps();
        self.postTourCallback();
      };
      $scope.openTour = function () {
        var startStep = self.currentStep >= steps.getCount() || self.currentStep < 0 ? 0 : self.currentStep;
        self.select(startStep);
      };
      $scope.closeTour = function () {
        self.cancelTour();
      };
    }
  ]).directive('tour', [
    '$parse',
    function ($parse) {
      return {
        controller: 'TourController',
        restrict: 'EA',
        scope: true,
        link: function (scope, element, attrs, ctrl) {
          if (!angular.isDefined(attrs.step)) {
            throw 'The <tour> directive requires a `step` attribute to bind the current step to.';
          }
          var model = $parse(attrs.step);
          scope.$watch(attrs.step, function (newVal) {
            ctrl.currentStep = newVal;
          });
          ctrl.postTourCallback = function () {
            if (angular.isDefined(attrs.postTour)) {
              scope.$parent.$eval(attrs.postTour);
            }
          };
          ctrl.postStepCallback = function () {
            if (angular.isDefined(attrs.postStep)) {
              scope.$parent.$eval(attrs.postStep);
            }
          };
          scope.setCurrentStep = function (val) {
            model.assign(scope.$parent, val);
            ctrl.currentStep = val;
          };
          scope.getCurrentStep = function () {
            return ctrl.currentStep;
          };
        }
      };
    }
  ]).directive('tourtip', [
    '$window',
    '$compile',
    '$interpolate',
    '$timeout',
    'scrollTo',
    'tourConfig',
    function ($window, $compile, $interpolate, $timeout, scrollTo, tourConfig) {
      var startSym = $interpolate.startSymbol(), endSym = $interpolate.endSymbol();
      var template = '<div tour-popup></div>';
      return {
        require: '^tour',
        restrict: 'EA',
        scope: true,
        link: function (scope, element, attrs, tourCtrl) {
          attrs.$observe('tourtip', function (val) {
            scope.ttContent = val;
          });
          attrs.$observe('tourtipPlacement', function (val) {
            scope.ttPlacement = val || tourConfig.placement;
          });
          attrs.$observe('tourtipNextLabel', function (val) {
            scope.ttNextLabel = val || tourConfig.nextLabel;
          });
          attrs.$observe('tourtipOffset', function (val) {
            scope.ttOffset = parseInt(val, 10) || tourConfig.offset;
          });
          scope.ttOpen = false;
          scope.ttAnimation = tourConfig.animation;
          scope.index = parseInt(attrs.tourtipStep, 10);
          var tourtip = $compile(template)(scope);
          tourCtrl.addStep(scope);
          $timeout(function () {
            scope.$watch('ttOpen', function (val) {
              if (val) {
                show();
              } else {
                hide();
              }
            });
          }, 500);
          function show() {
            var position, ttWidth, ttHeight, ttPosition, height, width, targetElement;
            if (!scope.ttContent) {
              return;
            }
            if (scope.ttAnimation)
              tourtip.fadeIn();
            else {
              tourtip.css({ display: 'block' });
            }
            element.after(tourtip);
            if (element.children().eq(0).length > 0) {
              targetElement = element.children().eq(0);
            } else {
              targetElement = element;
            }
            var updatePosition = function () {
              position = targetElement.position();
              ttWidth = tourtip.width();
              ttHeight = tourtip.height();
              width = targetElement.width();
              height = targetElement.height();
              switch (scope.ttPlacement) {
              case 'right':
                ttPosition = {
                  top: position.top,
                  left: position.left + width + scope.ttOffset
                };
                break;
              case 'bottom':
                ttPosition = {
                  top: position.top + height + scope.ttOffset,
                  left: position.left
                };
                break;
              case 'left':
                ttPosition = {
                  top: position.top,
                  left: position.left - ttWidth - scope.ttOffset
                };
                break;
              default:
                ttPosition = {
                  top: position.top - ttHeight - scope.ttOffset,
                  left: position.left
                };
                break;
              }
              ttPosition.top += 'px';
              ttPosition.left += 'px';
              tourtip.css(ttPosition);
              scrollTo(tourtip, -200, -300, tourConfig.scrollSpeed);
            };
            angular.element($window).bind('resize.' + scope.$id, function () {
              updatePosition();
            });
            updatePosition();
          }
          function hide() {
            tourtip.detach();
            angular.element($window).unbind('resize.' + scope.$id);
          }
          scope.$on('$destroy', function onDestroyTourtip() {
            angular.element($window).unbind('resize.' + scope.$id);
            tourtip.remove();
            tourtip = null;
          });
        }
      };
    }
  ]).directive('tourPopup', function () {
    return {
      replace: true,
      templateUrl: 'tour/tour.tpl.html',
      scope: true,
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  }).factory('orderedList', function () {
    var OrderedList = function () {
      this.map = {};
      this._array = [];
    };
    OrderedList.prototype.set = function (key, value) {
      if (!angular.isNumber(key))
        return;
      if (key in this.map) {
        this.map[key] = value;
      } else {
        if (key < this._array.length) {
          var insertIndex = key - 1 > 0 ? key - 1 : 0;
          this._array.splice(insertIndex, 0, key);
        } else {
          this._array.push(key);
        }
        this.map[key] = value;
        this._array.sort(function (a, b) {
          return a - b;
        });
      }
    };
    OrderedList.prototype.indexOf = function (value) {
      for (var prop in this.map) {
        if (this.map.hasOwnProperty(prop)) {
          if (this.map[prop] === value)
            return Number(prop);
        }
      }
    };
    OrderedList.prototype.push = function (value) {
      var key = this._array[this._array.length - 1] + 1 || 0;
      this._array.push(key);
      this.map[key] = value;
      this._array.sort(function (a, b) {
        return a - b;
      });
    };
    OrderedList.prototype.remove = function (key) {
      var index = this._array.indexOf(key);
      if (index === -1) {
        throw new Error('key does not exist');
      }
      this._array.splice(index, 1);
      delete this.map[key];
    };
    OrderedList.prototype.get = function (key) {
      return this.map[key];
    };
    OrderedList.prototype.getCount = function () {
      return this._array.length;
    };
    OrderedList.prototype.forEach = function (f) {
      var key, value;
      for (var i = 0; i < this._array.length; i++) {
        key = this._array[i];
        value = this.map[key];
        f(value, key);
      }
    };
    OrderedList.prototype.first = function () {
      var key, value;
      key = this._array[0];
      value = this.map[key];
      return value;
    };
    var orderedListFactory = function () {
      return new OrderedList();
    };
    return orderedListFactory;
  }).factory('scrollTo', function () {
    return function (target, offsetY, offsetX, speed) {
      if (target) {
        offsetY = offsetY || -100;
        offsetX = offsetX || -100;
        speed = speed || 500;
        $('html,body').stop().animate({
          scrollTop: target.offset().top + offsetY,
          scrollLeft: target.offset().left + offsetX
        }, speed);
      } else {
        $('html,body').stop().animate({ scrollTop: 0 }, speed);
      }
    };
  });
}(window, document));