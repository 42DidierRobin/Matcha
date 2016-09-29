/**
 * Created by rdidier on 6/18/16.
 */
'use strict';
var User = require('../model/user.js');
var Tags = require('../model/tags');
var Relation = require('../model/relation');
var Message = require('../model/message');
var Picture = require('../model/picture');
var check = require('../tools/check');
var geolib = require('geo-lib');
var request = require('request');

//TODO: verifier toutes les entrees dargument

function get_ip(req) {
    return ( req.headers["X-Forwarded-For"]
    || req.headers["x-forwarded-for"]
    || req.client.remoteAddress);
}

function get_loc(ip, cb){
    request('http://ip-api.com/json/'+ip+'?fields=lat,lon', function (error, response, body) {
        if (error && response.statusCode != 200)
            cb(true, response);
        else {
            body = JSON.parse(body);
            cb(false, {lat: body.lat, lng: body.lon});
        }
    });
}

function new_user(req, cb) {

    var user = new User();
    check.daddy_check(['pseudo', 'mail', 'first_name', 'last_name', 'password'],
        ['pseudo', 'mail', 'first_name', 'last_name', 'password'], req.body, function (err, data) {
            if (err)
                cb(true, data);
            else {
                get_loc(get_ip(req), function(err, d){
                    if (err)
                        cb(true, 'error when finding localisation of ip /' + d)
                    else{
                        req.body.loca_lat = d.lat;
                        req.body.loca_lng = d.lng;
                        user.define_user(req.body, function (err, data) {
                            if (err)
                                cb(true, data);
                            else {
                                require('../server/server').send_mail(user.generate_confirm_mail(), function (err) {
                                    if (err)
                                        cb(true, 'error sending email confirm / ' + err);
                                    else
                                        cb(false, 'email has been sent / ' + data);
                                })
                            }
                        });
                    }
                })
            }
        })
}

function update_user(req, cb) {
    var user = new User();
    check.daddy_check(['id'], ['id', 'sex', 'bio', 'orientation', 'sex', 'age'], req.body, function (err, data) {
        if (err)
            cb(true, data);
        else {
            user.set_by_id(req.body.id, function (err, data) {
                if (err) {
                    cb(true, 'error getting information from user with id ' + req.body.id + ' / ' + data);
                }
                else {
                    user.change_values(req.body, cb);
                }
            });
        }
    });
}

function get_user_by_pseudo(req, cb) {

    var user = new User();
    check.daddy_check(['pseudo'], ['pseudo'], req.query, function (err, data) {
        if (err)
            cb(true, data);
        else {
            user.set_by_pseudo(req.query.pseudo, function (err, data) {
                if (err)
                    cb(true, data);
                else {
                    delete data.salt;
                    delete data.password;
                    delete data.mail_verif;
                    cb(false, data);
                }
            });
        }
    })
}

function get_user_by_mail(req, cb) {

    var user = new User();
    check.daddy_check(['mail'], ['mail'], req.query, function (err, data) {
        if (err)
            cb(true, data);
        else {
            user.set_by_mail(req.query.mail, function (err, data) {
                if (err)
                    cb(true, data);
                else {
                    delete data.salt;
                    delete data.password;
                    delete data.mail_verif;
                    cb(false, data);
                }
            });
        }
    })
}

function get_user_by_id(req, cb) {

    var user = new User();
    check.daddy_check(['id'], ['id', 'lat', 'lng'], req.query, function (err, data) {
        if (err)
            cb(true, data);
        else {
            user.set_by_id(req.query.id, function (err, data) {
                if (err)
                    cb(true, data);
                else {
                    delete user.salt;
                    delete user.password;
                    delete user.mail_verif;
                    delete user.cookie_key;
                    delete user.mail;
                    user.dist = geolib.distance({
                        p1: {lat: parseFloat(req.query.lat), lon: parseFloat(req.query.lng)},
                        p2: {lat: user.loca_lat, lon: user.loca_lng}
                    }).distance;
                    delete user.loca_lat;
                    delete user.loca_lng;
                    cb(false, user);
                }
            });
        }
    });
}

