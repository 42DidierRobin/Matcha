/**
 * Created by rdidier on 9/8/16.
 */

angular.module('matchaApp').controller('searchCtrl', function ($scope, sender, $rootScope) {

    var user = $rootScope.user;
    $scope.search = {};
    $scope.noTag = false;
    $scope.listOfTags = [];
    $scope.error = false;
    $scope.noResult = 'hide';
    $scope.sort = {};

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

    $scope.sort = function (nbr){
        if (!$scope.sort.ref)
            $scope.sort.ref = {0: 'age', 1: 'dist', 2: 'score', 3: 'tags_common'};
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
        $scope.sort.tagsClass = ($scope.sort.active == 3)? 'sortActivate': 'sort';
        $scope.sort.img = $scope.sort.order? 'upArrow.png' : 'downArrow.png';
        sort_it();
    }


    $scope.sliderAge = {
        minValue: 42,
        maxValue: 84,
        options: {
            floor: 18,
            ceil: 99,
            step: 1,
            minRange: 0,
            noSwitching: true
        }
    };

    $scope.sliderDist = {
        minValue: 20,
        maxValue: 420,
        options: {
            floor: 0,
            ceil: 500,
            step: 1,
            minRange: 10,
            noSwitching: true
        }
    };

    $scope.sliderScore = {
        minValue: 12,
        maxValue: 99,
        options: {
            floor: 0,
            ceil: 100,
            step: 1,
            minRange: 10,
            noSwitching: true
        }
    };

    $scope.search = function () {
        $scope.listOfResults = null;
        sender.post('/Search', {
                age: {from: $scope.sliderAge.minValue, to: $scope.sliderAge.maxValue},
                score: {from: $scope.sliderScore.minValue, to: $scope.sliderScore.maxValue},
                dist: {from: $scope.sliderDist.minValue, to: $scope.sliderDist.maxValue},
                sex: $rootScope.user.orientation,
                tags: $scope.listOfTags,
                lat: $rootScope.user.loca_lat,
                lng: $rootScope.user.loca_lng
            },
            function (success) {
                if (success.error == 42)
                    $scope.noResult = 'noResult';
                else {
                    $scope.listOfResults = [];
                    $scope.noResult = 'hide';
                    for (var k in success.content) {
                        $scope.listOfResults.push(success.content[k]);
                    }
                }
            })
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
    }


});
