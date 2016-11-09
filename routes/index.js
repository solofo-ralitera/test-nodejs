"use strict";

let express = require('express');
let router = express.Router();
let users = require('../src/users');

router.get('/', function(req, res, next) {
    res.set({ 'Content-type': 'text/html; charset=utf-8' });
    res.render('index', {
        title: 'Express',
        staticUrl : req.app.config.staticCdnUrl
    });
});

module.exports = router;