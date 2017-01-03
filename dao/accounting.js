const _      = require('lodash');
const check  = require('../lib/types.js').check;
const logger = require("../lib/debug.js").logger;
const shared = require("./_shared.js");

const entryDAO   = require("../dao/entry.js");
const periodDAO  = require("../dao/period.js");
const accountDAO = require("../dao/account.js");

class Accounting extends shared.BancaObject {
    constructor(id, period, account, amount_start, amount_end) {
        super();
        check.assert(check.null(id) || check.__numberlike(id));
        check.assert(check.__numberlike(period) || check.instance(period, periodDAO.Period));
        check.assert(check.__numberlike(account) || check.instance(account, accountDAO.Account));
        check.assert(check.__numberlike(amount_start));
        check.assert(check.__numberlike(amount_end));

        this.id           = id;
        this.amount_start = amount_start;
        this.amount_end   = amount_end;

        if (check.instance(period, periodDAO.Period))
            this.period = period;
        else
            this.period_id = period;

        if (check.instance(account, accountDAO.Account))
            this.account = account;
        else
            this.account_id = account;
    }

    get id()            { return this._id; }
    get account()       { return this._account; }
    get account_id()    { return this._account ? this._account.id : this._account_id; }
    get period()        { return this._period; }
    get period_id()     { return this._period ? this._period.id : this._period_id; }
    get amount_start()  { return this._amount_start; }
    get amount_end()    { return this._amount_end; }
    set id(v)           { this._id = v ? Number.parseInt(v) : -1; }
    set amount_start(v) { this._amount_start = check.__numberlike(v) ? _.round(Number.parseFloat(v), 2) : 0; }
    set amount_end(v)   { this._amount_end = check.__numberlike(v) ? _.round(Number.parseFloat(v), 2) : 0; }
    set account(v)    {
        check.assert.instance(v, accountDAO.Account);
        this._account    = v;
        this._account_id = v.id;
    }
    set account_id(v) {
        this._account = null;
        this._account_id = v ? Number.parseInt(v) : -1;
    }
    set period(v)    {
        check.assert.instance(v, periodDAO.Period);
        this._period    = v;
        this._period_id = v.id;
    }
    set period_id(v) {
        this._period = null;
        this._period_id = v ? Number.parseInt(v) : -1;
    }

    static fromObject(obj) {
        return new Accounting(
            obj.id,
            obj.period ? obj.period : obj.period_id,
            obj.account ? obj.account : obj.account_id,
            obj.amount_start,
            obj.amount_end);
    }

    assertEquivalence(obj) {
        this.assertEquivalenceIgnoreFields(obj, ["account", "period"]);
    }

    assertEquivalence_IgnoreFields(obj, ignore) {
        ignore.push("account");
        ignore.push("period");
        this.assertEquivalenceIgnoreFields_internal(obj, ignore);
    }

    toJSON() {
        var json = super.toJSON();
        _.unset(json, "account");
        _.unset(json, "period");
        return json;
    }
}
exports.Accounting = Accounting;

exports.add = function (db, accounting) {
    logger.trace("Accounting DAO - Add:");
    logger.trace(accounting);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.instanceStrict(accounting, Accounting);
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
            shared.generateDBResponseFunctionInsert(resolve, reject, accounting)
        );
    });
};


exports.calc = function (db, id) {
    logger.trace("Accounting DAO - calc: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
    var amount = 0;
    return Promise.resolve()
        .then(() => { return entryDAO.listByAccounting(db, id); })
        .then((entries) => {
            console.log(entries);
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
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
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
    check.assert.equal(db.constructor.name, "Database");
    check.assert.array.of.number(period_ids);
    check.assert(check.__numberlike(account_id));
    return Promise.resolve()
        .then(() => { return exports.listByAccount(db, account_id); })
        .then((periods) => {
            var period_ids_extant = _.map(periods, "period_id");
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
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM accounting " +
            "WHERE accounting_id = ?",
            id,
            shared.generateDBResponseFunctionGet(resolve, reject, Accounting.fromObject)
        );
    });
};


exports.getByPeriodAndAccount = function (db, period_id, account_id) {
    logger.trace("Accounting DAO - getByPeriodAndAccount: P: " + period_id + ", A: " + account_id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(account_id));
    check.assert(check.__numberlike(period_id));
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM accounting " +
            "WHERE " +
            "   accounting_period_id = ? AND " +
            "   accounting_account_id = ?",
            period_id,
            account_id,
            shared.generateDBResponseFunctionGet(resolve, reject, Accounting.fromObject)
        );
    });
};


