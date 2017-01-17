const check = require('../lib/types.js').check;
const _     = require('lodash');

const db            = require("./_shared.js").db;
const testObjects   = require("./_shared.js").testObjects;
const entryAAO      = require("./aao/entry.js");
const entryDAO      = require("../dao/entry.js");
const accountDAO    = require("../dao/account.js");
const accountingDAO = require("../dao/accounting.js");
const periodDAO     = require("../dao/period.js");

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;


describe("Entry DAO", function () {
    const account0    = testObjects.createTestAccount(0);
    const account1    = testObjects.createTestAccount(1);
    const period0     = testObjects.createTestPeriod(0);
    const period1     = testObjects.createTestPeriod(1);
    const accounting0 = testObjects.createTestAccounting(0, period0, account0);

    before(function () {
        return Promise.resolve()
            .then(() => { return accountDAO.removeAll(db); })
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return accountDAO.add(db, account1); })
            .then(() => { return periodDAO.removeAll(db); })
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.add(db, period1); })
            .then(() => { return accountingDAO.removeAll(db); })
            .then(() => { return accountingDAO.add(db, accounting0); });
    });

    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return entryDAO.removeAll(db); })
    });

    // ------------------------------------------------------------- TEST
    it("CRUD", function () {
        const entry0      = testObjects.createTestEntry(0, account0);
        const entry1      = testObjects.createTestEntry(1, account1);
        return Promise.resolve()
            // Test Add
            .then(() => { return entryDAO.add(db, entry0); })
            .then((id) => { return entryDAO.get(db, id); })
            .then((obj) => {
                check.assert.assigned(obj, "Added object is null");
                check.assert.assigned(obj.id, "ID not set");
                entry0.assertEquivalence(obj);
            })
            .then(() => { return entryDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 1, "Record not found by listAll after add");
            })

            // Test Update
            .then(() => { entry1.id = entry0.id; })
            .then(() => { return entryDAO.update(db, entry1); })
            .then(() => { return entryDAO.get(db, entry1.id); })
            .then((obj) => { entry1.assertEquivalence(obj); })

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
            var obj = new entryDAO.Entry("0", "1", "-100.0", "2016-07-01", "bank_note", "note", "tag", "where", "what");
            check.assert.equal(obj.id, 0);
            check.assert.equal(obj.account_id, 1);
            check.assert.equal(obj.amount, -100);
            check.assert.equal(obj.date, 1467331200000);
            check.assert.equal(obj.bank_note, "bank_note");
            check.assert.equal(obj.note, "note");
            check.assert.equal(obj.tag, "tag");
            check.assert.equal(obj.where, "where");
            check.assert.equal(obj.what, "what");
        });
    });

    // ------------------------------------------------------------- TEST
    it(".listByAccount", function () {
        const entry_sp_0 = testObjects.createTestEntry(0, account0);
        const entry_sp_1 = testObjects.createTestEntry(1, account0);
        const entry_sp_2 = testObjects.createTestEntry(2, account1);

        return Promise.resolve()
            .then(() => {
                return Promise.all([
                    entryDAO.add(db, entry_sp_0),
                    entryDAO.add(db, entry_sp_1),
                    entryDAO.add(db, entry_sp_2)]);
            })
            .then(() => { return entryDAO.listByAccount(db, account0.id) })
            .then((rows) => {
                check.assert.equal(rows.length, 2, "Incorrect number of entries retrieved");
                entry_sp_0.assertEquivalence(rows[0]);
                entry_sp_1.assertEquivalence(rows[1]);
            })
            .then(() => { return entryDAO.listByAccount(db, account1.id) })
            .then((rows) => {
                check.assert.equal(rows.length, 1, "Incorrect number of entries retrieved");
                entry_sp_2.assertEquivalence(rows[0]);
            });
    });

    // ------------------------------------------------------------- TEST
    it(".listByAccountAndPeriod", function () {
        const entry_sp_0  = testObjects.createTestEntry(0, account0);
        const entry_sp_1  = testObjects.createTestEntry(1, account0);
        const entry_sp_2  = testObjects.createTestEntry(2, account0);
        const entry_sp_3  = testObjects.createTestEntry(3, account1);
        entry_sp_0.date = period0.date_start + 1001;
        entry_sp_1.date = period0.date_start + 1002;
        entry_sp_2.date = period1.date_start + 1003;
        entry_sp_3.date = period0.date_start + 1004;

        return Promise.resolve()
            .then(() => {
                return Promise.all([
                    entryDAO.add(db, entry_sp_0),
                    entryDAO.add(db, entry_sp_1),
                    entryDAO.add(db, entry_sp_2),
                    entryDAO.add(db, entry_sp_3)]);
            })
            .then(() => { return entryDAO.listByAccountAndPeriod(db, account0.id, period0.id) })
            .then((rows) => {
                check.assert.equal(rows.length, 2, "Incorrect number of entries retrieved");
                entry_sp_0.assertEquivalence(rows[0]);
                entry_sp_1.assertEquivalence(rows[1]);
            });
    });

    // ------------------------------------------------------------- TEST
    it(".listByAccounting", function () {
        const entry_sp_0  = testObjects.createTestEntry(0, account0);
        const entry_sp_1  = testObjects.createTestEntry(1, account0);
        const entry_sp_2  = testObjects.createTestEntry(2, account0);
        const entry_sp_3  = testObjects.createTestEntry(3, account1);
        entry_sp_0.date = period0.date_start + 1001;
        entry_sp_1.date = period0.date_start + 1002;
        entry_sp_2.date = period1.date_start + 1003;
        entry_sp_3.date = period0.date_start + 1004;

        return Promise.resolve()
            .then(() => {
                return Promise.all([
                    entryDAO.add(db, entry_sp_0),
                    entryDAO.add(db, entry_sp_1),
                    entryDAO.add(db, entry_sp_2),
                    entryDAO.add(db, entry_sp_3)]);
            })
            .then(() => { return entryDAO.listByAccounting(db, accounting0.id) })
            .then((rows) => {
                check.assert.equal(rows.length, 2, "Incorrect number of entries retrieved");
                entry_sp_0.assertEquivalence(rows[0]);
                entry_sp_1.assertEquivalence(rows[1]);
            });
    });

    // ------------------------------------------------------------- TEST
    it(".listByPeriod", function () {
        const entry_sp_0  = testObjects.createTestEntry(0, account0);
        const entry_sp_1  = testObjects.createTestEntry(1, account0);
        const entry_sp_2  = testObjects.createTestEntry(2, account0);
        entry_sp_0.date = period0.date_start + 1001;
        entry_sp_1.date = period0.date_start + 5002;
        entry_sp_2.date = period1.date_start + 1003;

        return Promise.resolve()
            .then(() => {
                return Promise.all([
                    entryDAO.add(db, entry_sp_0),
                    entryDAO.add(db, entry_sp_1),
                    entryDAO.add(db, entry_sp_2)]);
            })
            .then(() => { return entryDAO.listByPeriod(db, period0.id) })
            .then((rows) => {
                check.assert.equal(rows.length, 2, "Incorrect number of entries retrieved");
                entry_sp_0.assertEquivalence(rows[0]);
                entry_sp_1.assertEquivalence(rows[1]);
            });
    });

    // ------------------------------------------------------------- TEST
    it(".removeAll", function () {
        const entry0      = testObjects.createTestEntry(0, account0);
        const entry1      = testObjects.createTestEntry(1, account1);
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


describe("Entry AJAX", function () {
    const account0 = testObjects.createTestAccount(0);
    const account1 = testObjects.createTestAccount(1);
    const period0  = testObjects.createTestPeriod(0);
    const period1  = testObjects.createTestPeriod(1);

    before(function () {
        return Promise.resolve()
            .then(() => { return accountDAO.removeAll(db); })
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return accountDAO.add(db, account1); })
            .then(() => { return periodDAO.removeAll(db); })
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.add(db, period1); });
    });

    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return entryDAO.removeAll(db); })
    });

    // ------------------------------------------------------------- TEST
    it(".listByAccountAndPeriod", function () {
        const entry_sp_0  = testObjects.createTestEntry(0, account0);
        const entry_sp_1  = testObjects.createTestEntry(1, account0);
        const entry_sp_2  = testObjects.createTestEntry(2, account0);
        const entry_sp_3  = testObjects.createTestEntry(3, account1);
        entry_sp_0.date = period0.date_start + 1001;
        entry_sp_1.date = period0.date_start + 1002;
        entry_sp_2.date = period1.date_start + 1003;
        entry_sp_3.date = period0.date_start + 1004;

        return Promise.resolve()
            .then(() => {
                return Promise.all([
                    entryDAO.add(db, entry_sp_0),
                    entryDAO.add(db, entry_sp_1),
                    entryDAO.add(db, entry_sp_2),
                    entryDAO.add(db, entry_sp_3)]);
            })
            .then(() => { return entryAAO.listByAccountAndPeriod(account0.id, period0.id) })
            .then((response) => {
                check.assert.equal(response.data.length, 2, "Incorrect number of entries retrieved");
                entry_sp_0.assertEquivalence(response.data[0]);
                entry_sp_1.assertEquivalence(response.data[1]);
            });
    });
});