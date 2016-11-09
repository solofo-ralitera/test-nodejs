"use strict";

let express = require('express');
let router = express.Router();
let users = require('../src/users');

router.get('/', function(req, res, next) {
    res.render('socket', {
        staticUrl : req.app.config.staticCdnUrl
    });
});

// Load users per page
router.get('/getuser', function(req, res, next) {
    let param = {};
    param.limit = (typeof req.query.limit !== "undefined")? req.query.limit : 50;
    param.offset = (typeof req.query.page !== "undefined")? req.query.page : 0;

    let Users = new users();
    Users.getUsers(param).then(function(users) {
        Users.destroy();
        res.status(200).send({
            status: "success",
            items : users
        });
    }).catch(err => {
        Users.destroy();
        res.status(500).send({
            status: "faillure",
            error : err
        });
    });
});

module.exports = router;