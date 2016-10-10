/**
 * Created by rdidier on 9/8/16.
 */
'use strict';

angular.module('matchaApp').controller('profileCtrl', function ($scope, $rootScope, $cookies, sender) {

    var user = $rootScope.user;
    var picture = new Array(4);
    $rootScope.locateAccept = false;
    $scope.listOfTags = [];
    var map;
    var marker;
    var latLng;

    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 49.119309, lng: 6.175716},
            zoom: 10
        });
    }

    function initPos(point) {

        marker = new google.maps.Marker({
            position: point,
            map: map,
            draggable: true,
            title: 'Im here'
        });
        map.setCenter(point);
    }

    var updateUser = function (success) {
        if (success) {
            $cookies.putObject('user', $scope.user);
            user = $scope.user;
        }
    };

    if (user) {

        $scope.user = user;
        $scope.picture = picture;
        sender.get('/Picture', {users_id: user.id}, function (data) {
            for (var i = 0; i < 5; i++) {
                if (data[i]) {
                    picture[i] = {};
                    picture[i].src = data[i].content;
                    picture[i].crt_date = data[i].crt_date;
                    picture[i].id = data[i].id;
                }
                else {
                    picture[i] = {};
                    picture[i].src = false;
                }
            }
        });
        sender.get('/Tags', {}, function (success) {
            if (success) {
                $scope.listOfTags = success.content;
            }
        });

        if (gglrdy) {
            initMap();
        }
    }

    $scope.imageDropped = function () {

        $scope.temp = "";
        var file = $scope.uploadedFile;
        var r = new FileReader();
        r.onloadend = function (e) {
            var i = 0;
            while (i < 5 && picture[i].src) {
                i++;
            }
            if (i == 5)
                alert("You already have 5 profile pictures");
            else {
                sender.post('/Picture', {users_id: user.id, content: e.target.result}, function (data) {
                    picture[i].src = e.target.result;
                    picture[i].id = data.id;
                    picture[i].crt_date = data.crt_date;
                    if (i == 0)
                        $rootScope.mainPic = e.target.result;
                })
            }
        };

        if (file.size >= 2097152)
            alert("the size of the file cant exceed 2MB");
        else if (file.type != "image/png")
            alert("please load a PNG file instead");
        else {
            r.readAsDataURL(file);
            $rootScope.user.score += 5;
            $rootScope.user.score = $rootScope.user.score > 100 ? 100 : $rootScope.user.score;
        }

        //Clear the uploaded file
        $scope.uploadedFile = null;
    };

    $scope.makePhotoFirst = function (n) {
        sender.put('/Picture', {id_to_up: picture[n].id, id_to_low: picture[0].id}, function (success) {
            if (success) {
                $rootScope.mainPic = picture[n].src;
                var temp = picture[0];
                picture[0] = picture[n];
                picture[n] = temp;
                temp = null;
            }
        })
    };

    $scope.deletePhoto = function (n) {
        sender.delete('/Picture', {id: picture[n].id, users_id: user.id, main: 0}, function (success) {
            if (success) {
                picture[n] = {};
                picture[n].src = null;
                n++;
                $rootScope.user.score -= 5;
                $rootScope.user.score = $rootScope.user.score < 0 ? 0 : $rootScope.user.score;
                while (n < 5 && picture[n].src) {
                    picture[n - 1] = picture[n];
                    picture[n] = {};
                    picture[n].src = false;
                    n++;
                }
            }
        })
    };

    $scope.updateAge = function () {
        sender.post('/User/update', {id: $scope.user.id, age: $scope.user.age}, updateUser)
    };

    $scope.changeSex = function () {
        sender.post('/User/update', {id: $scope.user.id, sex: $scope.user.sex}, updateUser)
    };

    $scope.changeOrientation = function () {
        sender.post('/User/update', {id: $scope.user.id, orientation: $scope.user.orientation}, updateUser)
    };

    $scope.updateDescription = function () {
        sender.post('/User/update', {id: $scope.user.id, bio: $scope.user.bio}, updateUser)
    };

    $scope.tagError = function (){
        $scope.tagType = 'error-label';
    };

    $scope.addTag = function () {
        if ($scope.new_tag) {
            sender.post('/Tags', {tag: $scope.new_tag}, function (success) {
                if (success && success.content == 'dup') {
                    $scope.alreadyTag = 'error-label';
                    $scope.new_tag = '';
                }
                else if (success) {
                    var new_tag = {id: success.content, name: $scope.new_tag, users_id: user.id};
                    $scope.listOfTags.push(new_tag);
                    $scope.new_tag = '';
                }
            })
        }
    };

    $scope.resetError = function () {
        $scope.alreadyTag = false;
        $scope.tagType = false;
    };

    $scope.deleteTag = function (tag) {
        sender.delete('/Tags', {tag: tag.id}, function (success) {
                if (success) {
                    $scope.listOfTags = $scope.listOfTags.filter(function (el) {
                        return el.id !== tag.id;
                    });
                }
            }
        );
    };

    $scope.activeLocate = function () {
        $rootScope.locateAccept = true;
        if (gglrdy) {
            sender.locate(function (d) {
                if (d.status == 'fail'){
                    console.log("IP API return error, please relaod the page");
                }
                else {
                    latLng = new google.maps.LatLng(d.lat, d.lon);
                    initPos(latLng);
                    sender.put('/Pos', {lat: d.lat, lng: d.lon}, function(){
                        $rootScope.loca_lat = d.lat;
                        $rootScope.loca_lng = d.lng;
                    });
                    google.maps.event.addListener(marker, "dragend", function(event) {
                        var lat = this.position.lat();
                        var lng = this.position.lng()
                        sender.put('/Pos', {lat: lat, lng: lng}, function(){
                            $rootScope.user.loca_lat = lat;
                            $rootScope.user.loca_lng = lng;

                        })
                    });
                }
            })
        }
    };

    $scope.disableLocate = function () {
        $rootScope.locateAccept = false;
        if (marker)
            marker.setMap(null);
        map.setCenter(new google.maps.LatLng(49.119309, 6.175716));
    };

    $scope.changeMail = function () {
        var new_mail = prompt("Please enter your new email. Not that you will be disconnected and will have to confirm the new mail", "new_email");
        sender.get('/User/newMail', {mail: new_mail}, function (success) {
            //TODO:: check format email adress
            if (!success.error) {
                console.log("email changed with sucess !");
                $rootScope.deco('newMail');
            }
        });
    };


});



