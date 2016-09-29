/**
 * Created by rdidier on 7/16/16.
 */

'use strict';

var tags_dao = require('../model/tags_dao');

function Tags() {
    var id;
    var users_id;
    var name;
}

Tags.prototype.sync_tags = function (data, cb) {

    this.name = data.tag;
    this.users_id = data.user;
    var current_tag = this;

    tags_dao.tags_exist(this.name, function (err, data) {
        if (err && err != 42)
            cb(true, 'err when checking if tags exist /' + data);
        else if (data) {
            console.log('already existing tag:' + data);
            current_tag.id = data;
            tags_dao.add_tag_to_user(current_tag, cb);
        }
        else {
            tags_dao.new_tag(current_tag.name, function (err, data) {
                if (err)
                    cb(true, 'error when creating new tag /' + data);
                else {
                    current_tag.id = data;
                    tags_dao.add_tag_to_user(current_tag, cb);
                }
            });
        }
    });
};

Tags.prototype.set_from_data = function(data){
    this.id = data.tags_id;
    this.users_id = data.users_id;
    this.name = data.tags_name;
};

Tags.prototype.fresh_copy = function() {
    var new_tag = new Tags();
    new_tag.id = this.id;
    new_tag.users_id = this.users_id;
    new_tag.name = this.name;
    return (new_tag);
};

module.exports = Tags;