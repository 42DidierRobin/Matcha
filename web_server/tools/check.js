/**
 * Created by rdidier on 7/20/16.
 */

'use strict';

var crypto = require('crypto');

var daddy_map = {
    'id': {fct: checkInt},
    'users_id': {fct: checkInt},
    'tags_id': {fct: checkInt},
    'users_id_from': {fct: checkInt},
    'users_id_to': {fct: checkInt},
    'id_to_up': {fct: checkInt},
    'id_to_low': {fct: checkInt},
    'main': {fct: checkInt, data: {from: 0, to: 1}},
    'age': {fct: checkInt, data: {from: 18, to: 99}},
    'agef': {fct: checkInt, data: {from: 18, to: 99}},
    'aget': {fct: checkInt, data: {from: 18, to: 99}},
    'distf': {fct: checkInt, data: {from: 0, to: 500}},
    'distt': {fct: checkInt, data: {from: 0, to: 500}},
    'score': {fct: checkInt, data: {from: 0, to: 100}},
    'scoref': {fct: checkInt, data: {from: 0, to: 100}},
    'scoret': {fct: checkInt, data: {from: 0, to: 100}},
    'sex': {fct: isIn, data: ['M', 'F']},
    'orientation': {fct: isIn, data: ['M', 'F', 'B']},
    'type': {fct: isIn, data: ['L', 'B']},
    'notifType': {fct: isIn, data: ['1', '2', '3', '4']},
    'mail': {fct: check_mail},
    'name': {fct: checkString, data: {from: 3, to: 12}},
    'pseudo': {fct: checkString, data: {from: 3, to: 12}},
    'first_name': {fct: checkString, data: {from: 3, to: 12}},
    'last_name': {fct: checkString, data: {from: 3, to: 12}},
    'password': {fct: minSize, data: 3},
    'tag': {fct: checkString, data: {from: 1, to: 100}},
    'content': {fct: noCheck},
    'msg_content': {fct: maxString},
    'bio': {fct: maxString},
    'key': {fct: noCheck},
    'tags': {fct: checkTab, data: 5},
    'lat': {fct: checkDouble, data: {from: 0, to: 1}},
    'lng': {fct: checkDouble, data: {from: 0, to: 1}}
};

function maxString(it) {
    it = it.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\" + char;
        }
    });
    return true;
}

function minSize(it, size) {
    return (it.length > size);
}

function checkTab(tab, size) {
    return (tab.length <= size)
}

function checkDouble(it, options) {
    if (!parseFloat(it) && parseFloat(it) != 0)
        return false;
    if (options && it <= options.from && it >= options.to)
        return false;
    return true
}

function noCheck() {
    return true;
}

function checkInt(it, options) {
    if (!parseInt(it, 10) && parseInt(it, 10) != 0)
        return false;
    if (options && it <= options.from && it >= options.to)
        return false;
    return true
}

function isIn(it, tab) {
    for (var i in tab) {
        if (tab[i] == it)
            return true
    }
    return false
}

function checkString(it, data) {
    var reg = /^[a-z0-9]+$/i;
    if (reg.test(it)) {
        if (it.length < data.from || it.length > data.to)
            return false;
        return true;
    }
}

function daddy_check(listOfRequired, listOfPossible, sentData, cb) {

    var keepOn = true;
    for (var i in listOfRequired) {
        if (typeof sentData[listOfRequired[i]] == 'undefined') {
            cb(true, 'CHECK ERROR: list of required args incomplete /');
            keepOn = false;
            break;
        }
    }
    if (keepOn) {
        for (var j in sentData) {
            if (j == 'connectedId' || j == 'connectedKey' || j == 'connectedPseudo')
                continue;
            if (listOfPossible.indexOf(j) == -1) {
                cb(true, 'CHECK ERROR: args ' + j + ' not possible here /')
                keepOn = false;
                break;
            } else {
                if (!(daddy_map[j].fct)(sentData[j], daddy_map[j].data)) {
                    cb(true, 'CHECK ERROR: value of ' + j + ' is not valid /');
                    keepOn = false;
                    break;
                }
            }
        }
        if (keepOn)
            cb(false);
    }
}

function check_mail(mail) {
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(mail);
}

function mini_hash(password, salt) {
    var hash = crypto.createHmac('sha512', salt);
    /** Hashing algorithm sha512 */
    hash.update(password);
    return hash.digest('hex');
}

module.exports.check_mail = check_mail;
module.exports.mini_hash = mini_hash;
module.exports.daddy_check = daddy_check;


