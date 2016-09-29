/**
 * Created by rdidier on 9/8/16.
 */
angular.module('matchaApp').controller('browseCtrl', function ($rootScope, $scope, sender) {

    var user = $rootScope.user;
    $scope.listOfResults = false;
    $scope.noResult = 'hide';

    sender.post('/Search', {
            age: {from: ((user.age - 15) < 18) ? 18 : user.age - 15,
                to : ((user.age + 15) > 99) ? 99 : user.age + 15},
            score: {from: ((user.score - 30) < 0) ? 0 : user.score - 30,
                    to : ((user.score + 20) > 100) ? 100 : user.score + 20},
            dist: {from: 0, to : 200},
            tags: [],
        lat: $rootScope.user.loca_lat,
        lng: $rootScope.user.loca_lng,
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