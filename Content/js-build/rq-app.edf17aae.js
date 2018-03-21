// In APP, we set up configuration settings for require, then call the main bootstrap file
// main logic for app
requirejs.config({
    waitSeconds: 200,
    paths: {
        'underscore': 'libs/underscore',
        'handlebars': 'libs/handlebars',
        'waypoints': 'libs/jquery.waypoints',
        'jquery.unobtrusive-ajax': 'libs/jquery.unobtrusive-ajax',
        'modernizr': '',
        'angular': ['//ajax.googleapis.com/ajax/libs/angularjs/1.2.26/angular.min', 'libs/angular.min.js'],
        'angularRoute': 'libs/angular-route',
        'text': 'libs/require-text',
        'ooyala': 'libs/ooyala'
    },
    shim: {
        'handlebars': { exports: 'handlebars' },
        'libs/amplify.core': { exports: 'amplify' },
        'jquery.unobtrusive-ajax': ['jquery'],
        'angular': { exports: 'angular' },
        'angularRoute': ['angular']
    }
});
console.log("rq-app");

// define modernizr after loading in the head
define('modernizr', [], function () { console.log('modernizr'); return window.Modernizr; });

requirejs(["bootstrap"]);