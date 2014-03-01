module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath : '.',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    files : [
        'bower_components/jquery/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-cookie/angular-cookie.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'src/**/*.js',
        'src/**/*.spec.js',
        'src/**/*.tpl.html'
    ],

    // location of templates
    preprocessors: {
        'src/**/*.tpl.html': 'html2js'
    },

    ngHtml2JsPreprocessor: {
        stripPrefix: 'src/'
    },

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,    

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun : false
  });
};