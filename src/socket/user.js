"use strict";

let co = require('co');
let Users = require('../users');
let SocketRabbitMQ = require('./rabbitmq.js');
let faker = require('faker');
let config = require('../../config');

module.exports = class Socket_Users {

    constructor(opt) {
        this.socketio = opt.socketio;
        this.socket = opt.socket;
        this.users = new Users();
        return this;
    }

    /**
     * Create all event
     * @returns {Socket_Redis}
     */
    start() {
        // Channel used to listen response (topic queue)
        // Listen to exchange response
        // Listen to all user bind key user.*.*
        new SocketRabbitMQ({
            exchange : true,
            channel : config.amqpChannelUserResponse,
            acknowledgment : false
        }).start().then(rabbitMqResponse => {
            rabbitMqResponse.consume((msg, channel, omsg) => {
                co((function *() {
                    // Error
                    if(omsg.fields.routingKey == config.amqpBindKeyUserError) {
                        this.socket.emit('user-addconcact-error', JSON.parse(msg));
                    }
                    // Truncate bind success
                    else if(omsg.fields.routingKey == config.amqpBindKeyUserTruncateSuccess) {
                        // Send informations to socket
                        this.socket.emit('user-truncate-success', {});
                    }
                    // Add bind success
                    else if(omsg.fields.routingKey == config.amqpBindKeyUserAddSuccess) {
                        // Send informations to socket
                        this.socket.emit('user-addconcact-success', JSON.parse(msg));
                    }
                    // Delete success
                    else if(omsg.fields.routingKey == config.amqpBindKeyUserDeleteSuccess) {
                        // Send informations to socket
                        this.socket.emit('user-removeconcact-success', JSON.parse(msg));
                    }
                }).bind(this)).catch(err => {
                    console.error(err);
                });
            }, "user.*.*");
        }).catch(err => {
            console.error(err);
        });

        // Send instructions to work queue
        this.socket.on('user-worker-queue', data => {
            // Chain commandes (separator : then )
            data.name.split(" then ").forEach(cmd => {
                // truncate table instruction
                if (/^truncate$/i.test(cmd)) {
                    return this.sendInstruction(config.amqpChannelUserTruncateRequest, "request truncate");
                }
                // Add random user message instruction
                else if (/^random [0-9]+$/i.test(cmd)) {
                    let promises = [];
                    let num = parseInt(cmd.replace(/[^0-9]/g, ""));
                    let aUsers = [];
                    for (let i = 1; i <= num; i++) {
                        aUsers.push({name: faker.name.findName()});
                        // Send instruction each 250 added
                        if(i % 250 == 0) {
                            promises.push(this.sendInstruction(config.amqpChannelUserAddRequest, aUsers));
                            aUsers = [];
                        }
                    }
                    // Send last users
                    promises.push(this.sendInstruction(config.amqpChannelUserAddRequest, aUsers));
                    return Promise.all(promises);
                }
                // Delete a liste of users
                else if (/^(delete|remove) [0-9]+(\-[0-9]+)*$/i.test(cmd)) {
                    let range = cmd.split(" ")[1].split("-");
                    if(Array.isArray(range)) {
                        let iRange = range.map(id => { return parseInt(id); });
                        if(iRange.length == 1) iRange.push(iRange[0]);
                        iRange = iRange.sort((a,b)=>a-b);
                        let toRemove = [];
                        let promises = [];
                        for(let i=iRange[0]; i <= iRange[1]; i++) {
                            // Send instruction each 250 removed
                            if(i % 250 == 0) {
                                promises.push(this.sendInstruction(config.amqpChannelUserDeleteRequest, toRemove));
                                toRemove = [];
                            }
                            toRemove.push(i);
                        }
                        // Remove last users
                        promises.push(this.sendInstruction(config.amqpChannelUserDeleteRequest, toRemove));
                        return Promise.all(promises);
                    }
                }
                // Add single user message
                else {
                    return this.sendInstruction(config.amqpChannelUserAddRequest, {name: cmd});
                }
            });
        });

        // Send remove instruction to worker queue
        this.socket.on('user-removeconcact-queue', data => {
            this.sendInstruction(config.amqpChannelUserDeleteRequest, data);
        });

        // add new user directly in mysql (Socket menu)
        this.socket.on('user-addconcact-mysql', data => {
            this.addUserFromMessage()({name : data.name, login : data.name}).catch(err => {
                console.error(err);
                this.socketio.sockets.emit('user-addconcact-error', err);
            });
        });

        // Remove single user send with socket
        this.socket.on('user-removeconcact-mysql', data => {
            this.users.deleteUser(data.id).then(res => {
                this.socketio.sockets.emit('user-removeconcact-success', res);
            }).catch(err => {
                this.socketio.sockets.emit('user-removeconcact-error', err);
            });
        });

        this.socket.on('disconnect', () => {

        });
        return this;
    }

    /**
     * Quit all redis connection
     * @returns {Socket_Redis}
     */
    stop() {
        this.users.destroy();
        return this;
    }

    addUserFromMessage() {
        return co.wrap((function *(data) {
            let res = yield this.users.addUser(data);
            if(res.affectedRows == 1) {
                let insertedUser = yield this.users.getUser(res.insertId);
                this.socketio.sockets.emit('user-addconcact-success', Object.assign(
                    insertedUser,
                    {type : 'newuser'}
                ));
            }
        }).bind(this));
    }

    /**
     * Send instruction message to the rabbit
     * @param channel
     * @param data
     * @returns {boolean}
     */
    sendInstruction(channel, data) {
        if(Array.isArray(data) && data.length == 0) return true;
        return new SocketRabbitMQ({
            exchange : false,
            channel : channel,
            acknowledgment : true
        }).start().then(r => {
            return r.send(JSON.stringify(data));
        }).then(r => {
            setTimeout(function() {
                r.stop();
            }, 100);
        }).catch(err => {
            console.error(err);
        });
    }
}