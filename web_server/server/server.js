/**
 * Created by rdidier on 6/13/16.
*/
url = '37.139.18.104';
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var router = require('./route');
var app = express();
var http = require('http').Server(app);
var node_mailer = require("nodemailer");
//--
app.use(cors());
app.use(bodyParser.json({limit: '3mb'}));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true,
    limit: '3mb'
}));
app.use(function (req, res, next){
    res.setHeader('Access-Control-Allow-Origin', 'http://'+url);
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var smtp_Transport = node_mailer.createTransport("SMTP", {
    host: url,
    port: 4203,
    // We add this setting to tell nodemailer the host isn't secure during dev:
    ignoreTLS: true
});

var send_mail = function (args, cb) {
    smtp_Transport.sendMail(args, cb);
};

//--
require ('./socket')(http);
http.listen(3042);
router.entry(app);

app.listen(4201);

module.exports.send_mail = send_mail;
