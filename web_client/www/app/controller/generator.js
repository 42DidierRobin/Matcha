/**
 * Created by rdidier on 9/30/16.
 */
angular.module('matchaApp').controller('generator', function ($scope, sender) {

    var result = [];

    $scope.doIt = function () {

        sender.generate(function(data){
            console.log(data);
        })

    }


});
