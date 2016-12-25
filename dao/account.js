const logger  = require("../lib/debug.js").logger;
const dbUtils = require("../lib/db-utils.js");
const check   = require('../lib/check-types-wrapper.js').check;

const table_name = "account";

class Account {
    constructor(id, name, description) {
        check.assert.equal(true, id === null || check.number(id));
        check.assert.string(name);
        check.assert.string(description);
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

    static fromObject(obj) {
        return new Account(
            obj.id,
            obj.name,
            obj.description);
    }

    static fieldNames() {
        return ["id", "name", "description"];
    }
}
exports.Account = Account;


exports.add = function(db, account) {
    logger.trace("Account DAO - Add:");
    logger.trace(account);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.instance(account, Account);
    return dbUtils.db_insert(db, table_name, Account.fieldNames(), account);
};


exports.get = function (db, id) {
    logger.trace("Account DAO - get: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.number(id);
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
    check.assert.equal(db.constructor.name, "Database");
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM account",
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.remove  = function (db, id) {
    logger.trace("Account DAO - remove: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.number(id);
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM account " +
            "WHERE account_id = ?",
            id,
            dbUtils.generateDBResponseFunctionDelete(resolve, reject)
        );
    });
};


exports.removeAll = function (db) {
    logger.trace("Account DAO - removeAll");
    check.assert.equal(db.constructor.name, "Database");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM account",
            dbUtils.generateDBResponseFunctionDelete(resolve, reject)
        );
    });
};


exports.update = function(db, account) {
    logger.trace("Account DAO - update:");
    logger.trace(account);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.instance(account, Account);
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