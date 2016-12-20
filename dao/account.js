const logger = require("../lib/debug.js").logger;
const dbUtils = require("../lib/db-utils.js");

class Account {
    constructor(id, name, description) {
        this._id = id ? id : -1;
        this._name = name ? name : "";
        this._description = description ? description  : "";
    }
    get id()            { return this._id; }
    get name()          { return this._name; }
    get description()   { return this._description; }
    set id(v)           { this._id = v; }
    set name(v)         { this._name = v; }
    set description(v)  { this._description = v; }

    static equivalenceFields() {
        return ["id", "name", "description"];
    }
}
exports.Account = Account;


exports.add = function(db, account) {
    logger.trace("Account DAO - Add:");
    logger.trace(account);
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO account (" +
            "   account_name, " +
            "   account_description) VALUES (?, ?)",
            account.name,
            account.description,
            function (err) {
                if (err) {
                    logger.error(err);
                    reject(err);
                }
                else {
                    account.id = this.lastID;
                    resolve(this.lastID);
                }
            }
        );
    });
};


exports.get = function (db, id) {
    logger.trace("Account DAO - get: " + id);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM account " +
            "WHERE account_id = ?",
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
    logger.trace("Account DAO - listAll");
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM account",
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
    logger.trace("Account DAO - remove: " + id);
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM account " +
            "WHERE account_id = ?",
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
    logger.trace("Account DAO - removeAll");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM account",
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


exports.update = function(db, account) {
    logger.trace("Account DAO - update:");
    logger.trace(account);
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE account SET             " +
            "   account_name = ?,           " +
            "   account_description = ?     " +
            "WHERE account_id = ?",
            account.name,
            account.description,
            account.id,
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