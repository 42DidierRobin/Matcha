/**
 * Created by rdidier on 7/20/16.
 */

'use strict';

var crypto = require('crypto');

var random_string = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex')
        .slice(0,length);
};

module.exports.random_string = random_string;