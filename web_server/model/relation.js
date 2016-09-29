/**
 * Created by rdidier on 7/19/16.
 */

var relation_dao = require('../model/relation_dao');

function Relation() {
    var id;
    var users_id_from;
    var users_id_to;
    var type;
    var creation_date;
}

Relation.prototype.maj_relation = function(data,cb){

    var follow = function() {
        relation_dao.get_relation({users_id_from: data.users_id_from, users_id_to: data.users_id_to}, function (err, d2){
            if (err == 42){
                relation_dao.new_relation(relation, cb);
            }
            else if (err)
                cb(true, 'error while checking old relation / ' + d2);
            else {
                relation_dao.del_relation(data, function (err, d3) {
                    if (err)
                        cb(true, 'error deleting old relation before adding new one /' + d3)
                    else
                        relation_dao.new_relation({users_id_from: data.users_id_from,
                            users_id_to: data.users_id_to,
                            type: data.type}, cb);
                })
            }
        })
    };

    this.users_id_from = data.users_id_from;
    this.users_id_to = data.users_id_to;
    this.type = data.type;

    var relation = this;
    var pic_dao = require('../model/picture_dao');
    if (this.type != 'B'){
        pic_dao.get_pictures({users_id: relation.users_id_from}, function (err,d) {
            if (err)
                cb(true, "error while checking if user has pictures");
            else if (!d[0])
                cb(true, "cant like some one without profile picture");
            else {
                follow();
            }
        });
    } else
        follow();

};

Relation.prototype.get_relation = function (data, cb) {

    var it = this;
    relation_dao.get_relation({users_id_from: data.users_id_from, users_id_to: data.users_id_to}, function (err, data){
        if (err == 42)
            cb (42);
        else if (err)
            cb(true, data);
        else {
            it.users_id_from = data.users_id_from;
            it.users_id_to = data.users_id_to;
            it.id = data.id;
            it.type = data.type;
            it.creation_date = data.crt_date;
            cb(false, it);
        }
    })
};


module.exports = Relation;
