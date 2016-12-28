const _ = require('lodash');

const check   = require('../lib/check-types-wrapper.js').check;
const dbUtils = require("../lib/db-utils.js");
const logger  = require("../lib/debug.js").logger;
const shared  = require("./_shared.js");

const accountDAO    = require("../dao/account.js");
const accountingDAO = require("../dao/accounting.js");
const periodDAO     = require("../dao/period.js");

var tags = [
    "Bank",
    "Books",
    "Cash out",
    "Clothes",
    "Donation",
    "Education",
    "Entertainment",
    "Food out",
    "Games",
    "Groceries",
    "Health",
    "Insurance",
    "Joint",
    "Liquor",
    "Misc",
    "Music",
    "Pay",
    "Phone",
    "Project",
    "Purchase",
    "Sport",
    "Tech",
    "Transfer",
    "Travel",
    "Unknown",
];
exports.tags = tags;

exports.UNKNOWN_TAG = "Unknown";

exports.isValidTagString = function (str) {
    return _.indexOf(tags, str) != -1;
};


class Entry extends shared.BancaObject {
    constructor(id, account, amount, date, bank_note, note, tag, where, what) {
        super();
        check.assert.equal(true, id === null || check.number(id));
        check.assert.equal(true, check.number(account) || check.instance(account, accountDAO.Account));
        check.assert.number(amount);
        check.assert.number(date);
        check.assert.string(bank_note);
        check.assert.string(note);
        check.assert.string(tag);
        check.assert.string(where);
        check.assert.string(what);

        this.id = id;
        this.account = account;
        this.amount = amount;
        this.date = date;
        this.bank_note = bank_note;
        this.note = note;
        this.tag = tag;
        this.where = where;
        this.what = what;
    }
    get id()            { return this._id; }
    get amount()        { return this._amount; }
    get date()          { return this._date; }
    get bank_note()     { return this._bank_note; }
    get note()          { return this._note; }
    get tag()           { return this._tag; }
    get where()         { return this._where; }
    get what()          { return this._what; }
    set id(v)           { this._id = v ? v : -1; }
    set amount(v)       { this._amount = isNaN(v) ? 0 : _.round(Number.parseFloat(v), 2); }
    set date(v)         { this._date = v ? new Date(v).getTime() : 0; }
    set bank_note(v)    { this._bank_note = v ? v : ""; }
    set note(v)         { this._note = v ? v : ""; }
    set tag(v)          { this._tag = v ? v : ""; }
    set where(v)        { this._where = v ? v : ""; }
    set what(v)         { this._what = v ? v : ""; }

    get account()       { return this._account; }
    get account_id()    { return this._account ? this._account.id : this._account_id; }
    set account(v)      {
        if (check.object(v)) {
            this._account    = v;
            this._account_id = v.id;
        }
        else {
            this._account    = null;
            this._account_id = v;
        }
    }
    set account_id(v) {
        if (this._account)
            this._account = null;
        this._account_id = v;
    }

    static fromObject(obj) {
        return new Entry(
            obj.id,
            obj.account ? obj.account : obj.account_id,
            obj.amount,
            obj.date,
            obj.bank_note,
            obj.note,
            obj.tag,
            obj.where,
            obj.what);
    }

    assertEquivalence(obj) {
        this.assertEquivalenceIgnoreFields(obj, ["account"]);
    }

    assertEquivalence_IgnoreFields(obj, ignore) {
        ignore.push("account");
        this.assertEquivalenceIgnoreFields_internal(obj, ignore);
    }

    toJSON() {
        var json = super.toJSON();
        _.unset(json, "account");
        return json;
    }
}
exports.Entry = Entry;


exports.add = function(db, entry) {
    logger.trace("Entry DAO - Add:");
    logger.trace(entry);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.instance(entry, Entry);
    entry.amount = _.round(entry.amount, 2);
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO entry (" +
            "   entry_account_id, " +
            "   entry_amount, " +
            "   entry_date, " +
            "   entry_bank_note, " +
            "   entry_note, " +
            "   entry_tag, " +
            "   entry_what, " +
            "   entry_where) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            entry.account_id,
            entry.amount,
            entry.date,
            entry.bank_note,
            entry.note,
            entry.tag,
            entry.what,
            entry.where,
            dbUtils.generateDBResponseFunctionInsert(resolve, reject, entry)
        );
    });
};


