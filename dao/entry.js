const logger = require("../lib/debug.js").logger;
const dbUtils = require("../lib/db-utils.js");

class Entry {
    fish;
    constructor(id, account_id, amount, date, bank_note, note, tag, where, what) {
        this._id = id ? id : -1;
        this._account_id = account_id ? account_id : "";
        this._amount = amount ? amount  : "";
        this._date = date ? date  : "";
        this._bank_note = bank_note ? bank_note : -1;
        this._note = note ? note : "";
        this._tag = tag ? tag  : "";
        this._where = where ? where  : "";
        this._what = what ? what  : "";
    }
    get id()            { return this._id; }
    get account_id()    { return this._account_id; }
    get amount()        { return this._amount; }
    get date()          { return this._date; }
    get bank_note()     { return this._bank_note; }
    get note()          { return this._note; }
    get tag()           { return this._tag; }
    get where()         { return this._where; }
    get what()          { return this._what; }
    set id(v)           { this._id = v; }
    set account_id(v)   { this._account_id = v; }
    set amount(v)       { this._amount = v; }
    set date(v)         { this._date = v; }
    set bank_note(v)    { this._bank_note = v; }
    set note(v)         { this._note = v; }
    set tag(v)          { this._tag = v; }
    set where(v)        { this._where = v; }
    set what(v)         { this._what = v; }
}
exports.Entry = Entry;


exports.add = function(db, entry) {
    logger.trace("Entry DAO - Add:");
    logger.trace(entry);
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
            function (err) {
                if (err) {
                    logger.error(err);
                    reject(err);
                }
                else {
                    entry.id = this.lastID;
                    resolve(this.lastID);
                }
            }
        );
    });
};


exports.get = function (db, id) {
    logger.trace("Entry DAO - get: " + id);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM entry " +
            "WHERE entry_id = ?",
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
    logger.trace("Entry DAO - listAll");
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM entry",
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
    logger.trace("Entry DAO - remove: " + id);
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM entry " +
            "WHERE entry_id = ?",
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
    logger.trace("Entry DAO - removeAll");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM entry",
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


exports.update = function(db, entry) {
    logger.trace("Entry DAO - update:");
    logger.trace(entry);
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