"use strict";

let redis = require("redis");
// Use bluebird to promisify redis function
let bluebird = require("bluebird");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

let RestTodoList = require('../RestTodoList');

module.exports = class Socket_Rest {

    constructor(opt) {
        this.socketio = opt.socketio;
        this.socket = opt.socket;
        this.TodoList = new RestTodoList();
        return this;
    }

    /**
     * Create all event
     * @returns {Socket_Redis}
     */
    start() {
        /*
        this.socket.emit('redis-channel-message', {
            channel : channel,
            message : message
        });
        */
        this.socket.on('rest-generatetoken', (user) => {
            this.socket.emit('rest-generatetoken', {
                token : this.TodoList.generateToken(user)
            });
        });

        return this;
    }

    /**
     * Quit all redis connection
     * @returns {Socket_Redis}
     */
    stop() {
        this.TodoList.destroy();
        return this;
    }
}