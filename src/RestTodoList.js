"use strict";

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
let config = require('../config');
let faker = require('faker');

module.exports = class RestTodoList {
    constructor() {
        // mysql db
        this.db = config.mysqlConnect();
        return this;
    }

    /**
     *
     * @returns {RestTodoList}
     */
    destroy() {
        this.db.end();
        return this;
    }

    /**
     *
     * @param user
     */
    generateToken(user) {
        return jwt.sign(user, config.tokenSecret, {
            expiresIn : "1h"
        });
    }

    getMainSqlRequest(params) {
        let sql = "SELECT * FROM todo_list WHERE 1=1";

        // Add request filter
        this.getfields().forEach((element, index, array) => {
            if (typeof params[element] != "undefined") {
                sql += " AND "+this.db.escapeId(element)+" LIKE "+ this.db.escape("%"+params[element]+"%");
            }
        });
        return sql;
    }
    /**
     *
     * @returns {boolean}
     */
    getCount(params) {
        let sql = this.getMainSqlRequest(params);
        sql = sql.replace("*", "count(*) as ct");
        return new Promise((resolve, reject) => {
            this.db.query(sql, (err, rows, fields) => {
                if (err) return reject(err);
                resolve(rows[0]["ct"]);
            });
        });
    }

    /**
     * Get all users from database
     * @returns {Promise<T>|Promise}
     */
    getItems(params, modifier) {
        params = params || {};
        modifier = (typeof modifier === 'function') ? modifier : null;
        return new Promise((resolve, reject) => {
            let sql = this.getMainSqlRequest(params);
            if(params.order) {
                sql += " ORDER BY " + params.order;
            }
            if(params.limit) {
                sql += " LIMIT " + params.limit;
                if(params.offset) {
                    sql += " OFFSET " + params.offset;
                }
            }
            this.db.query(sql, (err, rows, fields) => {
                if (err) return reject(err);
                if(modifier) {
                    rows = rows.map(modifier);
                }
                resolve(rows);
            });
        });
    }

    /**
     *
     * @param id
     * @returns {*}
     */
    getItem(id, modifier) {
        modifier = (typeof modifier === 'function') ? modifier : null;
        return new Promise((resolve, reject) => {
            this.db.query('SELECT * FROM todo_list WHERE id = ?', [id], (err, rows, fields) => {
                if (err) return reject(err);
                if(rows[0]) {
                    if(modifier) {
                        rows = rows.map(modifier);
                    }
                    resolve(rows[0]);
                }else {
                    return reject("No TODO found for " + id);
                }
            });
        });
    }

    /**
     * Add a new user
     * @param login
     * @param name
     * @returns {Promise<T>|Promise}
     */
    addItem(todo) {
        return new Promise((resolve, reject) => {
            this.db.query(
                'INSERT INTO todo_list SET ?',
                todo,
                function(err, results) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                }
            );
        });
    }

    /**
     *
     * @param todo
     * @returns {*}
     */
    updateItem(todo) {
        return new Promise((resolve, reject) => {
            if(! todo.id){
                return reject("Todo id not specified in request parameters");
            }
            this.db.query(
                'UPDATE todo_list SET ? WHERE id = ?',
                [todo, todo.id],
                function(err, results) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                }
            );
        });
    }

    /**
     *
     * @param todo
     * @returns {*}
     */
    deleteItem(todo) {
        return new Promise((resolve, reject) => {
            if(! todo.id){
                return reject("Todo id not specified in request parameters");
            }
            this.db.query(
                'DELETE FROM todo_list WHERE id = ?',
                [todo.id],
                function(err, results) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                }
            );
        });
    }

    /**
     *
     * @param request
     * @returns {{}}
     */
    getParams(request) {
        let params = {};
        if (Object.keys(request.body).length > 0) {
            params = request.body;
        } else if (Object.keys(request.params).length > 0) {
            params = request.params;
        } else if (Object.keys(request.query).length > 0) {
            params = request.query;
        }
        return params;
    }

    /**
     *
     * @returns {string[]}
     */
    getfields(){
        return ['id', 'name', 'status', 'date'];
    }

    fillWithFakeData(number) {
        return new Promise((resolve, reject) => {
            let name;
            for(let i=0; i < number; i++) {
                name = faker.name.firstName();
                this.addItem({
                    name : faker.lorem.sentence(),
                    status : 1
                });
            }
        });
    }
}