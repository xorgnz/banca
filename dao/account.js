const _      = require('lodash');
const check  = require('../lib/check-types-wrapper.js').check;
const logger = require("../lib/debug.js").logger;
const shared = require("./_shared.js");

class Account extends shared.BancaObject {
    constructor(id, name, description) {
        super();
        check.assert.equal(true, check.not.assigned(id) || check.__numberlike(id));
        check.assert.string(name);
        check.assert.string(description);
        this.id          = id;
        this.name        = name;
        this.description = description;
    }
    get id()            { return this._id; }
    get name()          { return this._name; }
    get description()   { return this._description; }
    set id(v)           { this._id = v ? Number.parseInt(v) : -1; }
    set name(v)         { this._name = v ? v.toString() : ""; }
    set description(v)  { this._description = v ? v.toString() : ""; }

    validate(obj) {
        var errors = [];
        errors = _.concat(errors, shared.vs_stringNotEmpty(obj.name, "name"));
        errors = _.concat(errors, shared.vs_stringNotEmpty(obj.description, "description"));
        return errors;
    }

    static fromObject(obj) {
        return new Account(
            obj.id,
            obj.name,
            obj.description);
    }
}
exports.Account = Account;


exports.add = function(db, account) {
    logger.trace("Account DAO - Add:");
    logger.trace(account);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.instance(account, Account);
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO account (" +
            "   account_name, " +
            "   account_description) VALUES (?, ?)",
            account.name,
            account.description,
            shared.generateDBResponseFunctionInsert(resolve, reject, account)
        );
    });
};


exports.get = function (db, id) {
    logger.trace("Account DAO - get: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM account " +
            "WHERE account_id = ?",
            id,
            shared.generateDBResponseFunctionGet(resolve, reject, Account.fromObject)
        );
    });
};


exports.listAll = function(db) {
    logger.trace("Account DAO - listAll");
    check.assert.equal(db.constructor.name, "Database");
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM account",
            shared.generateDBResponseFunctionGet(resolve, reject, Account.fromObject)
        );
    });
};


exports.remove  = function (db, id) {
    logger.trace("Account DAO - remove: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM account " +
            "WHERE account_id = ?",
            id,
            shared.generateDBResponseFunctionDelete(resolve, reject)
        );
    });
};


exports.removeAll = function (db) {
    logger.trace("Account DAO - removeAll");
    check.assert.equal(db.constructor.name, "Database");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM account",
            shared.generateDBResponseFunctionDelete(resolve, reject)
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
            shared.generateDBResponseFunctionUpdate(resolve, reject)
        );
    });
};