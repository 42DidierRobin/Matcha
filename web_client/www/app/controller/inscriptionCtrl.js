/**
 * Created by Mathiisss on 23/08/2016.
 */
'use strict';

angular.module('matchaApp').controller('inscriptionCtrl', function ($scope, sender, $location) {

    $scope.inscription = {};
    var check1 = true;
    var check2 = true;
    var check3 = true;

    $scope.verifyMail = function () {
        sender.get('/User', {mail: $scope.inscription.mail}, function (data) {
            if (data.found) {
                $scope.inscription.errorMail = "error-label";
                check1 = false;
            } else {
                $scope.inscription.errorMail = "hide";
                check1 = true;
            }
        })
    };

    $scope.verifyPseudo = function () {
        sender.get('/User', {pseudo: $scope.inscription.pseudo}, function (data) {
            if (data.found) {
                $scope.inscription.errorPseudo = "error-label";
                check2 = false;
            } else {
                $scope.inscription.errorPseudo = "hide";
                check2 = true;
            }
        })
    };

    $scope.verifyPass = function () {
        if ($scope.inscription.password != $scope.inscription.password2) {
            check3 = false;
            $scope.inscription.errorPass = "error-label"
        }
        else {
            check3 = true;
            $scope.inscription.errorPass = "hide"
        }
    };

    $scope.send = function () {
        if (check1 && check2 && check3 && $scope.inscription.pseudo && $scope.inscription.mail && $scope.inscription.first_name && $scope.inscription.last_name ) {
            $scope.inscription.sending = "loading";
            sender.post('/User/new', {
                pseudo: $scope.inscription.pseudo,
                last_name: $scope.inscription.last_name,
                first_name: $scope.inscription.first_name,
                password: $scope.inscription.password,
                mail: $scope.inscription.mail
            }, function () {
                $location.path('/home/new');
            });
        }
        else {
            $scope.inscription.errors = "error-label"
        }
    }
});

