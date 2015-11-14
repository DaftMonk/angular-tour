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

```zsh
bower install angular-tour
```

Angular Tour has a dependency on jQuery.

## Setup

Once bower has downloaded the dependencies for you, you'll need to make sure you add the required libraries to your index file. Also, ensure that jQuery is loaded prior to angular-tour, as it is a required dependency. Your script includes should look something like this:

```HTML
<script src="bower_components/jquery/jquery.js"></script>
<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/angular-tour/dist/angular-tour-tpls.min.js"></script>
```

You'll also probably want to include the default stylesheet for angular tour. (You can replace this with your own stylesheet.)

```HTML
<link href="bower_components/angular-tour/dist/angular-tour.css" rel="stylesheet" type="text/css"/>
```

Lastly, you'll need to include the module in your angular app

```JS
angular.module('myApp', ['angular-tour'])
```

## How to use

To begin your tour you'll need a `<tour>` element to contain all of your tour tips, it must have a `step` attribute for binding the tour step to your scope.

Add the tourtip attribute to whatever elements you want to add a tip to.

Example markup:

```HTML
<tour step="currentStep">
  <span tourtip="tip 1"> Highlighted </span>
  <span tourtip="tip 2"> Elements </span>
  <input tourtip="or add it as an attribute to your element" />
</tour>
```

You can also add callbacks to the `tour`:

```HTML
<tour step="currentStep" post-tour="tourEnded()" post-step="stepComplete()" tour-complete="tourComplete()">
```

* `tourEnded` will be called always when tour will be ended - completed or not
* `tourComplete` will be called only when user will get to the last step
* `stepComplete` will be called every time the step will be changed

> Side note: If you don't initialize `currentStep` in your controller it will be by default set to `-1`, which mean the tour won't appear on page load. 
> This is **breaking change**, as previously `currentStep` was defaulted to `0`, which caused tour to start automatically.

It is very easy to add a cookie module that remembers what step a user was on. Using the angular-cookie module this is all you need to integrate cookies:

```JS
// load cookie, or start new tour
$scope.currentStep = ipCookie('myTour') || 0;

// save cookie after each step
$scope.stepComplete = function() {
  ipCookie('myTour', $scope.currentStep, { expires: 3000 });
};
```
There are additional attributes that allow you to customize each tour-tip.

* `tourtip-step` **(Default: "null")**: tour tips play from step 0 onwards, or in the order they were added. You can specify a specific order, e.g.

```HTML
<span tourtip="tip 2" tourtip-step="1"></span>
<span tourtip="tip 1" tourtip-step="0"></span>
<span tourtip="tip 3" tourtip-step="2"></span>
```

* `tourtip-next-label` **(Default: "Next")**: The text for the next button.

* `tourtip-placement` **(Default: "top")**: Placement of the tour tip relative to the target element. can be top, right, left, bottom

* `on-show` **(Default: null)**: Callback, which will be called when the tour step will appear

* `on-proceed` **(Default: null)**: Callback, which will be called when user move to the next step, but just before showing it

* `tourtip-element` **(Default: null)**: CSS Selector for element, for which tourtip will be pointed. If left `null`, tourtip will be pointed for itself

* `use-source-scope` **(Default: false)**: Option meaningful only when using virtual steps. When set to `false` - it will use as a target scope, scope of target's element for evaluating `on-show` and `on-proceed` callbacks. When set to `true`, target's scope will be scope when resides step itself. See example below for a better explanation if you still need one.

* `tourtip-container-element` **(Default: "body")**: Element the tour tips are placed in. Especially practical when you have several scrollable containers you want to display tours in.

Inside your tour, you also have access to two scope methods for ending and starting the tour.

```HTML
<a ng-click="openTour()">Open Tour</a>
<a ng-click="closeTour()">Close Tour</a>
```

## Virtual steps

If you have more complicated structure of application, especially with page 
divided by page includes and different controllers you can consider using this approach.

