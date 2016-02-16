/* global jasmine */
'use strict';

describe('Directive: tour', function () {

  beforeEach(module('tour/tour.tpl.html'));
  beforeEach(module('angular-tour.tour'));

  function getTourStep() {
    return angular.element('body').find('div.tour-tip');
  }

  var $rootScope, $compile, $controller, $timeout;

  beforeEach(inject(function (_$rootScope_, _$compile_, _$controller_, _$timeout_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $controller = _$controller_;
    $timeout = _$timeout_;

    this.addMatchers({
      toHaveOpenTourtips: function(noOfOpened) {
        var tourtipElements = getTourStep();

        this.message = function() {
          return 'Expected \'' + angular.mock.dump(tourtipElements) + '\' to have \'' + noOfOpened +
            '\' opened tour tips. Instead had \'' + tourtipElements.length + '\'.';
        };

        return tourtipElements.length === noOfOpened;
      }
    });

  }));

  describe('orderedList', function() {
    var steps;

    beforeEach(inject(function (orderedList) {
      steps = orderedList();
      // add unordered items
    }));

    function addTypicalSteps() {
      steps.set(1, '1');
      steps.set(3, '3');
      steps.set(2, '2');
      steps.set(4, '4');
    }

    it('should insert a value into steps', function () {
      steps.set(2, '2');
      steps.set(3, '3');
      steps.set(4, '4');

      expect(steps.getCount()).toBe(3);
      steps.set(1, '1');
      expect(steps.getCount()).toBe(4);

      expect(steps.get(1)).toBe('1');
      expect(steps.get(2)).toBe('2');
      expect(steps.get(3)).toBe('3');
      expect(steps.get(4)).toBe('4');
    });

    it('should should return the first value', function () {
      addTypicalSteps();
      expect(steps.first()).toBe('1');
    });

    it('should find index of \'4\'', function () {
      addTypicalSteps();
      expect(steps.indexOf('4'));
    });
    it('should have a length of 4 items', function () {
      addTypicalSteps();
      expect(steps.getCount()).toBe(4);
    });

    it('should not add undefined indexes', function () {
      addTypicalSteps();
      steps.set(undefined, '5');
      expect(steps.getCount()).toBe(4);
    });

    it('should get the 3rd item', function() {
      addTypicalSteps();
      expect(steps.get(3)).toBe('3');
    });

    it('should push a value into steps', function () {
      addTypicalSteps();
      expect(steps.getCount()).toBe(4);
      steps.push('5');
      expect(steps.getCount()).toBe(5);
      expect(steps.get(5)).toBe('5');
    });

    it('should push a value into empty list', inject(function (orderedList) {
      expect(steps.getCount()).toBe(0);

      steps.push('1');
      expect(steps.getCount()).toBe(1);
      expect(steps.get(0)).toBe('1');
    }));

    it('should order numbers properly', function() {
      addTypicalSteps();
      var list = [];
      steps.forEach(function(value, key) {
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

      scope = $rootScope.$new();

      scope.stepIndex = 0;

      tour = angular.element('<tour step="stepIndex">' +
        '<span id="tt1" tourtip="feature 1!" tourtip-step="0" tourtip-next-label="Next" tourtip-placement="top" class="btn">Important website feature</span>' +
        '<span id="tt2" tourtip="feature 2!" tourtip-step="1" tourtip-next-label="Next" tourtip-placement="top" class="btn">Another website feature</span>' +
      '</tour>');

      elm = $compile(tour)(scope);
      tip1 = tour.find('#tt1');
      tip2 = tour.find('#tt2');
      scope.$apply();
      $timeout.flush();

      tourScope = elm.scope();
    });
    afterEach(function() {
      scope.$destroy();
    });

    it('should be able to close tour', function () {
      expect(elm).toHaveOpenTourtips(1);
      tourScope.closeTour();
      scope.$apply();
      expect(elm).toHaveOpenTourtips(0);
    });

    it('should be able to open tour', function () {
      tourScope.closeTour();
      scope.$apply();
      expect(elm).toHaveOpenTourtips(0);
      tourScope.openTour();
      scope.$apply();
      expect(elm).toHaveOpenTourtips(1);
    });
  });

  describe('tourtip', function() {
    var elm, scope, tour, tip1, tip2, tourScope;

    beforeEach(function() {

      scope = $rootScope.$new();

      scope.stepIndex = 0;

      tour = angular.element('<tour step="stepIndex">' +
        '<span id="tt1" tourtip="feature 1!" on-show="onShowFunction()" on-proceed="onProceedFunction()" tourtip-step="0" tourtip-placement="top" class="btn">Important website feature</span>' +
        '<span id="tt2" tourtip="feature 2!" tourtip-step="1" tourtip-placement="top" class="btn">Another website feature</span>' +
      '</tour>');

      elm = $compile(tour)(scope);
      tip1 = tour.find('#tt1');
      tip2 = tour.find('#tt2');
      scope.$apply();
      $timeout.flush();

      tourScope = elm.scope();
    });
    afterEach(function() {
      scope.$destroy();
    });

    it('should contain original text', function () {
      expect(elm.html()).toContain('Important website feature');
    });

    it('should append tip1 popup to body and open it', function () {
      expect(elm).toHaveOpenTourtips(1);
      var stepText = tip1.attr('tourtip');
      var tourStep = getTourStep();
      expect(tourStep.html()).toContain('feature 1');
      expect(tip1.scope().ttOpen).toBe(true);
    });

    it('should open tip2 popup and close tip1 on next', function () {
      var elmNext = getTourStep().find('.tour-next-tip').eq(0);

      elmNext.click();

      expect(elm).toHaveOpenTourtips(1);
      expect(tip1.scope().ttOpen).toBe(false);
      expect(tip2.scope().ttOpen).toBe(true);
    });

    it('proceed will move to the next step', function () {
      var tScope = tip1.scope();
      tScope.proceed();
      scope.$apply();
      expect(tScope.getCurrentStep() + 1).toBe(2);
      var tourStep = getTourStep();
      expect(tourStep.html()).toContain('feature 2');
    });

    it('should close tips when you click close', function () {
      var elmNext = getTourStep().find('.tour-close-tip').eq(0);
      elmNext.click();

      expect(tip1.scope().ttOpen).toBe(false);
      expect(tip2.scope().ttOpen).toBe(false);
    });

    it('should call on-proceed method', function() {
      scope.onProceedFunction = function() {};
      scope.ttSourceScope = true;
      spyOn(scope, 'onProceedFunction');
      var tour1Next = getTourStep().find('.tour-next-tip').eq(0);
      tour1Next.click();
      $timeout.flush();

      expect(scope.onProceedFunction).toHaveBeenCalled();
    });

    it('should call on-show method', function() {
      //let's reset to the state where tour is not visible
      scope.stepIndex = -1;
      scope.$apply();

      //assign onShow callback
      scope.onShowFunction = function() {};
      spyOn(scope, 'onShowFunction');

      //go to the first step
      scope.stepIndex = 0;
      scope.$apply();
      $timeout.flush();

      scope.onProceedFunction = function() {};
      spyOn(scope, 'onProceedFunction');
      expect(scope.onShowFunction).toHaveBeenCalled();
      expect(scope.onProceedFunction).not.toHaveBeenCalled();
    });

  });

  describe('tour directive', function() {

    var scope, elm, tour, tip1, tip2, tourScope;

    beforeEach(function() {
      scope = $rootScope.$new();
      scope.stepIndex = 0;
      scope.otherStepIndex = -1;

      // set up first tour
      tour = angular.element('<tour step="stepIndex" post-tour="tourEnd()" tour-complete="tourComplete()" post-step="tourStep()"></tour>');
      tip1 = angular.element('<span tourtip="feature 1!">' +
        'Important website feature' +
        '</span>');
      tip2 = angular.element('<span tourtip="feature 2!">' +
        'Another website feature' +
        '</span>');

      tour.append(tip1);
      tour.append(tip2);

      elm = $compile(tour)(scope);
      scope.$apply();
      $timeout.flush();
      tourScope = tour.scope();
    });
    afterEach(function() {
      scope.$destroy();
    });

    it('should call post-tour method', function() {
      scope.tourEnd = function() {};
      spyOn(scope, 'tourEnd');
      var tour1Next = getTourStep().find('.tour-next-tip').eq(0);
      tour1Next.click();
      tour1Next.click();
      expect(scope.tourEnd).toHaveBeenCalled();
    });

    it('should call post-tour method even when tour was canceled', function() {
      scope.tourEnd = function() {};
      spyOn(scope, 'tourEnd');
      tourScope.closeTour();
      expect(scope.tourEnd).toHaveBeenCalled();
    });

    it('should call tour-complete method', function() {
      scope.tourComplete = function() {};
      spyOn(scope, 'tourComplete');
      var tour1Next = getTourStep().find('.tour-next-tip').eq(0);
      tour1Next.click();
      tour1Next.click();
      expect(scope.tourComplete).toHaveBeenCalled();
    });

    it('should not call tour-complete method when tour canceled', function() {
      scope.tourComplete = function() {};
      spyOn(scope, 'tourComplete');
      tourScope.closeTour();
      expect(scope.tourComplete).not.toHaveBeenCalled();
    });

    it('should call post-step method', function() {
      scope.tourStep = function() {};
      spyOn(scope, 'tourStep');
      var tour1Next = getTourStep().find('.tour-next-tip').eq(0);
      tour1Next.click();
      expect(scope.tourStep).toHaveBeenCalled();
    });

    it('should be able to handle multiple tours', function() {
      // when first tour finishes, initializes second tour
      scope.tourComplete = function() {
        scope.otherStepIndex = 0;
      };

      // set up second tour
      var otherTour = angular.element('<tour step="otherStepIndex"></tour>');
      var otherTip1 = angular.element('<span tourtip="feature 1 of other tour!">' +
        'Important website feature' + '</span>');
      var otherTip2 = angular.element('<span tourtip="feature 2 of other tour!">' +
        'Another website feature' + '</span>');

      otherTour.append(otherTip1);
      otherTour.append(otherTip2);

      var otherElm = $compile(otherTour)(scope);

      scope.$apply();
      $timeout.flush();

      var tour1Next = getTourStep().find('.tour-next-tip').eq(0);

      // expect second tour to be closed
      expect(otherTip1.scope().ttOpen).toBe(false);
      expect(otherTip2.scope().ttOpen).toBe(false);

      // finish first tour, expect tours to open and close correctly
      expect(tip1.scope().ttOpen).toBe(true);
      expect(tip2.scope().ttOpen).toBe(false);
      tour1Next.click();
      expect(tip1.scope().ttOpen).toBe(false);
      expect(tip2.scope().ttOpen).toBe(true);
      tour1Next.click();

      // recompile the other tour element after the first tour finishes
      otherElm = $compile(otherTour)(scope);
      scope.$apply();
      $timeout.flush();
      var tour2Next = getTourStep().find('.tour-next-tip').eq(0);

      // expect second tour to open after first tour finished
      expect(otherTip1.scope().ttOpen).toBe(true);
      expect(otherTip2.scope().ttOpen).toBe(false);
      tour2Next.click();
      expect(otherTip1.scope().ttOpen).toBe(false);
      expect(otherTip2.scope().ttOpen).toBe(true);
    });
  });

  describe('tour controller', function() {
    var scope, ctrl;
    //create an array of steps and add to the scope
    var steps = [{'content': 1},{'content': 2},{'content': 3}];

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

    it('should select step at index', function () {
      ctrl.select(0);
      expect(ctrl.currentStep).toEqual(0);
      ctrl.select(1);
      expect(ctrl.currentStep).toEqual(1);
    });

    it('should set first step to active = true and the rest to false', function() {
      ctrl.select(0);

      ctrl.steps.forEach(function(step, i) {
        if (i !== 0) {
          expect(step.ttOpen).not.toBe(true);
        } else {
          expect(step.ttOpen).toBe(true);
        }
      });
    });

    it('should have added tourtips to steps array', function () {
      expect(ctrl.steps.getCount()).toBe(3);
    });

    it('should add tourtip to end of list if it doesnt specify step', function () {
      expect(ctrl.steps.get(3)).toBe(undefined);
      expect(ctrl.steps.getCount()).toBe(3);

      var tourStep = {content:'mockStep'};
      ctrl.addStep(tourStep);

      expect(ctrl.steps.getCount()).toBe(4);
      expect(ctrl.steps.get(3).content).toBe('mockStep');
    });

    it('should replace tourtip at specified step', function () {
      expect(ctrl.steps.get(0).content).toBe(1);

      var tourStep = {content: 3, index:0};
      ctrl.addStep(tourStep);

      expect(ctrl.steps.get(0).content).toBe(3);
    });
  });

  describe('scroll service', function() {
    var div, target, body, scope, scrollTo;

    beforeEach(inject(function (_scrollTo_) {
      scope = $rootScope.$new();
      scrollTo = _scrollTo_;
      div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.top = '500px';
      target = angular.element(div);
      body = angular.element(document).find('body')
      body[0].style.height = (window.innerHeight*3).toString() + 'px';
      body.append(target);
      window.scrollTo(0, 0);
    }));

    it('should scroll to position', function () {
      expect( body[0].scrollTop ).toEqual(0);
      debugger;

      scrollTo(target, 'body', -100, -100, 500);
      waitsFor(function() {
        return body.scrollTop === 100;
      }, 'Current position to be 100px');

      runs(function() {
        expect( body.scrollTop ).toEqual(100);
      });
    });
  });
});
