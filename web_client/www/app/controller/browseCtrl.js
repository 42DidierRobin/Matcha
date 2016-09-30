/**
 * Created by rdidier on 9/8/16.
 */
angular.module('matchaApp').controller('browseCtrl', function ($rootScope, $scope, sender) {

    var user = $rootScope.user;
    $scope.listOfResults = false;
    $scope.noResult = 'hide';
    $scope.data = {};

    if ($rootScope.user) {
        user.age = parseInt(user.age);
        user.score = parseInt(user.score);
        user.dist = parseInt(user.dist);
        $scope.data.age = {};
        $scope.data.score = {};
        $scope.data.dist = {};
        $scope.data.age.floor = ((user.age - 15) < 18) ? 18 : user.age - 15;
        $scope.data.age.ceil = ((user.age  + 15) > 100) ? 100 : user.age + 15;
        $scope.data.score.floor = ((user.score - 30) < 0) ? 0 : user.score - 30;
        $scope.data.score.ceil = ((user.score + 30) > 100) ? 100 : user.score + 30;
        $scope.data.dist.floor = 0;
        $scope.data.dist.ceil = 200;


        sender.post('/Search', {
                age: {from: $scope.data.age.floor,
                    to : $scope.data.age.ceil},
                score:{from: $scope.data.score.floor,
                    to : $scope.data.score.ceil},
                dist: {from: $scope.data.dist.floor, to : $scope.data.dist.ceil},
                tags: [],
                lat: $rootScope.user.loca_lat,
                lng: $rootScope.user.loca_lng,
                sex: $rootScope.user.orientation},
            function (success) {
                if (success.error == 42)
                    $scope.noResult = 'oneResult';
                else {
                    $scope.listOfResults = [];
                    $scope.noResult = 'hide';
                    for (var k in success.content) {
                        $scope.listOfResults.push(success.content[k]);
                    }
                }
            });
    }

    var sort_it = function (){
        var comp = function(a,b) {
            if ($scope.sort.order) {
                if (a[$scope.sort.ref[$scope.sort.active]] <= b[$scope.sort.ref[$scope.sort.active]])
                    return 1;
                else
                    return -1;
            }
            else{
                if (a[$scope.sort.ref[$scope.sort.active]] >= b[$scope.sort.ref[$scope.sort.active]])
                    return 1;
                else
                    return -1;
            }
        }
        $scope.listOfResults.sort(comp);
    };

    $scope.sliderAge = {
        minValue: $scope.data.age.floor,
        maxValue: $scope.data.age.ceil,
        options: {
            floor: $scope.data.age.floor,
            ceil:  $scope.data.age.ceil,
            step: 1,
            minRange: 0,
            noSwitching: true
        }
    };

    $scope.sliderDist = {
        minValue: $scope.data.dist.floor,
        maxValue: $scope.data.dist.ceil,
        options: {
            floor: $scope.data.dist.floor,
            ceil: $scope.data.dist.ceil,
            step: 1,
            minRange: 10,
            noSwitching: true
        }
    };

    $scope.sliderScore = {
        minValue: $scope.data.score.floor,
        maxValue: $scope.data.score.ceil,
        options: {
            floor: $scope.data.score.floor,
            ceil: $scope.data.score.ceil,
            step: 1,
            minRange: 1,
            noSwitching: true
        }
    };

    $scope.sort = function (nbr){
        if (!$scope.sort.ref)
            $scope.sort.ref = {0: 'age', 1: 'dist', 2: 'score'};
        //on change juste le sens
        if (!$scope.sort.active)
            $scope.sort.active = 0;
        if (typeof $scope.sort.order == 'undefined')
            $scope.sort.order = true;
        if ($scope.sort.active == nbr){
            $scope.sort.order = !$scope.sort.order;
        }
        else {
            $scope.sort.active = nbr;
            $scope.sort.order = true;
        }
        $scope.sort.ageClass = ($scope.sort.active == 0)? 'sortActivate': 'sort';
        $scope.sort.distClass = ($scope.sort.active == 1)? 'sortActivate': 'sort';
        $scope.sort.scoreClass = ($scope.sort.active == 2)? 'sortActivate': 'sort';
        $scope.sort.img = $scope.sort.order? 'upArrow.png' : 'downArrow.png';
        sort_it();
    };

    $scope.clearError = function () {
        $scope.noTag = false;
        $scope.muchTag = false;
        $scope.error = false;
    };

    $scope.addTag = function () {

        console.log('yolo');
        console.log($scope.listOfTags);

        if ($scope.listOfTags.length > 4) {
            $scope.muchTag = "error-label";
            $scope.error = 'hide';
        }
        else if ($scope.new_tag) {
            var exist = false;
            for (var i in $scope.listOfTags) {
                if ($scope.listOfTags[i].name == $scope.new_tag) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                sender.get("/Tags/exist", {name: $scope.new_tag}, function (success) {
                    if (success.error == 42) {
                        $scope.noTag = "error-label";
                        $scope.error = 'hide';
                    }
                    else {
                        $scope.listOfTags.push({id: success.content, name: $scope.new_tag})
                    }
                })
            }
        }
    };

    $scope.deleteTag = function (tag) {
        $scope.listOfTags = $scope.listOfTags.filter(function (el) {
            return el.id !== tag.id;
        });
    };

    $scope.filter = function () {
        for (var i in $scope.listOfResults){
            if (parseInt($scope.listOfResults[i].age) < parseInt($scope.sliderAge.minValue) ||
                parseInt($scope.listOfResults[i].age) > parseInt($scope.sliderAge.maxValue) ||
                parseInt($scope.listOfResults[i].score) < parseInt($scope.sliderScore.minValue) ||
                parseInt($scope.listOfResults[i].score) > parseInt($scope.sliderScore.maxValue) ||
                parseInt($scope.listOfResults[i].dist) < parseInt($scope.sliderDist.minValue) ||
                parseInt($scope.listOfResults[i].dist) > parseInt($scope.sliderDist.maxValue) ){
                $scope.listOfResults[i].class = 'hide';
            }
            else
                $scope.listOfResults[i].class = 'oneResult';
        }
    }


});