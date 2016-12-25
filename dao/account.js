const logger = require("../lib/debug.js").logger;
const dbUtils = require("../lib/db-utils.js");

const table_name = "account";

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

    static fieldNames() {
        return ["id", "name", "description"];
    }
}
exports.Account = Account;


exports.add = function(db, account) {
    logger.trace("Account DAO - Add:");
    logger.trace(account);
    return dbUtils.db_insert(db, table_name, Account.fieldNames(), account);
};


exports.get = function (db, id) {
    logger.trace("Account DAO - get: " + id);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM account " +
            "WHERE account_id = ?",
            id,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.listAll = function(db) {
    logger.trace("Account DAO - listAll");
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM account",
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
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
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.removeAll = function (db) {
    logger.trace("Account DAO - removeAll");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM account",
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
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
            dbUtils.generateDBResponseFunctionUpdate(resolve, reject)
        );
    });
};