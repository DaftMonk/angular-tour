'use strict';

angular.module('angular-tour.tour', [])
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
          self._array.push(key);
          self.map[key] = value;
          self._array.sort();
        }
      },
      indexOf: function(value) {
        for( var prop in self.map ) {
          if( self.map.hasOwnProperty( prop ) ) {
            if( self.map[ prop ] === value )
              return prop;
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
          f(key, value);
        }
      }
    };
  })
  .controller('TourController', function($scope, OrderedList) {
    var self = this,
      currentIndex = -1,
      currentStep = null,
      steps = self.steps = OrderedList;

    self.select = function(nextStep) {
      function goNext() {
        if(currentStep) {
          nextStep.tt_open = true;
          currentStep.tt_open = false;
        }
        currentStep = nextStep;
        currentIndex = nextIndex;
      }

      var nextIndex = steps.indexOf(nextStep);
      if(nextStep && nextStep !== currentStep) {
        goNext();
      }
    };
    self.addStep = function(step) {
      if(angular.isNumber(step.position)) {
        steps.set(step.position, step);
      } else {
        steps.push(step);
      }

      if(steps.getCount() === 1 || step.tt_open) {
        steps.get(steps.getCount() - 1).tt_open = true;
      } else {
        step.tt_open = false;
      }
    };

    $scope.endTour = function () {
      for(var i=0; i<steps.getCount(); i++) {
        steps.get(i).tt_open = false;
      }
    };

    $scope.next = function () {
      var newIndex = currentIndex + 1;
      if(newIndex > steps.getCount()) {
        return $scope.endTour();
      }
      return self.select(steps[newIndex]);
    };

    $scope.prev = function () {
      var newIndex = currentIndex - 1 < 0 ? 0 : currentIndex - 1;

      return self.select(steps.get(newIndex));
    };
  })
  .directive('tour', function () {
    return {
      controller: 'TourController',
      scope: {},
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  })

  .directive('tourTip', function ($window, $compile, $interpolate) {
    var startSym = $interpolate.startSymbol();
    var endSym = $interpolate.endSymbol();

    var template =
      '<div tour-popup '+
        'next="'+startSym+'tt_next'+endSym+'" '+
        'content="'+startSym+'tt_content'+endSym+'" '+
        'placement="'+startSym+'tt_placement'+endSym+'" '+
        '>'+
        '</div>';

    return {
      require: '^tour',
      restrict: 'EA',
      scope: true,
      link: function (scope, element, attrs, tourCtrl) {
        var tourtip = $compile( template )( scope );
        scope.tt_content = attrs.tourTip;
        scope.tt_placement = attrs.placement;
        scope.tt_step = attrs.step;
        scope.tt_next = attrs.next;
        scope.tt_isOpen = false;
        tourCtrl.addStep(scope);

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
            ttPosition;

          if ( ! scope.tt_content ) {
            return;
          }

          // Set the initial positioning.
          tourtip.css({ top: 0, left: 0, display: 'block' });

          // Append it to the dom
          element.after( tourtip );

          // Get the position of the directive element
          position = element.position;

          // Get the height and width of the tooltip so we can center it
          ttWidth = tourtip.prop( 'offsetWidth' );
          ttHeight = tourtip.prop( 'offsetHeight' );

          // Calculate the tourtip's top and left coordinates to center it
          switch ( scope.tt_placement ) {
          case 'right':
            ttPosition = {
              top: position.top + position.height / 2 - ttHeight / 2,
              left: position.left + position.width
            };
            break;
          case 'bottom':
            ttPosition = {
              top: position.top + position.height,
              left: position.left + position.width / 2 - ttWidth / 2
            };
            break;
          case 'left':
            ttPosition = {
              top: position.top + position.height / 2 - ttHeight / 2,
              left: position.left - ttWidth
            };
            break;
          default:
            ttPosition = {
              top: position.top - ttHeight,
              left: position.left + position.width / 2 - ttWidth / 2
            };
            break;
          }

          ttPosition.top += 'px';
          ttPosition.left += 'px';

          // Now set the calculated positioning.
          tourtip.css( ttPosition );

          scope.tt_isOpen = true;
        }

        function hide() {

        }
      }
    };
  })
  .directive('tourPopup', function () {
    return {
      replace: true,
      templateUrl: 'tour/tour.tpl.html',
      scope: {content: '@', next: '@', placement: '@'},
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });
