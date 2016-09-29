/**
 * Created by rdidier on 9/18/16.
 */
angular.module('matchaApp').controller('aprofileCtrl', function ($rootScope, $routeParams, $scope, $location, sender) {

    var picture = {};
    $scope.picture = picture;
    var pseudo = '';

    if ($routeParams.id == $rootScope.user.id){
        $location.path('/profile');
    }
    else {
        sender.get('/User', {id: $routeParams.id, lat: $rootScope.user.loca_lat, lng: $rootScope.user.loca_lng}, function (success) {
            if (success) {
                $scope.user = success.content;
                pseudo = success.content.pseudo;
                if ($scope.user.orientation == 'M')
                    $scope.user.orientation = 'Male';
                else if ($scope.user.orientation == 'F')
                    $scope.user.orientation = 'Female';
                else
                    $scope.user.orientation = 'Both sex';
                if ($scope.user.sex == 'M')
                    $scope.user.sex = 'Male';
                else
                    $scope.user.sex = 'Female';
                if (success.content.connected)
                    $scope.user.connected = 'Connected !';
                else
                    $scope.user.connected = "Last connected : " + success.content.last_connected;
                sender.get('/Picture', {users_id: $scope.user.id}, function (data) {

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
                sender.get('/Tags', {users_id: $scope.user.id}, function (success) {
                    if (success) {
                        $scope.listOfTags = success.content;
                    }
                })
                $rootScope.socket.emit('newRel', {
                    from_pseudo: $rootScope.user.pseudo,
                    users_from: $rootScope.user.id,
                    users_to: $routeParams.id,
                    type: 2
                });

                sender.get('/Relation', {users_id_from: $rootScope.user.id, users_id_to: $routeParams.id}, function (result) {
                    if (result.error == 42) {
                        $scope.matched = false;
                        $scope.iLike = false;
                        $scope.imLiked = false;
                        $scope.buttonText = "like it !"
                    }
                    else if ((result.content.one && result.content.one.type == 'B')
                        || (result.content.two && result.content.two.type == 'B'))
                        $location.path('/home');
                    else if (result.content.one && result.content.one.type == 'L') {
                        $scope.iLike = true;
                        $scope.buttonText = 'Dislike it !';
                        if (result.content.two && result.content.two.type == 'L') {
                            $scope.imLiked = true;
                            $scope.matched = true;
                        }
                    }
                    else if (result.content.two && result.content.two.type == 'L') {
                        $scope.imLiked = true;
                        $scope.buttonText = "like it !"
                    }
                });
            }
        })
    }


    $scope.report = function () {
        if (confirm('Reporting this user will also block him, are you sure ?')) {
            sender.put('/User/report', {id: $routeParams.id}, function (success) {
            })
        }
    };

    $scope.newRelation = function (block) {
        if (block) {
            if (confirm('Are you sure you want to block this user ?')) {
                sender.post('/Relation', {
                    users_id_from: $rootScope.user.id,
                    users_id_to: $routeParams.id,
                    type: 'B'
                }, function (success) {
                    if (!success) {
                        $scope.iLike = false;
                        $scope.matched = false;
                        for (var i = 0; i < $rootScope.listMatch.length; i++)
                            if ($rootScope.listMatch[i].id === $scope.user.id) {
                                $rootScope.listMatch.splice(i, 1);
                                break;
                            }
                    }
                    $location.path('/home');
                });
            }
        }
        else if ($scope.iLike) {
            sender.delete('/Relation', {
                users_id_from: $rootScope.user.id,
                users_id_to: $routeParams.id
            }, function (success) {
                if (!success.error) {
                    $scope.iLike = false;
                    $rootScope.socket.emit('newRel', {
                        from_pseudo: $rootScope.user.pseudo,
                        users_from: $rootScope.user.id,
                        users_to: $routeParams.id,
                        type: 4
                    });
                    $scope.matched = false;
                    for (var i = 0; i < $rootScope.listMatch.length; i++)
                        if ($rootScope.listMatch[i].id === $scope.user.id) {
                            $rootScope.listMatch.splice(i, 1);
                            break;
                        }
                    $scope.buttonText = 'Like it !';
                }
            });
        }
        else {
            sender.post('/Relation', {
                users_id_from: $rootScope.user.id,
                users_id_to: $routeParams.id,
                type: 'L'
            }, function (success) {
                if (!success.error) {
                    $scope.iLike = true;
                    if ($scope.imLiked) {
                        $rootScope.socket.emit('newRel', {
                            from_pseudo: $rootScope.user.pseudo,
                            users_from: $rootScope.user.id,
                            users_to: $routeParams.id,
                            type: 3
                        });
                        $scope.matched = true;
                        $rootScope.listMatch.push({id: $scope.user.id, pseudo: $scope.user.pseudo})
                    }
                    else
                        $rootScope.socket.emit('newRel', {
                            from_pseudo: $rootScope.user.pseudo,
                            users_from: $rootScope.user.id,
                            users_to: $routeParams.id,
                            type: 1
                        });
                    $scope.buttonText = 'Dislike it !';

                }
            });
        }
    }

});