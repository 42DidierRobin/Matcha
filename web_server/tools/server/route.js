/**
 * Created by rdidier on 6/18/16.
 */

'use strict';

var Controller = require('./controller');
var currentUser = {};

//TODO:: verifier chaque variable et chaque data ( nom existant, injection sql, conforme au format (example: age 18-100)

function entry(router) {

    router.all('*', function (req, res, next) {

        var check = true;

        function check_cookie() {

            var user_dao = require('../model/user_dao');
            user_dao.get_by_id(currentUser.id, function (err, data) {
                if (err)
                    console.log("error when checking cookie / " + data);
                else {
                    if (data.cookie_key != currentUser.key) {
                        currentUser = null;
                        res.send({error: true, data: "dont play with devil"});
                        check = false
                    }
                    else
                        check = true;
                }
            })
        }

        if (req.body && req.body.connectedKey) {

            currentUser.pseudo = req.body.connectedPseudo;
            currentUser.connected = true;
            currentUser.key = req.body.connectedKey;
            currentUser.id = req.body.connectedId;
            check_cookie();
            delete req.body.connectedPseudo;
            delete req.body.connectedKey;
            delete req.body.connectedId;
        }
        else if (req.query && req.query.connectedKey) {
            currentUser.pseudo = req.query.connectedPseudo;
            currentUser.connected = true;
            currentUser.key = req.query.connectedKey;
            currentUser.id = req.query.connectedId;
            check_cookie();
            delete req.query.connectedPseudo;
            delete req.query.connectedKey;
            delete req.query.connectedId;
        }
        else {
            currentUser = {};
        }
        if (check) {
            next();
        }
    });

    router.get('/User/mail_confirm', function (req, res) {
        Controller.verify_email(req, function (err, data) {
            if (err == 42) {
                console.log("email already verified");
                res.send({error: 42, content: data})
            } else if (err) {
                console.log('error confirming mail / ' + data);
                res.send({error: true, content: 'error confirming mail / ' + data})
            } else {
                console.log('email has been verify');
                res.send({error: false})
            }
        })
    });

    router.post('/User/new', function (req, res) {
        Controller.new_user(req, function (err, data) {
            if (err) {
                console.log('error when creating new user / ' + data);
                res.send({error: true, content: 'error when creating new user / ' + data})
            }
            else {
                console.log('User created: :');
                console.log(data);
                res.send({error: false});
            }
        })
    });

    router.post('/User/update', function (req, res) {
        //TODO: verifier les variable une a une
        if (req.body.id == currentUser.id) {
            Controller.update_user(req, function (err, data) {
                if (err) {
                    console.log('error when updating new user / ' + data);
                }
                else {
                    console.log('User has been updated correctly.');
                    res.send({error: false});
                }
            })
        }
        else res.send({error: true, content: "acces denied"});
    });

    router.post('/User/connect', function (req, res) {
        Controller.identify_user(req, function (err, data) {
            var res_data = {};
            if (err == 1) {
                console.log('error when identifying user type 1 / ' + data);
                res_data.error = 2;
                res.send(res_data);
            }
            else if (err == 2) {
                console.log('error when identifying user type 2 / ' + data);
                res_data.error = 1;
                res.send(res_data);
            }
            else if (err) {
                console.log('error when identifying user / ' + data);
                res_data.error = 3;
                res.data.content = data;
                res.send(res_data);
            }
            else {
                data.error = false;
                delete data.salt;
                delete data.password;
                delete data.mail_verif;
                res.send(data);
            }
        })
    });

    router.get('/User', function (req, res) {

        function cb(err, data) {
            if (err) {
                console.log('error when getting user / ' + data);
            }
            else {
                if (data.pseudo) {
                    console.log("User find.");
                    if (currentUser.key && currentUser.key == data.cookie_key) {
                        data.found = true;
                        delete data.salt;
                        delete data.password;
                        delete data.mail_verif;
                        res.send(data);
                    }
                    else
                        res.send({found: true});
                }
                else {
                    console.log("no user found with ");
                    console.log(req.query);
                    data.found = false;
                    res.send(data);
                }
            }
        }

        if (req.query.pseudo)
            Controller.get_user_by_pseudo(req, cb);
        else if (req.query.mail)
            Controller.get_user_by_mail(req, cb);
        else if (req.query.id)
            Controller.get_user_by_id(req, function (err, data) {
                if (err)
                    res.send({error: true, content: data});
                else {
                    for (var i in listOfConnected){
                        if (listOfConnected[i].id == data.id){
                            data.connected = true;
                            break;
                        }
                    }
                    res.send({error: false, content: data});
                }
            });
        else
            res.send(false);
    });

    router.put('/User/report', function(req, res){
        Controller.report(currentUser.id, req, function(err, data){
            if (err){
                console.log("error reporting user /" + data)
                res.send({error: true, content: "error reporting user /" + data})
            }
            else{
                console.log('user has been reported');
                res.send({error: false})
            }
        })
    })

    router.get('/User/forgetPwd', function (req, res){
        Controller.forget_pwd(req, function (err, data) {
            if (err == 42){
                console.log(data);
                res.send({error: 42, content: data});
            }else if (err){
                console.log('error trying to change password /' + data);
                res.send({error: true, content: 'error trying to change password /' + data});
            }
            else {
                console.log('password changed');
                res.send({error: false});
            }
        })
    })

    router.get('/User/newMail', function (req, res){
        Controller.change_mail({id: currentUser.id, pseudo: currentUser.pseudo, mail: req.query.mail}, function (err, data) {
            if (err){
                console.log('error trying to change mail /' + data);
                res.send({error: true, content: 'error trying to change mail /' + data});
            }
            else {
                console.log('mail changed');
                res.send({error: false});
            }
        })
    });

    router.post('/Tags', function (req, res) {
        Controller.new_tags(currentUser.id, req.body, function (err, data) {
            if (err == 42) {
                res.send({error: false, content: 'dup'});
            } else if (err) {
                console.log('error when adding new tag /' + data);
                res.send({error: true, content: 'error when  adding new tag /' + data})
            }
            else {
                console.log('tags added correctly');
                console.log(data);
                res.send({error: false, content: data.id});
            }
        });
    });

    router.delete('/Tags', function (req, res) {
        if (currentUser.id) {
            Controller.delete_tag({users_id: currentUser.id, tags_id: req.query.tag}, function (err, data) {
                if (err && err == 42) {
                    console.log("Not authorized to delete this tag");
                    res.send({error: true, content: "acces denied"});
                }
                else if (err) {
                    console.log('error when deleting tag /' + data);
                    res.send({error: true, content: 'error when deleting tag /' + data});
                }
                else {
                    console.log('association tag-user deleted correctly');
                    res.send({error: false});
                }
            });
        }
        else
            res.send({error: true, content: "not connected"})
    });

    router.get('/Tags', function (req, res) {
        var id = req.query.users_id || currentUser.id;
        if (id) {
            Controller.get_all_tags({users_id: id}, function (err, data) {
                if (err) {
                    console.log('error when charging all tags /' + data);
                    res.send({error: true, content: 'error when charging all tags /' + data});
                }
                else {
                    console.log('list of tags have been loaded');
                    res.send({error: false, content: data});
                }
            });
        }
        else
            res.send({error: true, content: "bad request"});
    });

    router.get('/Tags/exist', function (req, res) {
        Controller.tag_exist(req.query.name, function (err, data) {
            if (err == 42) {
                console.log("no tag found with this name");
                res.send({error: 42, content: "no tag with this name"});
            } else if (err) {
                console.log("error: / " + data);
                res.send({error: true, content: data});
            } else {
                console.log("tag found, id return");
                res.send({error: false, content: data});
            }
        });
    });

    router.get('/Match', function (req, res) {
        Controller.get_match (req.query, function (err, data) {
            if (err == 42)
                res.send({error:42});
            else if (err)
                res.send({error: true, content: 'error charging list of match / ' + data});
            else {
                console.log("list of matchs chargee");
                for (var i in data) {
                    for (var j in listOfConnected) {
                        if (data[i].id == listOfConnected[j].id) {
                            data[i].connected = true;
                            break;
                        }
                    }
                }
                res.send({error: false, content: data});
            }
        })
    });

    router.get('/Relation', function (req, res) {
        Controller.get_relation(req, function (err, data) {
            if (err == 42) {
                console.log("no relation between these users");
                res.send({error: 42});
            }
            else if (err) {
                console.log('error when getting relation /' + data);
                res.send({error: true, content: 'error when getting relation /' + data})
            }
            else {
                console.log('Relation between users sent');
                res.send({error: false, content: data});
            }
        });
    });

    router.post('/Relation', function (req, res) {
        Controller.set_relation(req, function (err, data) {
            if (err) {
                console.log('error when adding new relation /' + data);
                res.send({error: true, content: 'error when deleting relation /' + data});
            }
            else {
                console.log('the relation has been added');
                res.send({error: false});
            }
        });
    });

    router.delete('/Relation', function (req, res) {
        Controller.del_relation(req, function (err, data) {
            if (err) {
                console.log('error when deleting relation /' + data);
                res.send({error: true, content: 'error when deleting relation /' + data})
            }
            else {
                console.log('The relation has been deleted');
                res.send({error: false});
            }
        });
    });

    router.post('/Message', function (req, res) {
        Controller.new_message(req, function (err, data) {
            if (err) {
                console.log('error when saving new message /' + data);
                res.send({error: true, content : 'error when saving new message /' + data});
            }else {
                console.log("the message has been saved  ");
                res.send({error: false});
            }
        })
    });

    router.get('/Message', function (req, res) {
        Controller.get_conversation(req, function (err, data) {
            if (err) {
                console.log('error when loading messages /' + data);
                res.send({error: true, content: 'error when loading messages /' + data});
            }else {
                console.log("conversation loaded");
                res.send({error: false, content: data});
            }
        })
    });

    router.delete('/Picture', function (req, res) {
        if (!currentUser.id)
            res.send({error: true, content: "acces denied "});
        Controller.picture_check_right(parseInt(req.query.id, 10), currentUser.id, function (err, data) {
            if (!err) {
                Controller.del_picture(currentUser.id, req, function (err, data) {
                    if (err) {
                        res.send({error: true, content: ('error when deleting picture /' + data)});
                    }
                    else {
                        console.log('The picture has been deleted.');
                        res.send({error: false});
                    }
                });
            }
            else
                res.send({error: true, content: data});
        });
    });

    router.post('/Picture', function (req, res) {
        if (currentUser.id != req.body.users_id)
            res.send({error: true, content: "not authorized"});
        else {
            Controller.new_picture(req, function (err, data) {
                if (err)
                    res.send({error: true, content: 'error when creating new picture /' + data});
                else {
                    console.log("new picture added");
                    res.send({error: false, id: data.id, crt_date: data.crt_date});
                }
            })
        }
    });

    router.get('/Picture', function (req, res) {
        Controller.get_pictures(req, function (err, data) {
            if (err)
                console.log('error when loading pictures /' + data);
            else {
                console.log("pictures loaded correctly");
                res.send(data);
            }
        })
    });

    router.put('/Picture', function (req, res) {
        if (!currentUser.id)
            res.send({error: true, content: "acces denied"});
        else {
            Controller.picture_check_right(req.body.id_to_low, currentUser.id, function (err, data) {
                if (!err) {
                    Controller.put_picture_first(req, function (err, data) {
                        if (err) {
                            console.log('error when trying to modify main picture /' + data);
                            res.send({error: true, content: ('error when trying to modify main picture /' + data)});
                        } else {
                            console.log("Main picture is now updated");
                            res.send({error: false});
                        }
                    })
                }
                else
                    res.send({error: true, content: data});
            });
        }
    });

    router.post('/Search', function (req, res) {
        if (currentUser) {
            Controller.get_result(req.body, currentUser.id, function (err, data) {
                if (err == 42) {
                    console.log("no result with this args");
                    res.send({error: 42, content: "no result"});
                }
                else if (err) {
                    console.log("error while finding result of the search / " + data);
                    res.send({error: true, content: "error while finding result of the search / " + data});
                } else {
                    console.log("search successfull");
                    res.send({error: false, content: data});
                }
            })
        } else {
            console.log("cant make search without being connected");
            res.send({error: true, content: "not connected"})
        }
    });

    router.delete('/Notif', function (req, res) {
        Controller.del_notif(req, function (err, data) {
            if (err) {
                console.log('error when deleting notif /' + data);
                res.send({error: true, content: 'error when deleting notif /' + data});
            }
            else {
                console.log('notif deleted');
                res.send({error: false});
            }
        });
    });

    router.get('/Notif', function (req, res) {
        Controller.get_notifs(req, function (err, data) {
            if (err) {
                console.log('error when getting notifs /' + data);
                res.send({error: true, content: 'error when getting notifs /' + data});
            }
            else {
                console.log('notifs charged');
                res.send({error: false, content: data});
            }
        });
    });

    router.put('/Pos', function(req, res){
        Controller.put_pos(currentUser.id, req.body, function(err, data){
            if (err){
                console.log('error updating lat and lng values' + data);
                res.send({error: true, content: 'error updating lat and lng values' + data});
            }else{
                console.log('position updated');
                res.send({error: false});
            }
        });
    })


}

module.exports.entry = entry;