exports.getByDateAndAccount = function (db, date, account_id) {
    logger.trace("Accounting DAO - getByDateAndAccount: D: " + new Date(date) + ", A: " + account_id);
    date = new Date(date).getTime();
    check.assert.equal(db.constructor.name, "Database");
    check.assert.number(date);
    check.assert(check.__numberlike(account_id));
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
            shared.generateDBResponseFunctionGet(resolve, reject, Accounting.fromObject)
        );
    });
};


exports.getByEntry = function (db, entry_id) {
    logger.trace("Accounting DAO - getByEntry: " + entry_id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(entry_id));
    return Promise.resolve()
        .then(() => { return entryDAO.get(db, entry_id); })
        .then((entry) => { return exports.getByDateAndAccount(db, entry.date, entry.account_id); });
};


exports.listAll = function (db) {
    logger.trace("Accounting DAO - listAll");
    check.assert.equal(db.constructor.name, "Database");
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT accounting.* FROM accounting " +
            "INNER JOIN period ON period_id = accounting_period_id " +
            "ORDER BY period_date_start",
            shared.generateDBResponseFunctionGet(resolve, reject, Accounting.fromObject)
        );
    });
};


exports.listSelfAndFollowing = function (db, id) {
    logger.trace("Accounting DAO - listFollowing: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
    return Promise.resolve()
        .then(() => { return exports.peekDatesAndAccount(db, id); })
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
                    shared.generateDBResponseFunctionGet(resolve, reject, Accounting.fromObject)
                );
            });
        });
};


exports.listByAccount = function (db, account_id) {
    logger.trace("Accounting DAO - listByAccount: " + account_id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(account_id));
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT accounting.* FROM accounting " +
            "INNER JOIN period ON period_id = accounting_period_id " +
            "WHERE accounting_account_id = ? " +
            "ORDER BY period_date_start",
            account_id,
            shared.generateDBResponseFunctionGet(resolve, reject, Accounting.fromObject)
        );
    });
};


exports.listOverDateRange = function (db, date_start, date_end, account_id) {
    logger.trace("Accounting DAO - listOverDateRange:");
    logger.trace("S: " + new Date(date_start));
    logger.trace("E: " + new Date(date_end));
    date_start = new Date(date_start).getTime();
    date_end = new Date(date_end).getTime();
    check.assert.equal(db.constructor.name, "Database");
    check.assert.number(date_start);
    check.assert.number(date_end);
    check.assert(check.__numberlike(account_id));
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
            shared.generateDBResponseFunctionGet(resolve, reject, Accounting.fromObject)
        );
    });
};


exports.peekDatesAndAccount = function (db, id) {
    logger.trace("Accounting DAO - peekDatesAndAccount: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
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
            shared.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.remove = function (db, id) {
    logger.trace("Accounting DAO - remove: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM accounting " +
            "WHERE accounting_id = ?",
            id,
            shared.generateDBResponseFunctionDelete(resolve, reject)
        );
    });
};


exports.removeAll = function (db) {
    logger.trace("Accounting DAO - removeAll");
    check.assert.equal(db.constructor.name, "Database");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM accounting",
            shared.generateDBResponseFunctionDelete(resolve, reject)
        );
    });
};


exports.update = function (db, accounting) {
    logger.trace("Accounting DAO - update:");
    accounting.amount_start = _.round(accounting.amount_start, 2);
    accounting.amount_end = _.round(accounting.amount_end, 2);
    logger.trace(accounting);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.instanceStrict(accounting, Accounting);
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
            shared.generateDBResponseFunctionUpdate(resolve, reject)
        );
    });
};