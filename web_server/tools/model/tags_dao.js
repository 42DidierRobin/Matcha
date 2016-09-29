/**
 * Created by rdidier on 7/16/16.
 */

'use strict';

var query_factory = require('../server/query_factory');
var mysql = require('../server/mysql_connection');
mysql = mysql.connection();

function tags_exist(name, cb){
    var query = query_factory.make_query('Get', 'tags', {'name' : name});
    mysql.query(query, function(err, rows){
        if (err) {
            cb(true, err)
        }
        else{
            if (rows[0])
                cb(false, rows[0].id);
            else
                cb(42);
        }
    });
}

function new_tag(name, cb){
    var query = query_factory.make_query('Insert', 'tags', {'name' : name});
    mysql.query(query, function(err, rows){
        if (err) {
            cb(true, err)
        }
        else{
            cb(false, rows.insertId);
        }
    });
}

function add_tag_to_user(tag, cb){
    var query = query_factory.make_query('Insert', 'users_has_tags', {users_id: tag.users_id, tags_id: tag.id});
    mysql.query(query, function(err, rows){

        if (err && err.errno == 1062)
            cb(42, '');
        else if (err) {
            console.log(err);
            cb(true, 'error when adding tag to user / ' + err)
        }
        else{
            cb(false, tag);
        }
    });
}

function delete_user_tag_relation(data, cb){
    var query = query_factory.make_query('Delete', 'users_has_tags', data);
    mysql.query(query, function(err, rows){
        if (err) {
            cb(true, 'sql error / ' + err)
        }
        else{
            cb(false, data);
        }
    });
}

function check_user_tag_rel(data, cb) {
    var query = query_factory.make_query('Get', 'users_has_tags', data);
    mysql.query(query, function(err, rows){
        if (err) {
            cb(true, 'sql error / ' + err)
        }
        else if (!rows[0]){
            cb(42);
        }
        else
            cb(false);
    });
}

function get_all_tags(data, cb) {
    //TODO:: faire un query factory pour un inner join
    mysql.query("SELECT users_id, tags_id, name AS tags_name FROM users_has_tags INNER JOIN tags WHERE users_has_tags.tags_id = tags.id AND users_id = " + data.users_id +";", function(err, rows){
        if (err) {
            cb(true, 'sql error / ' + err)
        }
        else{
            cb(false, rows);
        }
    });
}

// function get_name_from_id(tag){
//     var query = query_factory.make_query('Get', 'tags', tag.id);
//     return mysql.query(query);
// }

module.exports.delete_tag = delete_user_tag_relation;
module.exports.tags_exist = tags_exist;
module.exports.new_tag = new_tag;
module.exports.add_tag_to_user = add_tag_to_user;
module.exports.get_all_tags = get_all_tags;
module.exports.check_user_tag_rel = check_user_tag_rel;
