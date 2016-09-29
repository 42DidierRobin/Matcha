/**
 * Created by rdidier on 6/18/16.
 */
'use strict';

var escape_string = function (str) {
    
    return '\'' + str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
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
    }) + '\'';
};

function generate_fields(object) {

    var ret = {};
    ret.items = "";
    ret.values = "";
    for ( var k in object)
    {
        if (!(typeof object[k] == 'function')) {
            ret.items += k + ',';
            if (typeof object[k] == 'string')
                ret.values += escape_string(object[k]) + ',';
            else
                ret.values += object[k] + ',';
        }
    }
    ret.items = ret.items.substring(0, ret.items.length - 1);
    ret.values = ret.values.substring(0, ret.values.length - 1);
    return ret;
}

function replace_fqm(query, arg){
    query = query.replace('?', arg);
    return query;
}

function make_conditions(data){

    var ret = '';
    var tmp;
    for (var k in data){
        if (typeof data[k] == 'string')
            tmp =  escape_string(data[k]);
        else if (typeof data[k] == 'function')
            continue;
        else
            tmp = data[k];
        ret += k + '=' + tmp + ' AND ';
    }
    ret = ret.substring(0, ret.length - 5);
    return ret;
}

function get_query_insert(table, data){
    var query = 'INSERT into ' + table +'(?) VALUES(?)';
    var split = generate_fields(data);
    query = replace_fqm(query, split.items);
    query = replace_fqm(query, split.values);
    return query;
}

function get_query_update(table, data){
    var query = 'UPDATE ' + table + ' SET ? WHERE ?';
    var set_list  = '';
    var tmp = '';
    for (var k in data.args) {
        if (typeof(data.args[k]) == 'string')
            tmp = escape_string(data.args[k]);
        else
            tmp = '\'' + data.args[k] + '\'';
        set_list += k + '=' + tmp + ', ';
    }
    set_list = set_list.substring(0, set_list.length - 2);
    query = replace_fqm(query, set_list);
    query = replace_fqm(query, 'id=' + data.id);
    return query;
}

function get_query_select(table, data, option){
    var que;
    if (Number.isInteger(data))
        que = 'SELECT * FROM ' + table + ' WHERE id=' + data;
    else {
        var conditions = make_conditions(data);
        que = 'SELECT * FROM ' + table + ' WHERE ' + conditions;
    }
    que = que + (option? ' ' + option : '');
    return (que);
}

function get_query_delete(table, data){
    if (Number.isInteger(data))
        return 'DELETE FROM ' + table + ' WHERE id=' + data;
    else {
        var conditions = make_conditions(data);
        return 'DELETE FROM ' + table + ' WHERE ' + conditions;
    }
}

function make_query_for_search_result(data){

    var from = '';
    var where1 = '';
    var where2 = '';

    if (data.tags[0]) {
        for (var k in data.tags) {
            from += 'users_has_tags as t' + k + ', ';
            where1 += '(t' + k + '.tags_id = ' + data.tags[k].id + ') AND ';
        }
        // on enleve la derniere virgule
        from = from.substring(0, from.length - 2);
        if (k > 0) {
            for (var i = 1; i <= k; i++) {
                where2 += '(t' + (i - 1) + '.users_id = t' + i + '.users_id) AND ';
            }
            //on enleve le dernier AND et on referme la parenthese
            where2 = where2.substring(0, where2.length - 5);
            where2 += ')';
        } else {
            where1 = where1.substring(0, where1.length - 5);
            where1 += ')';
        }
        return ("SELECT DISTINCT users.id, pictures.content AS mainPic, age, score, loca_lat, loca_lng "
        + "FROM users "
        + "INNER JOIN users_has_tags "
        + "ON users.id=users_has_tags.users_id "
        + "INNER JOIN pictures "
        + "ON users.id=pictures.users_id "
        + "WHERE (age >= " + data.age.from + " AND age <= " + data.age.to + ") "
        + ((data.sex != 'B')? ('AND sex=\'' + data.sex + "\' "):(''))
        + "AND (score >= " + data.score.from + " AND score <= " + data.score.to + ") "
        + "AND pictures.main = 1 "
        //TODO:: +  localisation
        + "AND users_has_tags.users_id IN (SELECT t0.users_id "
        + "FROM " + from
        + " WHERE " + where1 + where2);
    } else{
        return ("SELECT DISTINCT users.id, pictures.content AS mainPic, age, score, loca_lat, loca_lng "
        + "FROM users "
        + "INNER JOIN pictures "
        + "ON users.id=pictures.users_id "
        + "WHERE (age >= " + data.age.from + " AND age <= " + data.age.to + ") "
        + ((data.sex != 'B')? ('AND sex=\'' + data.sex + "\' "):(''))
        + "AND (score >= " + data.score.from + " AND score <= " + data.score.to + ") "
        + "AND pictures.main = 1 ");
        //TODO:: +  localisation
    }
}

function the_ultimate_query_factory_function(action, table, data, option) {

    var action_map = {
        'Insert': get_query_insert,
        'Update': get_query_update,
        'Delete': get_query_delete,
        'Get'   : get_query_select
    };
    //console.log('query constructed :');console.log(option? action_map[action](table, data, option) : action_map[action](table, data));
    return option? action_map[action](table, data, option) : action_map[action](table, data);
}

exports.make_query = the_ultimate_query_factory_function;
exports.dirty_query = make_query_for_search_result;