function put_user_last_connection(id, cb) {

    var user_dao = require('../model/user_dao');
    user_dao.put_last_connection(id, cb);
}

function forget_pwd(req, cb) {
    var user_dao = require('../model/user_dao');
    check.daddy_check(['pseudo'], ['pseudo'], req.query, function (err, data) {
        if (err)
            cb(true, data);
        else {
            user_dao.forget_pwd(req.query.pseudo, cb);
        }
    })

}

function change_mail(data, cb) {
    var user_dao = require('../model/user_dao');
    check.daddy_check(['mail'], ['mail'], {mail: data.mail}, function (err, d) {
        if (err)
            cb(true, d);
        else {
            user_dao.change_mail(data, cb);
        }
    })

}

function identify_user(req, cb) {
    var user_dao = require('../model/user_dao');
    check.daddy_check(['pseudo', 'password'], ['pseudo', 'password'], req.body, function (err, data) {
        if (err)
            cb(true, data);
        else {
            get_loc(get_ip(req), function(err, d){
                if (err)
                    cb (true, 'error looking for ip /' + d);
                else{
                    req.body.lat = d.lat;
                    req.body.lng = d.lng;
                    user_dao.identify(req.body, cb);
                }
            })
        }})
}

function verify_email(req, cb) {
    var user_dao = require('../model/user_dao');
    check.daddy_check(['pseudo', 'key'], ['pseudo', 'key'], req.query, function (err, data) {
        if (err)
            cb(true, data)
        else
            user_dao.verify_email(req.query, cb);
    })
}

function new_tags(id, data, cb) {
    var tag = new Tags;
    check.daddy_check(['tag'], ['tag'], data, function (err, d) {
        if (err)
            cb(true, d);
        else
            tag.sync_tags({user: id, tag: data.tag}, cb);
    });
}

function delete_tag(req, cb) {
    var tags_dao = require('../model/tags_dao');
    check.daddy_check(['users_id', 'tags_id'], ['users_id', 'tags_id'], req, function (err, d) {
        if (err)
            cb(true, d);
        else {
            tags_dao.check_user_tag_rel(req, function (err, data) {
                if (err)
                    cb(err, "error when looking for the relation tag user /" + data);
                else {
                    tags_dao.delete_tag(req, function (err, data) {
                        if (err)
                            cb(true, 'error when deleting tag /' + data);
                        else {
                            cb(false, data);
                        }
                    });
                }
            });
        }
    });
}

function get_all_tags(req, cb) {
    var tags_dao = require('../model/tags_dao');
    check.daddy_check(['users_id'], ['users_id'], req, function (err, d) {
        if (err)
            cb(true, d);
        else {
            tags_dao.get_all_tags(req, function (err, data) {
                if (err)
                    cb(true, 'error when loading tags /' + data);
                else {
                    var tab = [];
                    var tag = new Tags;
                    for (var k in data) {
                        tag.set_from_data(data[k]);
                        tab.push(tag.fresh_copy());
                    }
                    cb(false, tab);
                }
            });
        }
    });
}

function tag_exist(name, cb) {
    var tags_dao = require('../model/tags_dao');
    check.daddy_check(['tag'], ['tag'], {tag: name}, function (err, data) {
        if (err)
            cb(true, data)
        else {
            tags_dao.tags_exist(name, function (err, data) {
                if (err == 42)
                    cb(42, 'no tag');
                else if (err) {
                    cb(true, 'error checking if tag exist / ' + data)
                }
                else {
                    cb(false, data);
                }
            });
        }
    })
}

