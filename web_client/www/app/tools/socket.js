/**
 * Created by rdidier on 9/21/16.
 */

var create_socket = function ($rootScope, $sce) {

    socket = io.connect('http://' + url + ':3042');

    socket.on('userDisconnect', function (user) {
        for (var i in $rootScope.listMatch) {
            if ($rootScope.listMatch[i].id == user.id)
                $rootScope.listMatch[i].connected = false;
        }
        $rootScope.$apply();
    });

    socket.on('userConnect', function (user) {
        for (var i in $rootScope.listMatch) {
            if ($rootScope.listMatch[i].id == user.id)
                $rootScope.listMatch[i].connected = true;
        }
        $rootScope.$apply();
    });

    socket.on('newMsg', function (data) {
        if (!$rootScope.tchatActive || ($rootScope.tchatId != data.from)) {
            for (var i in $rootScope.listMatch) {
                if ($rootScope.listMatch[i].id == data.from) {
                    $rootScope.listMatch[i].newMsg = true;
                    break;
                }
            }
        }
        else {
            $rootScope.tchatContent += '<div class="aMsg notFromMe">' + data.content + '</div>';
            $rootScope.tchatContent = $sce.trustAsHtml($rootScope.tchatContent);
        }
        $rootScope.$apply();
    });

    socket.on('newNotif', function (data) {
        $rootScope.user.score += data.score;
        delete data.score;
        $rootScope.listOfNotifs.push(data);
        $rootScope.$apply();
    });

    return socket;
};