const check = require('../lib/types.js').check;
const _     = require('lodash');

const db            = require("./_shared.js").db;
const testObjects   = require("./_shared.js").testObjects;
const entryDAO      = require("../dao/entry.js");
const accountDAO    = require("../dao/account.js");
const accountingDAO = require("../dao/accounting.js");
const periodDAO     = require("../dao/period.js");

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;


describe("Entry DAO", function () {
    const account0 = testObjects.createTestAccount(0);
    const account1 = testObjects.createTestAccount(1);
    const entry0   = testObjects.createTestEntry(0, account0);
    const entry1   = testObjects.createTestEntry(1, account1);

    before(function () {
        return Promise.resolve()
            .then(() => { return accountDAO.removeAll(db); })
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return accountDAO.add(db, account1); });
    });

    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return entryDAO.removeAll(db); })
    });

    // ------------------------------------------------------------- TEST
    it("CRUD", function () {
        return Promise.resolve()

            // Test Add
            .then(() => { return entryDAO.add(db, entry0); })
            .then((id) => { return entryDAO.get(db, id); })
            .then((obj) => {
                check.assert.assigned(obj, "Added object is null");
                check.assert.assigned(obj.id, "ID not set");
                obj.assertEquivalence(entry0);
            })
            .then(() => { return entryDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 1, "Record not found by listAll after add");
            })

            // Test Update
            .then(() => { entry1.id = entry0.id; })
            .then(() => { return entryDAO.update(db, entry1); })
            .then(() => { return entryDAO.get(db, entry1.id); })
            .then((obj) => { obj.assertEquivalence(entry1); })

            // Test remove
            .then(() => { return entryDAO.remove(db, entry0.id); })
            .then(() => { return entryDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 0, "Record remains after remove");
            });
    });

    // ------------------------------------------------------------- TEST
    it("Object construction", function () {
        describe("All fields passed in as strings", function () {
            var e = new entryDAO.Entry("0", "1", "-100.0", "2016-07-01", "bank_note", "note", "tag", "where", "what");
        });
    });

    // ------------------------------------------------------------- TEST
    it(".listByAccount", function () {
        var period0    = testObjects.createTestPeriod(0);
        var entry_sp_0 = testObjects.createTestEntry(0, account0);
        var entry_sp_1 = testObjects.createTestEntry(1, account0);
        var entry_sp_2 = testObjects.createTestEntry(2, account1);

        return Promise.resolve()
            .then(() => {
                return Promise.all([
                    periodDAO.add(db, period0),
                    entryDAO.add(db, entry_sp_0),
                    entryDAO.add(db, entry_sp_1),
                    entryDAO.add(db, entry_sp_2)]);
            })
            .then(() => { return entryDAO.listByAccount(db, account0.id) })
            .then((rows) => {
                check.assert.equal(rows.length, 2, "Incorrect number of entries retrieved");
                rows[0].assertEquivalence(entry_sp_0);
                rows[1].assertEquivalence(entry_sp_1);
            })
            .then(() => { return entryDAO.listByAccount(db, account1.id) })
            .then((rows) => {
                check.assert.equal(rows.length, 1, "Incorrect number of entries retrieved");
                rows[0].assertEquivalence(entry_sp_2);
            });
    });

    // ------------------------------------------------------------- TEST
    it(".listByAccounting", function () {
        var period0     = testObjects.createTestPeriod(0);
        var period1     = testObjects.createTestPeriod(1);
        var accounting0 = testObjects.createTestAccounting(0, period0, account0);
        var entry_sp_0  = testObjects.createTestEntry(0, account0);
        var entry_sp_1  = testObjects.createTestEntry(1, account0);
        var entry_sp_2  = testObjects.createTestEntry(2, account0);
        var entry_sp_3  = testObjects.createTestEntry(3, account1);
        entry_sp_0.date = period0.date_start + 1001;
        entry_sp_1.date = period0.date_start + 1002;
        entry_sp_2.date = period1.date_start + 1003;
        entry_sp_3.date = period0.date_start + 1004;

        return Promise.resolve()
            .then(() => { return periodDAO.removeAll(db); })
            .then(() => { return accountingDAO.removeAll(db); })
            .then(() => {
                return Promise.all([
                    periodDAO.add(db, period0),
                    periodDAO.add(db, period1),
                    entryDAO.add(db, entry_sp_0),
                    entryDAO.add(db, entry_sp_1),
                    entryDAO.add(db, entry_sp_2),
                    entryDAO.add(db, entry_sp_3)]);
            })
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return entryDAO.listByAccounting(db, accounting0.id) })
            .then((rows) => {
                check.assert.equal(rows.length, 2, "Incorrect number of entries retrieved");
                rows[0].assertEquivalence(entry_sp_0);
                rows[1].assertEquivalence(entry_sp_1);
            });
    });

    // ------------------------------------------------------------- TEST
    it(".listByPeriod", function () {
        var period0     = testObjects.createTestPeriod(0);
        var period1     = testObjects.createTestPeriod(1);
        var entry_sp_0  = testObjects.createTestEntry(0, account0);
        var entry_sp_1  = testObjects.createTestEntry(1, account0);
        var entry_sp_2  = testObjects.createTestEntry(2, account0);
        entry_sp_0.date = period0.date_start + 1001;
        entry_sp_1.date = period0.date_start + 5002;
        entry_sp_2.date = period1.date_start + 1003;

        return Promise.resolve()
            .then(() => {
                return Promise.all([
                    periodDAO.add(db, period0),
                    periodDAO.add(db, period1),
                    entryDAO.add(db, entry_sp_0),
                    entryDAO.add(db, entry_sp_1),
                    entryDAO.add(db, entry_sp_2)]);
            })
            .then(() => { return entryDAO.listByPeriod(db, period0.id) })
            .then((rows) => {
                check.assert.equal(rows.length, 2, "Incorrect number of entries retrieved");
                rows[0].assertEquivalence(entry_sp_0);
                rows[1].assertEquivalence(entry_sp_1);
            });
    });

    // ------------------------------------------------------------- TEST
    it(".removeAll", function () {
        return Promise.resolve()
            .then(() => { return entryDAO.add(db, entry0); })
            .then(() => { return entryDAO.add(db, entry0); })
            .then(() => { return entryDAO.removeAll(db); })
            .then(() => { return entryDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 0, "Records remain after removeAll");
            })
    });
});
