/**
 * Created by rdidier on 6/18/16.
 */

function connection() {

    var mysql = require('mysql');

    return mysql.createConnection({
        host: url,
        user: "matcha_user",
        password: "matcha42",
        database: "matcha",
        port: 4202
    });
}

module.exports.connection = connection;