exports.get = function (db, id) {
    logger.trace("Entry DAO - get: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM entry " +
            "WHERE entry_id = ?",
            id,
            dbUtils.generateDBResponseFunctionGet(resolve, reject, Entry.fromObject)
        );
    });
};


exports.listAll = function(db) {
    logger.trace("Entry DAO - listAll");
    check.assert.equal(db.constructor.name, "Database");
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM entry " +
            "ORDER BY entry_date",
            dbUtils.generateDBResponseFunctionGet(resolve, reject, Entry.fromObject)
        );
    });
};


exports.listByAccount = function(db, account_id) {
    logger.trace("Entry DAO - listByAccount. ID: " + account_id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(account_id));

    return Promise.resolve()
        .then(() => {
            return new Promise((resolve, reject) => {
                db.all(
                    "SELECT * FROM entry " +
                    "WHERE " +
                    "   entry_account_id = ? " +
                    "ORDER BY entry_date",
                    account_id,
                    dbUtils.generateDBResponseFunctionGet(resolve, reject, Entry.fromObject)
                );
            });
        })
};


exports.listByAccounting = function(db, accounting_id) {
    logger.trace("Entry DAO - listByAccounting. ID: " + accounting_id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(accounting_id));

    return Promise.resolve()
        .then(() => { return accountingDAO.peekDatesAndAccount(db, accounting_id); })
        .then((peek) => {
            return new Promise((resolve, reject) => {
                db.all(
                    "SELECT * FROM entry " +
                    "WHERE " +
                    "   entry_date >= ? AND " +
                    "   entry_date <= ? AND " +
                    "   entry_account_id = ? " +
                    "ORDER BY entry_date",
                    peek.date_start,
                    peek.date_end,
                    peek.account_id,
                    dbUtils.generateDBResponseFunctionGet(resolve, reject, Entry.fromObject)
                );
            });
        })
};


exports.listByPeriod = function(db, period_id) {
    logger.trace("Entry DAO - listByPeriod");
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(period_id));

    return Promise.resolve()
        .then(() => { return periodDAO.get(db, period_id); })
        .then((period) => {
            return new Promise((resolve, reject) => {
                db.all(
                    "SELECT * FROM entry " +
                    "WHERE " +
                    "   entry_date >= ? AND" +
                    "   entry_date <= ?" +
                    "ORDER BY entry_date",
                    period.date_start,
                    period.date_end,
                    dbUtils.generateDBResponseFunctionGet(resolve, reject, Entry.fromObject)
                );
            });
        });
};


exports.remove  = function (db, id) {
    logger.trace("Entry DAO - remove: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM entry " +
            "WHERE entry_id = ?",
            id,
            dbUtils.generateDBResponseFunctionDelete(resolve, reject)
        );
    });
};


exports.removeAll = function (db) {
    logger.trace("Entry DAO - removeAll");
    check.assert.equal(db.constructor.name, "Database");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM entry",
            dbUtils.generateDBResponseFunctionDelete(resolve, reject)
        );
    });
};


exports.update = function(db, entry) {
    logger.trace("Entry DAO - update:");
    logger.trace(entry);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.instance(entry, Entry);
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE entry SET           " +
            "   entry_account_id = ?,   " +
            "   entry_amount = ?,       " +
            "   entry_date = ?,         " +
            "   entry_bank_note = ?,    " +
            "   entry_note = ?,         " +
            "   entry_tag = ?,          " +
            "   entry_what = ?,         " +
            "   entry_where = ?         " +
            "WHERE entry_id = ?",
            entry.account_id,
            entry.amount,
            entry.date,
            entry.bank_note,
            entry.note,
            entry.tag,
            entry.what,
            entry.where,
            entry.id,
            dbUtils.generateDBResponseFunctionUpdate(resolve, reject)
        );
    });
};