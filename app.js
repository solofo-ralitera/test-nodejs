"use strict";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var app = express();

var routes = require('./routes/index');
var routeSocket = require('./routes/socket');
var routeAngular = require('./routes/angular');
var routeRedis = require('./routes/redis');
var routeRabbitMq = require('./routes/rabbitmq');
var routeRest = require('./routes/rest');

// call socket.io to the app
app.io = require('socket.io')();

app.config = require('./config');

// view engine setup
app.engine('html', require('jade').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());

app.use('/', routes);
app.use('/socket', routeSocket);
app.use('/angular', routeAngular);
app.use('/redis', routeRedis);
app.use('/rabbitmq', routeRabbitMq);
app.use('/rest', routeRest);

// start listen with socket.io
var Socket = require('./src/socket');
new Socket(app.io).start();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;