```html
<div class="container">
  <a class="btn btn-sm magic-button" ng-click="someRandomAction()">Well, some magic button</a>
  <a id="other-button" class="btn btn-s">Well, some magic button</a>
</div>

<!-- somewhere else on the page, and different scope -->

<button class="btn btn-sm btn-primary" ng-click="localAction()">Pff</button>

<tour step="currentStep">
  <virtual-step 
    tourtip="Content of the first step"
    tourtip-next-label="Move forward"
    tourtip-placement="bottom"
    tourtip-element=".magic-button"
    on-show="someRandomAction()"
    tourtip-container-element="#scrollableDiv"
    tourtip-step="0" />  
  <div
    tourtip="Some other content..."
    tourtip-next-label="Faster, faster!"
    tourtip-placement="top"
    tourtip-element="#other-button"
    on-proceed="localAction()"
    use-source-scope="true"
    tourtip-container-element="#scrollableDiv"
    tourtip-step="1" />
</tour>
```

Name of the tag doesn't really matter. It's a normal step definition, but the element that will be used to attach to is specified by `tourtip-element` attribute.

## Customization

### Defaults

If you'd like to edit the defaults for all your tour, you can inject tourConfig somewhere into your app and modify the following defaults.

```JS
{
  placement        : 'top',  // default placement relative to target. 'top', 'right', 'left', 'bottom', 'center', 'center-top'
  animation        : true,   // if tips fade in
  nextLabel        : 'Next', // default text in the next tip button
  scrollSpeed      : 500,    // page scrolling speed in milliseconds
  margin           : 28,     // margin in pixels that the tip is from the target (matches placement)
  backDrop         : false,  // should page dim out when the tour starts?
  containerElement : 'body'  // default container element to parent tourtips to
}
```

### Positioning

Tourtip positioning can be controlled globally in the previously mentioned tourConfig service via the placement property ('top', 'right', 'bottom', 'center', 'center-top'), or via the tourtip-placement attribute, which will allow you to set the placement on an individual element-by-element basis. 

The distance between a tourtip and the element it is attached to can either be set globally via tourConfig.margin, or on an individual element-by-element basis using the tourtip-margin attribute. The margin will always match the placement - if the placement is top, tourtip-margin will add a margin between the tourtip and the top of the element. 

There may be times, especially when transcluding or applying to conditional elements, where the tour tip's calculated x,y position at compilation might not correspond to the element's current position. In these cases you can use tourtip-offset-horizontal or tourtip-offset-vertical to override and adjust the positioning by a certain amount of pixels.

```html

<tour step="currentStep">
  <p
    tourtip="Hey! I'd like to walk you through our site, it's great"
    tourtip-next-label="Hmmm, okay sure!"
    tourtip-placement="top"
    tourtip-margin="10"
    tourtip-step="0">
    Hi! Welcome to our site thing.
  </p>
  <p
    ng-show="currentStep === 1"
    tourtip="Behold! I am now explaining the feature..."
    tourtip-next-label="Wow, Amazing!"
    tourtip-placement="right"
    tourtip-offset-vertical="-30"
    tourtip-offset-horizontal="-26"
    tourtip-step="1" />
    Some cool feature... sure does need some splaining tho, dang...
  </p>
</tour>
```

### Customizing Templates

As was already mentioned, you can use your own CSS for styling the tour tips. You can also use your own markup.

If you would like to replace the html template, instead of using the `angular-tour-tpls.min.js` script, use `angular-tour.min.js` which doesn't include a template.

The easiest way to add your own template is to use the script directive:

```HTML
<script id="tour/tour.tpl.html" type="text/ng-template">
  <div class="tour-tip">
      <span class="tour-arrow tt-{{ ttPlacement }}" ng-hide="centered"></span>
      <div class="tour-content-wrapper">
          <p ng-bind="ttContent"></p>
          <a ng-click="proceed()" ng-bind="ttNextLabel" class="small button tour-next-tip"></a>
          <a ng-click="closeTour()" class="tour-close-tip">×</a>
      </div>
  </div>
</script>
```

## License

This project is licensed under the [MIT license](http://opensource.org/licenses/MIT).
