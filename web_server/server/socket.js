/**
 * Created by rdidier on 9/21/16.
 */

module.exports = function (http) {

    var io = require('socket.io').listen(http);
    var Controller = require('./controller');
    listOfConnected = [];

    io.sockets.on('connection', function (socket) {
        var currentUser = {};

        socket.on('login', function (user) {
            console.log("user " + user.pseudo + " just connected");
            currentUser = user;
            user.socketId = socket.id;
            listOfConnected.push(user);
            socket.broadcast.emit('userConnect', currentUser);
        });

        socket.on('disconnect', function () {

            if (currentUser.id) {
                var del = false;
                if (currentUser) {
                    for (var i in listOfConnected) {
                        if (listOfConnected[i].id == currentUser.id) {
                            del = true;
                            break;
                        }
                    }
                    if (del)
                        listOfConnected.splice(i, 1);
                    Controller.put_user_last_connection(currentUser.id, function(err, data){
                        if (err)
                            console.log('error adding current date to last connection / ' + data);
                        else
                            console.log('User '+currentUser.pseudo+' disconnect, current date STAMP save');
                    });
                    socket.broadcast.emit('userDisconnect', currentUser);
                }
            }
        });

        socket.on('sendMsg', function (data) {
            for (var i in listOfConnected) {
                if (listOfConnected[i].id == data.to) {
                    io.sockets.connected[listOfConnected[i].socketId].emit('newMsg', {
                        from: data.from,
                        content: data.content
                    });
                    break;
                }
            }
        });

        socket.on('newRel', function (data) {
            if (data.type == 4) {
                for (var i in listOfConnected) {
                    if (listOfConnected[i].id == data.users_to) {
                        Controller.new_notif(data, function (err, d) {
                            if (err)
                                console.log('error in notif /' + d)
                            else {
                                io.sockets.connected[listOfConnected[i].socketId].emit('newNotif', {
                                    score: -5,
                                    id: d.id,
                                    users_from: data.users_from,
                                    users_to: data.users_to,
                                    content: d.content
                                });
                            }
                        });
                        break;
                    }
                }
            }
            else if (data.type == 1 || data.type == 2 || data.type == 3) {
                Controller.new_notif(data, function (err, d) {
                    if (err)
                        console.log('error in notif /' + d)
                    else {
                        for (var i in listOfConnected) {
                            var score = data.type == 2 ? 0 : 5;
                            if (listOfConnected[i].id == data.users_to) {
                                io.sockets.connected[listOfConnected[i].socketId].emit('newNotif', {
                                    score: score,
                                    id: d.id,
                                    users_from: data.users_from,
                                    users_to: data.users_to,
                                    content: d.content
                                })
                                break;
                            }
                        }
                    }
                })
            }
        })

    });
};
