"use strict";

const co = require('co');
const Users = require('../src/users');
const SocketRabbitMQ = require('../src/socket/rabbitmq.js');
const config = require('../config');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
var elasticsearch = require('elasticsearch');

// https://www.compose.com/articles/getting-started-with-elasticsearch-and-node/

/************* START WORKER  ****************/
const elasticUserIndex = "users";

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
}else {
// Listen message from RabbitMQ
//  Queue for user add
    let rabbitUserAdd = new SocketRabbitMQ({
        exchange: false,
        channel: config.amqpChannelUserAddRequest,
        acknowledgment: true
    });
// Queue for truncate
    let rabbitUserTruncate = new SocketRabbitMQ({
        exchange: false,
        channel: config.amqpChannelUserTruncateRequest,
        acknowledgment: true
    });

// Topic channel for response
    let rabbitResponseQueue = new SocketRabbitMQ({
        exchange: true,
        channel: config.amqpChannelUserResponse,
        acknowledgment: false
    });
    rabbitResponseQueue.start();

    let elasticClient = new elasticsearch.Client({
        hosts: config.elasticSearchHost
    });
    // Init elastic user index (TODO check if exists before crating)
    elasticClient.indices.create({
        index: elasticUserIndex
    },function(err,resp,status) {
        if(err) {
            //console.log(err);
        }
    });

    let users = new Users();

// ADD USER
    rabbitUserAdd.start().then(r => {
        rabbitUserAdd.consume((msg, channel, omsg) => {
            console.log(" [x] Add user received : %s", msg);
            // Ack before add, its for test
            channel.ack(omsg);
            let aMsg = JSON.parse(msg);
            if (!Array.isArray(aMsg)) {
                aMsg = [aMsg];
            }
            aMsg.forEach(user => {
                co(function *() {
                    let res = yield users.addUser(user);
                    if (res.affectedRows == 1) {
                        let insertedUser = yield users.getUser(res.insertId);

                        // add to elastic
                        elasticClient.index({
                            index: elasticUserIndex,
                            id: res.insertId,
                            type: 'user',
                            body: insertedUser
                        },function(err,resp,status) {
                            //console.log(resp);
                        });

                        // Send success message on topic channel
                        rabbitResponseQueue.send(JSON.stringify(insertedUser), config.amqpBindKeyUserAddSuccess);
                    }
                }).catch(err => {
                    console.log(err);
                    rabbitResponseQueue.send(JSON.stringify(err), config.amqpBindKeyUserError);
                });
            });
        });
    }).catch(err => {
        console.error(err);
    });

// DELETE USER
    new SocketRabbitMQ({
        exchange: false,
        channel: config.amqpChannelUserDeleteRequest,
        acknowledgment: true
    }).start().then(r => {
        r.consume((msg, channel, omsg) => {
            console.log(" [x] Delete user received : ", msg);
            channel.ack(omsg);
            JSON.parse(msg).forEach((item) => {
                users.deleteUser(item).then(res => {

                    // delete from elastic
                    elasticClient.delete({
                        index: elasticUserIndex,
                        id: res.id,
                        type: 'user'
                    },function(err,resp,status) {
                        //console.log(resp);
                    });

                    // Send success message on topic channel
                    rabbitResponseQueue.send(JSON.stringify(res), config.amqpBindKeyUserDeleteSuccess);
                }).catch(err => {
                    console.error(err);
                });
            });
        });
    }).catch(err => {
        console.error(err);
    });

// TRUNCATE USER
    rabbitUserTruncate.start().then(r => {
        rabbitUserTruncate.consume((msg, channel, omsg) => {
            console.log(" [x] Truncate user received : %s", msg);
            co(function *() {
                let res = yield users.truncateUser();
                channel.ack(omsg);

                // Send success message on topic channel
                rabbitResponseQueue.send("{success:true, message:\"Truncate success\"}", config.amqpBindKeyUserTruncateSuccess);
            }).catch(err => {
                rabbitResponseQueue.send(JSON.stringify(err), config.amqpBindKeyUserError);
            });
        });
    }).catch(err => {
        console.error(err);
    });
}