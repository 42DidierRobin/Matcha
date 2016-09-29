/**
 * Created by rdidier on 9/8/16.
 */
angular.module('matchaApp').controller('browseCtrl', function ($rootScope, $scope, sender) {

    var user = $rootScope.user;
    $scope.listOfResults = false;
    $scope.noResult = 'hide';

    sender.post('/Search', {
            age: {from: ((user.age - 8) < 0) ? 0 : user.age - 8,
                to : ((user.age + 8) > 99) ? 99 : user.age + 8},
            score: {from: ((user.score - 20) < 0) ? 0 : user.score - 20,
                    to : ((user.score + 20) > 100) ? 100 : user.score + 20},
                    tags: [],
            sex: $rootScope.user.orientation},
        function (success) {
                console.log(success);
            if (success.error == 42)
                $scope.noResult = 'noResult';
            else {
                $scope.listOfResults = [];
                $scope.noResult = 'hide';
                for (var k in success.content) {
                    $scope.listOfResults.push(success.content[k]);
                }
            }
        });

});