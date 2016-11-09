"use strict";

let express = require('express');
let router = express.Router();
let TodoList = require('../src/RestTodoList');
let jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
let co = require('co');
let config = require("../config");

/*
 https://www.tutorialspoint.com/nodejs/nodejs_restful_api.htm
 https://codeforgeek.com/2015/03/restful-api-node-and-express-4/
 http://www.yogasaikrishna.com/simple-restful-api-using-nodejs-express-and-mysql/
 http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api

 Header status
    http://www.ibm.com/support/knowledgecenter/SSQP76_8.8.1/com.ibm.odm.itoa.ref/topics/ref_rest_headers_codes.html
    http://www.restapitutorial.com/httpstatuscodes.html
Authentication
    https://devdactic.com/restful-api-user-authentication-1/
    https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens
Link
     https://spring.io/understanding/HATEOAS
     http://stateless.co/hal_specification.html
     http://www.iana.org/assignments/link-relations/link-relations.xml
     https://tools.ietf.org/html/rfc5988
Pagination
    https://developer.atlassian.com/confdev/confluence-server-rest-api/pagination-in-the-rest-api

 Api	        Type	Description
 /todo/	        GET
 /todo/	        POST
 /todo/	        PUT
 /todo/:id/	    DELETE
 */

const STATUS_FAILURE = 0;
const STATUS_SUCCESS = 1;
const DEFAULT_NUMPAGE = 10;

let routerUpdateItem = function(Todo, req, res) {
    let todoParam = Todo.getParams(req);

    co(function *() {
        let result = yield Todo.updateItem(todoParam);
        let item = yield Todo.getItem(todoParam.id, formatTodo.bind(null, req));

        Todo.destroy();
        res.status(200).send({
            status: STATUS_SUCCESS,
            links:[
                {rel: "self",href: getUrl(req)}
            ],
            message: 'TODO updated successfully',
            item : item,
            _results : result
        });
    }).catch(err => {
        Todo.destroy();
        res.status(400).send({
            status: STATUS_FAILURE,
            message: 'TODO update failed',
            error : err
        });
    });
};

let getUrl = function (req) {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
};

let formatTodo = function (req, todo) {
    if(! todo.links) {
        todo.links = [
            {rel : "self",href: req.protocol + '://' + req.get('host') + "/rest/todo/" + todo.id},
            {rel : "up",href: req.protocol + '://' + req.get('host') + "/rest/todos/"}
        ];
    }
    return todo;
};

let formatLink = function (req, response) {
    if (typeof req.query.limit == "undefined") {
        req.query.limit = response.limit;
    }
    if (typeof req.query.offset == "undefined") {
        req.query.offset = response.start;
    }

    // Prev/Next links
    response.limit = parseInt(req.query.limit);
    response.start = parseInt(req.query.offset);

    response.links[1].href = getUrl(req).replace(/limit=[0-9]+/, "limit=" + response.limit);
    response.links[1].href = getUrl(req).replace(/offset=[0-9]+/, "offset=" + Math.max(0, response.start - response.limit));

    response.links[2].href = getUrl(req).replace(/limit=[0-9]+/, "limit=" + response.limit);
    response.links[2].href = getUrl(req).replace(/offset=[0-9]+/, "offset=" + (response.start + response.limit));

    response.links[3].href = req.protocol + '://' + req.get('host') + "/rest/todos/?limit=" + DEFAULT_NUMPAGE + "&offset=0";
    response.links[4].href = req.protocol + '://' + req.get('host') + "/rest/todos/?limit=" + DEFAULT_NUMPAGE + "&offset=" + Math.max(0, response.total - DEFAULT_NUMPAGE);

    // no prev if offset = 0
    if (req.query.offset == 0) {
        response.links[1].href = "#";
    }

    // no next if start exceeds total
    let offsetNext = response.start + response.limit;
    if (offsetNext > response.total) {
        response.links[2].href = "#";
    }
    return response;
};

