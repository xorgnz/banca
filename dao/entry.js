const _ = require('lodash');

const check   = require('../lib/check-types-wrapper.js').check;
const dbUtils = require("../lib/db-utils.js");
const logger  = require("../lib/debug.js").logger;

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


class Entry {
    constructor(id, account, amount, date, bank_note, note, tag, where, what) {
        check.assert.equal(true, id === null || check.number(id));
        check.assert.equal(true, check.number(account) || check.instance(account, accountDAO.Account));
        check.assert.number(amount);
        check.assert.number(date);
        check.assert.string(bank_note);
        check.assert.string(note);
        check.assert.string(tag);
        check.assert.string(where);
        check.assert.string(what);

        this._id = id ? id : -1;
        this._amount = amount ? amount : _.round(amount, 2);
        this._date = date ? date  : 0;
        this._bank_note = bank_note ? bank_note : -1;
        this._note = note ? note : "";
        this._tag = tag ? tag  : "";
        this._where = where ? where  : "";
        this._what = what ? what  : "";

        if (check.object(account))
            this._account = account;
        else
            this._account_id = account;
    }
    get id()            { return this._id; }
    get amount()        { return this._amount; }
    get date()          { return this._date; }
    get bank_note()     { return this._bank_note; }
    get note()          { return this._note; }
    get tag()           { return this._tag; }
    get where()         { return this._where; }
    get what()          { return this._what; }
    set id(v)           { this._id = v; }
    set amount(v)       { this._amount = _.round(v, 2) }
    set date(v)         { this._date = v; }
    set bank_note(v)    { this._bank_note = v; }
    set note(v)         { this._note = v; }
    set tag(v)          { this._tag = v; }
    set where(v)        { this._where = v; }
    set what(v)         { this._what = v; }

    get account()       { return this._account; }
    get account_id()    { return this._account ? this._account.id : this._account_id; }
    set account(v)      { this._account = v; }
    set account_id(v)   { if (this._account) this._account = null; this._account_id = v; }

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

    static fieldNames() {
        return ["id", "account_id", "amount", "date", "bank_note", "note", "tag", "where", "what"];
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
    check.assert.number(id);
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
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.listByAccount = function(db, account_id) {
    logger.trace("Entry DAO - listByAccount. ID: " + account_id);
    check.assert.equal(db.constructor.name, "Database");
    if (check.string(account_id))
        account_id = Number.parseInt(account_id);
    check.assert.number(account_id);

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
    if (check.string(accounting_id))
        accounting_id = Number.parseInt(accounting_id);
    check.assert.number(accounting_id);

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
    check.assert.number(period_id);

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
    check.assert.number(id);
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