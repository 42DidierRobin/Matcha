/**
 * Created by rdidier on 9/1/16.
 */

var requester = angular.module('requester', []);

requester.service('sender', function ($http, $cookies) {

    function error(data) {
       // console.log("Error send from the server: " + data);
        alert("Error send from the server: " + data);
    }

    middleware = function (data) {
        var cookie = $cookies.getObject("user");
        if (cookie) {
            data.connectedKey = cookie.cookie_key;
            data.connectedPseudo = cookie.pseudo;
            data.connectedId = cookie.id;
        }
        return (data);
    };

    this.post = function (route, data, cb) {
        data = middleware(data);
        $http({
            method: 'POST',
            url: api + route,
            data: data
        }).success(function (data) {
            if (data.error && !Number.isInteger(data.error))
                error(data.content);
            else
                cb(data);
        })
    };

    this.get = function (route, data, cb) {
        data = middleware(data);
        $http({
            method: 'GET',
            url: api + route,
            params: data
        }).success(function (data) {
            if (data.error && !Number.isInteger(data.error))
                error(data.content);
            else
                cb(data);
        })
    };

    this.delete = function (route, data, cb) {
        data = middleware(data);
        $http({
            method: 'DELETE',
            url: api + route,
            params: data
        }).success(function (data) {
            if (data.error && !Number.isInteger(data.error))
                error(data.content);
            else {
                cb(data);
            }
        })
    };

    this.put = function (route, data, cb) {
        data = middleware(data);
        $http({
            method: 'PUT',
            url: api + route,
            data: data
        }).success(function (data) {
            if (data.error && !Number.isInteger(data.error))
                error(data.content);
            else
                cb(data);
        })
    };

    this.locate = function(cb) {
        $http({
            method: 'GET',
            url: 'http://ip-api.com/json/?fields=lat,lon'
        }).success(cb);
    }


});
