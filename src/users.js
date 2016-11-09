"use strict";

let config = require('../config');
let faker = require('faker');

module.exports = class Users {
    constructor() {
        // mysql db
        this.db = config.mysqlConnect();
    }

    destroy() {
        this.db.end();
    }

    /**
     * Get all users from database
     * @returns {Promise<T>|Promise}
     */
    getUsers(params) {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * from user";
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
                resolve(rows);
            });
        });
    }

    /**
     * Get all users from database
     * @returns {Promise<T>|Promise}
     */
    getUser(id) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT * from user WHERE id = ?', [id], (err, rows, fields) => {
                if (err) return reject(err);
                if(rows[0]) {
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
    addUser(user) {
        return new Promise((resolve, reject) => {
            user.login = user.login || user.name.toLowerCase().replace(" ", ".");
            user.avatar = user.avatar || faker.image.avatar();
            user.email = user.email || faker.internet.email().replace(/^.+(@)/, user.login.replace(/[^0-9a-z\.\-_]/i, ".") + "$1");
            user.phone = user.phone || faker.phone.phoneNumber();
            user.job = user.job || faker.name.jobDescriptor() + " - " + faker.name.jobArea() + " - " + faker.name.jobType();
            this.db.query(
                'INSERT INTO user SET ?',
                user,
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
     * @param id
     * @returns {boolean}
     */
    deleteUser(id) {
        return new Promise((resolve, reject) => {
            this.db.query(
                'DELETE FROM user WHERE id = ?',
                [id],
                function(err, results) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({id:id});
                }
            );
        });
    }

    truncateUser() {
        return new Promise((resolve, reject) => {
            this.db.query(
                'TRUNCATE user',
                function(err, results) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                }
            );
        });
    }

    fillWithFakeData(number) {
        return new Promise((resolve, reject) => {
            let name;
            for(let i=0; i < number; i++) {
                name = faker.name.firstName();
                this.addUser({
                    login: name.toLowerCase(),
                    name: name + " " + faker.name.lastName()
                });
            }
        });
    }
}