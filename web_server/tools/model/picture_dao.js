/**
 * Created by rdidier on 7/19/16.
 */

'use strict';

var query_factory = require('../server/query_factory');
var mysql = require('../server/mysql_connection');
mysql = mysql.connection();

function get_pictures(data, cb) {

    var d = {users_id: data.users_id};
    if (data.main)
        d.main = 1;
    var query = query_factory.make_query('Get', 'pictures', d);
    mysql.query(query, function (err, rows) {
        if (err)
            cb(true, 'sql error when loading pictures / ' + err);
        else {
            cb(false, rows);
        }
    })
}

function new_picture(picture, cb) {
    var query = query_factory.make_query('Insert', 'pictures', {users_id: picture.users_id, content: picture.content, main: picture.main});
    mysql.query(query, function (err, rows) {
        if (err)
            cb(true, 'sql error when inserting new picture / ' + err);
        else {
            picture.id = rows.insertId;
            get_crt_date(picture.id, function (err, data) {
                if (err)
                    cb(true, 'cant get crt_date after creation /' + data);
                else {
                    picture.crt_date = data;
                    cb(false, picture);
                }
            });
        }
    })
}

function get_crt_date(id, cb) {
    var query = query_factory.make_query('Get', 'pictures', id);
    mysql.query(query, function (err, row) {
        if (err) {
            cb(true, 'sql error when getting date of picture / ' + err);
        }
        else {
            if (row && row[0].crt_date)
                cb(false, row[0].crt_date);
            else
                cb(false);
        }
    });
}

function del_picture(data, cb) {
    var query = query_factory.make_query('Delete', 'pictures', data);
    mysql.query(query, function (err) {
        if (err) {
            cb(true, 'sql error when deleting picture / ' + err);
        }
        else {
            if (data.main == 1) {
                get_pictures(data, function (err, data) {
                    if (err)
                        cb(true, 'error when loading rest of picture after delete /' + err);
                    else if (!data.length) {
                        cb(false, "user has no more picture");
                    }
                    //on doit passer une autre photo en main si celle-ci l'etais
                    else {
                        up_picture(data[0].id, function (err){
                            if (err)
                                cb(true, "error when updating main of another picture after delete / " + err);
                            else
                                cb(false, "picture was a main one, picture with id="+data[0].id+" is now the main one.");
                        });
                    }
                })
            }
            else
                cb(false, "the picture deleted wasnt a main one, no further modification done");
            }
        }
        );
}

function up_picture(id, cb) {
    var query = query_factory.make_query('Update', 'pictures', {id: id, args: { main: 1}});
    mysql.query(query, function (err, row) {
        if (err) {
            cb(true, 'sql error when upping picture / ' + err);
        }
        else {
            cb(false);
        }
    });
}

function low_picture(id, cb) {
    var query = query_factory.make_query('Update', 'pictures', {id: id,args: { main: 0}});
    mysql.query(query, function (err, row) {
        if (err) {
            cb(true, 'sql error when lowing picture/ ' + err);
        }
        else {
            cb(false);
        }
    });
}

function get_user_id(pic_id, cb){
    var query = query_factory.make_query('Get', 'pictures', pic_id);
    mysql.query(query, function (err, rows) {
        if (err)
            cb (true, "sql error when finding id of user owning photo /" + err)
        else if (!rows[0]) {
            cb(true, "no picture with this id");
        }
        else
            cb(false, rows[0].users_id);
    })
}

exports.low_picture = low_picture;
exports.up_picture = up_picture;
exports.del_picture = del_picture;
exports.get_pictures = get_pictures;
exports.new_picture = new_picture;
exports.get_user_id = get_user_id;