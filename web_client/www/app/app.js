/**
 * Created by Mathiisss on 23/08/2016.
 */
'use strict';
var url = '37.139.18.104';
var api = 'http://' + url + ':4201';
var app = angular.module('matchaApp', ['ngRoute', 'ngCookies', 'requester', 'rzModule']);
var mail_regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
var name_regex = /^[a-z0-9]{3,12}$/i;
var gglrdy = false;

app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
    $routeProvider

        .when('/', {
            templateUrl: './app/view/home.html',
            controller: 'homeCtrl'
        })
        .when('/home/:opt?', {
            templateUrl: './app/view/home.html',
            controller: 'homeCtrl'
        })
        .when('/inscription', {
            templateUrl: './app/view/inscription.html',
            controller: 'inscriptionCtrl'
        })
        .when('/connection/:pseudo?/:key?', {
            templateUrl: './app/view/connection.html',
            controller: 'connectionCtrl'
        })
        .when('/browse', {
            templateUrl: './app/view/browse.html',
            controller: 'browseCtrl'
        })
        .when('/search', {
            templateUrl: './app/view/search.html',
            controller: 'searchCtrl'
        })
        .when('/profile', {
            templateUrl: './app/view/profile.html',
            controller: 'profileCtrl'
        })

        .when('/profile/:id', {
            templateUrl: './app/view/aprofile.html',
            controller: 'aprofileCtrl'
        })
        .otherwise({
            templateUrl: './app/view/lost.html'
        });
});

app.directive('name', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.name = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }
                if (name_regex.test(viewValue)) {
                    // it is valid
                    return true;
                }
                // it is invalid
                return false;
            };
        }
    };
});

app.directive('mail', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.mail = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }
                if (mail_regex.test(viewValue)) {
                    // it is valid
                    return true;
                }
                // it is invalid
                return false;
            };
        }
    };
});

app.directive('imagedrop', function ($parse, $document) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var onImageDrop = $parse(attrs.onImageDrop);

            //When an item is dragged over the document
            var onDragOver = function (e) {
                e.preventDefault();
            };

            //When the user leaves the window, cancels the drag or drops the item
            var onDragEnd = function (e) {
                e.preventDefault();
            };

            //When a file is dropped
            var loadFile = function (file) {
                scope.uploadedFile = file;
                scope.$apply(onImageDrop(scope));
            };

            //Dragging begins on the document
            $document.bind("dragover", onDragOver);

            //Dragging ends on the overlay, which takes the whole window
            element.bind("dragleave", onDragEnd)
                .bind("drop", function (e) {
                    onDragEnd(e);
                    loadFile(e.dataTransfer.files[0]);
                });
        }
    };
});

app.run(function ($rootScope, $location) {
    $rootScope.$on("$routeChangeStart", function (event, next) {
        if (!$rootScope.user && next.templateUrl != './app/view/inscription.html' && next.templateUrl != './app/view/home.html' && next.templateUrl != './app/view/connection.html') {
            $location.path('/home');
        }
    });
});

function googleRDY() {
    gglrdy = true;
}

app.directive('pass', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.pass = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }
                if (viewValue.length <= 3) {
                    // it is invalid
                    return false;
                }
                // it is valid
                return true;
            };
        }
    };
});

app.controller('mainCtrl', function ($scope, $rootScope, $cookies, $route, sender, $sce) {

    $rootScope.user = $cookies.getObject("user");
    $rootScope.host = 'http://' + url + '/';
    var socket = create_socket($rootScope, $sce);
    $rootScope.socket = socket;

    if ($rootScope.user) {
        socket.emit('login', {
            id: $rootScope.user.id,
            pseudo: $rootScope.user.pseudo
        });
    }

    $rootScope.deco = function (path) {
        $cookies.remove("user");
        $rootScope.user = null;
        $rootScope.mainPic = null;
        $rootScope.listMatch = null;
        socket.disconnect();
        window.location = '/home' + (path ? ('/' + path) : '');
    };

});







