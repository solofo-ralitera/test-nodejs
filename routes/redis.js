"use strict";

let express = require('express');
let router = express.Router();
var bluebird = require("bluebird");
var redis = require("redis");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

router.get('/', function(req, res, next) {
    res.render('redis', {
        title: 'Node - Express - Redis',
        staticUrl : req.app.config.staticCdnUrl
    });
});

module.exports = router;