# Angular Tour - [AngularJS](http://angularjs.org/) directive for giving a tour of your website.

## Demo

Note: This is a fork of the Angular Tour project: [Angular Tour] (https://github.com/DaftMonk/angular-tour)
      This fork support navigation - the tourtips can guide a user from page to page 

Want to see it in action? Visit See [demo here] (http://bartonhammond.github.io/#/)

## Showcase features of your website

Give an interactive tour to showcase the features of your website. 

  * Easy to use
  * Responsive to window resizes
  * Navigates views
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

Angular Tour has dependencies on jQuery and jQuery cookie, which bower will install.

## Setup

Once bower has downloaded those dependencies for you, you'll need to make sure you add the required libraries to your index file. Your script includes should look something like this:

    <script src="bower_components/jquery/jquery.js"></script>
    <script src="bower_components/angular/angular.js"></script>
    <script src="bower_components/angular-tour/dist/angular-tour-tpls.min.js"></script>

You'll also probably want to include the default stylesheet for angular tour. (You can replace this with your own stylesheet.)

    <link rel="bower_components/angular-tour/dist/angular-tour.css"/>

Lastly, you'll need to include the module in your angular app

    angular.module('myApp', ['angular-tour'])

## How to use

To begin your tour you'll need a `<tour>` element to contain all of your tour tips.

Add the tourtip attribute wherever you want a tip.

Example markup:

    <tour>
      <span tourtip="tip 1"> Highlighted </span>
      <span tourtip="tip 2"> Elements </span>
      <input tourtip="or add it as an attribute to your element" />
    </tour>

There are additional attributes that allow you to customize each tour-tip.

`tourtip-step` **(Default: "null")**: tour tips play from step 0 onwards, or in the order they were added. You can specify a specific order, e.g.

    <span tourtip="tip 2" tourtip-step="1"></span>
    <span tourtip="tip 1" tourtip-step="0"></span>
    <span tourtip="tip 3" tourtip-step="2"></span>

`next-label` **(Default: "Next")**: The text for the next button.
`placement` **(Default: "top")**: Placement of the tour tip relative to the target element. can be top, right, left, bottom

Navigation code
The tour directive should be contained within each page.  So if you have 4 pages, you'll have for "mini" tours - the tourtips within that page.  In order to support navigation, the <tour> controller emits a "onTourEnd" event.  

So within your controller that contains the <tour>, add a init() add the following code to navigate to the "search" page when this tour ends.

 $scope.init = function() {
   $scope.$on('onTourEnd', function() {
     $location.path('/search');
   });
 }

Be sure to have a "ng-init="init()" somewhere in your html markup - maybe on the <tour such as:

   <tour ng-init="init()">
   ....
   </tour>

## Customization

### Defaults

If you'd like to edit the defaults for all your tour, you can inject tourConfig somewhere into your app and modify the following defaults.

    {
      placement        : 'top',                  // default placement relative to target. 'top', 'right', 'left', 'bottom'
      animation        : true,                   // if tips fade in
      nextLabel        : 'Next',                 // default text in the next tip button
      scrollSpeed      : 500,                    // page scrolling speed in milliseconds
      offset           : 28,                     // how many pixels offset the tip is from the target
      postTourCallback : function (stepIndex){}, // a method to call once the tour closes (canceled or complete)
      postStepCallback : function (stepIndex){}  // a method to call after each step
    }

### Customizing Templates

As was already mentioned, you can use your own CSS for styling the tour tips. You can also use your own markup.

If you would like to replace the html template, instead of using the `angular-tour-tpls.min.js` script, use `angular-tour.min.js` which doesn't include a template.

The easiest way to add your own template is to use the script directive:

    <script id="tour/tour.tpl.html" type="text/ng-template">
      <div class="tour-tip">
          <span class="tour-arrow tt-{{ placement }}"></span>
          <div class="tour-content-wrapper">
              <p ng-bind="content"></p>
              <a ng-click="nextAction()" ng-bind="nextLabel" class="small button tour-next-tip"></a>
              <a ng-click="closeAction()" class="tour-close-tip">�</a>
          </div>
      </div>  
    </script>

## License

This project is licensed under the [MIT license](http://opensource.org/licenses/MIT).
