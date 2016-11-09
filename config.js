module.exports = {
    // Mysql config
    mysqlHost : "192.168.33.78",
    mysqlUser : "root",
    mysqlPassword : "root",
    mysqlName : "test",
    mysqlConnect : function() {
        // mysql db
        let db = require('mysql').createConnection({
            host     : this.mysqlHost,
            user     : this.mysqlUser,
            password : this.mysqlPassword,
            database : this.mysqlName
        });
        db.connect();
        db.query("SET NAMES 'utf8'");
        return db;
    },

    // CDN url for static resources
    staticCdnUrl : "http://192.168.33.78/nodejs/test-nodeexpress1/public",

    // Redis config
    redisHost : "192.168.33.10",
    redisPort : 6379,

    // Elastic search
    elasticSearchHost : ["http://192.168.33.10:9200", "http://192.168.33.11:9200"],

    // RabbitMQ config (list of node cluster)
    amqpUrl : ["amqp://192.168.33.10", "amqp://192.168.33.11"],
        // work queue param
    amqpChannelUserAddRequest : "user.add.request",
    amqpChannelUserTruncateRequest : "user.truncate.request",
    amqpChannelUserDeleteRequest : "user.delete.request",
        // topic response param
    amqpChannelUserResponse : "user.response",
    amqpBindKeyUserAddSuccess : "user.add.success",
    amqpBindKeyUserTruncateSuccess : "user.truncate.success",
    amqpBindKeyUserDeleteSuccess : "user.delete.success",
    amqpBindKeyUserError : "user.response.error",

    // Token key for jsonwebtoken
    tokenSecret : "mynameisbond"
}