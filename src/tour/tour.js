'use strict';

angular.module('angular-tour.tour', [])

  /**
   * tourConfig
   * Default configuration, can be customized by injecting tourConfig into your app and modifying it
   */
  .constant('tourConfig', {
    placement        : 'top',                  // default placement relative to target. 'top', 'right', 'left', 'bottom'
    animation        : true,                   // if tips fade in
    nextLabel        : 'Next',                 // default text in the next tip button
    scrollSpeed      : 500,                    // page scrolling speed in milliseconds
    offset           : 28                      // how many pixels offset the tip is from the target
  })

  /**
   * TourController
   * the logic for the tour, which manages all the steps
   */
  .controller('TourController', function($scope, orderedList) {
    var self = this,
        steps = self.steps = orderedList();

    // we'll pass these in from the directive
    self.postTourCallback = angular.noop;
    self.postStepCallback = angular.noop;
    self.currentStep = 0;

    // if currentStep changes, select the new step
    $scope.$watch( function() { return self.currentStep; },
      function ( val ) {
        self.select(val);
      }
    );

    self.select = function(nextIndex) {
      if(!angular.isNumber(nextIndex)) return;

      self.unselectAllSteps();
      var step = steps.get(nextIndex);
      if(step) {
        step.ttOpen = true;
      }

      // update currentStep if we manually selected this index
      if(self.currentStep !== nextIndex) {
        self.currentStep = nextIndex;
      }

      if(nextIndex >= steps.getCount()) {
        self.postTourCallback();
      }
      self.postStepCallback();
    };

    self.addStep = function(step) {
      if(angular.isNumber(step.index) && !isNaN(step.index)) {
        steps.set(step.index, step);
      } else {
        steps.push(step);
      }
    };

    self.unselectAllSteps = function() {
      steps.forEach(function (step) {
        step.ttOpen = false;
      });
    };

    self.cancelTour = function () {
      self.unselectAllSteps();
      self.postTourCallback();
    };

    $scope.openTour = function() {
      // open at first step if we've already finished tour
      var startStep = self.currentStep >= steps.getCount() || self.currentStep < 0  ? 0 : self.currentStep;
      self.select(startStep);
    };

    $scope.closeTour = function() {
      self.cancelTour();
    };
  })

  /**
   * Tour
   * directive that allows you to control the tour
   */
  .directive('tour', function ($parse) {
    return {
      controller: 'TourController',
      restrict: 'EA',
      scope: true,
      link: function (scope, element, attrs, ctrl) {
        if(!angular.isDefined(attrs.step)) {
          throw('The <tour> directive requires a `step` attribute to bind the current step to.');
        }
        var model = $parse(attrs.step);

        // Watch current step view model and update locally
        scope.$watch(attrs.step, function(newVal){
          ctrl.currentStep = newVal;
        });

        ctrl.postTourCallback = function() {
          if(angular.isDefined(attrs.postTour)) {
            scope.$parent.$eval(attrs.postTour);
          }
        };

        ctrl.postStepCallback = function() {
          if(angular.isDefined(attrs.postStep)) {
            scope.$parent.$eval(attrs.postStep);
          }
        };

        // update the current step in the view as well as in our controller
        scope.setCurrentStep = function(val) {
          model.assign(scope.$parent, val);
          ctrl.currentStep = val;
        };

        scope.getCurrentStep = function() {
          return ctrl.currentStep;
        };
      }
    };
  })

  /**
   * Tourtip
   * tourtip manages the state of the tour-popup directive
   */
  .directive('tourtip', function ($window, $compile, $interpolate, $timeout, scrollTo, tourConfig) {
    var startSym = $interpolate.startSymbol(),
        endSym = $interpolate.endSymbol();

    var template = '<div tour-popup></div>';

    return {
      require: '^tour',
      restrict: 'EA',
      scope: true,
      link: function (scope, element, attrs, tourCtrl) {
        attrs.$observe( 'tourtip', function ( val ) {
          scope.ttContent = val;
        });

        attrs.$observe( 'tourtipPlacement', function ( val ) {
          scope.ttPlacement = val || tourConfig.placement;
        });

        attrs.$observe( 'tourtipNextLabel', function ( val ) {
          scope.ttNextLabel = val || tourConfig.nextLabel;
        });

        attrs.$observe( 'tourtipOffset', function ( val ) {
          scope.ttOffset = parseInt(val, 10) || tourConfig.offset;
        });

        scope.ttOpen = false;
        scope.ttAnimation = tourConfig.animation;
        scope.index = parseInt(attrs.tourtipStep, 10);

        var tourtip = $compile( template )( scope );
        tourCtrl.addStep(scope);

        // wrap this in a time out because the tourtip won't compile right away
        $timeout( function() {
          scope.$watch('ttOpen', function(val) {
            if(val) {
              show();
            } else {
              hide();
            }
          });
        }, 500);

        function show() {
          var position,
            ttWidth,
            ttHeight,
            ttPosition,
            height,
            width,
            targetElement;

          if ( ! scope.ttContent ) {
            return;
          }
          tourtip.css({
              display: 'block'
          });
          tourtip.removeClass('ng-hide');

          // Append it to the dom
          element.after( tourtip );

          // Try to set target to the first child of our tour directive
          if(element.children().eq(0).length>0) {
            targetElement = element.children().eq(0);
          } else {
            targetElement = element;
          }

          var updatePosition = function() {
            // Get the position of the directive element
            position = targetElement[0];

            ttWidth = tourtip[0].offsetWidth;
            ttHeight = tourtip[0].offsetHeight;

            width = targetElement[0].offsetWidth;
            height = targetElement[0].offsetHeight;

            // Calculate the tourtip's top and left coordinates to center it
            switch ( scope.ttPlacement ) {
            case 'right':
              ttPosition = {
                top: position.offsetTop,
                left: position.offsetLeft + width + scope.ttOffset
              };
              break;
            case 'bottom':
              ttPosition = {
                top: position.offsetTop + height + scope.ttOffset,
                left: position.offsetLeft
              };
              break;
            case 'left':
              ttPosition = {
                top: position.offsetTop,
                left: position.offsetLeft - ttWidth - scope.ttOffset
              };
              break;
            default:
              ttPosition = {
                top: position.offsetTop - ttHeight - scope.ttOffset,
                left: position.offsetLeft
              };
              break;
            }

            ttPosition.top += 'px';
            ttPosition.left += 'px';

            // Now set the calculated positioning.
            tourtip.css( ttPosition );

            // Scroll to the tour tip
            scrollTo(tourtip, -200, -300, tourConfig.scrollSpeed);
          };

          angular.element($window).bind('resize.' + scope.$id, function() {
            updatePosition();
          });
          updatePosition();
        }

        function hide() {
          tourtip.addClass('ng-hide');
          angular.element($window).unbind('resize.' + scope.$id);
        }

        // Make sure tooltip is destroyed and removed.
        scope.$on('$destroy', function onDestroyTourtip() {
          angular.element($window).unbind('resize.' + scope.$id);
          tourtip.remove();
          tourtip = null;
        });
      }
    };
  })

  /**
   * TourPopup
   * the directive that actually has the template for the tip
   */
  .directive('tourPopup', function () {
    return {
      replace: true,
      templateUrl: 'tour/tour.tpl.html',
      scope: true,
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  })

  /**
   * OrderedList
   * Used for keeping steps in order
   */
  .factory('orderedList', function () {
    var OrderedList = function() {
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
        this._array.sort(function(a,b){
          return a-b;
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
      this._array.sort(function(a, b) {
        return a-b;
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

    var orderedListFactory = function() {
      return new OrderedList();
    };

    return orderedListFactory;
  })

  /**
   * ScrollTo
   * Smoothly scroll to a dom element
   */
  .factory('scrollTo', function($window, $timeout, tourConfig) {

    var smooth_scroll = function(targetX, targetY, duration) {

        targetX = Math.round(targetX);
        targetY = Math.round(targetY);
        duration = Math.round(duration);

        if (duration < 0) {
          return Promise.reject("bad duration");
        }
        if (duration === 0) {
          window.scrollTo(targetX, targetY);
          return Promise.resolve();
        }

        var start_time = Date.now(),
          end_time = start_time + duration,
          startLeft = window.scrollX,
          startTop = window.scrollY,
          distanceX = targetX - startLeft,
          distanceY = targetY - startTop;

        // based on http://en.wikipedia.org/wiki/Smoothstep
        var smooth_step = function(start, end, point) {
          if (point <= start) {
            return 0;
          }
          if (point >= end) {
            return 1;
          }
          var x = (point - start) / (end - start); // interpolation
          return x * x * (3 - 2 * x);
        }

        return new Promise(function(resolve, reject) {
          var scroll_frame = function() {
            var now = Date.now(),
              point = smooth_step(start_time, end_time, now),
              frameLeft = Math.round(startLeft + (distanceX * point)),
              frameTop = Math.round(startTop + (distanceY * point));
            window.scrollTo(frameLeft, frameTop)
            // check if we're done!
            if (now >= end_time) {
              resolve();
              return;
            }
            // schedule next frame for execution
            $timeout(scroll_frame, 0);
          }
          // boostrap the animation process
          $timeout(scroll_frame, 0);
        });
    }

    return function(target, offsetY, offsetX, speed) {
      if(target) {
        offsetY = offsetY || -100;
        offsetX = offsetX || -100;
        speed = speed || 500;
            smooth_scroll(target[0].offsetLeft + offsetX, target[0].offsetTop + offsetY, speed);
      } else {
            smooth_scroll(0, 0, speed);
      }
    };
  });
