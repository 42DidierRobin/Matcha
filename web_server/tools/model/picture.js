/**
 * Created by rdidier on 7/19/16.
 */
'use strict';

var picture_dao = require('../model/picture_dao');

function Picture() {
    var id;
    var users_id;
    var main;
    var crt_date;
    var content;
};

Picture.prototype.set_new_picture = function(data, cb) {

    this.users_id = data.users_id;
    this.content = data.content;

    var current_p = this;
    picture_dao.get_pictures(current_p, function(err, data){
        if (err)
            cb(true, 'error when checking if user already have picture / ' + data);
        else if (!data.length){
            current_p.main = 1;
            picture_dao.new_picture(current_p, cb);
        }
        else if (data.length >= 5)
            cb(true, 'user already have 5 picture.');
        else {
            current_p.main = 0;
            picture_dao.new_picture(current_p, cb);
        }
    })
};

Picture.prototype.fresh_copy = function(data){

    var pic = new Picture();
    pic.id = data.id;
    pic.users_id = data.users_id;
    pic.content = data.content;
    pic.crt_date = data.crt_date;
    pic.main = data.main;
    return (pic);
};

module.exports = Picture;