"use strict";
const logger  = require("../lib/debug.js").logger;
const dbUtils = require("../lib/db-utils.js");
const _      = require('lodash');
const pad     = require("pad-number");

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

const table_name = "period";

class Period {
    constructor(id, name, date_start, date_end) {
        this._id         = id ? id : -1;
        this._name       = name ? name : "";
        this._date_start = isNaN(date_start) ? 0 : Number.parseInt(date_start);
        this._date_end   = isNaN(date_end) ? 0 : Number.parseInt(date_end);
    };

    get id()            { return this._id; }
    get name()          { return this._name; }
    get date_start()    { return this._date_start; }
    get date_end()      { return this._date_end; }
    set id(v)           { this._id = v; }
    set name(v)         { this._name = v; }
    set date_start(v)   { this._date_start = v; }
    set date_end(v)     { this._date_end = v; }

    static fieldNames() {
        return ["id", "name", "date_start", "date_end"];
    }
}
exports.Period = Period;


exports.add     = function (db, period) {
    logger.trace("Period DAO - add:");
    logger.trace(period);
    return dbUtils.db_insert(db, table_name, Period.fieldNames(), period);
};


exports.createOverDateRange = function (db, date_start, date_end) {
    logger.trace("Period DAO - createOverDateRange: ");

    var sDate = new Date(date_start);
    var eDate = new Date(date_end);
    console.log("S: " + sDate);
    console.log("E: " + eDate);

    var sMonth = sDate.getUTCMonth();
    var sYear  = sDate.getUTCFullYear();
    var eMonth = eDate.getUTCMonth();
    var eYear  = eDate.getUTCFullYear();

    return Promise.resolve()
        .then(() => { return exports.listOverDateRange(db, date_start, date_end); })
        .then((periods) => {
            var periodNames = _.map(periods, "name");
            var promises = [];
            for (var y = sYear; y <= eYear; y++) {
                for (var m = sMonth; m <= ((y < eYear) ? 11 : eMonth) ; m++) {
                    var period = new Period(
                        null,
                        months[m] + "-" + y,
                        new Date(y + "-" + pad(m + 1, 2) + "-01T00:00:00.000Z").getTime(),
                        new Date((m < 11 ? y : y + 1) + "-" + pad(1 + ((m + 1) % 12), 2) + "-01T00:00:00.000Z").getTime() - 1);
                    if (_.indexOf(periodNames, period.name) == -1)
                        promises.push(exports.add(db, period));
                }
                sMonth = 0;
            }

            return Promise.all(promises);
        });
};


exports.get = function (db, id) {
    logger.trace("Period DAO - get: " + id);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM period " +
            "WHERE period_id = ?",
            id,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.getByDate = function (db, date) {
    logger.trace("Period DAO - getByDate: " + date);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM period " +
            "WHERE " +
            "   period_date_start <= ? AND " +
            "   period_date_end >= ?",
            date, date,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.listAll = function (db) {
    logger.trace("Period DAO - listAll");
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM period " +
            "ORDER BY period_date_start",
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.listOverDateRange = function (db, date_start, date_end) {
    logger.trace("Period DAO - listOverDateRange:");
    console.log("S: " + new Date(date_start));
    console.log("E: " + new Date(date_end));
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM period " +
            "WHERE " +
            "   period_date_start <= ? AND " +
            "   period_date_end >= ? " +
            "ORDER BY period_date_start",
            date_end,
            date_start,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.remove = function (db, id) {
    logger.trace("Period DAO - remove: " + id);
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM period " +
            "WHERE period_id = ?",
            id,
            dbUtils.generateDBResponseFunctionDelete(resolve, reject)
        );
    });
};


exports.removeAll = function (db) {
    logger.trace("Period DAO - removeAll");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM period",
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.update = function (db, period) {
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
            dbUtils.generateDBResponseFunctionUpdate(resolve, reject)
        );
    });
};