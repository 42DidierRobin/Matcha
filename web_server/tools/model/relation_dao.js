/**
 * Created by rdidier on 7/19/16.
 */
'use strict';

var query_factory = require('../server/query_factory');
var mysql = require('../server/mysql_connection');
mysql = mysql.connection();

function del_relation(rel, cb) {
    var data = {users_id_from: rel.users_id_from, users_id_to: rel.users_id_to};
    var query = query_factory.make_query('Delete', 'relations', data);
    mysql.query(query, function(err, rows){
        if (err) {
            cb(true, 'sql error when deleting older relation / ' + err)
        }
        else{
            cb(false);
        }
    });
}

function new_relation(data, cb) {
    var query = query_factory.make_query('Insert', 'relations', data);
    mysql.query(query, function(err){
        if (err) {
            cb(true, 'sql error adding relation / ' + err)
        }
        else{
            if (data.type == 'L')
            {
                cb (false);
            }
            else
                cb(false);
        }
    });
}

function get_relation(data,cb) {
    var query = query_factory.make_query('Get', 'relations', data);
    mysql.query(query, function(err, rows){
        if (err) {
            cb(true, 'sql error looking for relation / ' + err)
        }
        else if (rows[0])
            cb(false, rows[0]);
        else
            cb(42);
    });
}

function are_matched(data, cb) {
    var reverse_rel = {users_id_from: data.users_id_to, users_id_to: data.users_id_from};
    var query = query_factory.make_query('Get', 'relations', data);
    mysql.query(query, function(err, rows){
        if (err) {
            cb(true, 'sql error looking for relation / ' + err)
        }
        else{
            if (rows[0] && rows[0].type == 'L'){
                query = query_factory.make_query('Get', 'relations', reverse_rel);
                mysql.query(query, function(err, rows){
                    if (err) {
                        cb(true, 'sql error looking for relation / ' + err)
                    }
                    else{
                        if (rows[0] && rows[0].type == 'L')
                            cb(false,true);
                    }
                });
            }
            else
                cb(false,false);
        }
    });
}

function get_match (data, cb) {
    var query = "SELECT users.pseudo, users.id \
    FROM users \
    WHERE users.id IN \
    (SELECT first.users_id_from \
    FROM relations as first \
    JOIN relations as second on first.users_id_from = second.users_id_to \
    WHERE first.users_id_to=" + data.users_id + " AND second.users_id_from=" + data.users_id + " AND first.type='L' AND second.type='L')";
    mysql.query(query, function(err, rows){
        if (err) {
            cb(true, 'sql error looking for matchs / ' + err)
        }
        else if (rows[0])
            cb(false, rows);
        else
            cb(42);
    });
}

exports.del_relation = del_relation;
exports.new_relation = new_relation;
exports.get_relation = get_relation;
exports.are_matched = are_matched;
exports.get_match = get_match;
