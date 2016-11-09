"use strict";

var amqp = require('amqplib/callback_api');
var config = require("../../config");

module.exports = class Socket_Rabbitmq {

    constructor(opt) {
        this.socketio = (typeof opt.socketio !== 'undefined') ?  opt.socketio : null;
        this.socket = (typeof opt.socket !== 'undefined') ?  opt.socket : null;
        this.channelName = (typeof opt.channel !== 'undefined') ?  opt.channel : null;
        this.exchange = (typeof opt.exchange !== 'undefined') ?  opt.exchange : true;
        this.acknowledgment = (typeof opt.acknowledgment !== 'undefined') ?  opt.acknowledgment : false;
        return this;
    }

    /**
     *
     * @returns {Promise<T>|Promise}
     */
    start() {
        if(this.socket) {
            this.socket.on('rabbitmq-channel-publish', (data) => {
                data.bindKey = data.bindKey || "";
                this.send(data.message, data.bindKey);
            });
        }
        // Pick randomly a node on which to connect
        let url = config.amqpUrl;
        if(Array.isArray(config.amqpUrl)) {
            url = config.amqpUrl[Math.floor(Math.random()*config.amqpUrl.length)];
        }
        return new Promise((resolve, reject) => {
            amqp.connect(url, (err, conn) => {
                if (err) {
                    if(this.socket) {
                        this.socket.emit('rabbitmq-channel-error', {
                            channel : this.channelName,
                            error : err
                        });
                    }
                    return reject(err);
                }
                this.conn = conn;
                this.conn.createChannel((err, channel) => {
                    if (err) {
                        console.error(err);
                    }
                    this.channel = channel;
                    if (this.exchange) {
                        //create an exchange of fanout type
                        this.channel.assertExchange(
                            this.channelName,
                            'topic', //'direct', //'fanout',
                            {
                                durable: false
                            }
                        );
                    } else {
                        //declare the queue from which we're going to consume
                        // used for worker queue
                         this.channel.assertQueue(this.channelName, {
                             durable: false
                         });
                    }

                    resolve(this);
                });
            });
        });
    }

    /**
     *
     * @param message
     * @returns {Promise<T>|Promise}
     */
    send(message, bindingKey) {
        if (this.exchange) {
            return this.sendToExchange(message, bindingKey);
        } else {
            return this.sendToQueue(message);
        }
    }

    /**
     *
     * @param message
     * @returns {Promise<T>|Promise}
     */
    sendToQueue(message) {
        // Sending message
        return new Promise((resolve, reject) => {
            this.channel.sendToQueue(this.channelName, Buffer.from(message), {
                persistent: false
            });
            resolve(this);
        });
    }

    /**
     *
     * @param message
     * @returns {Promise<T>|Promise}
     */
    sendToExchange(message, bindingKey) {
        bindingKey = bindingKey || "";
        // Sending message
        return new Promise((resolve, reject) => {
            this.channel.publish(this.channelName, bindingKey, Buffer.from(message));
            resolve(this);
        });
    }

    consume(callback, bindingKey) {
        if (this.exchange) {
            return this.consumeExchange(callback, bindingKey);
        } else {
            return this.consumeQueue(callback);
        }
    }

    consumeChannel(channelName, callback) {
        this.channel.consume(channelName, (msg) => {
            if(callback && typeof callback == "function") {
                callback(msg.content.toString(), this.channel, msg);
            }
            if(this.socket && msg) {
                this.socket.emit('rabbitmq-channel-message', {
                    channel : channelName,
                    message : msg.content.toString()
                });
            }
            //console.log(" [x] Received %s", msg.content.toString());
        }, {
            noAck: ! this.acknowledgment
        });
        return this;
    }

    /**
     * Consuming queue message
     */
    consumeQueue(callback){
        callback = callback  || null;
        this.consumeChannel(this.channelName, callback);
        return this;
    }

    consumeExchange(callback, bindingKey){
        bindingKey = bindingKey ||"";
        this.channel.assertQueue('', {exclusive: true}, (err, q) => {
            this.channel.bindQueue(q.queue, this.channelName, bindingKey);
            this.consumeChannel(q.queue, callback);
            if(this.socket) {
                this.socket.emit('rabbitmq-channel-binding', {
                    channel: this.channelName,
                    binding: bindingKey
                });
            }
        });
        return this;
    }

    /**
     *
     * @returns {Socket_Rabbitmq}
     */
    stop() {
        if(this.conn) {
            this.conn.close();
        }
        return this;
    }
}