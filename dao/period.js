"use strict";
const logger = require("../lib/debug.js").logger;
const dbUtils = require("../lib/db-utils.js");

class Period {
    constructor(id, name, date_start, date_end) {
        this._id = id ? id : -1;
        this._name = name ? name : "";
        this._date_start = isNaN(date_start) ? 0 : Number.parseInt(date_start);
        this._date_end = isNaN(date_end) ? 0 : Number.parseInt(date_end);
    };
    get id()            { return this._id; }
    get name()          { return this._name; }
    get date_start()    { return this._date_start; }
    get date_end()      { return this._date_end; }
    set id(v)           { this._id = v; }
    set name(v)         { this._name = v; }
    set date_start(v)   { this._date_start = v; }
    set date_end(v)     { this._date_end = v; }
}
exports.Period = Period;


exports.add = function(db, period) {
    logger.trace("Period DAO - Add:");
    logger.trace(period);
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO period (" +
            "   period_name, " +
            "   period_date_start, " +
            "   period_date_end) VALUES (?, ?, ?)",
            period.name,
            period.date_start,
            period.date_end,
            function (err) {
                if (err) {
                    logger.error(err);
                    reject(err);
                }
                else {
                    period.id = this.lastID;
                    resolve(this.lastID);
                }
            }
        );
    });
};


exports.get = function (db, id) {
    logger.trace("Period DAO - get: " + id);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM period " +
            "WHERE period_id = ?",
            id,
            function (err, row) {
                if (err) {
                    logger.error(err);
                    reject(err);
                }
                else {
                    resolve(dbUtils.stripDatabasePrefix(row));
                }
            }
        );
    });
};


exports.listAll = function(db) {
    logger.trace("Period DAO - listAll");
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM period",
            function (err, rows) {
                if (err) {
                    logger.error(this);
                    reject(err);
                }
                else {
                    resolve(dbUtils.stripDatabasePrefix(rows));
                }
            }
        );
    });
};


exports.remove  = function (db, id) {
    logger.trace("Period DAO - remove: " + id);
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM period " +
            "WHERE period_id = ?",
            id,
            function (err, rows) {
                if (err) {
                    logger.error(err);
                    reject(err);
                }
                else {
                    resolve(dbUtils.stripDatabasePrefix(rows));
                }
            }
        );
    });
};


exports.removeAll = function (db) {
    logger.trace("Period DAO - removeAll");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM period",
            function (err, rows) {
                if (err) {
                    logger.error(err);
                    reject(err);
                }
                else {
                    resolve(dbUtils.stripDatabasePrefix(rows));
                }
            }
        );
    });
};


exports.update = function(db, period) {
    logger.trace("Period DAO - update:");
    logger.trace(period);
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE period SET          " +
            "   period_name = ?,        " +
            "   period_date_start = ?,  " +
            "   period_date_end = ?    " +
            "WHERE period_id = ?",
            period.name,
            period.date_start,
            period.date_end,
            period.id,
            function (err, row) {
                if (err) {
                    logger.error(err);
                    reject(err);
                }
                else {
                    resolve(dbUtils.stripDatabasePrefix(row));
                }
            }
        );
    });
};