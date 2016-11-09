"use strict";

let express = require('express');
let router = express.Router();
let amqp = require('amqplib/callback_api');
let SocketRabbitMQ = require('../src/socket/rabbitmq');

const RabbitMQChanel = "demo";

/*
Adding user to remote control
 rabbitmqctl add_user test test
 rabbitmqctl set_user_tags test administrator
 rabbitmqctl set_permissions -p / test ".*" ".*" ".*"

 http://server_name:15672/
 */

router.get('/', function(req, res, next) {
    res.render('rabbitmq', {
        title: 'Node - Express - RabbitMQ',
        staticUrl : req.app.config.staticCdnUrl
    });
});

router.post('/', function(req, res, next) {
    res.send({});

    new SocketRabbitMQ({
        socketio : null,
        socket : null,
        channel : RabbitMQChanel
    }).start().then(rabbitmq => {
        return rabbitmq.send(req.body.message);
    }).then(r => {
        setTimeout(function() {
            r.stop();
        }, 100);
    }).catch(err => {
            //raf
    });
});
module.exports = router;