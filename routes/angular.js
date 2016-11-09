"use strict";

let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
    res.render('angular', {
        title: 'Node - Express - Angular'
    });
});

module.exports = router;