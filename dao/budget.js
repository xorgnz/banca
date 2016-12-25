const logger = require("../lib/debug.js").logger;
const dbUtils = require("../lib/db-utils.js");

const table_name = "budget";

class Budget {
    constructor(id, code, type, amount) {
        this._id     = id ? id : -1;
        this._code   = code ? code : "";
        this._type   = type ? type  : "";
        this._amount = amount ? amount  : "";
    }
    get id()            { return this._id; }
    get code()          { return this._code; }
    get type()          { return this._type; }
    get amount()        { return this._amount; }
    set id(v)           { this._id = v; }
    set code(v)         { this._code = v; }
    set type(v)         { this._type = v; }
    set amount(v)       { this._amount = v; }

    static fieldNames() {
        return ["id", "code", "type", "amount"];
    }
}
exports.Budget = Budget;


exports.add = function(db, budget) {
    logger.trace("budget DAO - Add:");
    logger.trace(budget);
    return dbUtils.db_insert(db, table_name, Budget.fieldNames(), budget);
};


exports.get = function (db, id) {
    logger.trace("budget DAO - get: " + id);
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM budget " +
            "WHERE budget_id = ?",
            id,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.listAll = function(db) {
    logger.trace("budget DAO - listAll");
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM budget",
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.remove  = function (db, id) {
    logger.trace("budget DAO - remove: " + id);
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM budget " +
            "WHERE budget_id = ?",
            id,
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.removeAll = function (db) {
    logger.trace("budget DAO - removeAll");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM budget",
            dbUtils.generateDBResponseFunctionGet(resolve, reject)
        );
    });
};


exports.update = function(db, budget) {
    logger.trace("budget DAO - update:");
    logger.trace(budget);
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE budget SET       " +
            "   budget_code = ?,     " +
            "   budget_type = ?,     " +
            "   budget_amount = ?    " +
            "WHERE budget_id = ?",
            budget.code,
            budget.type,
            budget.amount,
            budget.id,
            dbUtils.generateDBResponseFunctionUpdate(resolve, reject)
        );
    });
};