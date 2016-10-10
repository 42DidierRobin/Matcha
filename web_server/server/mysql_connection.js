/**
 * Created by rdidier on 6/18/16.
 */

function connection(multiple) {

    var mysql = require('mysql');

    if (multiple){
        return mysql.createConnection({
            host: url,
            user: "matcha",
            password: "matcha",
            database: "matcha",
            port: 4202,
            multipleStatements: true
        });
    }

    return mysql.createConnection({
        host: url,
        user: "matcha",
        password: "matcha",
        database: "matcha",
        port: 4202
    });
}

module.exports.connection = connection;
