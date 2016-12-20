const assert = require("chai").assert;
const logger = require("../lib/debug.js").logger;
const _      = require('lodash');

const db          = require("./_shared.js").db;
const testObjects = require("./_shared.js").testObjects;
const entryDAO    = require("../dao/entry.js");
const accountDAO  = require("../dao/account.js");

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;


var createTestEntry     = function (num, account) {
    return new entryDAO.Entry(
        null,
        account,
        num * 0.01,
        num + 1000,
        "Bank Note " + num,
        "Note " + num,
        "Tag " + num,
        "Where " + num,
        "What " + num)
};
exports.createTestEntry = createTestEntry;


describe("Entry DAO", function () {
    const account0 = testObjects.createTestAccount(0);
    const account1 = testObjects.createTestAccount(1);
    const entry0   = testObjects.createTestEntry(0, account0);
    const entry1   = testObjects.createTestEntry(1, account1);

    before(function () {
        return Promise.resolve()
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return accountDAO.add(db, account1); });
    });

    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return entryDAO.removeAll(db); })
    });

    it("CRUD", function () {
        return Promise.resolve()

            // Test Add
            .then(() => { return entryDAO.add(db, entry0); })
            .then((id) => { return entryDAO.get(db, id); })
            .then((entry) => {
                assert(entry.id, "ID not set");
                for (var key of entryDAO.Entry.equivalenceFields())
                    assert(entry[key] === entry0[key], "Field '" + key + "' did not add");
            })
            .then(() => { return entryDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length == 1, "Record not found by listAll after add");
            })

            // Test Update
            .then(() => { entry1.id = entry0.id; })
            .then(() => { return entryDAO.update(db, entry1); })
            .then(() => { return entryDAO.get(db, entry1.id); })
            .then((entry) => {
                for (var key of entryDAO.Entry.equivalenceFields())
                    assert(entry[key] === entry1[key], "Field '" + key + "' did not update");
            })

            // Test remove
            .then(() => { return entryDAO.remove(db, entry0.id); })
            .then(() => { return entryDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 0, "Record remains after remove");
            });
    });

    // Test removeAll
    it(".removeAll", function () {
        return Promise.resolve()
            .then(() => { return entryDAO.add(db, entry0); })
            .then(() => { return entryDAO.add(db, entry0); })
            .then(() => { return entryDAO.removeAll(db); })
            .then(() => { return entryDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 0, "Records remain after removeAll");
            })
    });
});