function get_relation(req, cb) {
    var ret = {};
    var relation = new Relation();
    var relation2 = new Relation();

    check.daddy_check(['users_id_from', 'users_id_to'], ['users_id_from', 'users_id_to'], req.query, function (err, data) {
        if (err)
            cb(true, data);
        else {
            relation.get_relation(req.query, function (err, data) {
                if (err && err != 42)
                    cb(err, data);
                else {
                    relation2.get_relation({
                            users_id_from: req.query.users_id_to,
                            users_id_to: req.query.users_id_from
                        },
                        function (err2, d) {
                            if (err2 && err2 != 42)
                                cb(true, d);
                            else if (err == 42 && err2 == 42)
                                cb(42);
                            else
                                cb(false, {one: data, two: d});
                        });
                }
            });
        }
    })

}

function set_relation(req, cb) {
    var relation = new Relation();
    var user_dao = require('../model/user_dao');
    check.daddy_check(['users_id_from', 'users_id_to', 'type'], ['users_id_from', 'users_id_to', 'type'], req.body, function (err, d2) {
        if (err)
            cb(true, d2);
        else {
            relation.maj_relation(req.body, function (err, data) {
                if (err)
                    cb(true, data);
                else {
                    var tmp = req.body.type == 'L' ? 5 : -2;
                    user_dao.update_score(req.body.users_id_to, tmp, function (err, d) {
                        if (err)
                            cb(true, 'error changing score after adding relation' + d);
                        else
                            cb(false, d);
                    });
                }
            });
        }
    })
}

function del_relation(req, cb) {
    var relation_dao = require('../model/relation_dao');
    var user_dao = require('../model/user_dao');
    check.daddy_check(['users_id_from', 'users_id_to'], ['users_id_from', 'users_id_to'], req.query, function (err, d2) {
        if (err)
            cb(true, d2);
        else {
            relation_dao.del_relation(req.query, function (err, data) {
                if (err)
                    cb(true, data);
                else {
                    user_dao.update_score(req.query.users_id_to, -5, function (err, d) {
                        if (err)
                            cb(true, 'error changing score after adding relation' + d);
                        else
                            cb(false, d);
                    });
                }
            });
        }
    })
}

function new_message(req, cb) {

    var message = new Message();
    check.daddy_check(['users_id_from', 'users_id_to', 'content'], ['users_id_from', 'users_id_to', 'content'], req.body, function (err, data) {
        if (err)
            cb(true, data);
        else {
            message.set_message(req.body, cb);
        }
    })
}

function get_conversation(req, cb) {

    var message_dao = require('../model/message_dao');
    check.daddy_check(['users_id_from', 'users_id_to'], ['users_id_from', 'users_id_to'], req.query, function (err, data) {
        if (err)
            cb(true, data);
        else {
            message_dao.get_messages(req.query, function (err, data) {
                if (err)
                    cb(true, 'error when loading messages /' + data);
                else {
                    var conv = [];
                    var mess = new Message();
                    for (var k in data) {
                        mess.set_from_data(data[k]);
                        conv.push(mess.fresh_copy(mess));
                    }
                    cb(false, conv);
                }
            });
        }
    })
}

function get_pictures(req, cb) {

    var picture_dao = require('../model/picture_dao');
    check.daddy_check(['users_id'], ['users_id', 'main'], req.query, function (err, data) {
        if (err)
            cb(true, data);
        else {
            picture_dao.get_pictures(req.query, function (err, data) {
                if (err)
                    cb(true, 'error when loading pictures /' + data);
                else {
                    var tab = [];
                    var elu;
                    var pic = new Picture();
                    for (var k in data) {
                        if (data[k].main == 1)
                            elu = k;
                        tab.push(pic.fresh_copy(data[k]));
                    }
                    var temp = tab[elu];
                    tab[elu] = tab[0];
                    tab[0] = temp;
                    cb(false, tab);
                }
            });
        }
    })
}

