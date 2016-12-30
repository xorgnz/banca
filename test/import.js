const check = require('../lib/check-types-wrapper.js').check;
const _     = require('lodash');

const importer      = require("../tools/importer.js");
const db            = require("./_shared.js").db;
const periodDAO     = require("../dao/period.js");
const accountDAO    = require("../dao/account.js");
const entryDAO      = require("../dao/entry.js");
const accountingDAO = require("../dao/accounting.js");
const testObjects   = require("./_shared.js").testObjects;

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;


describe("Importer", function () {
    const period0     = new periodDAO.Period(null, "January-2016",
        new Date("2016-01-01").getTime(),
        new Date("2016-01-31").getTime());
    const period1     = new periodDAO.Period(null, "February-2016",
        new Date("2016-02-01").getTime(),
        new Date("2016-02-28").getTime());
    const account0    = testObjects.createTestAccount(0);
    const account1    = testObjects.createTestAccount(1);
    const accounting0 = testObjects.createTestAccounting(0, period0, account0);

    beforeEach(() => {
        return Promise.resolve()
            .then(() => { return periodDAO.removeAll(db); })
            .then(() => { return accountDAO.removeAll(db); })
            .then(() => { return accountingDAO.removeAll(db); })
            .then(() => { return entryDAO.removeAll(db); })
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.add(db, period1); })
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return accountDAO.add(db, account1); })
            .then(() => { return accountingDAO.add(db, accounting0); });
    });

    // ------------------------------------------------------------- TEST
    it("Fails correctly if account is missing", () => {
        return Promise.resolve()
            .then(() => { return importer.importFromCsv(db, "test/import/import_success.csv", account1.id + 100); })
            .then(() => { check.assert(false, "Error was not detected"); })
            .catch((err) => {
                check.assert.contains(err.message, "no account exists", "Bad error message");
            });
    });

    // ------------------------------------------------------------- TEST
    it("Fails correctly if amount is missing", () => {
        return Promise.resolve()
            .then(() => { return importer.importFromCsv(db, "test/import/import_fail_amount.csv", account0.id); })
            .then(() => { check.assert(false, "Error was not detected"); })
            .catch((err) => {
                check.assert.not.undefined(err.badRows, "Bad rows construct does not exist");
                check.assert.equal(err.badRows.length, 1, "Incorrect number of bad rows detected");
                check.assert.not.number(err.badRows[0].amount_pre, "amount_pre column should be NaN");
                check.assert.not.number(err.badRows[0].amount_pre2, "amount_pre2 column should be NaN");
                check.assert.equal(err.badRows[0].reasons.length, 1, "Incorrect number of reasons for failure");
                check.assert.equal(err.badRows[0].reasons[0], "Amount columns empty or non-numeric", "Bad reason");
            });
    });

    // ------------------------------------------------------------- TEST
    it("Fails correctly if date is missing", () => {
        return Promise.resolve()
            .then(() => { return importer.importFromCsv(db, "test/import/import_fail_date.csv", account0.id); })
            .then(() => { check.assert(false, "Error was not detected"); })
            .catch((err) => {
                check.assert.not.undefined(err.badRows, "Bad rows construct does not exist");
                check.assert.equal(err.badRows.length, 3, "Incorrect number of bad rows detected");
                check.assert.equal(err.badRows[0].reasons.length, 1, "Incorrect number of reasons for failure");
                check.assert.equal(err.badRows[0].reasons[0], "Date column is empty", "Bad reason");
                check.assert.equal(err.badRows[1].reasons.length, 1, "Incorrect number of reasons for failure");
                check.assert.contains(err.badRows[1].reasons[0], "cannot be parsed", "Bad reason");
                check.assert.equal(err.badRows[2].reasons.length, 1, "Incorrect number of reasons for failure");
                check.assert.contains(err.badRows[2].reasons[0], "cannot be parsed", "Bad reason");
            });
    });

    // ------------------------------------------------------------- TEST
    it("Fails correctly if file is empty", () => {
        return Promise.resolve()
            .then(() => { return importer.importFromCsv(db, "test/import/does_not_exist.csv", account0.id); })
            .then(() => { check.assert(false, "Error was not detected"); })
            .catch((err) => {
                check.assert.contains(err.message, "file does not exist", "Bad error message");
            });
    });

    // ------------------------------------------------------------- TEST
    it("Imports correct data", () => {
        return Promise.resolve()
            .then(() => { return importer.importFromCsv(db, "test/import/import_success.csv", account0.id); })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 5, "Incorrect number of periods post import");
            })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 5, "Incorrect number of accountings post import");
                check.assert.equal(rows[0].amount_start, 0);
                check.assert.equal(rows[0].amount_end, 1.1);
                check.assert.equal(rows[1].amount_start, 1.1);
                check.assert.equal(rows[1].amount_end, 2.2);
                check.assert.equal(rows[2].amount_start, 2.2);
                check.assert.equal(rows[2].amount_end, 4.4);
                check.assert.equal(rows[3].amount_start, 4.4);
                check.assert.equal(rows[3].amount_end, 5.5);
                check.assert.equal(rows[4].amount_start, 5.5);
                check.assert.equal(rows[4].amount_end, 6.6);
            })
            .then(() => { return entryDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 6, "Incorrect number of entries created");
                for (var i = 0; i < rows.length; i++) {
                    check.assert.equal(rows[i].amount, 1.1);
                    check.assert.equal(rows[i].where, "Where");
                    check.assert.equal(rows[i].what, "What");
                    check.assert.equal(rows[i].note, "Note");
                    if (i < 4)
                        check.assert.equal(rows[i].tag, "Games");
                    else
                        check.assert.equal(rows[i].tag, "Unknown");
                }
            });
    });
});