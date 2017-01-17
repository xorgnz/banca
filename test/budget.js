const check = require('../lib/types.js').check;
const _     = require('lodash');

const db          = require("./_shared.js").db;
const testObjects = require("./_shared.js").testObjects;
const budgetDAO   = require("../dao/budget.js");
const budgetAAO   = require("./aao/budget.js");

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;


describe("Budget DAO", function () {

    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return budgetDAO.removeAll(db); })
    });

    it("CRUD", function () {
        const budget0 = testObjects.createTestBudget(0);
        const budget1 = testObjects.createTestBudget(1);
        return Promise.resolve()
            // Test Add
            .then(() => { return budgetDAO.add(db, budget0); })
            .then((id) => { return budgetDAO.get(db, id); })
            .then((obj) => {
                check.assert.assigned(obj, "Added object is null");
                check.assert.assigned(obj.id, "ID not set");
                budget0.assertEquivalence(obj);
            })
            .then(() => { return budgetDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 1, "Record not found by listAll after add");
            })

            // Test Update
            .then(() => { budget1.id = budget0.id; })
            .then(() => { return budgetDAO.update(db, budget1); })
            .then(() => { return budgetDAO.get(db, budget1.id); })
            .then((obj) => { budget1.assertEquivalence(obj); })

            // Test remove
            .then(() => { return budgetDAO.remove(db, budget0.id); })
            .then(() => { return budgetDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 0, "Record remains after remove");
            });
    });

    // ------------------------------------------------------------- TEST
    it("Object construction", function () {
        describe("All fields passed in as strings", function () {
            var obj = new budgetDAO.Budget("0", "code", "1", "-100.0");
            check.assert.equal(obj.id, 0);
            check.assert.equal(obj.code, "code");
            check.assert.equal(obj.type, 1);
            check.assert.equal(obj.amount, -100);
        });
    });

    // ------------------------------------------------------------- TEST
    it(".removeAll", function () {
        const budget0 = testObjects.createTestBudget(0);
        const budget1 = testObjects.createTestBudget(1);
        return Promise.resolve()
            .then(() => { return budgetDAO.add(db, budget0); })
            .then(() => { return budgetDAO.add(db, budget1); })
            .then(() => { return budgetDAO.removeAll(db); })
            .then(() => { return budgetDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 0, "Records remain after removeAll");
            })
    });
});


describe("Budget AJAX", function () {
    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return budgetDAO.removeAll(db); })
    });

    // ------------------------------------------------------------- TEST
    it("CRUD", function () {
        const budget0 = testObjects.createTestBudget(0);
        const budget1 = testObjects.createTestBudget(1);
        return Promise.resolve()
            // Test Add
            .then(() => { return budgetAAO.add(budget0); })
            .then((r) => { return budgetAAO.get(budget0.id); })
            .then((r) => { budget0.assertEquivalence(r.data); })
            .then(() => { return budgetAAO.listAll(db); })
            .then((r) => {
                check.assert.array(r.data, ".listAll - Returned data is not array");
                check.assert.equal(r.data.length, 1, "Record not found by listAll after add");
            })

            // Test Update
            .then(() => {
                budget1.id = budget0.id;
                return budgetAAO.update(budget1);
            })
            .then(() => { return budgetAAO.get(budget1.id); })
            .then((r) => { budget1.assertEquivalence(r.data); })

            // Test remove
            .then(() => {
                console.log(budget0);
                return budgetAAO.remove(budget0.id, "id");
            })
            .then(() => { return budgetAAO.listAll(db); })
            .then((r) => {
                check.assert.equal(r.data.length, 0, "Record remains after remove");
            });
    });
});