function new_picture(req, cb) {
    var pic = new Picture();
    var user_dao = require('../model/user_dao');

    check.daddy_check(['users_id', 'content'], ['users_id', 'content'], req.body, function (err, data) {
        if (err)
            cb(true, data);
        else {
            pic.set_new_picture(req.body, function (err, data) {
                if (err)
                    cb(true, data);
                else {
                    user_dao.update_score(req.body.users_id, 8, function (err, d) {
                        if (err)
                            cb(true, 'error changing score after picture upload' + d);
                        else
                            cb(false, data);
                    });
                }
            });
        }
    })
}

function put_picture_first(req, cb) {
    var pic_dao = require('../model/picture_dao');
    check.daddy_check(['id_to_up', 'id_to_low'], ['id_to_up', 'id_to_low'], req.body, function (err, data) {
        if (err)
            cb(true, data);
        else {
            pic_dao.up_picture(req.body.id_to_up, function (err, data) {
                if (err)
                    cb(true, data);
                else {
                    pic_dao.low_picture(req.body.id_to_low, cb);
                }
            });
        }
    })
}

function del_picture(userId, req, cb) {
    var pic_dao = require('../model/picture_dao');
    var user_dao = require('../model/user_dao');
    check.daddy_check(['id'], ['id', 'users_id', 'main'], req.query, function (err, data) {
        if (err)
            cb(true, data);
        else {
            pic_dao.del_picture(parseInt(req.query.id, 10), function (err, data) {
                if (err)
                    cb(true, data);
                else {
                    user_dao.update_score(userId, -8, function (err, d) {
                        if (err)
                            cb(true, 'error changing score after picture delete' + d);
                        else
                            cb(false, data);
                    });
                }
            });
        }
    })
}

function picture_check_right(pic_id, user_id, cb) {
    var pic_dao = require('../model/picture_dao');
    pic_dao.get_user_id(pic_id, function (err, data) {
        if (err)
            cb(true, data);
        else if (data != user_id)
            cb(true, "acces denied");
        else
            cb(false);
    })

}

function get_result(data, users_id, cb) {
    var user_dao = require('../model/user_dao');
    check.daddy_check(['agef', 'aget', 'scoref', 'scoret', 'orientation', 'distf', 'distt', 'lat', 'lng'],
        ['agef', 'aget', 'scoref', 'scoret', 'orientation', 'lat', 'lng', 'tags', 'distf', 'distt'], {
            agef: data.age.from,
            aget: data.age.to,
            scoref: data.score.from,
            scoret: data.score.to,
            distf: data.dist.from,
            distt: data.dist.to,
            orientation: data.sex,
            tags: data.tags,
            lat: data.lat,
            lng: data.lng
        }, function (err, d) {
            if (err)
                cb(true, d);
            else {
                user_dao.get_result(data, function (err, d1) {
                    if (err == 42)
                        cb(42);
                    else if (err)
                        cb(err, d1);
                    else {
                        //delete des personnes bloque ou qui ont bloque
                        user_dao.get_ennemies(users_id, function (err, d2) {
                                if (err)
                                    cb(true, 'error getting block relation from user / ' + d2);
                                else {
                                    var result = d1.filter(function (elem) {
                                        elem.dist = (geolib.distance({
                                            p1: {lat: parseFloat(data.lat), lon: parseFloat(data.lng)},
                                            p2: {lat: parseFloat(elem.loca_lat), lon: parseFloat(elem.loca_lng)}
                                        }).distance);
                                        return (!d2.find(function(elem2){return elem.id === elem2.id;}) &&
                                            (elem.dist >= data.dist.from && elem.dist <= data.dist.to))
                                    });
                                    if (result.length == 0)
                                        cb(42);
                                    else
                                        cb(false, result);
                                }
                            }
                        )
                    }
                });
            }
        })
}

