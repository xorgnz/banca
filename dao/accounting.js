const logger   = require("../lib/debug.js").logger;
const dbUtils  = require("../lib/db-utils.js");
const _        = require('lodash');
const entryDAO = require("../dao/entry.js");

const table_name = "accounting";

class Accounting {
    constructor(id, period, account, amount_start, amount_end) {
        this._id           = id ? id : -1;
        this._amount_start = isNaN(amount_start) ? 0 : Number.parseFloat(amount_start);
        this._amount_end   = isNaN(amount_end) ? 0 : Number.parseFloat(amount_end);

        if (typeof(account) === "object")
            this._account = account;
        else
            this._account_id = account;

        if (typeof(period) === "object")
            this._period = period;
        else
            this._period_id = period;
    }

    get id()            { return this._id; }
    set id(v)           { this._id = v; }
    get amount_start()  { return this._amount_start; }
    set amount_start(v) { this._amount_start = _.round(v, 2); }
    get amount_end()    { return this._amount_end; }
    set amount_end(v)   { this._amount_end = _.round(v, 2) }

    get account()     { return this._account; }
    get account_id()  { return this._account ? this._account.id : this._account_id; }
    set account(v)    { this._account = v; }
    set account_id(v) {
        if (this._account) this._account = null;
        this._account_id = v;
    }

    get period()     { return this._period; }
    get period_id()  { return this._period ? this._period.id : this._period_id; }
    set period(v)    { this._period = v; }
    set period_id(v) {
        if (this._period) this._period = null;
        this._period_id = v;
    }

    static fieldNames() {
        return ["id", "amount_start", "amount_end", "account_id", "period_id"];
    }
}
exports.Accounting = Accounting;


exports.add = function (db, accounting) {
    logger.trace("Accounting DAO - Add:");
    logger.trace(accounting);
    accounting.amount_start = _.round(accounting.amount_start, 2);
    accounting.amount_end = _.round(accounting.amount_end, 2);
    return dbUtils.db_insert(db, table_name, Accounting.fieldNames(), accounting);
};


exports.calc = function (db, id) {
    logger.trace("Accounting DAO - calc: " + id);
    var amount = 0;
    return Promise.resolve()
        .then(() => { return entryDAO.listByAccounting(db, id); })
        .then((entries) => {
            _.each(entries, (v) => { amount += v.amount; });
            return exports.get(db, id);
        })
        .then((accounting) => {
            accounting.amount_end = Math.round((accounting.amount_start + amount) * 100) * 0.01;
            return exports.update(db, accounting);
        });
};


exports.cascade = function (db, id) {
    logger.trace("Accounting DAO - cascade: " + id);
    return Promise.resolve()
        .then(() => { return exports.listSelfAndFollowing(db, id); })
        .then((rows) => {
            var promises = [];
            for (var i = 1; i < rows.length; i++) {
                if (rows[i].amount_start != rows[i - 1].amount_end) {
                    var change           = rows[i].amount_end - rows[i].amount_start;
                    rows[i].amount_start = rows[i - 1].amount_end;
                    rows[i].amount_end   = rows[i].amount_start + change;
                    promises.push(exports.update(db, rows[i]));
                }
            }
            return Promise.all(promises);
        });
};


exports.createForPeriods = function (db, period_ids, account_id) {
    logger.trace("Accounting DAO - createForPeriods: [" + period_ids + "], " + account_id);

    return Promise.resolve()
        // contract - period_ids is array of numbers
        .then(() => {
            _.each(period_ids, (pid) => {
                if (isNaN(pid))
                    throw new Error("period_ids contains non-numbers");
            });
        })
        .then(() => { return exports.listByAccount(db, account_id); })
        .then((periods) => {
            var period_ids_extant = _.map(periods, "period_id");
            console.log(period_ids_extant);
            var promises = [];
            for (var i = 0; i < period_ids.length; i++) {
                if (_.indexOf(period_ids_extant, period_ids[i]) == -1) {
                    promises.push(
                        exports.add(db, new Accounting(null, period_ids[i], account_id, 0, 0))
                    );
                }
            }
            return Promise.all(promises);
        });
};


