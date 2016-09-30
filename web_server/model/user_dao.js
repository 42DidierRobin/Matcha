/**
 * Created by rdidier on 6/18/16.
 */
'use strict';

var query_factory = require('../server/query_factory');
var mysql = require('../server/mysql_connection');
mysql = mysql.connection();
var check = require('../tools/check');
var key = require('../tools/key');

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

function put_last_connection(id, cb) {
    change_values({id: id}, {last_connected: getDateTime()}, cb);
}

function forget_pwd(pseudo, cb) {
    var data = {};
    var password = key.random_string(8);
    var query = 'SELECT mail,id FROM users WHERE pseudo=\'' + pseudo + '\'';
    mysql.query(query, function (err, rows) {
        if (err)
            cb(true, 'error sql loading user mail /' + err);
        else if (rows[0]) {
            var mail = {
                to: rows[0].mail,
                subject: 'Matcha change password',
                text: 'Here is your new password : ' + password + ' . Remember we wont know it, keep it carefully, or change it again !'
            };
            require('../server/server').send_mail(mail, function (err) {
                if (err)
                    cb(true, 'error sending email confirm / ' + err);
                else {
                    data.salt = key.random_string(16);
                    data.password = check.mini_hash(password, data.salt);
                    change_values({id: rows[0].id}, data, function (err, data) {
                        if (err)
                            cb(true, 'error sving new password /' + data)
                        else {
                            delete data.password;
                            cb(false);
                        }
                    })
                }
            })
        }
        else
            cb(42, 'no user found with this pseudo');
    })

}

function change_mail(data, cb) {
    data.mail_verif = key.random_string(42);
    var mail = {
        to: data.mail,
        subject: 'Matcha mail change',
        text: 'Welcome to Matcha ! To confirm your new mail, please click on the link following : ' +
        'http://' + url + '/connection/' + data.pseudo + '/' + data.mail_verif
    }
    require('../server/server').send_mail(mail, function (err) {
        if (err)
            cb(true, 'error sending mail for mail changing confirmation / ' + err);
        else {
            change_values({id: data.id}, {mail: data.mail, mail_verif: data.mail_verif}, function (err, data) {
                if (err)
                    cb(true, 'error changing mail adress /' + data)
                else {
                    cb(false);
                }
            })
        }
    })

}

function create_cookie_key(cb) {

    var key = require('../tools/key').random_string(42);
    var query = 'Select cookie_key FROM users';
    mysql.query(query, function (err, data) {
        if (err)
            cb(true, 'sql error loading cookie keys /' + err);
        else {
            if (!data[0])
                cb(false, key);
            for (var k in data) {
                if (data[k].cookie_key == key) {
                    create_cookie_key(cb);
                    break;
                }
                else if (!data[k + 1]) {
                    cb(false, key);
                    break;
                }
            }
        }
    });
}

function new_user(user, cb) {
    create_cookie_key(function (err, data) {
        if (err)
            cb(true, data);
        else {
            user.cookie_key = data;
            user.mail_verif = require('../tools/key').random_string(42);
            var query = query_factory.make_query('Insert', 'users', user);
            mysql.query(query, function (err, rows) {
                if (err) {
                    cb(true, 'error sql inserting new user /' + err);
                }
                else {
                    user.id = rows.insertId;
                    cb(false, user);
                }
            });
        }
    });
}

function get_user_by_id(id, cb) {
    var query = query_factory.make_query('Get', 'users', {id: id});
    mysql.query(query, function (err, row) {
        if (err) {
            cb(true, err)
        }
        else {
            if (!row[0])
                cb(true, 'no result');
            else
                cb(false, row[0]);
        }
    });
}

function get_user_by_pseudo(pseudo, cb) {
    var query = query_factory.make_query('Get', 'users', {pseudo: pseudo});
    mysql.query(query, function (err, rows) {
        if (err) {
            cb(true, err)
        }
        else {
            cb(false, rows[0]);
        }
    });
}

function get_user_by_mail(mail, cb) {
    var query = query_factory.make_query('Get', 'users', {mail: mail});
    mysql.query(query, function (err, rows) {
        if (err) {
            cb(true, err)
        }
        else {
            cb(false, rows[0]);
        }
    });
}

function change_values(user, args, cb) {
    var query = query_factory.make_query('Update', 'users', {id: user.id, args: args});
    mysql.query(query, function (err) {
        if (err) {
            cb(true, 'error in changing value sql / ' + err);
        } else
            cb(false, 'SQL: values have been saved.');
    });
}

