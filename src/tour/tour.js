'use strict';

angular.module('angular-tour.tour', ['ivpusic.cookie'])
  .constant('tourConfig', {
    placement        : 'top',                  // default placement relative to target. 'top', 'right', 'left', 'bottom'
    animation        : true,                   // if tips fade in
    nextLabel        : 'Next',                 // default text in the next tip button
    scrollSpeed      : 500,                    // page scrolling speed in milliseconds
    offset           : 28,                     // how many pixels offset the tip is from the target
    cookies          : true,                   // if cookies are used, may help to disable during development
    cookieName       : 'ngTour',               // choose your own cookie name
    postTourCallback : function (stepIndex){}, // a method to call once the tour closes (canceled or complete)
    postStepCallback : function (stepIndex){}  // a method to call after each step
  })

  .provider('cookieStore', function(){
    var self = this;
    self.defaultOptions = {};

    self.setDefaultOptions = function(options){
      self.defaultOptions = options;
    };

    self.$get = function(ipCookie){
      return {
        get: function(name){
          var jsonCookie = ipCookie(name);
          if(jsonCookie){
            return angular.fromJson(jsonCookie);
          }
        },
        put: function(name, value, options){
          options = $.extend({}, self.defaultOptions, options);
          ipCookie(name, angular.toJson(value), options);
        },
        remove: function(name, options){
          ipCookie.remove(name);
        }
      };
    };
  })

  .config(function(cookieStoreProvider){
    cookieStoreProvider.setDefaultOptions({
      path: '/', // Cookies should be available on all pages
      expires: 3650 // Store tour cookies for 10 years
    });
  })

  .controller('TourController', function($scope, orderedList, tourConfig, cookieStore) {
    var self = this,
      currentIndex = -1,
      currentStep = null,
      steps = self.steps = orderedList();

    var selectIfFirstStep = function(step) {
      var loadedIndex = cookieStore.get(tourConfig.cookieName);
      var wasClosed = cookieStore.get(tourConfig.cookieName + '_closed');
      if(wasClosed) return;

      function selectFromCookie() {
        if(steps.indexOf(step) === loadedIndex) {
          self.select(step);
        }
      }

      function selectFirst() {
        if((steps.first() === step)) {
          self.select(step);
        } else {
          step.tt_open = false;
        }
      }

      // load from cookie or select first step
      if(loadedIndex && tourConfig.cookies) {
        selectFromCookie();
      } else {
        selectFirst();
      }
    };

    self.selectAtIndex = function(index) {
      if(steps.get(index))
        self.select(steps.get(index));
    };

    self.getCurrentStep = function() {
      return currentStep;
    };

    self.select = function(nextStep) {
      var nextIndex = steps.indexOf(nextStep);

      function goNext() {
        if(currentStep) {
          currentStep.tt_open = false;
        }
        currentStep = nextStep;
        currentIndex = nextIndex;
        nextStep.tt_open = true;
      }

      if(nextStep) {
        goNext();
      } else {
        self.tourCompleted();
      }
    };

    self.addStep = function(step) {
      if(angular.isNumber(step.index) && !isNaN(step.index)) {
        steps.set(step.index, step);
      } else {
        steps.push(step);
      }
    };

    self.endTour = function (skipSave) {
      steps.forEach(function(step) {
        step.tt_open = false;
      });

      if(!skipSave && tourConfig.cookies) {
        cookieStore.put(tourConfig.cookieName + '_closed', true);
      }

      tourConfig.postTourCallback(currentIndex);
    };

    self.startTour = function() {
      if(cookieStore.get(tourConfig.cookieName + '_completed')) return;

      if(tourConfig.cookies) {
        cookieStore.put(tourConfig.cookieName + '_closed', false);
      }

      steps.forEach(function(step) {
        selectIfFirstStep(step);
      });
    };

    $scope.openTour = function() {
      if(cookieStore.get(tourConfig.cookieName + '_completed') && tourConfig.cookies) {
        cookieStore.put(tourConfig.cookieName + '_completed', false);
        self.save(steps.indexOf(steps.first()));
      }

      self.startTour();
    };

    $scope.closeTour = function() {
      self.endTour();
    };

    self.save = function(index) {
      cookieStore.put(tourConfig.cookieName, index);
    };

    self.tourCompleted = function() {
      self.endTour();
      cookieStore.put(tourConfig.cookieName + '_completed', true);
    };

    self.next = function () {
      var newIndex = currentIndex + 1;

      if(tourConfig.cookies) {
        self.save(currentIndex + 1);
      }

      if(newIndex + 1 > steps.getCount()) {
        self.tourCompleted();
      }

      tourConfig.postStepCallback(newIndex);
      self.select(steps.get(newIndex));
    };
  })

  .directive('tour', function () {
    return {
      controller: 'TourController',
      scope: true,
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  })

  .directive('tourtip', function ($window, $compile, $interpolate, $timeout, scrollTo, tourConfig) {
    var startSym = $interpolate.startSymbol(),
        endSym = $interpolate.endSymbol();

    var template =
      '<div tour-popup '+
        'next-label="'+startSym+'tt_next_label'+endSym+'" '+
        'content="'+startSym+'tt_content'+endSym+'" '+
        'placement="'+startSym+'tt_placement'+endSym+'" '+
        'next-action="tt_next_action()" '+
        'close-action="tt_close_action()" '+
        'is-open="'+startSym+'tt_open'+endSym+'" '+
        '>'+
        '</div>';

    return {
      require: '^tour',
      restrict: 'EA',
      scope: {},
      link: function (scope, element, attrs, tourCtrl) {
        attrs.$observe( 'tourtip', function ( val ) {
          scope.tt_content = val;
        });

        attrs.$observe( 'tourtipPlacement', function ( val ) {
          scope.tt_placement = val || tourConfig.placement;
        });

        attrs.$observe( 'tourtipNextLabel', function ( val ) {
          scope.tt_next_label = val || tourConfig.nextLabel;
        });

        attrs.$observe( 'tourtipOffset', function ( val ) {
          scope.tt_offset = parseInt(val, 10) || tourConfig.offset;
        });

        scope.tt_open = false;
        scope.tt_animation = tourConfig.animation;
        scope.tt_next_action = tourCtrl.next;
        scope.tt_close_action = tourCtrl.endTour;
        scope.index = parseInt(attrs.tourtipStep, 10);

        var tourtip = $compile( template )( scope );
        tourCtrl.addStep(scope);

        $timeout(function() {
          tourCtrl.startTour();
        }, 500);

        scope.$watch('tt_open', function(tt_open) {
          if(tt_open) {
            tourCtrl.select(scope);
            show();
          } else {
            hide();
          }
        });

        function show() {
          var position,
            ttWidth,
            ttHeight,
            ttPosition,
            height,
            width,
            targetElement;

          if ( ! scope.tt_content ) {
            return;
          }

          if(scope.tt_animation)
            tourtip.fadeIn();
          else {
            tourtip.css({ display: 'block' });
          }

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
            position = targetElement.position();

            ttWidth = tourtip.width();
            ttHeight = tourtip.height();

            width = targetElement.width();
            height = targetElement.height();

            // Calculate the tourtip's top and left coordinates to center it
            switch ( scope.tt_placement ) {
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
          tourtip.detach();
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

  .directive('tourPopup', function () {
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
  })

  /**
   * OrderedList factory
   * Each tour will have their own steps
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

  .factory('scrollTo', function() {
    return function(target, offsetY, offsetX, speed) {
      if(target) {
        offsetY = offsetY || -100;
        offsetX = offsetX || -100;
        speed = speed || 500;
        $('html,body').stop().animate({scrollTop: target.offset().top + offsetY, scrollLeft: target.offset().left + offsetX}, speed);
      } else {
        $('html,body').stop().animate({scrollTop: 0}, speed);
      }
    };
  });



