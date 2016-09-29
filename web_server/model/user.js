/**
 * Created by rdidier on 6/18/16.
 */
'use strict';


var user_dao = require('../model/user_dao');
var check = require('../tools/check');
var key = require('../tools/key');

function User() {
    var id;
    var pseudo;
    var age;
    var first_name;
    var last_name;
    var mail;
    var password;
    var sex;
    var orientation;
};

User.prototype.define_user = function (args, cb) {

    this.first_name = args.first_name;
    this.last_name = args.last_name;
    this.mail = args.mail;
    this.pseudo = args.pseudo;
    this.loca_lng = args.loca_lng;
    this.loca_lat = args.loca_lat;
    this.salt = key.random_string(16);
    this.password = check.mini_hash(args.password, this.salt);
    this.sex = args.sex ? args.sex : 'M';
    this.orientation = args.orientation ? args.orientation : 'B';
    if (check.check_mail(this.mail))
        user_dao.new_user(this, cb);
    else
        cb(true, 'email invalid');
};

User.prototype.set_by_id = function (id, cb) {
    var self = this;
    user_dao.get_by_id(id, function (err, data) {
        if (err)
            cb(true, err);
        else {
            for (var k in data) {
                self[k] = data[k]
            }
            cb(false);
        }
    });
};

User.prototype.set_by_pseudo = function (pseudo, cb) {
    var self = this;
    user_dao.get_by_pseudo(pseudo, function (err, data) {
        if (err)
            cb(true, data);
        else {
            for (var k in data) {
                self[k] = data[k]
            }
            cb(false, self);
        }
    });
};

User.prototype.set_by_mail = function (mail, cb) {
    var self = this;
    user_dao.get_by_mail(mail, function (err, data) {
        if (err)
            cb(true, data);
        else {
            for (var k in data) {
                self[k] = data[k]
            }
            cb(false, self);
        }
    });
};

User.prototype.change_values = function (args, cb) {
    //le premier argument ID nest pas un parametre a change
    delete args["id"];
    for (var k in args) {
        this[k] = args[k];
    }
    if (args["mail"]) {
        args.mail_verif = require('../tools/key').random_string(16);
        var pseudo = this.pseudo;
        user_dao.change_values(this, args, function (err, data) {
            if (err)
                cb(true, 'error when changing value in user / ' + data);
            else {
                require('../server/server').send_mail({
                    to: args.mail,
                    subject: "match confirm mail",
                    text: "You recently changed your email adresse. Please confirm it with the following link : " +
                    'http://164.132.103.226:4201/User/mail_confirm?pseudo=' + pseudo + '&key=' + args.mail_verif
                }, function(err){
                    if (err)
                        cb(true, 'error sending email / ' + err);
                    else
                        cb(false, 'email sent');
                })
            }
        });
    }
    else {
        user_dao.change_values(this, args, function (err, data) {
            if (err)
                cb(true, 'error when changing value in user / ' + data);
            else
                cb(false, 'user changed correctly');
        });
    }
};

User.prototype.generate_confirm_mail = function () {
    return ({
        to: this.mail,
        subject: 'Matcha subscribe confirm',
        text: 'Welcome to Matcha ! To confirm your inscription, please click on the link following : ' +
        'http://'+url+'/connection/' + this.pseudo + '/' + this.mail_verif
    })
};

module.exports = User;