function identify_user(data, cb) {
    get_user_by_pseudo(data.pseudo, function (err, res) {
        if (err)
            cb(2, 'error finding user by pseudo / ' + res);
        else {
            if (!res)
                cb(2, 'no user existing with this pseudo');
            else if (res.password == require('../tools/check').mini_hash(data.password, res.salt)) {
                if (res.mail_verif != 'OK')
                    cb(1, 'email not verify');
                else {
                    var query = 'UPDATE users SET loca_lng=' + data.lng + ', loca_lat=' + data.lat + ' WHERE pseudo=\'' + data.pseudo + '\'';
                    console.log(query);
                    mysql.query(query, function (err) {
                        if (err)
                            cb(true, 'error updating position in sql /' + err)
                        else
                            cb(false, res)
                    })
                }
            }
            else
                cb(2, 'wrong password');
        }
    })
}

function verify_email(data, cb) {
    get_user_by_pseudo(data.pseudo, function (err, res) {
        if (err)
            cb(true, data);
        else if (!res)
            cb(true, 'no user with this pseudo');
        else {
            if (res.mail_verif == 'OK')
                cb(42, "already verified key");
            else if (data.key == res.mail_verif) {
                var query = query_factory.make_query('Update', 'users', {id: res.id, args: {mail_verif: 'OK'}});
                mysql.query(query, function (err) {
                    if (err)
                        cb(true, 'error while changing mail_verif to null / ' + err);
                    else {
                        cb(false, 'user verify mail key updated')
                    }
                })
            }
            else cb(true, 'false key');
        }
    })
}

function get_result(data, cb) {

    var query = query_factory.dirty_query(data);
    mysql.query(query, function (err, row) {
        if (err) {
            cb(true, err)
        }
        else {
            if (!row[0])
                cb(42, 'no result');
            else
                cb(false, row);
        }
    });
}

function get_ennemies(id, cb) {
    var query = "SELECT users_id_to AS id \
    FROM relations \
    WHERE type='B' AND users_id_from=" + id + " \
    UNION \
    SELECT users_id_from AS id \
    FROM relations \
    WHERE type='B' AND users_id_to=" + id;
    mysql.query(query, function (err, row) {
        if (err) {
            cb(true, err)
        }
        else {
            //on push lidee de lutilisateur car on ne le veut pas dans les resultat
            row.push({id: id});
            cb(false, row);
        }
    })
};

function update_score(id, nbr, cb) {
    var query = 'SELECT score FROM users WHERE id=\'' + id + '\'';
    mysql.query(query, function (err, data) {
        if (err)
            cb(true, err)
        else if (!data[0])
            cb(true, 'no user with this id')
        else {
            var tmp = (parseInt(data[0].score) + nbr);
            tmp = tmp < 0 ? 0 : tmp;
            tmp = tmp > 100 ? 100 : tmp;
            query = 'UPDATE users SET score=\'' + tmp + '\' WHERE id=\'' + id + '\'';
            mysql.query(query, function (err, data) {
                if (err)
                    cb(true, err);
                else
                    cb(false)
            })
        }
    })
}

function report(data, cb) {
    var query = query_factory.make_query('Insert', 'reporteds', data);
    mysql.query(query, function (err, data) {
        if (err) {
            cb(true, err);
        }
        else {
            cb(false);
        }
    })
}

function put_pos(id, data, cb) {
    var query = 'UPDATE users SET loca_lat=' + data.lat + ', loca_lng=' + data.lng + ' WHERE id=\'' + id + '\'';
    mysql.query(query, function (err) {
        if (err)
            cb(true, err)
        else {
            cb(false);
        }
    })
}

function get_tags_common(id_from, elem, cb) {
    var query = 'SELECT COUNT(*) AS nb \
    FROM users_has_tags as t0, users_has_tags as t1 \
    WHERE (t0.users_id = ' + id_from + ') AND (t1.users_id = ' + elem.id + ') AND (t0.tags_id = t1.tags_id)';
    mysql.query(query, function (err, row) {
        if (err)
            cb(true, err)
        else{
            elem.tags_common = row[0]['nb'];
            cb(false)
            }
    });
}

module.exports.get_tags_common = get_tags_common;
module.exports.put_pos = put_pos;
module.exports.update_score = update_score;
module.exports.report = report;
module.exports.put_last_connection = put_last_connection;
module.exports.verify_email = verify_email;
module.exports.identify = identify_user;
module.exports.new_user = new_user;
module.exports.change_values = change_values;
module.exports.get_by_id = get_user_by_id;
module.exports.get_by_pseudo = get_user_by_pseudo;
module.exports.get_by_mail = get_user_by_mail;
module.exports.get_result = get_result;
module.exports.get_ennemies = get_ennemies;
module.exports.forget_pwd = forget_pwd;
module.exports.change_mail = change_mail;