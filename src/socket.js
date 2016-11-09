"use strict";

let redis = require("redis");
// Use bluebird to promisify redis function
let bluebird = require("bluebird");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

let SocketRedis = require('./socket/redis');
let SocketUser = require('./socket/user');
let SocketRabbitMQ = require('./socket/rabbitmq');
let SocketRest = require('./socket/rest');

const RedisChanel = "demo";

module.exports = class Socket {

    constructor(socketio) {
        this.socketio = socketio;
        return this;
    }

    /**
     * Manage socket events
     * @returns {Socket}
     */
    start() {
        this.socketio.on('connection', (socket) => {
            this.socketio.sockets.emit('newconnection', []);

            // redis pub/sub (Redis menu)
            let redis = new SocketRedis({
                socketio : this.socketio,
                socket : socket,
                channel : RedisChanel
            }).start();

            // Mysql user
            let user = new SocketUser({
                socketio : this.socketio,
                socket : socket
            }).start();

            // RabbitMQ
            let rabbitmq = new SocketRabbitMQ({
                socketio : this.socketio,
                socket : socket,
                exchange : true,
                channel : RedisChanel
            });
            rabbitmq.start().then((r) => {
                r.consume();
            });

            // Rest - todolist
            let todolist = new SocketRest({
                socketio : this.socketio,
                socket : socket
            }).start();

            socket.on('disconnect', () => {
                redis.stop();
                user.stop();
                rabbitmq.stop();
                todolist.stop();
            });

        });
        return this;
    }
}