exports.get = function (db, id) {
    logger.trace("Accounting DAO - get: " + id);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM accounting " +
            "WHERE accounting_id = ?",
            id,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.getByPeriodAndAccount = function (db, period_id, account_id) {
    logger.trace("Accounting DAO - getByPeriodAndAccount: P: " + period_id + ", A: " + account_id);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM accounting " +
            "WHERE " +
            "   accounting_period_id = ? AND " +
            "   accounting_account_id = ?",
            period_id,
            account_id,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.getByDateAndAccount = function (db, date, account_id) {
    logger.trace("Accounting DAO - getByDateAndAccount: D: " + new Date(date) + ", A: " + account_id);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT accounting.* FROM accounting " +
            "INNER JOIN period ON period_id = accounting_period_id " +
            "WHERE " +
            "   period_date_start <= ? AND " +
            "   period_date_end >= ? AND " +
            "   accounting_account_id = ?",
            date, date,
            account_id,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.listAll = function (db) {
    logger.trace("Accounting DAO - listAll");
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM accounting",
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.listSelfAndFollowing = function (db, accounting_id) {
    logger.trace("Accounting DAO - listFollowing: " + accounting_id);

    return Promise.resolve()
        .then(() => { return exports.peekDatesAndAccount(db, accounting_id); })
        .then((peek) => {
            return new Promise((resolve, reject) => {
                db.all(
                    "SELECT accounting.* FROM accounting " +
                    "INNER JOIN period ON period_id = accounting_period_id " +
                    "WHERE " +
                    "   accounting_account_id = ? AND " +
                    "   period_date_start >= ?" +
                    "ORDER BY period_date_start",
                    peek.account_id,
                    peek.date_start,
                    dbUtils.generateDBResponseFunctionGet(resolve, reject)
                );
            });
        });
};


exports.listByAccount = function (db, account_id) {
    logger.trace("Accounting DAO - listByAccount: " + account_id);
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT accounting.* FROM accounting " +
            "INNER JOIN period ON period_id = accounting_period_id " +
            "WHERE accounting_account_id = ? " +
            "ORDER BY period_date_start",
            account_id,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


// TODO - Take accounting as well (why ever would we not??)
exports.listOverDateRange = function (db, date_start, date_end, account_id) {
    logger.trace("Accounting DAO - listOverDateRange:");
    console.log("S: " + new Date(date_start));
    console.log("E: " + new Date(date_end));

    return new Promise((resolve, reject) => {
        db.all(
            "SELECT accounting.* FROM accounting " +
            "INNER JOIN period ON accounting_period_id = period_id " +
            "WHERE " +
            "   period_date_start <= ? AND " +
            "   period_date_end >= ? AND " +
            "   accounting_account_id = ? " +
            "ORDER BY period_date_start",
            date_end,
            date_start,
            account_id,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.peekDatesAndAccount = function (db, id) {
    logger.trace("Accounting DAO - peekDatesAndAccount: " + id);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT " +
            "   period_date_start, " +
            "   period_date_end, " +
            "   accounting_account_id " +
            "FROM accounting " +
            "INNER JOIN period ON period_id = accounting_period_id " +
            "WHERE accounting_id = ?",
            id,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.remove = function (db, id) {
    logger.trace("Accounting DAO - remove: " + id);
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM accounting " +
            "WHERE accounting_id = ?",
            id,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.removeAll = function (db) {
    logger.trace("Accounting DAO - removeAll");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM accounting",
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.update = function (db, accounting) {
    logger.trace("Accounting DAO - update:");
    accounting.amount_start = _.round(accounting.amount_start, 2);
    accounting.amount_end = _.round(accounting.amount_end, 2);
    logger.trace(accounting);

    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE accounting SET          " +
            "   accounting_period_id = ?,   " +
            "   accounting_account_id = ?,  " +
            "   accounting_amount_start = ?," +
            "   accounting_amount_end = ?   " +
            "WHERE accounting_id = ?",
            accounting.period_id,
            accounting.account_id,
            accounting.amount_start,
            accounting.amount_end,
            accounting.id,
            dbUtils.generateDBResponseFunctionUpdate(resolve, reject)
        );
    });
};