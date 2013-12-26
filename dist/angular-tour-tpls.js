/**
 * An AngularJS directive for showcasing features of your website
 * @version v0.0.2 - 2013-12-26
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
      $templateCache.put('tour/tour.tpl.html', '<div class="tour-tip">\n' + '    <span class="tour-arrow tt-{{ placement }}"></span>\n' + '    <div class="tour-content-wrapper">\n' + '        <p ng-bind="content"></p>\n' + '        <a ng-click="nextAction()" ng-bind="nextLabel" class="small button tour-next-tip"></a>\n' + '        <a ng-click="closeAction()" class="tour-close-tip">\xd7</a>\n' + '    </div>\n' + '</div>');
    }
  ]);
  angular.module('angular-tour.tour', []).constant('tourConfig', {
    placement: 'top',
    animation: true,
    nextLabel: 'Next',
    scrollSpeed: 500,
    offset: 28,
    cookies: true,
    cookieName: 'ngTour',
    postTourCallback: function (stepIndex) {
    },
    postStepCallback: function (stepIndex) {
    }
  }).provider('$cookieStore', function () {
    var self = this;
    self.defaultOptions = {};
    self.setDefaultOptions = function (options) {
      self.defaultOptions = options;
    };
    self.$get = function () {
      return {
        get: function (name) {
          var jsonCookie = $.cookie(name);
          if (jsonCookie) {
            return angular.fromJson(jsonCookie);
          }
        },
        put: function (name, value, options) {
          options = $.extend({}, self.defaultOptions, options);
          $.cookie(name, angular.toJson(value), options);
        },
        remove: function (name, options) {
          options = $.extend({}, self.defaultOptions, options);
          $.removeCookie(name, options);
        }
      };
    };
  }).config([
    '$cookieStoreProvider',
    function ($cookieStoreProvider) {
      $cookieStoreProvider.setDefaultOptions({
        path: '/',
        expires: 3650
      });
    }
  ]).controller('TourController', [
    '$scope',
    'OrderedList',
    'tourConfig',
    '$cookieStore',
    function ($scope, OrderedList, tourConfig, $cookieStore) {
      var self = this, currentIndex = -1, currentStep = null, steps = self.steps = OrderedList;
      var selectIfFirstStep = function (step) {
        var loadedIndex = $cookieStore.get(tourConfig.cookieName);
        var wasClosed = $cookieStore.get(tourConfig.cookieName + '_closed');
        if (wasClosed)
          return;
        function selectFromCookie() {
          if (steps.indexOf(step) === loadedIndex) {
            self.select(step);
          }
        }
        function selectFirst() {
          if (steps.first() === step) {
            self.select(step);
          } else {
            step.tt_open = false;
          }
        }
        if (loadedIndex && tourConfig.cookies) {
          selectFromCookie();
        } else {
          selectFirst();
        }
      };
      self.selectAtIndex = function (index) {
        if (steps.get(index))
          self.select(steps.get(index));
      };
      self.getCurrentStep = function () {
        return currentStep;
      };
      self.select = function (nextStep) {
        var nextIndex = steps.indexOf(nextStep);
        function goNext() {
          if (currentStep) {
            currentStep.tt_open = false;
          }
          currentStep = nextStep;
          currentIndex = nextIndex;
          nextStep.tt_open = true;
        }
        if (nextStep) {
          goNext();
        } else {
          self.tourCompleted();
        }
      };
      self.addStep = function (step) {
        if (angular.isNumber(step.index) && !isNaN(step.index)) {
          steps.set(step.index, step);
        } else {
          steps.push(step);
        }
      };
      self.endTour = function (skipSave) {
        steps.forEach(function (step) {
          step.tt_open = false;
        });
        if (!skipSave && tourConfig.cookies) {
          $cookieStore.put(tourConfig.cookieName + '_closed', true);
        }
        tourConfig.postTourCallback(currentIndex);
      };
      self.startTour = function () {
        if ($cookieStore.get(tourConfig.cookieName + '_completed'))
          return;
        if (tourConfig.cookies) {
          $cookieStore.put(tourConfig.cookieName + '_closed', false);
        }
        steps.forEach(function (step) {
          selectIfFirstStep(step);
        });
      };
      $scope.openTour = function () {
        if ($cookieStore.get(tourConfig.cookieName + '_completed') && tourConfig.cookies) {
          $cookieStore.put(tourConfig.cookieName + '_completed', false);
          self.save(steps.indexOf(steps.first()));
        }
        self.startTour();
      };
      $scope.closeTour = function () {
        self.endTour();
      };
      self.save = function (index) {
        $cookieStore.put(tourConfig.cookieName, index);
      };
      self.tourCompleted = function () {
        self.endTour();
        $cookieStore.put(tourConfig.cookieName + '_completed', true);
      };
      self.next = function () {
        var newIndex = currentIndex + 1;
        if (tourConfig.cookies) {
          self.save(currentIndex + 1);
        }
        if (newIndex + 1 > steps.getCount()) {
          self.tourCompleted();
        }
        tourConfig.postStepCallback(newIndex);
        self.select(steps.get(newIndex));
      };
    }
  ]).directive('tour', function () {
    return {
      controller: 'TourController',
      scope: true,
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  }).directive('tourtip', [
    '$window',
    '$compile',
    '$interpolate',
    '$timeout',
    'scrollTo',
    'tourConfig',
    function ($window, $compile, $interpolate, $timeout, scrollTo, tourConfig) {
      var startSym = $interpolate.startSymbol(), endSym = $interpolate.endSymbol();
      var template = '<div tour-popup ' + 'next-label="' + startSym + 'tt_next_label' + endSym + '" ' + 'content="' + startSym + 'tt_content' + endSym + '" ' + 'placement="' + startSym + 'tt_placement' + endSym + '" ' + 'next-action="tt_next_action()" ' + 'close-action="tt_close_action()" ' + 'is-open="' + startSym + 'tt_open' + endSym + '" ' + '>' + '</div>';
      return {
        require: '^tour',
        restrict: 'EA',
        scope: {},
        link: function (scope, element, attrs, tourCtrl) {
          attrs.$observe('tourtip', function (val) {
            scope.tt_content = val;
          });
          attrs.$observe('tourtipPlacement', function (val) {
            scope.tt_placement = val || tourConfig.placement;
          });
          attrs.$observe('tourtipNextLabel', function (val) {
            scope.tt_next_label = val || tourConfig.nextLabel;
          });
          attrs.$observe('tourtipOffset', function (val) {
            scope.tt_offset = parseInt(val, 10) || tourConfig.offset;
          });
          scope.tt_open = false;
          scope.tt_animation = tourConfig.animation;
          scope.tt_next_action = tourCtrl.next;
          scope.tt_close_action = tourCtrl.endTour;
          scope.index = parseInt(attrs.tourtipStep, 10);
          var tourtip = $compile(template)(scope);
          tourCtrl.addStep(scope);
          $timeout(function () {
            tourCtrl.startTour();
          }, 500);
          scope.$watch('tt_open', function (tt_open) {
            if (tt_open) {
              tourCtrl.select(scope);
              show();
            } else {
              hide();
            }
          });
          function show() {
            var position, ttWidth, ttHeight, ttPosition, height, width, targetElement;
            if (!scope.tt_content) {
              return;
            }
            if (scope.tt_animation)
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
              switch (scope.tt_placement) {
              case 'right':
                ttPosition = {
                  top: position.top,
                  left: position.left + width + scope.tt_offset
                };
                break;
              case 'bottom':
                ttPosition = {
                  top: position.top + height + scope.tt_offset,
                  left: position.left
                };
                break;
              case 'left':
                ttPosition = {
                  top: position.top,
                  left: position.left - ttWidth - scope.tt_offset
                };
                break;
              default:
                ttPosition = {
                  top: position.top - ttHeight - scope.tt_offset,
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
      scope: {
        content: '@',
        nextLabel: '@',
        placement: '@',
        nextAction: '&',
        closeAction: '&',
        isOpen: '@'
      },
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  }).factory('OrderedList', function () {
    var self = this;
    self.map = {};
    self._array = [];
    function sortNumber(a, b) {
      return a - b;
    }
    return {
      set: function (key, value) {
        if (!angular.isNumber(key))
          return;
        if (key in self.map) {
          self.map[key] = value;
        } else {
          if (key < self._array.length) {
            var insertIndex = key - 1 > 0 ? key - 1 : 0;
            self._array.splice(insertIndex, 0, key);
          } else {
            self._array.push(key);
          }
          self.map[key] = value;
          self._array.sort(sortNumber);
        }
      },
      indexOf: function (value) {
        for (var prop in self.map) {
          if (self.map.hasOwnProperty(prop)) {
            if (self.map[prop] === value)
              return Number(prop);
          }
        }
      },
      push: function (value) {
        var key = self._array[self._array.length - 1] + 1 || 0;
        self._array.push(key);
        self.map[key] = value;
        self._array.sort(sortNumber);
      },
      remove: function (key) {
        var index = self._array.indexOf(key);
        if (index === -1) {
          throw new Error('key does not exist');
        }
        self._array.splice(index, 1);
        delete self.map[key];
      },
      get: function (key) {
        return self.map[key];
      },
      getCount: function () {
        return self._array.length;
      },
      forEach: function (f) {
        var key, value;
        for (var i = 0; i < self._array.length; i++) {
          key = self._array[i];
          value = self.map[key];
          f(value, key);
        }
      },
      first: function () {
        var key, value;
        key = self._array[0];
        value = self.map[key];
        return value;
      }
    };
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