'use strict';

angular.module('angular-tour.tour', ['ngCookies'])
  .constant('tourConfig', {
    placement        : 'top',                  // default placement relative to target. 'top', 'right', 'left', 'bottom'
    animation        : true,                   // if tips fade in
    nextLabel        : 'Next',                 // default text in the next tip button
    scrollSpeed      : 200,                    // page scrolling speed in milliseconds
    offset           : 28,                     // how many pixels offset the tip is from the target
    cookies          : true,                   // if cookies are used, may help to disable during development
    cookieName       : 'ngTour',               // choose your own cookie name
    postTourCallback : function (stepIndex){}, // a method to call once the tour closes (canceled or complete)
    postStepCallback : function (stepIndex){}  // a method to call after each step
  })
  .controller('TourController', function($scope, OrderedList, tourConfig, $cookieStore) {
    var self = this,
      currentIndex = -1,
      currentStep = null,
      steps = self.steps = OrderedList;

    var selectIfFirstStep = function(step) {
      var loadedIndex = $cookieStore.get(tourConfig.cookieName);
      var wasClosed = $cookieStore.get(tourConfig.cookieName + '_closed');
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
        $cookieStore.put(tourConfig.cookieName + '_closed', true);
      }

      tourConfig.postTourCallback(currentIndex);
    };

    self.startTour = function() {
      if($cookieStore.get(tourConfig.cookieName + '_completed')) return;

      if(tourConfig.cookies) {
        $cookieStore.put(tourConfig.cookieName + '_closed', false);
      }

      steps.forEach(function(step) {
        selectIfFirstStep(step);
      });
    };

    $scope.openTour = function() {
      if($cookieStore.get(tourConfig.cookieName + '_completed') && tourConfig.cookies) {
        $cookieStore.put(tourConfig.cookieName + '_completed', false);
        self.save(steps.indexOf(steps.first()));
      }

      self.startTour();
    };

    $scope.closeTour = function() {
      self.endTour();
    };

    self.save = function(index) {
      $cookieStore.put(tourConfig.cookieName, index);
    };

    self.next = function () {
      var newIndex = currentIndex + 1;

      if(tourConfig.cookies) {
        self.save(currentIndex + 1);
      }

      if(newIndex + 1 > steps.getCount()) {
        self.endTour();
        $cookieStore.put(tourConfig.cookieName + '_completed', true);
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

  .directive('tourReopen', function () {
    return {
      require:['^parentDirective', '^ngModel'],
      scope: true,
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  })

  .directive('tourTip', function ($window, $compile, $interpolate, $timeout, scrollTo, tourConfig) {
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
        attrs.$observe( 'tourTip', function ( val ) {
          scope.tt_content = val;
        });

        attrs.$observe( 'placement', function ( val ) {
          scope.tt_placement = val || tourConfig.placement;
        });

        attrs.$observe( 'nextLabel', function ( val ) {
          scope.tt_next_label = val || tourConfig.nextLabel;
        });

        attrs.$observe( 'offset', function ( val ) {
          scope.tt_offset = val || tourConfig.offset;
        });

        scope.animation = attrs.offset || tourConfig.animation;
        scope.tt_open = false;
        scope.tt_next_action = tourCtrl.next;
        scope.tt_close_action = tourCtrl.endTour;
        scope.index = parseInt(attrs.step, 10);

        var tourtip = $compile( template )( scope );
        tourCtrl.addStep(scope);

        $timeout(function() {
          tourCtrl.startTour();
        }, 100);

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

          if(scope.animation)
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

          // Get the position of the directive element
          position = targetElement.position() || element.position();

          ttWidth = tourtip.width();
          ttHeight = tourtip.height();

          width = targetElement.width();
          height = targetElement.height();

          // Calculate the tourtip's top and left coordinates to center it
          switch ( scope.tt_placement ) {
          case 'right':
            scrollTo(targetElement);
            ttPosition = {
              top: position.top,
              left: position.left + width + scope.tt_offset
            };
            break;
          case 'bottom':
            scrollTo(targetElement);
            ttPosition = {
              top: position.top + height + scope.tt_offset,
              left: position.left
            };
            break;
          case 'left':
            scrollTo(targetElement, -200);
            ttPosition = {
              top: position.top,
              left: position.left - ttWidth - scope.tt_offset
            };
            break;
          default:
            scrollTo(targetElement, 200);
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
        }

        function hide() {
          tourtip.detach();
        }
      }
    };
  })

  .directive('tourPopup', function () {
    return {
      replace: true,
      templateUrl: 'tour/tour.tpl.html',
      scope: {content: '@', nextLabel: '@', placement: '@', nextAction: '&', closeAction: '&', isOpen: '@'},
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  })

  .factory('OrderedList', function() {
    var self = this;
    self.map = {};
    self._array = [];
    return {
      set: function(key, value) {
        if(!angular.isNumber(key)) return;
        // key already exists, replace value
        if(key in self.map) {
          self.map[key] = value;
        }
        // insert new key and value
        else {
          if(key < self._array.length) {
            // insert if possible
            var insertIndex = key - 1 > 0 ? key - 1 : 0;
            self._array.splice(insertIndex, 0, key);
          } else {
            // otherwise just push to the end
            self._array.push(key);
          }

          self.map[key] = value;
          self._array.sort();
        }
      },
      indexOf: function(value) {
        for( var prop in self.map ) {
          if( self.map.hasOwnProperty( prop ) ) {
            if( self.map[ prop ] === value )
              return Number(prop);
          }
        }
      },
      push: function(value) {
        var key = (self._array[self._array.length - 1] + 1) || 0;
        // insert new key and value
        self._array.push(key);
        self.map[key] = value;
        self._array.sort();
      },
      remove: function(key) {
        var index = self._array.indexOf(key);
        if(index === -1) {
          throw new Error('key does not exist');
        }
        self._array.splice(index, 1);
        delete self.map[key];
      },
      get: function(key) {
        return self.map[key];
      },
      getCount: function() {
        return self._array.length;
      },
      forEach: function(f) {
        var key, value;
        for(var i = 0; i < self._array.length; i++) {
          key = self._array[i];
          value = self.map[key];
          f(value, key);
        }
      },
      first: function() {
        var key, value;
        key = self._array[0];
        value = self.map[key];
        return(value);
      }
    };
  })

  .factory('scrollTo', function() {
    return function(target, offset, speed) {
      if(target) {
        offset = offset || 100;
        speed = speed || 500;
        $('html,body').stop().animate({scrollTop: target.offset().top - offset}, speed);
      } else {
        $('html,body').stop().animate({scrollTop: 0}, speed);
      }
    };
  });



