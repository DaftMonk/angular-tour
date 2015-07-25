/**
 * An AngularJS directive for showcasing features of your website
 * @version v0.2.2 - 2015-07-25
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
      $templateCache.put('tour/tour.tpl.html', '<div class="tour-tip">\n' + '    <span class="tour-arrow tt-{{ ttPlacement }}" ng-hide="centered"></span>\n' + '    <div class="tour-content-wrapper">\n' + '        <p ng-bind="ttContent"></p>\n' + '        <a ng-click="proceed()" ng-bind="ttNextLabel" class="small button tour-next-tip"></a>\n' + '        <a ng-click="closeTour()" class="tour-close-tip">&times;</a>\n' + '    </div>\n' + '</div>');
    }
  ]);
  angular.module('angular-tour.tour', []).constant('tourConfig', {
    placement: 'top',
    animation: true,
    nextLabel: 'Next',
    scrollSpeed: 500,
    margin: 28,
    backDrop: false,
    useSourceScope: false,
    containerElement: 'body'
  }).controller('TourController', [
    '$scope',
    'orderedList',
    function ($scope, orderedList) {
      var self = this, steps = self.steps = orderedList();
      // we'll pass these in from the directive
      self.postTourCallback = angular.noop;
      self.postStepCallback = angular.noop;
      self.showStepCallback = angular.noop;
      self.currentStep = -1;
      // if currentStep changes, select the new step
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
        // update currentStep if we manually selected this index
        if (self.currentStep !== nextIndex) {
          self.currentStep = nextIndex;
        }
        if (self.currentStep > -1)
          self.showStepCallback();
        if (nextIndex >= steps.getCount()) {
          self.postTourCallback(true);
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
        self.postTourCallback(false);
      };
      $scope.openTour = function () {
        // open at first step if we've already finished tour
        var startStep = self.currentStep >= steps.getCount() || self.currentStep < 0 ? 0 : self.currentStep;
        self.select(startStep);
      };
      $scope.closeTour = function () {
        self.cancelTour();
      };
    }
  ]).directive('tour', [
    '$parse',
    '$timeout',
    'tourConfig',
    function ($parse, $timeout, tourConfig) {
      return {
        controller: 'TourController',
        restrict: 'EA',
        scope: true,
        link: function (scope, element, attrs, ctrl) {
          if (!angular.isDefined(attrs.step)) {
            throw 'The <tour> directive requires a `step` attribute to bind the current step to.';
          }
          var model = $parse(attrs.step);
          var backDrop = false;
          // Watch current step view model and update locally
          scope.$watch(attrs.step, function (newVal) {
            ctrl.currentStep = newVal;
          });
          ctrl.postTourCallback = function (completed) {
            angular.element('.tour-backdrop').remove();
            backDrop = false;
            angular.element('.tour-element-active').removeClass('tour-element-active');
            if (completed && angular.isDefined(attrs.tourComplete)) {
              scope.$parent.$eval(attrs.tourComplete);
            }
            if (angular.isDefined(attrs.postTour)) {
              scope.$parent.$eval(attrs.postTour);
            }
          };
          ctrl.postStepCallback = function () {
            if (angular.isDefined(attrs.postStep)) {
              scope.$parent.$eval(attrs.postStep);
            }
          };
          ctrl.showStepCallback = function () {
            if (tourConfig.backDrop) {
              angular.element(tourConfig.containerElement).append(angular.element('<div class="tour-backdrop"></div>'));
              $timeout(function () {
                $('.tour-backdrop').remove();
                angular.element('<div class="tour-backdrop"></div>').insertBefore('.tour-tip');
              }, 1000);
              backDrop = true;
            }
          };
          // update the current step in the view as well as in our controller
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
          //defaults: tourConfig.placement
          attrs.$observe('tourtipPlacement', function (val) {
            scope.ttPlacement = (val || tourConfig.placement).toLowerCase().trim();
            scope.centered = scope.ttPlacement.indexOf('center') === 0;
          });
          attrs.$observe('tourtipNextLabel', function (val) {
            scope.ttNextLabel = val || tourConfig.nextLabel;
          });
          attrs.$observe('tourtipContainerElement', function (val) {
            scope.ttContainerElement = val || tourConfig.containerElement;
          });
          attrs.$observe('tourtipMargin', function (val) {
            scope.ttMargin = parseInt(val, 10) || tourConfig.margin;
          });
          attrs.$observe('tourtipOffsetVertical', function (val) {
            scope.offsetVertical = parseInt(val, 10) || 0;
          });
          attrs.$observe('tourtipOffsetHorizontal', function (val) {
            scope.offsetHorizontal = parseInt(val, 10) || 0;
          });
          //defaults: null
          attrs.$observe('onShow', function (val) {
            scope.onStepShow = val || null;
          });
          //defaults: null
          attrs.$observe('onProceed', function (val) {
            scope.onStepProceed = val || null;
          });
          //defaults: null
          attrs.$observe('tourtipElement', function (val) {
            scope.ttElement = val || null;
          });
          //defaults: tourConfig.useSourceScope
          attrs.$observe('useSourceScope', function (val) {
            scope.ttSourceScope = !val ? tourConfig.useSourceScope : val === 'true';
          });
          //Init assignments (fix for Angular 1.3+)
          scope.ttNextLabel = tourConfig.nextLabel;
          scope.ttContainerElement = tourConfig.containerElement;
          scope.ttPlacement = tourConfig.placement.toLowerCase().trim();
          scope.centered = false;
          scope.ttMargin = tourConfig.margin;
          scope.offsetHorizontal = 0;
          scope.offsetVertical = 0;
          scope.ttSourceScope = tourConfig.useSourceScope;
          scope.ttOpen = false;
          scope.ttAnimation = tourConfig.animation;
          scope.index = parseInt(attrs.tourtipStep, 10);
          var tourtip = $compile(template)(scope);
          tourCtrl.addStep(scope);
          // wrap this in a time out because the tourtip won't compile right away
          $timeout(function () {
            scope.$watch('ttOpen', function (val) {
              if (val) {
                show();
              } else {
                hide();
              }
            });
          }, 500);
          //determining target scope. It's used only when using virtual steps and there
          //is some action performed like on-show or on-progress. Without virtual steps
          //action would performed on element's scope and that would work just fine
          //however, when using virtual steps, whose steps can be placed in different
          //controller, so it affects scope, which will be used to run this action against.
          function getTargetScope() {
            var targetElement = scope.ttElement ? angular.element(scope.ttElement) : element;
            var targetScope = scope;
            if (targetElement !== element && !scope.ttSourceScope)
              targetScope = targetElement.scope();
            return targetScope;
          }
          function calculatePosition(element, container) {
            var ttPosition;
            // Get the position of the directive element
            var position = element[0].getBoundingClientRect();
            //make it relative against page, not the window
            var top = position.top + window.pageYOffset;
            var containerLeft = 0;
            if (container && container[0]) {
              top = top - container[0].getBoundingClientRect().top + container[0].scrollTop;
              if (container.css('position') === 'fixed') {
                containerLeft = container[0].getBoundingClientRect().left;
              }
            }
            var ttWidth = tourtip.width();
            var ttHeight = tourtip.height();
            // Calculate the tourtip's top and left coordinates to center it
            switch (scope.ttPlacement) {
            case 'right':
              ttPosition = {
                top: top + scope.offsetVertical,
                left: position.left - containerLeft + position.width + scope.ttMargin + scope.offsetHorizontal
              };
              break;
            case 'bottom':
              ttPosition = {
                top: top + position.height + scope.ttMargin + scope.offsetVertical,
                left: position.left - containerLeft + scope.offsetHorizontal
              };
              break;
            case 'center':
              ttPosition = {
                top: top + 0.5 * (position.height - ttHeight) + scope.ttMargin + scope.offsetVertical,
                left: position.left - containerLeft + 0.5 * (position.width - ttWidth) + scope.offsetHorizontal
              };
              break;
            case 'center-top':
              ttPosition = {
                top: top + 0.1 * (position.height - ttHeight) + scope.ttMargin + scope.offsetVertical,
                left: position.left - containerLeft + 0.5 * (position.width - ttWidth) + scope.offsetHorizontal
              };
              break;
            case 'left':
              ttPosition = {
                top: top + scope.offsetVertical,
                left: position.left - containerLeft - ttWidth - scope.ttMargin + scope.offsetHorizontal
              };
              break;
            default:
              ttPosition = {
                top: top - ttHeight - scope.ttMargin + scope.offsetVertical,
                left: position.left - containerLeft + scope.offsetHorizontal
              };
              break;
            }
            ttPosition.top += 'px';
            ttPosition.left += 'px';
            return ttPosition;
          }
          function show() {
            if (!scope.ttContent) {
              return;
            }
            if (scope.ttAnimation)
              tourtip.fadeIn();
            else {
              tourtip.css({ display: 'block' });
            }
            var targetElement = scope.ttElement ? angular.element(scope.ttElement) : element;
            if (targetElement == null || targetElement.length === 0)
              throw 'Target element could not be found. Selector: ' + scope.ttElement;
            angular.element(scope.ttContainerElement).append(tourtip);
            var updatePosition = function () {
              var offsetElement = scope.ttContainerElement === 'body' ? undefined : angular.element(scope.ttContainerElement);
              var ttPosition = calculatePosition(targetElement, offsetElement);
              // Now set the calculated positioning.
              tourtip.css(ttPosition);
              // Scroll to the tour tip
              var ttPositionTop = parseInt(ttPosition.top), ttPositionLeft = parseInt(ttPosition.left);
              scrollTo(tourtip, scope.ttContainerElement, -150, -300, tourConfig.scrollSpeed, ttPositionTop, ttPositionLeft);
            };
            if (tourConfig.backDrop)
              focusActiveElement(targetElement);
            angular.element($window).bind('resize.' + scope.$id, updatePosition);
            updatePosition();
            if (scope.onStepShow) {
              var targetScope = getTargetScope();
              //fancy! Let's make on show action not instantly, but after a small delay
              $timeout(function () {
                targetScope.$eval(scope.onStepShow);
              }, 300);
            }
          }
          function hide() {
            tourtip.detach();
            angular.element($window).unbind('resize.' + scope.$id);
          }
          function focusActiveElement(el) {
            angular.element('.tour-element-active').removeClass('tour-element-active');
            if (!scope.centered)
              el.addClass('tour-element-active');
          }
          // Make sure tooltip is destroyed and removed.
          scope.$on('$destroy', function onDestroyTourtip() {
            angular.element($window).unbind('resize.' + scope.$id);
            tourtip.remove();
            tourtip = null;
          });
          scope.proceed = function () {
            if (scope.onStepProceed) {
              var targetScope = getTargetScope();
              $timeout(function () {
                targetScope.$eval(scope.onStepProceed);
              }, 100);
            }
            scope.setCurrentStep(scope.getCurrentStep() + 1);
          };
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
    return function (target, containerElement, offsetY, offsetX, speed, ttPositionTop, ttPositionLeft) {
      if (target) {
        offsetY = offsetY || -100;
        offsetX = offsetX || -100;
        speed = speed || 500;
        $('html,' + containerElement).stop().animate({
          scrollTop: ttPositionTop + offsetY,
          scrollLeft: ttPositionLeft + offsetX
        }, speed);
      } else {
        $('html,' + containerElement).stop().animate({ scrollTop: 0 }, speed);
      }
    };
  });
}(window, document));