// Route order is important
// Add protected route after the middleware
router.get('/', function(req, res, next) {
    let Todo = new TodoList();
    res.render('rest', {
        title: 'Node - Express - Rest',
        token : Todo.generateToken({
            name : "demo"
        }),
        fields : Todo.getfields(),
        staticUrl : req.app.config.staticCdnUrl
    });
});

router.get('/todos', function(req, res, next) {
    let Todo = new TodoList();
    Promise.all([
        Todo.getItems(req.query, formatTodo.bind(null, req)),
        Todo.getCount(req.query)
    ]).then(([todos, count]) => {
        Todo.destroy();
        let response = formatLink(req, {
            status: STATUS_SUCCESS,
            links: [
                {rel: "self", href: getUrl(req)},
                {rel: "prev", href: "#"},
                {rel: "next", href: "#"},
                {rel: "first", href: "#"},
                {rel: "last", href: "#"}
            ],
            start: 0,
            limit: count,
            count: todos.length,
            total: count,
            items: todos
        });
        res.status(200).send(response);
    }).catch(err => {
        Todo.destroy();
        res.status(500).send({
            status: STATUS_FAILURE,
            message: 'TODO get failed',
            error : err
        });
    });
});

router.get('/todo/:id', function(req, res, next) {
    let Todo = new TodoList();
    co(function *() {
        let item = yield Todo.getItem(req.params.id, formatTodo.bind(null, req));
        Todo.destroy();
        res.status(200).send({
            status: STATUS_SUCCESS,
            item : item
        });
    }).catch(err => {
        Todo.destroy();
        res.status(404).send({
            status: STATUS_FAILURE,
            message: 'TODO get failed',
            error : err
        });
    });
});

// Middleware check token
// Route defined after this are protected
router.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.params.token || req.headers['x-access-token'] || req.headers.authorization;

    // remove token if passed in params
    if(req.body.token) {
        delete req.body.token;
    }

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.tokenSecret, function(err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: STATUS_FAILURE,
                    message: "Failed to authenticate token",
                    err : err
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: STATUS_FAILURE,
            message: "No token provided"
        });
    }
});

router.post('/todo', function(req, res, next) {
    let Todo = new TodoList();
    co(function *() {
        let result = yield Todo.addItem(Todo.getParams(req));
        let item = yield Todo.getItem(result.insertId);
        Todo.destroy();
        res.status(201).send({
            status: STATUS_SUCCESS,
            links:[
                {rel: "self",href: getUrl(req)}
            ],
            message: 'TODO created successfully',
            item : item
        });
    }).catch(err => {
        Todo.destroy();
        res.status(500).send({
            status: STATUS_FAILURE,
            message: 'TODO creation failed',
            error : err
        });
    });
});

router.put('/todo', function(req, res, next) {
    let Todo = new TodoList();
    let params = Todo.getParams(req);
    Todo.getfields().forEach((element, index, array) => {
        if (typeof params[element] == "undefined") {
            return res.status(400).send({
                status: STATUS_FAILURE,
                message: "TODO update failed",
                error : "Request parameters not complete, use patch instead"
            });
        }
    });
    return routerUpdateItem(Todo, req, res);
});

router.patch('/todo', function(req, res, next) {
    return routerUpdateItem(new TodoList(), req, res);
});

router.delete('/todo', function(req, res, next) {
    let Todo = new TodoList();
    Todo.deleteItem(Todo.getParams(req)).then(results => {
        Todo.destroy();
        res.status(200).send({ //200
            status: STATUS_SUCCESS,
            links:[
                {rel: "self",href: getUrl(req)}
            ],
            message: 'TODO deleted successfully',
            _results : results
        });
    }).catch(err => {
        Todo.destroy();
        res.status(409).send({
            status: STATUS_FAILURE,
            message: 'TODO delete failed',
            error : err
        });
    });
});

module.exports = router;