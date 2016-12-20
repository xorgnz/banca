"use strict";
const logger  = require("../lib/debug.js").logger;
const dbUtils = require("../lib/db-utils.js");
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

class Period {
    constructor(id, name, date_start, date_end) {
        this._id         = id ? id : -1;
        this._name       = name ? name : "";
        this._date_start = isNaN(date_start) ? 0 : Number.parseInt(date_start);
        this._date_end   = isNaN(date_end) ? 0 : Number.parseInt(date_end);
    };

    get id() { return this._id; }

    get name() { return this._name; }

    get date_start() { return this._date_start; }

    get date_end() { return this._date_end; }

    set id(v) { this._id = v; }

    set name(v) { this._name = v; }

    set date_start(v) { this._date_start = v; }

    set date_end(v) { this._date_end = v; }

    static equivalenceFields() {
        return ["id", "name", "date_start", "date_end"];
    }
}
exports.Period = Period;


var add     = function (db, period) {
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
exports.add = add;

exports.createPeriodRange = function (db, date_start, date_end) {
    logger.trace("Period DAO - Create Period Range: ");

    var sDate  = new Date(date_start);
    var sMonth = sDate.getUTCMonth();
    var sYear  = sDate.getUTCFullYear();
    var eDate  = new Date(date_end);
    var eMonth = eDate.getUTCMonth();
    var eYear  = eDate.getUTCFullYear();

    console.log("starting " + sDate);
    console.log("ending " + eDate);

    var promises = [];
    for (var y = sYear; y <= eYear; y++) {
        for (var m = sMonth; m <= eMonth; m++) {
            var period = new Period(
                null,
                months[m] + "-" + y,
                new Date(y + "-" + pad(m + 1, 2) + "-01T00:00:00.000Z").getTime(),
                new Date((m < 11 ? y : y + 1) + "-" + pad(1 + ((m + 1) % 12), 2) + "-01T00:00:00.000Z").getTime() - 1);
            promises.push(add(db, period));
        }
        sMonth = 0;
    }

    return Promise.all(promises);
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

var getPeriodContainingDate     = function (db, date) {
    logger.trace("Period DAO - getPeriodContainingDate: " + date);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM period " +
            "WHERE period_date_start <= ? AND period_date_end >= ?",
            date, date,
            function (err, row) {
                console.log(this);
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
exports.getPeriodContainingDate = getPeriodContainingDate;


exports.listAll = function (db) {
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


exports.remove = function (db, id) {
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