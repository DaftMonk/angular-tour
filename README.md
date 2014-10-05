# Angular Tour - [AngularJS](http://angularjs.org/) directive for giving a tour of your website.

## Demo

Want to see it in action? Visit <http://daftmonk.github.io/angular-tour/>

## Showcase features of your website

Give an interactive tour to showcase the features of your website. 

  * Easy to use
  * Responsive to window resizes
  * Smoothly scrolls to each step
  * Control the placement for each tour tip

## Supported browsers

Has been tested in 

* Chrome
* Firefox
* Safari
* Internet Explorer 9+

## Installation

To install run

    bower install angular-tour

Angular Tour has a dependency on jQuery.

## Setup

Once bower has downloaded the dependencies for you, you'll need to make sure you add the required libraries to your index file. Your script includes should look something like this:

    <script src="bower_components/jquery/jquery.js"></script>
    <script src="bower_components/angular/angular.js"></script>
    <script src="bower_components/angular-tour/dist/angular-tour-tpls.min.js"></script>

You'll also probably want to include the default stylesheet for angular tour. (You can replace this with your own stylesheet.)

    <link href="bower_components/angular-tour/dist/angular-tour.css" rel="stylesheet" type="text/css"/>

Lastly, you'll need to include the module in your angular app

    angular.module('myApp', ['angular-tour'])

## How to use

To begin your tour you'll need a `<tour>` element to contain all of your tour tips, it must have a `step` attribute for binding the tour step to your scope.

Add the tourtip attribute to whatever elements you want to add a tip to.

Example markup:

    <tour step="currentStep">
      <span tourtip="tip 1"> Highlighted </span>
      <span tourtip="tip 2"> Elements </span>
      <input tourtip="or add it as an attribute to your element" />
    </tour>

You can also add callbacks to the `tour`:

    <tour step="currentStep" post-tour="tourComplete()" post-step="stepComplete()">

It is very easy to add a cookie module that remembers what step a user was on. Using the angular-cookie module this is all you need to integrate cookies:

    // load cookie, or start new tour
    $scope.currentStep = ipCookie('myTour') || 0;

    // save cookie after each step
    $scope.stepComplete = function() {
      ipCookie('myTour', $scope.currentStep, { expires: 3000 });
    };

There are additional attributes that allow you to customize each tour-tip.

`tourtip-step` **(Default: "null")**: tour tips play from step 0 onwards, or in the order they were added. You can specify a specific order, e.g.

    <span tourtip="tip 2" tourtip-step="1"></span>
    <span tourtip="tip 1" tourtip-step="0"></span>
    <span tourtip="tip 3" tourtip-step="2"></span>

`next-label` **(Default: "Next")**: The text for the next button.
`placement` **(Default: "top")**: Placement of the tour tip relative to the target element. can be top, right, left, bottom

Inside your tour, you also have access to two scope methods for ending and starting the tour.

    <a ng-click="openTour()">Open Tour</a>
    <a ng-click="closeTour()">Close Tour</a>

## Customization

### Defaults

If you'd like to edit the defaults for all your tour, you can inject tourConfig somewhere into your app and modify the following defaults.

    {
      placement        : 'top',                  // default placement relative to target. 'top', 'right', 'left', 'bottom'
      animation        : true,                   // if tips fade in
      nextLabel        : 'Next',                 // default text in the next tip button
      scrollSpeed      : 500,                    // page scrolling speed in milliseconds
      offset           : 28                      // how many pixels offset the tip is from the target
    }

### Customizing Templates

As was already mentioned, you can use your own CSS for styling the tour tips. You can also use your own markup.

If you would like to replace the html template, instead of using the `angular-tour-tpls.min.js` script, use `angular-tour.min.js` which doesn't include a template.

The easiest way to add your own template is to use the script directive:

    <script id="tour/tour.tpl.html" type="text/ng-template">
      <div class="tour-tip">
          <span class="tour-arrow tt-{{ ttPlacement }}"></span>
          <div class="tour-content-wrapper">
              <p ng-bind="ttContent"></p>
              <a ng-click="setCurrentStep(getCurrentStep() + 1)" ng-bind="ttNextLabel" class="small button tour-next-tip"></a>
              <a ng-click="closeTour()" class="tour-close-tip">×</a>
          </div>
      </div>
    </script>

## License

This project is licensed under the [MIT license](http://opensource.org/licenses/MIT).
