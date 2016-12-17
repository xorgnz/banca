const logger = require("../lib/debug.js").logger;
const dbUtils = require("../lib/db-utils.js");

class Accounting {
    constructor(id, period_id, account_id, amount_start, amount_end) {
        this._id = id ? id : -1;
        this._period_id = period_id ? period_id : "";
        this._account_id = account_id ? account_id : "";
        this._amount_start = isNaN(amount_start) ? 0 : Number.parseFloat(amount_start);
        this._amount_end = isNaN(amount_end) ? 0 : Number.parseFloat(amount_end);
    }
    get id()            { return this._id; }
    get period_id()     { return this._period_id; }
    get account_id()    { return this._account_id; }
    get amount_start()  { return this._amount_start; }
    get amount_end()    { return this._amount_end; }
    set id(v)           { this._id = v; }
    set period_id(v)    { this._period_id = v; }
    set account_id(v)   { this._account_id = v; }
    set amount_start(v) { this._amount_start = v; }
    set amount_end(v)   { this._amount_end = v; }
}
exports.Accounting = Accounting;


exports.add = function(db, accounting) {
    logger.trace("Accounting DAO - Add:");
    logger.trace(accounting);
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO accounting (" +
            "   accounting_period_id, " +
            "   accounting_account_id, " +
            "   accounting_amount_start, " +
            "   accounting_amount_end) VALUES (?, ?, ?, ?)",
            accounting.period_id,
            accounting.account_id,
            accounting.amount_start,
            accounting.amount_end,
            function (err) {
                if (err) {
                    logger.error(err);
                    reject(err);
                }
                else {
                    accounting.id = this.lastID;
                    resolve(this.lastID);
                }
            }
        );
    });
};


exports.get = function (db, id) {
    logger.trace("Accounting DAO - get: " + id);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM accounting " +
            "WHERE accounting_id = ?",
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
    logger.trace("Accounting DAO - listAll");
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM accounting",
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
    logger.trace("Accounting DAO - remove: " + id);
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM accounting " +
            "WHERE accounting_id = ?",
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
    logger.trace("Accounting DAO - removeAll");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM accounting",
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


exports.update = function(db, accounting) {
    logger.trace("Accounting DAO - update:");
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