/**
 * Created by rdidier on 7/19/16.
 */

'use strict';

var query_factory = require('../server/query_factory');
var mysql = require('../server/mysql_connection');
mysql = mysql.connection();

function get_notifications(id, cb) {

    var query = query_factory.make_query('Get', 'notifications', {users_to: parseInt(id)});
    mysql.query(query, function (err, rows) {
        if (err)
            cb(true, 'sql error when loading notifications / ' + err);
        else {
            cb(false, rows);
        }
    })
}

function new_notification(data, cb) {
    var query = query_factory.make_query('Insert', 'notifications', data);
    mysql.query(query, function (err, rows) {
        if (err)
            cb(true, 'sql error when inserting new notification / ' + err);
        else 
            cb(false, {id: rows.insertId, content: data.content});
    })
}

function del_notification(id, cb) {
    var query = query_factory.make_query('Delete', 'notifications', {id: id});
    mysql.query(query, function (err) {
        if (err)
            cb(true, 'sql error when deleting notification / ' + err);
         else
            cb(false);
    })
}



exports.del_notification = del_notification;
exports.get_notifications = get_notifications;
exports.new_notification = new_notification;