"use strict";

let redis = require("redis");
// Use bluebird to promisify redis function
let bluebird = require("bluebird");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var config = require("../../config");

module.exports = class Socket_Redis {

    constructor(opt) {
        this.socketio = opt.socketio;
        this.socket = opt.socket;
        this.channel = opt.channel;
        return this;
    }

    /**
     * Create all event
     * @returns {Socket_Redis}
     */
    start() {
        // redis pub/sub (Redis menu)
        this.redisClient = redis.createClient({
            host : config.redisHost,
            port : config.redisPort
        });
        this.redisClientSub = redis.createClient({
            host : config.redisHost,
            port : config.redisPort
        });
        this.redisClientPub = redis.createClient({
            host : config.redisHost,
            port : config.redisPort
        });
        
        this.redisClient.on("error", (err) => {
            this.socket.emit('redis-channel-error', err);
        });
        this.redisClientSub.on("error", (err) => {});
        this.redisClientPub.on("error", (err) => {});

        this.redisClientSub.on("subscribe", (channel, count) => {
            this.socket.emit('redis-channel-subscribe', {
                channel : channel,
                count : count
            });
        });

        this.redisClientSub.on("message", (channel, message) => {
            // Get key value using bluebird, not the channet demo
            this.redisClient.getAsync('demo').then(function(res) {
                //console.log(res);
            });
            this.socket.emit('redis-channel-message', {
                channel : channel,
                message : message
            });
        });

        this.socket.on('redis-channel-publish', (data) => {
            this.redisClientPub.publish(data.channel, data.message);
        });

        this.redisClientSub.subscribe(this.channel);

        return this;
    }

    /**
     * Quit all redis connection
     * @returns {Socket_Redis}
     */
    stop() {
        this.redisClient.quit();
        this.redisClientSub.quit();
        this.redisClientPub.quit();
        return this;
    }
}