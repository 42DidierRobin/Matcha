/**
 * Created by rdidier on 9/1/16.
 */
'use strict';

angular.module('matchaApp').controller('connectionCtrl',
    function ($scope, $routeParams, $route, $rootScope, sender, $cookies, $location) {

        $scope.login = {};

        if ($routeParams.pseudo && $routeParams.key) {
            sender.get('/User/mail_confirm', {pseudo: $routeParams.pseudo, key: $routeParams.key},
                function (success) {
                    if (success.error == 42) {
                        $scope.already_verif = "congrats";
                        $scope.login.pseudo = $routeParams.pseudo;
                    }
                    else {
                        $scope.mail_verif = "congrats";
                        $scope.login.pseudo = $routeParams.pseudo;
                    }
                })
        }

        $scope.send = function () {
            sender.post('/User/connect', {pseudo: $scope.login.pseudo, password: $scope.login.password}, function (data) {
                $scope.login.errorPass = "hide";
                $scope.login.errorMail = "hide";
                if (data.error == 1)
                    $scope.login.errorPass = "error-label";
                else if (data.error == 2)
                    $scope.login.errorMail = "error-label";
                else if (data.error == 3)
                    console.log("server error : " + data.content);
                else {
                    $cookies.putObject("user", data);
                    $rootScope.user = $cookies.getObject("user");
                    window.location = '/profile';
                }
            });
        };

        $scope.changePwd = function () {
            if (confirm('A new password will be sent to your email adress. Are you sure ?')) {
                sender.get('/User/forgetPwd', {pseudo: $scope.login.pseudo}, function (data) {
                    if (data.error == 42)
                        alert('This pseudo doesnt exist.')
                    else //TODO: acceuil + variable avec phrase de resume "pseudo change blabla"
                        window.location = '/home';
                })
            }
        }
    });