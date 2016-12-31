const _      = require('lodash');
const check  = require('../lib/check-types-wrapper.js').check;
const logger = require("../lib/debug.js").logger;
const pad    = require("pad-number");
const shared = require("./_shared.js");

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


class Period extends shared.BancaObject {
    constructor(id, name, date_start, date_end) {
        super();
        check.assert.equal(true, id === null || check.number(id));
        check.assert.string(name);
        check.assert.number(new Date(date_start).getTime());
        check.assert.number(new Date(date_end).getTime());

        this.id         = id;
        this.name       = name;
        this.date_start = date_start;
        this.date_end   = date_end;
    };

    get id()            { return this._id; }
    get name()          { return this._name; }
    get date_start()    { return this._date_start; }
    get date_end()      { return this._date_end; }
    set id(v)           { this._id = v ? Number.parseInt(v) : -1; }
    set name(v)         { this._name = v ? v.toString() : ""; }
    set date_start(v)   { this._date_start = v ? new Date(v).getTime() : 0; }
    set date_end(v)     { this._date_end = v ? new Date(v).getTime() : 0; }

    static fromObject(obj) {
        return new Period(
            obj.id,
            obj.name,
            obj.date_start,
            obj.date_end);
    }
}
exports.Period = Period;


exports.add     = function (db, period) {
    logger.trace("Period DAO - add:");
    logger.trace(period);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.instanceStrict(period, Period);

    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO period (" +
            "   period_name, " +
            "   period_date_start, " +
            "   period_date_end) VALUES (?, ?, ?)",
            period.name,
            period.date_start,
            period.date_end,
            shared.generateDBResponseFunctionInsert(resolve, reject, period)
        );
    });
};


exports.createOverDateRange = function (db, date_start, date_end) {
    logger.trace("Period DAO - createOverDateRange: ");
    logger.trace("S: " + new Date(date_start));
    logger.trace("E: " + new Date(date_end));
    date_start = new Date(date_start).getTime();
    date_end = new Date(date_end).getTime();
    check.assert.equal(db.constructor.name, "Database");
    check.assert.number(date_start);
    check.assert.number(date_end);

    return Promise.resolve()
        .then(() => { return exports.listOverDateRange(db, date_start, date_end); })
        .then((periods) => {
            var sDate = new Date(date_start);
            var sMonth = sDate.getUTCMonth();
            var sYear  = sDate.getUTCFullYear();
            var eDate = new Date(date_end);
            var eMonth = eDate.getUTCMonth();
            var eYear  = eDate.getUTCFullYear();

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
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM period " +
            "WHERE period_id = ?",
            id,
            shared.generateDBResponseFunctionGet(resolve, reject, Period.fromObject)
        );
    });
};


exports.getByDate = function (db, date) {
    logger.trace("Period DAO - getByDate: " + date);
    date = new Date(date).getTime();
    check.assert.equal(db.constructor.name, "Database");
    check.assert.number(date);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM period " +
            "WHERE " +
            "   period_date_start <= ? AND " +
            "   period_date_end >= ?",
            date, date,
            shared.generateDBResponseFunctionGet(resolve, reject, Period.fromObject)
        );
    });
};


exports.listAll = function (db) {
    logger.trace("Period DAO - listAll");
    check.assert.equal(db.constructor.name, "Database");
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM period " +
            "ORDER BY period_date_start",
            shared.generateDBResponseFunctionGet(resolve, reject, Period.fromObject)
        );
    });
};


exports.listOverDateRange = function (db, date_start, date_end) {
    logger.trace("Period DAO - listOverDateRange:");
    logger.trace("S: " + new Date(date_start));
    logger.trace("E: " + new Date(date_end));
    date_start = new Date(date_start).getTime();
    date_end = new Date(date_end).getTime();
    check.assert.equal(db.constructor.name, "Database");
    check.assert.number(date_start);
    check.assert.number(date_end);
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM period " +
            "WHERE " +
            "   period_date_start <= ? AND " +
            "   period_date_end >= ? " +
            "ORDER BY period_date_start",
            date_end,
            date_start,
            shared.generateDBResponseFunctionGet(resolve, reject, Period.fromObject)
        );
    });
};


exports.remove = function (db, id) {
    logger.trace("Period DAO - remove: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM period " +
            "WHERE period_id = ?",
            id,
            shared.generateDBResponseFunctionDelete(resolve, reject)
        );
    });
};


exports.removeAll = function (db) {
    logger.trace("Period DAO - removeAll");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM period",
            shared.generateDBResponseFunctionDelete(resolve, reject)
        );
    });
};


exports.update = function (db, period) {
    logger.trace("Period DAO - update:");
    logger.trace(period);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.instanceStrict(period, Period);

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
            shared.generateDBResponseFunctionUpdate(resolve, reject)
        );
    });
};