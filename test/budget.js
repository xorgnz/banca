const assert  = require("chai").assert;
const sqlite3 = require('sqlite3');
const logger  = require("../lib/debug.js").logger;
const _       = require('lodash');

const db        = new sqlite3.Database('test.sqlite');
const budgetDAO = require("../dao/budget.js");
const testObjects   = require("./objects.js");

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;


describe("Budget DAO", function () {
    const budget0 = testObjects.createTestBudget(0);
    const budget1 = testObjects.createTestBudget(1);

    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return budgetDAO.removeAll(db); })
    });

    it("CRUD", function () {
        return Promise.resolve()

            // Test Add
            .then(() => { return budgetDAO.add(db, budget0); })
            .then((id) => { return budgetDAO.get(db, id); })
            .then((obj) => {
                assert(obj.id, "ID not set");
                for (var key of budgetDAO.Budget.equivalenceFields())
                    assert(obj[key] === budget0[key], "Field '" + key + "' did not add");
            })
            .then(() => { return budgetDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length == 1, "Record not found by listAll after add");
            })

            // Test Update
            .then(() => { budget1.id = budget0.id; })
            .then(() => { return budgetDAO.update(db, budget1); })
            .then(() => { return budgetDAO.get(db, budget1.id); })
            .then((obj) => {
                for (var key of budgetDAO.Budget.equivalenceFields())
                    assert(obj[key] === budget1[key], "Field '" + key + "' did not update");
            })

            // Test remove
            .then(() => { return budgetDAO.remove(db, budget0.id); })
            .then(() => { return budgetDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 0, "Record remains after remove");
            });
    });

        // Test removeAll
    it(".removeAll", function () {
        return Promise.resolve()
            .then(() => { return budgetDAO.add(db, budget0); })
            .then(() => { return budgetDAO.add(db, budget0); })
            .then(() => { return budgetDAO.removeAll(db); })
            .then(() => { return budgetDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 0, "Records remain after removeAll");
            })
    });
});
