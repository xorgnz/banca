const check  = require('../lib/check-types-wrapper.js').check;
const logger = require("../lib/debug.js").logger;
const shared = require("./_shared.js");


exports.types = [
    {id: 1, description: "Monthly Regular"},
    {id: 2, description: "Yearly Regular"},
    {id: 3, description: "One Off Special"},
    {id: 4, description: "Ongoing Special"},
];


class Budget extends shared.BancaObject {
    constructor(id, code, type, amount) {
        super();
        check.assert.equal(true, id === null || check.__numberlike(id));
        check.assert.string(code);
        check.assert.number(type);
        check.assert.number(amount);

        this.id     = id;
        this.code   = code;
        this.type   = type;
        this.amount = amount;
    }
    get id()            { return this._id; }
    get code()          { return this._code; }
    get type()          { return this._type; }
    get amount()        { return this._amount; }
    set id(v)           { this._id = v ? Number.parseInt(v) : -1; }
    set code(v)         { this._code = v ? v : ""; }
    set type(v)         {
        v = check.__numberlike(v) ? Number.parseInt(v) : 1;
        if (v < 1 || v > 4)
            v = 1;
        this._type = v;
    }
    set amount(v)       { this._amount = v ? Number.parseFloat(v) : 0; }

    static fromObject(obj) {
        return new Budget(
            obj.id,
            obj.code,
            obj.type,
            obj.amount);
    }
}
exports.Budget = Budget;


exports.add = function(db, budget) {
    logger.trace("budget DAO - Add:");
    logger.trace(budget);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.instance(budget, Budget);
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO budget (" +
            "   budget_code, " +
            "   budget_type, " +
            "   budget_amount) VALUES (?, ?, ?)",
            budget.code,
            budget.type,
            budget.amount,
            shared.generateDBResponseFunctionInsert(resolve, reject, budget)
        );
    });
};


exports.get = function (db, id) {
    logger.trace("budget DAO - get: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM budget " +
            "WHERE budget_id = ?",
            id,
            shared.generateDBResponseFunctionGet(resolve, reject, Budget.fromObject)
        );
    });
};


exports.listAll = function(db) {
    logger.trace("budget DAO - listAll");
    check.assert.equal(db.constructor.name, "Database");
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM budget",
            shared.generateDBResponseFunctionGet(resolve, reject, Budget.fromObject)
        );
    });
};


exports.remove  = function (db, id) {
    logger.trace("budget DAO - remove: " + id);
    check.assert.equal(db.constructor.name, "Database");
    check.assert(check.__numberlike(id));
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM budget " +
            "WHERE budget_id = ?",
            id,
            shared.generateDBResponseFunctionDelete(resolve, reject)
        );
    });
};


exports.removeAll = function (db) {
    logger.trace("budget DAO - removeAll");
    check.assert.equal(db.constructor.name, "Database");
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM budget",
            shared.generateDBResponseFunctionDelete(resolve, reject)
        );
    });
};


exports.update = function(db, budget) {
    logger.trace("budget DAO - update:");
    logger.trace(budget);
    check.assert.equal(db.constructor.name, "Database");
    check.assert.instance(budget, Budget);
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
            shared.generateDBResponseFunctionUpdate(resolve, reject)
        );
    });
};