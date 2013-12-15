'use strict';

describe('Directive: tour', function () {

  beforeEach(module('tour/tour.tpl.html'));
  beforeEach(module('angular-tour.tour'));

  var $rootScope, $compile, $controller, $timeout;

  beforeEach(inject(function (_$rootScope_, _$compile_, _$controller_, _$timeout_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $controller = _$controller_;
    $timeout = _$timeout_;
  }));

  describe('OrderedList', function() {
    var steps;

    beforeEach(inject(function (OrderedList) {
      steps = OrderedList;
      // add unordered items
      steps.set(1, '1');
      steps.set(3, '3');
      steps.set(2, '2');
      steps.set(4, '4');
    }));

    it('should find index of \'4\'', function () {
      expect(steps.indexOf('4'));
    });
    it('should have a length of 4 items', function () {
      expect(steps.getCount()).toBe(4);
    });

    it('should not add undefined indexes', function () {
      steps.set(undefined, '5');
      expect(steps.getCount()).toBe(4);
    });

    it('should get the 3rd item', function() {
      expect(steps.get(3)).toBe('3');
    });

    it('should push a value into steps', function () {
      expect(steps.getCount()).toBe(4);
      steps.push('5');
      expect(steps.getCount()).toBe(5);
      expect(steps.get(5)).toBe('5');
    });

    it('should push a value into empty list', inject(function (OrderedList) {
      steps.remove(1);
      steps.remove(2);
      steps.remove(3);
      steps.remove(4);
      expect(steps.getCount()).toBe(0);

      steps.push('1');
      expect(steps.getCount()).toBe(1);
      expect(steps.get(0)).toBe('1');
    }));

    it('should order numbers properly', function() {
      var list = [];
      steps.forEach(function(key, value) {
        list.push(key);
      });
      expect(list[0]).toBe(1);
      expect(list[1]).toBe(2);
      expect(list[2]).toBe(3);
      expect(list[3]).toBe(4);
    });
  });

  describe('basics', function() {
    var elm, scope, tour, tip1, tip2, tourScope;

    beforeEach(function() {
      this.addMatchers({
        toHaveOpenTourtips: function(noOfOpened) {
          var tourtipElements = this.actual.find('div.tour-tip');
          noOfOpened = noOfOpened || 1;

          this.message = function() {
            return "Expected '" + angular.mock.dump(tourtipElements) + "' to have '" + tourtipElements.length + "' opened tour tips.";
          };

          return tourtipElements.length === noOfOpened;
        }
      });

      scope = $rootScope.$new();

      tour = angular.element('<tour></tour>');
      tip1 = angular.element('<span tour-tip="feature 1!" step="0" next="Next" placement="top" class="btn">' +
        'Important website feature' +
        '<a href="#" tour-next></a>' +
        '</span>');

      tip2 = angular.element('<span tour-tip="feature 2!" step="1" next="Next" placement="top" class="btn">' +
        'Another website feature' +
        '</span>');

      tour.append(tip1);
      tour.append(tip2);

      elm = $compile(tour)(scope);
      scope.$apply();

      tourScope = elm.isolateScope();
    });
    afterEach(function() {
      scope.$destroy();
    });

    describe('tour-tip', function() {
      it('should contain original text', function () {
        expect(elm.html()).toContain('Important website feature');
      });

      it('should append feature 1 popup to element and open it', function () {
        expect(elm).toHaveOpenTourtips(1);
        expect(tip1.next().html()).toContain('feature 1');
        expect(tip1.scope().tt_open).toBe(true);
      });

      it('should open feature 2 popup to element', function () {
        tourScope.next();
        expect(elm).toHaveOpenTourtips(1);
        expect(tip2.scope().tt_open).toBe(true);
      });

    });
  });

  describe('tour controller', function() {
    var scope, ctrl;
    //create an array of steps and add to the scope
    var steps = [{'content': 1},{'content': 2}];

    beforeEach(function() {
      scope = $rootScope.$new();
      ctrl = $controller('TourController', {$scope: scope});
      for(var i = 0;i < steps.length;i++){
        ctrl.addStep(steps[i]);
      }
      scope.$apply();
    });

    afterEach(function() {
      scope.$destroy();
    });

    it('should have added tour-tips to steps array', function () {
      expect(ctrl.steps.getCount()).toBe(2);
    });

    it('should add tour-tip to end of list if it doesnt specify step', function () {
      expect(ctrl.steps.get(2)).toBe(undefined);
      expect(ctrl.steps.getCount()).toBe(2);

      var tourStep = {content:'mockStep'};
      ctrl.addStep(tourStep);

      expect(ctrl.steps.getCount()).toBe(3);
      expect(ctrl.steps.get(2).content).toBe('mockStep');
    });

    it('should replace tour-tip at specified step', function () {
      expect(ctrl.steps.get(0).content).toBe(1);

      var tourStep = {content: 3, position:0};
      ctrl.addStep(tourStep);

      expect(ctrl.steps.get(0).content).toBe(3);
    });
  });
});