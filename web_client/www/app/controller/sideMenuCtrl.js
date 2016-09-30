/**
 * Created by rdidier on 9/21/16.
 */

angular.module('matchaApp').controller('sideMenuCtrl', function ($rootScope, $route, sender, $sce, $sanitize) {

    $rootScope.listMatch = [];
    $rootScope.tchatActive = false;
    $rootScope.msgInput = '';
    $rootScope.tamp = [];
    $rootScope.tchatContent = '';
    $rootScope.listOfNotifs = [];
    $rootScope.notifClicked = false;
    var socket = $rootScope.socket;


    if ($rootScope.user) {
        sender.get('/Notif', {id: $rootScope.user.id}, function (success) {
            if (!success.error) {
                $rootScope.listOfNotifs = success.content;
            }
        });
        sender.get('/Picture', {users_id: $rootScope.user.id, main: 1}, function (data) {
            if (data[0]){
            if (!$rootScope.mainPic && data) {
                $rootScope.mainPic = data[0].content;
                if ($rootScope.mainPic)
                    $rootScope.gotPicture = true;
                else
                    $rootScope.gotPicture = false;
            }}
        });
        sender.get('/Match', {users_id: $rootScope.user.id}, function (success) {
            if (!success.error) {
                for (var k in success.content) {
                    var temp = success.content[k];
                    temp.newMsg = false;
                    $rootScope.listMatch.push(temp);
                }
            }
        });
    }

    $rootScope.activeTchat = function (user) {
        $rootScope.tchatPseudo = user.pseudo;
        $rootScope.tchatId = user.id;
        var found = false;

        if ($rootScope.tchatActive) {
            $rootScope.tchatContent = '';
        }
        $rootScope.tchatActive = true;

        sender.get('/Message', {users_id_from: $rootScope.user.id, users_id_to: user.id}, function (success) {
            for (var i in success.content) {
                if (success.content[i].users_id_from == user.id) {
                    $rootScope.tchatContent += '<div class="aMsg notFromMe">' + $sanitize(String(success.content[i].content)) + '</div>';
                } else {
                    $rootScope.tchatContent += '<div class="aMsg fromMe">' + $sanitize(String(success.content[i].content)) + '</div>';
                }
            }
            $rootScope.tchatContent = $sce.trustAsHtml($rootScope.tchatContent);
        })
        updateConv();
    };

    var updateConv = function () {
        var elem = document.getElementById('42');
        document.getElementById('41').value = "";
        elem.scrollTop = elem.scrollHeight;
    }

    $rootScope.closeTchat = function () {
        $rootScope.tchatActive = false;
    };

    $rootScope.postMsg = function (msg) {
        if ($sanitize(msg) != '') {
            sender.post('/Message', {
                msg_content: msg,
                users_id_from: $rootScope.user.id,
                users_id_to: $rootScope.tchatId
            }, function () {
                $rootScope.tchatContent += '<div class="aMsg fromMe">' + $sanitize(msg) + '</div>';
                $rootScope.tchatContent = $sce.trustAsHtml($rootScope.tchatContent);
                socket.emit('sendMsg', {from: $rootScope.user.id, to: $rootScope.tchatId, content: msg});
                updateConv();
            })
        } else
            updateConv();
    }

    $rootScope.showNotif = function () {
        $rootScope.notifClicked = !$rootScope.notifClicked;
    }

    $rootScope.clickOnNotif = function (notif) {
        sender.delete('/Notif', {id: notif.id}, function (success) {
            if (!success.error) {
                for (var i in $rootScope.listOfNotifs) {
                    if ($rootScope.listOfNotifs[i].id == notif.id) {
                        $rootScope.listOfNotifs.splice(i, 1);
                        break
                    }
                }
                $rootScope.notifClicked = false;
                window.location = '/profile/' + notif.users_from;
            }
        });
    }
});
