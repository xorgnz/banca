const assert = require("chai").assert;
const logger = require("../lib/debug.js").logger;
const _      = require('lodash');

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

    it("CRUD", function () {
        return Promise.resolve()

            // Test Add
            .then(() => { return accountDAO.add(db, account0); })
            .then((id) => { return accountDAO.get(db, id); })
            .then((obj) => {
                assert(obj.id, "ID not set");
                for (var key of accountDAO.Account.equivalenceFields())
                    assert(obj[key] === account0[key], "Field '" + key + "' did not add");
            })
            .then(() => { return accountDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length == 1, "Record not found by listAll after add");
            })

            // Test Update
            .then(() => { account1.id = account0.id; })
            .then(() => { return accountDAO.update(db, account1); })
            .then(() => { return accountDAO.get(db, account1.id); })
            .then((obj) => {
                for (var key of accountDAO.Account.equivalenceFields())
                    assert(obj[key] === account1[key], "Field '" + key + "' did not update");
            })

            // Test remove
            .then(() => { return accountDAO.remove(db, account0.id); })
            .then(() => { return accountDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 0, "Record remains after remove");
            });
    });
    // Test removeAll
    it(".removeAll", function () {
        return Promise.resolve()
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return accountDAO.removeAll(db); })
            .then(() => { return accountDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 0, "Records remain after removeAll");
            })
    });
});
