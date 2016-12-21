const assert = require("chai").assert;
const logger = require("../lib/debug.js").logger;
const _      = require('lodash');

const db            = require("./_shared.js").db;
const testObjects   = require("./_shared.js").testObjects;
const periodDAO     = require("../dao/period.js");
const accountDAO    = require("../dao/account.js");
const accountingDAO = require("../dao/accounting.js");

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;


describe("Accounting DAO", function () {
    const period0     = testObjects.createTestPeriod(0);
    const account0    = testObjects.createTestAccount(0);
    const period1     = testObjects.createTestPeriod(1);
    const account1    = testObjects.createTestAccount(1);
    const period2     = testObjects.createTestPeriod(2);
    const account2    = testObjects.createTestAccount(2);
    const accounting0 = testObjects.createTestAccounting(0, period0, account0);
    const accounting1 = testObjects.createTestAccounting(1, period1, account1);
    const accounting2 = testObjects.createTestAccounting(2, period2, account2);

    before(() => {
        return Promise.resolve()
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return periodDAO.add(db, period1); })
            .then(() => { return accountDAO.add(db, account1); })
            .then(() => { return periodDAO.add(db, period2); })
            .then(() => { return accountDAO.add(db, account2); });
    });

    beforeEach(() => {
        return Promise.resolve()
            .then(() => { return accountingDAO.removeAll(db); })
    });

    it("CRUD", function () {
        return Promise.resolve()

            // Test Add
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then((id) => { return accountingDAO.get(db, id); })
            .then((obj) => {
                assert(obj.id, "ID not set");
                for (var key of accountingDAO.Accounting.equivalenceFields())
                    assert(obj[key] === accounting0[key], "Field '" + key + "' did not add");
            })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length == 1, "Record not found by listAll after add");
            })

            // Test Update
            .then(() => { accounting1.id = accounting0.id; })
            .then(() => { return accountingDAO.update(db, accounting1); })
            .then(() => { return accountingDAO.get(db, accounting1.id); })
            .then((obj) => {
                for (var key of accountingDAO.Accounting.equivalenceFields())
                    assert(obj[key] === accounting1[key], "Field '" + key + "' did not update");
            })

            // Test remove
            .then(() => { return accountingDAO.remove(db, accounting0.id); })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 0, "Record remains after remove");
            });
    });

    // Test Create accountings for single period
    it(".createForPeriods (single period)", function () {
        return Promise.resolve()
            .then(() => {
                return accountingDAO.createForPeriods(db,
                    [period0.id],
                    account0.id);
            })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 1, "Incorrect number of accountings created");
                assert(rows[0].period_id == period0.id, "Incorrect period ID on accounting");
                assert(rows[0].account_id == account0.id, "Incorrect account ID on accounting");
            });
    });

    // Test Create accountings for multiple periods
    it(".createForPeriods (multiple periods)", function () {
        return Promise.resolve()
            .then(() => {
                return accountingDAO.createForPeriods(db,
                    [period0.id, period1.id, period2.id],
                    account0.id);
            })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                rows = _.sortBy(rows, 'period_id');
                assert(rows.length === 3, "Incorrect number of accountings created");
                assert(rows[0].period_id == period0.id, "Incorrect period ID on accounting");
                assert(rows[0].account_id == account0.id, "Incorrect account ID on accounting");
                assert(rows[1].period_id == period1.id, "Incorrect period ID on accounting");
                assert(rows[1].account_id == account0.id, "Incorrect account ID on accounting");
                assert(rows[2].period_id == period2.id, "Incorrect period ID on accounting");
                assert(rows[2].account_id == account0.id, "Incorrect account ID on accounting");
            });
    });

    // Test getByPeriodAndAccount
    it(".getByPeriodAndAccount", function () {
        return Promise.resolve()
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.add(db, accounting1); })
            .then(() => { return accountingDAO.getByPeriodAndAccount(db, period0.id, account0.id); })
            .then((obj) => {
                for (var key of accountingDAO.Accounting.equivalenceFields())
                    assert(obj[key] === accounting0[key], "Incorrect accounting found");
            })
            .then(() => { return accountingDAO.getByPeriodAndAccount(db, period0.id, account1.id); })
            .then((obj) => {
                assert(obj === null, "Accounting found when should have been null");
            })
            .then(() => { return accountingDAO.getByPeriodAndAccount(db, period1.id, account1.id); })
            .then((obj) => {
                for (var key of accountingDAO.Accounting.equivalenceFields())
                    assert(obj[key] === accounting1[key], "Incorrect accounting found");
            });
    });

    // Test getByDateAndAccount
    it(".getByDateAndAccount", function () {
        return Promise.resolve()
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.add(db, accounting1); })
            .then(() => { return accountingDAO.add(db, accounting2); })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2000-01-20").getTime(), account0.id);
            })
            .then((obj) => {
                for (var key of accountingDAO.Accounting.equivalenceFields())
                    assert(obj[key] === accounting0[key], "Incorrect accounting found");
            })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2001-01-31T23:59:59.999Z").getTime(), account1.id);
            })
            .then((obj) => {
                for (var key of accountingDAO.Accounting.equivalenceFields())
                    assert(obj[key] === accounting1[key], "Incorrect accounting found");
            })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2002-01-01T00:00:00.000Z").getTime(), account2.id);
            })
            .then((obj) => {
                for (var key of accountingDAO.Accounting.equivalenceFields())
                    assert(obj[key] === accounting2[key], "Incorrect accounting found");
            })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2000-04-20").getTime(), account0.id);
            })
            .then((obj) => {
                assert(obj === null, "Expecting null - no period should match - bad date");
            })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2000-01-20").getTime(), 999999999);
            })
            .then((obj) => {
                assert(obj === null, "Expecting null - no period should match - bad account");
            });
    });

    // Test removeAll
    it(".removeAll", function () {
        return Promise.resolve()
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.removeAll(db); })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 0, "Records remain after removeAll");
            })
    });
});
