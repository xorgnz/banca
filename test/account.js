const check = require('../lib/types.js').check;

const db          = require("./_shared.js").db;
const testObjects = require("./_shared.js").testObjects;
const accountDAO  = require("../dao/account.js");

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;

describe("Account DAO", function () {
    const account0 = testObjects.createTestAccount(0);
    const account1 = testObjects.createTestAccount(1);

    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return accountDAO.removeAll(db); })
    });

    // ------------------------------------------------------------- TEST
    it("CRUD", function () {
        return Promise.resolve()
            // Test Add
            .then(() => { return accountDAO.add(db, account0); })
            .then((id) => { return accountDAO.get(db, id); })
            .then((obj) => {
                check.assert.assigned(obj, "Added object is null");
                check.assert.assigned(obj.id, "ID not set");
                obj.assertEquivalence(account0);
            })
            .then(() => { return accountDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 1, "Record not found by listAll after add");
            })

            // Test Update
            .then(() => { account1.id = account0.id; })
            .then(() => { return accountDAO.update(db, account1); })
            .then(() => { return accountDAO.get(db, account1.id); })
            .then((obj) => { obj.assertEquivalence(account1); })

            // Test remove
            .then(() => { return accountDAO.remove(db, account0.id); })
            .then(() => { return accountDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 0, "Record remains after remove");
            });
    });

    // ------------------------------------------------------------- TEST
    it("Object construction", function () {
        describe("All fields passed in as strings", function () {
            var obj = new accountDAO.Account("0", "name", "description");
            check.assert.equal(obj.id, 0);
            check.assert.equal(obj.name, "name");
            check.assert.equal(obj.description, "description");
        });
    });

    // ------------------------------------------------------------- TEST
    it(".removeAll", function () {
        return Promise.resolve()
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return accountDAO.removeAll(db); })
            .then(() => { return accountDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 0, "Records remain after removeAll");
            })
    });
});
