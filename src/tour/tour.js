'use strict';

angular.module('angular-tour.tour', [])

  /**
   * tourConfig
   * Default configuration, can be customized by injecting tourConfig into your app and modifying it
   */
  .constant('tourConfig', {
    placement: 'top', // default placement relative to target. 'top', 'right', 'left', 'bottom'
    animation: true, // if tips fade in
    nextLabel: 'Next', // default text in the next tip button
    scrollSpeed: 500, // page scrolling speed in milliseconds
    margin: 28, // how many pixels margin the tip is from the target
    backDrop: false, // if there is a backdrop (gray overlay) when tour starts
    useSourceScope: false, // only target scope should be used (only when using virtual steps)
    containerElement: 'body' // default container element to parent tourtips to
  })

  /**
   * TourController
   * the logic for the tour, which manages all the steps
   */
  .controller('TourController', ['$scope', 'orderedList',
    function($scope, orderedList) {
    
    var self = this,
        steps = self.steps = orderedList(),
        firstCurrentStepChange = true;

    // we'll pass these in from the directive
    self.postTourCallback = angular.noop;
    self.postStepCallback = angular.noop;
    self.showStepCallback = angular.noop;
    self.currentStep = -1;

    // if currentStep changes, select the new step
    $scope.$watch(function () {
        return self.currentStep;
      }, function (val) {
        if (firstCurrentStepChange)
          firstCurrentStepChange = false;
        else
          self.select(val);
      }
    );

    self.select = function(nextIndex) {
      if (!angular.isNumber(nextIndex)) return;

      self.unselectAllSteps();
      var step = steps.get(nextIndex);
      if (step) { step.ttOpen = true; }

      // update currentStep if we manually selected this index
      if (self.currentStep !== nextIndex) { self.currentStep = nextIndex; }

      if (self.currentStep > -1) { self.showStepCallback(); }

      if (nextIndex >= steps.getCount()) { self.postTourCallback(true); }
      
      self.postStepCallback();
    };

    self.addStep = function (step) {
      if (angular.isNumber(step.index) && !isNaN(step.index))
        steps.set(step.index, step);
      else
        steps.push(step);
    };

    self.unselectAllSteps = function() {
      steps.forEach(function (step) {
        step.ttOpen = false;
      });
    };

    self.cancelTour = function() {
      self.unselectAllSteps();
      self.postTourCallback(false);
    };

    $scope.openTour = function() {
      // open at first step if we've already finished tour
      var startStep = self.currentStep >= steps.getCount() || self.currentStep < 0 ? 0 : self.currentStep;
      self.select(startStep);
    };

    $scope.closeTour = function() {
      self.cancelTour();
    };
  }])

  /**
   * Tour
   * directive that allows you to control the tour
   */
  .directive('tour', ['$parse', '$timeout', 'tourConfig',
    function($parse, $timeout, tourConfig) {
    
    return {
      controller: 'TourController',
      restrict: 'EA',
      scope: true,
      link: function(scope, element, attrs, ctrl) {
        if (!angular.isDefined(attrs.step)) {
          throw ('The <tour> directive requires a `step` attribute to bind the current step to.');
        }
        var model = $parse(attrs.step);
        var backDrop = false;

        // Watch current step view model and update locally
        scope.$watch(attrs.step, function(newVal) {
          ctrl.currentStep = newVal;
        });

        ctrl.postTourCallback = function(completed) {
          var backdropEle = document.getElementsByClassName('tour-backdrop');
          var active = document.getElementsByClassName('tour-element-active');
          angular.element(backdropEle).remove();
          backDrop = false;
          angular.element(active).removeClass('tour-element-active');

          if (completed && angular.isDefined(attrs.tourComplete)) {
            scope.$parent.$eval(attrs.tourComplete);
          }

          if (angular.isDefined(attrs.postTour)) {
            scope.$parent.$eval(attrs.postTour);
          }
        };

        ctrl.postStepCallback = function() {
          if (angular.isDefined(attrs.postStep)) {
            scope.$parent.$eval(attrs.postStep);
          }
        };

        ctrl.showStepCallback = function() {
          if (tourConfig.backDrop) {
            // var div = document.createElement('div');
            // div.className = 'tour-backdrop';
            // var container = document.querySelector(tourConfig.containerElement);
            // angular.element(container).append(angular.element(div));

            $timeout(function() {
              var backdrop = document.getElementsByClassName('tour-backdrop');
              var tooltip = document.getElementsByClassName('tour-tip')[0];
              var div = document.createElement('div');
              div.className = 'tour-backdrop';
              angular.element(backdrop).remove();
              tooltip.parentNode.insertBefore(div, tooltip);
            }, 501);

            backDrop = true;
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
  }])

  /**
   * Tourtip
   * tourtip manages the state of the tour-popup directive
   */
  .directive('tourtip', ['$window', '$compile', '$interpolate', '$timeout', 'scrollTo', 'tourConfig', 'debounce', '$q',
    function($window, $compile, $interpolate, $timeout, scrollTo, tourConfig, debounce, $q) {
    
    var startSym = $interpolate.startSymbol(),
        endSym = $interpolate.endSymbol();

    var template = '<div tour-popup></div>';

    return {
      require: '^tour',
      restrict: 'EA',
      scope: true,
      link: function(scope, element, attrs, tourCtrl) {
        
        attrs.$observe('tourtip', function(val) {
          scope.ttContent = val;
        });

        //defaults: tourConfig.placement
        attrs.$observe('tourtipPlacement', function(val) {
          scope.ttPlacement = (val || tourConfig.placement).toLowerCase().trim();
          scope.centered = (scope.ttPlacement.indexOf('center') === 0);
        });

        attrs.$observe('tourtipNextLabel', function(val) {
          scope.ttNextLabel = val || tourConfig.nextLabel;
        });

        attrs.$observe('tourtipContainerElement', function(val) {
          scope.ttContainerElement = val || tourConfig.containerElement;
        });

        attrs.$observe('tourtipMargin', function(val) {
          scope.ttMargin = parseInt(val, 10) || tourConfig.margin;
        });

        attrs.$observe('tourtipOffsetVertical', function(val) {
          scope.offsetVertical = parseInt(val, 10) || 0;
        });

        attrs.$observe('tourtipOffsetHorizontal', function(val) {
          scope.offsetHorizontal = parseInt(val, 10) || 0;
        });

        //defaults: null
        attrs.$observe('onShow', function(val) {
          scope.onStepShow = val || null;
        });

        //defaults: null
        attrs.$observe('onProceed', function(val) {
          scope.onStepProceed = val || null;
        });

        //defaults: null
        attrs.$observe('tourtipElement', function(val) {
          scope.ttElement = val || null;
        });

        //defaults: null
        attrs.$observe('tourtipTitle', function (val) {
          scope.ttTitle = val || null;
        });

        //defaults: tourConfig.useSourceScope
        attrs.$observe('useSourceScope', function(val) {
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
        $timeout(function() {
          scope.$watch('ttOpen', function(val) {
            if (val)
              show();
            else
              hide();
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
          if (targetElement !== element && !scope.ttSourceScope) { targetScope = targetElement.scope(); }

          return targetScope;
        }

        function calculatePosition(element, container) {
          var minimumLeft = 0; // minimum left position of tour tip
          var restrictRight;
          var ttPosition;
          var tourtipWidth = tourtip[0].offsetWidth;
          var tourtipHeight = tourtip[0].offsetHeight;

          // Get the position of the directive element
          var position = element[0].getBoundingClientRect();

          //make it relative against page or fixed container, not the window
          var top = position.top + window.pageYOffset;
          var containerLeft = 0;
          if (container && container[0]) {
            top = top - container[0].getBoundingClientRect().top + container[0].scrollTop;
            // if container is fixed, position tour tip relative to fixed container
            if (container.css('position') === 'fixed') {
              containerLeft = container[0].getBoundingClientRect().left;
            }
            // restrict right position if the tourtip doesn't fit in the container
            var containerWidth = container[0].getBoundingClientRect().width;
            if (tourtipWidth + position.width > containerWidth) {
              restrictRight = containerWidth - position.left + scope.ttMargin;
            }
          }

          var ttWidth = tourtipWidth;
          var ttHeight = tourtipHeight;

          // Calculate the tourtip's top and left coordinates to center it
          var _left;
          switch(scope.ttPlacement) {
          case 'right':
            _left = position.left - containerLeft + position.width + scope.ttMargin + scope.offsetHorizontal;
            ttPosition = {
              top: top + scope.offsetVertical,
              left: _left > 0 ? _left : minimumLeft
            };
            break;
          case 'bottom':
            _left = position.left - containerLeft + scope.offsetHorizontal;
            ttPosition = {
              top: top + position.height + scope.ttMargin + scope.offsetVertical,
              left: _left > 0 ? _left : minimumLeft
            };
            break;
          case 'center':
            _left = position.left - containerLeft + 0.5 * (position.width - ttWidth) + scope.offsetHorizontal;
            ttPosition = {
              top: top + 0.5 * (position.height - ttHeight) + scope.ttMargin + scope.offsetVertical,
              left: _left > 0 ? _left : minimumLeft
            };
            break;
          case 'center-top':
            _left = position.left - containerLeft + 0.5 * (position.width - ttWidth) + scope.offsetHorizontal;
            ttPosition = {
              top: top + 0.1 * (position.height - ttHeight) + scope.ttMargin + scope.offsetVertical,
              left: _left > 0 ? _left : minimumLeft
            };
            break;
          case 'left':
            _left = position.left - containerLeft - ttWidth - scope.ttMargin + scope.offsetHorizontal;
            ttPosition = {
              top: top + scope.offsetVertical,
              left: _left > 0 ? _left : minimumLeft,
              right: restrictRight
            };
            break;
          default:
            _left = position.left - containerLeft + scope.offsetHorizontal;
            ttPosition = {
              top: top - ttHeight - scope.ttMargin + scope.offsetVertical,
              left: _left > 0 ? _left : minimumLeft
            };
            break;
          }

          ttPosition.top += 'px';
          ttPosition.left += 'px';

          return ttPosition;
        }

        function show() {
          if (!scope.ttContent) { return; }

          var targetElement = scope.ttElement ? angular.element(scope.ttElement) : element;

          if (targetElement === null || targetElement.length === 0)
            throw 'Target element could not be found. Selector: ' + scope.ttElement;

          var containerEle = document.querySelectorAll(scope.ttContainerElement);
          angular.element(containerEle).append(tourtip);

          var updatePosition = function() {

            var offsetElement = scope.ttContainerElement === 'body' ? undefined : angular.element(containerEle);
            var ttPosition = calculatePosition(targetElement, offsetElement);

            // Now set the calculated positioning.
            tourtip.css(ttPosition);

            // Scroll to the tour tip
            scrollTo(tourtip, scope.ttContainerElement, -150, -300, tourConfig.scrollSpeed);
          };

          if (tourConfig.backDrop) { focusActiveElement(targetElement); }

          angular.element($window).bind('resize.' + scope.$id, debounce(updatePosition, 50));

          updatePosition();

          // CSS class must be added after the element is already on the DOM otherwise it won't animate (fade in).
          tourtip.addClass('show');

          if (scope.onStepShow) {
            var targetScope = getTargetScope();

            //fancy! Let's make on show action not instantly, but after a small delay
            $timeout(function() {
              targetScope.$eval(scope.onStepShow);
            }, 300);
          }
        }

        function hide() {
          tourtip.removeClass('show');
          tourtip.detach();
          angular.element($window).unbind('resize.' + scope.$id);
        }

        function focusActiveElement(el) {
          var activeEle = document.getElementsByClassName('tour-element-active');
          angular.element(activeEle).removeClass('tour-element-active');
          if (!scope.centered) { el.addClass('tour-element-active'); }
        }

        // Make sure tooltip is destroyed and removed.
        scope.$on('$destroy', function onDestroyTourtip() {
          angular.element($window).unbind('resize.' + scope.$id);
          tourtip.remove();
          tourtip = null;
        });

        scope.proceed = function() {
          if (scope.onStepProceed) {
            var targetScope = getTargetScope();

            var onProceedResult = targetScope.$eval(scope.onStepProceed);
            $q.resolve(onProceedResult).then(function () {
              scope.setCurrentStep(scope.getCurrentStep() + 1);
            });
          } else {
            scope.setCurrentStep(scope.getCurrentStep() + 1);
          }
        };
      }
    };
  }])

  /**
   * TourPopup
   * the directive that actually has the template for the tip
   */
  .directive('tourPopup', function() {
    return {
      replace: true,
      templateUrl: 'tour/tour.tpl.html',
      scope: true,
      restrict: 'EA',
      link: function(scope, element, attrs) {}
    };
  })

  /**
   * OrderedList
   * Used for keeping steps in order
   */
  .factory('orderedList', function() {
    var OrderedList = function() {
      this.map = {};
      this._array = [];
    };

    OrderedList.prototype.set = function(key, value) {
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
        this._array.sort(function(a, b) {
          return a - b;
        });
      }
    };
    
    OrderedList.prototype.indexOf = function(value) {
      for (var prop in this.map) {
        if (this.map.hasOwnProperty(prop)) {
          if (this.map[prop] === value)
            return Number(prop);
        }
      }
    };
    
    OrderedList.prototype.push = function(value) {
      var key = this._array[this._array.length - 1] + 1 || 0;
      this._array.push(key);
      this.map[key] = value;
      this._array.sort(function(a, b) {
        return a - b;
      });
    };
    
    OrderedList.prototype.remove = function(key) {
      var index = this._array.indexOf(key);
      if (index === -1) {
        throw new Error('key does not exist');
      }
      this._array.splice(index, 1);
      delete this.map[key];
    };
    
    OrderedList.prototype.get = function(key) {
      return this.map[key];
    };
    
    OrderedList.prototype.getCount = function() {
      return this._array.length;
    };
    
    OrderedList.prototype.forEach = function(f) {
      var key, value;
      for (var i = 0; i < this._array.length; i++) {
        key = this._array[i];
        value = this.map[key];
        f(value, key);
      }
    };
    
    OrderedList.prototype.first = function() {
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
  .factory('scrollTo', ['$interval', function($interval) {

    var animationInProgress = false;

    function getEasingPattern (time) {
      return time < 0.5 ? (4 * time * time * time) : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; // default easeInOutCubic transition
    }

    function _autoScroll (container, endTop, endLeft, offsetY, offsetX, speed) {
      
      if (animationInProgress) { return; }
      
      speed = speed || 500;
      offsetY = offsetY || 0;
      offsetX = offsetX || 0;
      // Set some boundaries in case the offset wants us to scroll to impossible locations
      var finalY = endTop + offsetY;
      if (finalY < 0) { finalY = 0; } else if (finalY > container.scrollHeight) { finalY = container.scrollHeight; }
      var finalX = endLeft + offsetX;
      if (finalX < 0) { finalX = 0; } else if (finalX > container.scrollWidth) { finalX = container.scrollWidth; }

      var startTop = container.scrollTop,
          startLeft = container.scrollLeft,
          timeLapsed = 0,
          distanceY = finalY - startTop, // If we're going up, this will be a negative number
          distanceX = finalX - startLeft,
          currentPositionY,
          currentPositionX,
          timeProgress;


      var stopAnimation = function () {
        // If we have reached our destination clear the interval
        if (currentPositionY === finalY && currentPositionX === finalX) {
          $interval.cancel(runAnimation);
          animationInProgress = false;
        }
      };

      var animateScroll = function () {
        timeLapsed += 16;
        // get percentage of progress to the specified speed (e.g. 16/500). Should always be between 0 and 1
        timeProgress = ( timeLapsed / speed );
        // Make a check and set back to 1 if we went over (e.g. 512/500)
        timeProgress = ( timeProgress > 1 ) ? 1 : timeProgress;
        // Number between 0 and 1 corresponding to the animation pattern
        var multiplier = getEasingPattern(timeProgress);
        // Calculate the distance to travel in this step. It is the total distance times a percentage of what we will move
        var translateY = distanceY * multiplier;
        var translateX = distanceX * multiplier;
        // Assign to the shorthand variables
        currentPositionY = startTop + translateY;
        currentPositionX = startLeft + translateX;
        // Move slightly following the easing pattern
        container.scrollTop = currentPositionY;
        container.scrollLeft = currentPositionX;
        // Check if we have reached our destination          
        stopAnimation();
      };

      animationInProgress = true;
      // Kicks off the function
      var runAnimation = $interval(animateScroll, 16);
    }

    return function(target, containerSelector, offsetY, offsetX, speed) {
      var container = document.querySelectorAll(containerSelector);
      if (target) {
        offsetY = offsetY || -100;
        offsetX = offsetX || -100;
      }
      _autoScroll(container[0], target[0].offsetTop, target[0].offsetLeft, offsetY, offsetX, speed);
    };
  }])

  .factory('debounce', ['$timeout', '$q',
    function($timeout, $q) {
    
    return function(func, wait, immediate) {
      var timeout;
      var deferred = $q.defer();
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if(!immediate) {
            deferred.resolve(func.apply(context, args));
            deferred = $q.defer();
          }
        };
        var callNow = immediate && !timeout;
        if ( timeout ) {
          $timeout.cancel(timeout);
        }
        timeout = $timeout(later, wait);
        if (callNow) {
          deferred.resolve(func.apply(context,args));
          deferred = $q.defer();
        }
        return deferred.promise;
      };
    };
  }]);
