/**
 * Created by rdidier on 7/19/16.
 */

'user strict';

var query_factory = require('../server/query_factory');
var mysql = require('../server/mysql_connection');
mysql = mysql.connection();

function new_message(mess, cb) {
    //TODO:: si on a un peu de temps : faire une fonction qui recupere la liste des variable dun objet sans ses function et la faire heriter a tous les objets
    var query = query_factory.make_query('Insert', 'messages', {users_id_from: mess.users_id_from, users_id_to: mess.users_id_to, content: mess.content });
    mysql.query(query, function(err, rows){
        if (err) {
            cb(true, err)
        }
        else{
            mess.id = rows.insertId;
            cb(false, mess);
        }
    });
}

function get_messages(data, cb) {
    //TODO:: factorise it in query factory if time..
    query = 'SELECT * FROM messages WHERE (users_id_from='+ data.users_id_from +' AND users_id_to=' + data.users_id_to + ')' +
                                        ' OR (users_id_from='+ data.users_id_to +' AND users_id_to=' + data.users_id_from + ')' + 'ORDER BY crt_date';
    mysql.query(query, function(err, rows){
        if (err) {
            cb(true, 'sql error while getting list of message / ' + err);
        }
        else{
            cb(false, rows);
        }
    });
}

exports.new_message = new_message;
exports.get_messages = get_messages;

