/**
 * Created by rdidier on 7/19/16.
 */

'use strict';

var message_dao = require('../model/message_dao');

function Message() {
    var id;
    var users_id_from;
    var users_id_to;
    var content;
}

Message.prototype.set_message = function(data, cb) {
    this.users_id_from = data.users_id_from;
    this.users_id_to = data.users_id_to;
    this.content = data.content;

    var mess = this;
    var relation_dao = require('../model/relation_dao');
    relation_dao.are_matched({users_id_from: this.users_id_from, users_id_to: this.users_id_to}, function(err, data){
        if (err)
            cb(true, err);
        else if (!data)
            cb(true, 'cant send a message to a non matched person');
        else {
            message_dao.new_message(mess, function(err, data){
                if (err)
                    cb(true, "error when creating new message / " + data);
                else {
                    cb(false, data);
                }
            })
        }
    })
};

Message.prototype.fresh_copy = function(ori) {

    var mess = new Message();
    mess.set_from_data(ori);
    return (mess);
};

Message.prototype.set_from_data = function(data) {

    this.id = data.id;
    this.users_id_from = data.users_id_from;
    this.users_id_to = data.users_id_to;
    this.content = data.content;
};

module.exports = Message;