function get_match(data, cb) {
    var relation_dao = require('../model/relation_dao');
    check.daddy_check(['users_id'], ['users_id'], data, function (err, d) {
        if (err)
            cb(true, d);
        else {
            relation_dao.get_match(data, cb);
        }
    })
}

function get_notifs(data, cb) {
    var notification_dao = require('../model/notifications_dao');
    check.daddy_check(['id'], ['id'], data.query, function (err, d) {
        if (err)
            cb(true, d);
        else {
            notification_dao.get_notifications(data.query.id, cb);
        }
    })
}

function del_notif(data, cb) {
    var notification_dao = require('../model/notifications_dao');
    check.daddy_check(['id'], ['id'], data.query, function (err, d) {
        if (err)
            cb(true, d);
        else {
            notification_dao.del_notification(data.query.id, cb);
        }
    })
}

function new_notif(data, cb) {

    var notif = {};
    check.daddy_check(['pseudo', 'users_id_from', 'users_id_to', 'notifType'], ['pseudo', 'users_id_from', 'users_id_to', 'notifType'],
        {
            pseudo: data.from_pseudo,
            users_id_from: data.users_from,
            users_id_to: data.users_to,
            notifType: data.type
        }, function (err, d) {
            if (err)
                cb(true, d);
            else {
                notif.users_from = data.users_from;
                notif.users_to = data.users_to;
                notif.content = require('../tools/notifGen').create(data.from_pseudo, data.type);
                var notification_dao = require('../model/notifications_dao');
                notification_dao.new_notification(notif, cb);
            }
        });

}

function report(from, req, cb) {
    var user_dao = require('../model/user_dao');
    check.daddy_check(['id'], ['id'], req.body, function (err, data) {
        if (err)
            cb(true, data);
        else {
            user_dao.report({users_id_from: from, users_id_to: req.body.id}, function (err, data) {
                if (err)
                    cb(true, 'error adding report /' + data);
                else {
                    var tmp = {};
                    tmp.body = {};
                    tmp.body.type = 'B';
                    tmp.body.users_id_from = from;
                    tmp.body.users_id_to = req.body.id;
                    set_relation(tmp, function (err, data) {
                        if (err)
                            cb(true, 'error blocking dude after report /' + data);
                        else
                            cb(false);
                    })
                }
            });
        }
    });
}

function put_pos(id, data, cb) {
    var user_dao = require('../model/user_dao');
    check.daddy_check(['lat', 'lng'], ['lat', 'lng'], data, function (err, d) {
        if (err)
            cb(true, d);
        else {
            user_dao.put_pos(id, data, cb);
        }
    });
}

module.exports.put_pos = put_pos;
module.exports.report = report;
module.exports.get_notifs = get_notifs;
module.exports.del_notif = del_notif;
module.exports.new_notif = new_notif;
module.exports.new_user = new_user;
module.exports.update_user = update_user;
module.exports.get_user_by_pseudo = get_user_by_pseudo;
module.exports.get_user_by_mail = get_user_by_mail;
module.exports.get_user_by_id = get_user_by_id;
module.exports.put_user_last_connection = put_user_last_connection;
module.exports.forget_pwd = forget_pwd;
module.exports.change_mail = change_mail;
module.exports.identify_user = identify_user;
module.exports.verify_email = verify_email;
module.exports.new_tags = new_tags;
module.exports.delete_tag = delete_tag;
module.exports.get_all_tags = get_all_tags;
module.exports.get_relation = get_relation;
module.exports.set_relation = set_relation;
module.exports.del_relation = del_relation;
module.exports.new_message = new_message;
module.exports.get_conversation = get_conversation;
module.exports.new_picture = new_picture;
module.exports.del_picture = del_picture;
module.exports.get_pictures = get_pictures;
module.exports.put_picture_first = put_picture_first;
module.exports.picture_check_right = picture_check_right;
module.exports.get_result = get_result;
module.exports.tag_exist = tag_exist;
module.exports.get_match = get_match;
