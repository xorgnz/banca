const logger  = require("../lib/debug.js").logger;
const dbUtils = require("../lib/db-utils.js");

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

    get id() { return this._id; }

    set id(v) { this._id = v; }

    get amount_start() { return this._amount_start; }

    set amount_start(v) { this._amount_start = v; }

    get amount_end() { return this._amount_end; }

    set amount_end(v) { this._amount_end = v; }

    get account() { return this._account; }

    get account_id() { return this._account ? this._account.id : this._account_id; }

    set account(v) { this._account = v; }

    set account_id(v) {
        if (this._account) this._account = null;
        this._account_id = v;
    }

    get period() { return this._period; }

    get period_id() { return this._period ? this._period.id : this._period_id; }

    set period(v) { this._period = v; }

    set period_id(v) {
        if (this._period) this._period = null;
        this._period_id = v;
    }

    static equivalenceFields() {
        return ["id", "amount_start", "amount_end", "acount_id", "period_id"];
    }
}
exports.Accounting = Accounting;


var add     = function (db, accounting) {
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
exports.add = add;


var createAccountingForPeriods     = function (db, period_ids, account_id) {
    logger.trace("Accounting DAO - createAccountingForPeriods: [" + period_ids + "], " + account_id);
    var promises = [];
    for (var i = 0; i < period_ids.length; i++) {
        promises.push(add(db, new Accounting(null, period_ids[i], account_id, 0, 0)));
    }
    return Promise.all(promises);
};
exports.createAccountingForPeriods = createAccountingForPeriods;


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


var getByPeriodAndAccount = function (db, period_id, account_id) {
    logger.trace("Accounting DAO - getByPeriodAndAccount: P: " + period_id + ", A: " + account_id);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM accounting " +
            "WHERE accounting_period_id = ? AND accounting_account_id = ?",
            period_id,
            account_id,
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
exports.getByPeriodAndAccount = getByPeriodAndAccount;


var getByPeriodAndDate = function (db, date, account_id) {
    logger.trace("Accounting DAO - getByPeriodAndDate: D: " + new Date(date) + ", A: " + account_id);
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
exports.getByPeriodAndDate = getByPeriodAndDate;


exports.listAll = function (db) {
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


exports.remove = function (db, id) {
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


exports.update = function (db, accounting) {
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