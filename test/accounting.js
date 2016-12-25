const assert = require("chai").assert;
const logger = require("../lib/debug.js").logger;
const _      = require('lodash');

const db            = require("./_shared.js").db;
const testObjects   = require("./_shared.js").testObjects;
const periodDAO     = require("../dao/period.js");
const accountDAO    = require("../dao/account.js");
const entryDAO      = require("../dao/entry.js");
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
            .then(() => { return accountDAO.removeAll(db); })
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return accountDAO.add(db, account1); })
            .then(() => { return accountDAO.add(db, account2); });
    });

    beforeEach(() => {
        return Promise.resolve()
            .then(() => { return periodDAO.removeAll(db); })
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.add(db, period1); })
            .then(() => { return periodDAO.add(db, period2); })
            .then(() => { return accountingDAO.removeAll(db); })
    });

    // ------------------------------------------------------------- TEST
    it("CRUD", function () {
        return Promise.resolve()

            .then(() => { return accountingDAO.add(db, accounting0); })
            .then((id) => { return accountingDAO.get(db, id); })
            .then((obj) => {
                assert(obj.id, "ID not set");
                for (var key of accountingDAO.Accounting.fieldNames())
                    assert(obj[key] === accounting0[key], "Field '" + key + "' did not add");
            })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length == 1, "Record not found by listAll after add");
            })

            .then(() => { accounting1.id = accounting0.id; })
            .then(() => { return accountingDAO.update(db, accounting1); })
            .then(() => { return accountingDAO.get(db, accounting1.id); })
            .then((obj) => {
                for (var key of accountingDAO.Accounting.fieldNames())
                    assert(obj[key] === accounting1[key], "Field '" + key + "' did not update");
            })

            .then(() => { return accountingDAO.remove(db, accounting0.id); })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 0, "Record remains after remove");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".calc", function () {
        return Promise.resolve()
            .then(() => { return entryDAO.removeAll(db); })
            .then(() => { return accountingDAO.add(db, accounting2); })
            .then(() => {
                var entry_good0    = testObjects.createTestEntry(0, account2);
                var entry_good1    = testObjects.createTestEntry(0, account2);
                var entry_good2    = testObjects.createTestEntry(0, account2);
                var entry_bad0     = testObjects.createTestEntry(0, account2);
                var entry_bad1     = testObjects.createTestEntry(0, account1);
                entry_good0.date   = period2.date_start + 1000;
                entry_good1.date   = period2.date_start + 1001;
                entry_good2.date   = period2.date_start + 1002;
                entry_bad0.date    = period1.date_start + 1003;
                entry_bad1.date    = period2.date_start + 1004;
                entry_good0.amount = 2.95;
                entry_good1.amount = -1.00;
                entry_good2.amount = 3.82;
                return Promise.all([
                    entryDAO.add(db, entry_good0),
                    entryDAO.add(db, entry_good1),
                    entryDAO.add(db, entry_good2),
                    entryDAO.add(db, entry_bad0),
                    entryDAO.add(db, entry_bad1)]);
            })
            .then(() => { return entryDAO.listAll(db) })
            .then((rows) => { console.log("rr"); console.log(rows); })
            .then(() => { return accountingDAO.calc(db, accounting2.id); })
            .then(() => { return accountingDAO.get(db, accounting2.id); })
            .then((obj) => {
                assert(obj.amount_start == 0.02);
                assert(obj.amount_end == 5.79); // 2.95 - 1.00 + 3.82 + 0.02 (from test obj)
            });
    });

    // ------------------------------------------------------------- TEST
    it(".cascade", function () {
        var period_sp0     = new periodDAO.Period(null, "January-2010",
            new Date("2010-01-01").getTime(),
            new Date("2010-01-31").getTime());
        var period_sp1     = new periodDAO.Period(null, "February-2010",
            new Date("2010-02-01").getTime(),
            new Date("2010-02-28").getTime());
        var period_sp2     = new periodDAO.Period(null, "March-2010",
            new Date("2010-03-01").getTime(),
            new Date("2010-03-31").getTime());
        var period_sp3     = new periodDAO.Period(null, "April-2010",
            new Date("2010-04-01").getTime(),
            new Date("2010-04-30").getTime());
        var accounting_sp0 = new accountingDAO.Accounting(null, period_sp0, account0, 10.50, 20.50);
        var accounting_sp1 = new accountingDAO.Accounting(null, period_sp1, account0, 3.24, 13.24);
        var accounting_sp2 = new accountingDAO.Accounting(null, period_sp2, account0, 892.33, 907.33);
        var accounting_sp3 = new accountingDAO.Accounting(null, period_sp3, account0, -40.50, -50.50);
        var accounting_sp4 = new accountingDAO.Accounting(null, period_sp2, account1, 3.24, 13.24);

        return Promise.resolve()
            .then(() => { return periodDAO.add(db, period_sp0); })
            .then(() => { return periodDAO.add(db, period_sp1); })
            .then(() => { return periodDAO.add(db, period_sp2); })
            .then(() => { return periodDAO.add(db, period_sp3); })
            .then(() => { return accountingDAO.add(db, accounting_sp0); })
            .then(() => { return accountingDAO.add(db, accounting_sp1); })
            .then(() => { return accountingDAO.add(db, accounting_sp2); })
            .then(() => { return accountingDAO.add(db, accounting_sp3); })
            .then(() => { return accountingDAO.add(db, accounting_sp4); })
            .then(() => { return accountingDAO.cascade(db, accounting_sp1.id); })
            .then(() => { return accountingDAO.get(db, accounting_sp0.id); })
            .then((accounting) => {
                assert(accounting.amount_start === accounting_sp0.amount_start);
                assert(accounting.amount_end === accounting_sp0.amount_end);
            })

            .then(() => { return accountingDAO.get(db, accounting_sp1.id); })
            .then((accounting) => {
                assert(accounting.amount_start === accounting_sp1.amount_start);
                assert(accounting.amount_end === accounting_sp1.amount_end);
            })
            .then(() => { return accountingDAO.get(db, accounting_sp2.id); })
            .then((accounting) => {
                console.log(accounting);
                assert(accounting.amount_start === 13.24);
                assert(accounting.amount_end === 28.24);
            })
            .then(() => { return accountingDAO.get(db, accounting_sp3.id); })
            .then((accounting) => {
                assert(accounting.amount_start === 28.24);
                assert(accounting.amount_end === 18.24);
            })
            .then(() => { return accountingDAO.get(db, accounting_sp4.id); })
            .then((accounting) => {
                assert(accounting.amount_start === accounting_sp4.amount_start);
                assert(accounting.amount_end === accounting_sp4.amount_end);
            });
    });

    // ------------------------------------------------------------- TEST
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

    // ------------------------------------------------------------- TEST
    it(".createForPeriods (multiple periods)", function () {
        return Promise.resolve()
            .then(() => {
                var a = new accountingDAO.Accounting(null, period0.id, account0.id, 0, 0);
                return accountingDAO.add(db, a);
            })
            .then(() => {
                var a = new accountingDAO.Accounting(null, period1.id, account1.id, 0, 0);
                return accountingDAO.add(db, a);
            })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                console.log("Accountings before");
                console.log(rows);
            })
            .then(() => {
                return accountingDAO.createForPeriods(db,
                    [period0.id, period1.id, period2.id],
                    account0.id);
            })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                console.log("Accountings after");
                console.log(rows);
            })
            .then(() => { return accountingDAO.listByAccount(db, account0.id); })
            .then((rows) => {
                console.log(rows);
                assert(rows.length === 3, "Incorrect number of accountings created");
                assert(rows[0].period_id == period0.id, "Incorrect period ID on accounting");
                assert(rows[0].account_id == account0.id, "Incorrect account ID on accounting");
                assert(rows[1].period_id == period1.id, "Incorrect period ID on accounting");
                assert(rows[1].account_id == account0.id, "Incorrect account ID on accounting");
                assert(rows[2].period_id == period2.id, "Incorrect period ID on accounting");
                assert(rows[2].account_id == account0.id, "Incorrect account ID on accounting");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".getByDateAndAccount", function () {
        return Promise.resolve()
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.add(db, accounting1); })
            .then(() => { return accountingDAO.add(db, accounting2); })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2000-01-20").getTime(), account0.id);
            })
            .then((obj) => {
                for (var key of accountingDAO.Accounting.fieldNames())
                    assert(obj[key] === accounting0[key], "Incorrect accounting found");
            })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2001-01-31T23:59:59.999Z").getTime(), account1.id);
            })
            .then((obj) => {
                for (var key of accountingDAO.Accounting.fieldNames())
                    assert(obj[key] === accounting1[key], "Incorrect accounting found");
            })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2002-01-01T00:00:00.000Z").getTime(), account2.id);
            })
            .then((obj) => {
                for (var key of accountingDAO.Accounting.fieldNames())
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

    // ------------------------------------------------------------- TEST
    it(".getByPeriodAndAccount", function () {
        return Promise.resolve()
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.add(db, accounting1); })
            .then(() => { return accountingDAO.getByPeriodAndAccount(db, period0.id, account0.id); })
            .then((obj) => {
                for (var key of accountingDAO.Accounting.fieldNames())
                    assert(obj[key] === accounting0[key], "Incorrect accounting found");
            })
            .then(() => { return accountingDAO.getByPeriodAndAccount(db, period0.id, account1.id); })
            .then((obj) => {
                assert(obj === null, "Accounting found when should have been null");
            })
            .then(() => { return accountingDAO.getByPeriodAndAccount(db, period1.id, account1.id); })
            .then((obj) => {
                for (var key of accountingDAO.Accounting.fieldNames())
                    assert(obj[key] === accounting1[key], "Incorrect accounting found");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".listByAccount", function () {
        return Promise.resolve()
            .then(() => {
                var promises = [];
                promises.push(accountingDAO.add(db, new accountingDAO.Accounting(null, period0, account0, 0, 0)));
                promises.push(accountingDAO.add(db, new accountingDAO.Accounting(null, period1, account0, 0, 0)));
                promises.push(accountingDAO.add(db, new accountingDAO.Accounting(null, period2, account1, 0, 0)));
                return Promise.all(promises);
            })
            .then(() => { return accountingDAO.listByAccount(db, account0.id); })
            .then((rows) => {
                assert(rows.length === 2, "Incorrect number of accountings retrieved");
                assert(rows[0].period_id == period0.id);
                assert(rows[1].period_id == period1.id);
            });

    });

    // ------------------------------------------------------------- TEST
    it(".listOverDateRange", function () {
        return Promise.resolve()
            .then(() => {
                return periodDAO.createOverDateRange(db,
                    new Date("2015-06-01").getTime(),
                    new Date("2015-12-01").getTime());
            })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
                var promises = [];
                promises.push(accountingDAO.createForPeriods(db, _.map(rows, 'id'), account0.id));
                promises.push(accountingDAO.createForPeriods(db, _.map(rows, 'id'), account1.id));
                return Promise.all(promises);
            })
            .then(() => {
                return accountingDAO.listOverDateRange(db,
                    new Date("2015-07-05").getTime(),
                    new Date("2015-09-05").getTime(), account0.id);
            })
            .then((rows) => {
                console.log(rows);
                assert(rows.length === 3, "Incorrect number of accountings retrieved");
            })
            .then(() => {
                return accountingDAO.listOverDateRange(db,
                    new Date("2015-04-05").getTime(),
                    new Date("2015-06-05").getTime(), account0.id);
            })
            .then((rows) => {
                assert(rows.length === 1, "Incorrect number of accountings retrieved");
            })
            .then(() => {
                return accountingDAO.listOverDateRange(db,
                    new Date("2015-11-05").getTime(),
                    new Date("2016-02-05").getTime(), account0.id);
            })
            .then((rows) => {
                assert(rows.length === 2, "Incorrect number of accountings retrieved");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".listSelfAndFollowing", function () {
        var period_sp0     = new periodDAO.Period(null, "January-2010",
            new Date("2010-01-01").getTime(),
            new Date("2010-01-31").getTime());
        var period_sp1     = new periodDAO.Period(null, "February-2010",
            new Date("2010-02-01").getTime(),
            new Date("2010-02-28").getTime());
        var period_sp2     = new periodDAO.Period(null, "March-2010",
            new Date("2010-03-01").getTime(),
            new Date("2010-03-31").getTime());
        var period_sp3     = new periodDAO.Period(null, "April-2010",
            new Date("2010-04-01").getTime(),
            new Date("2010-04-30").getTime());
        var accounting_sp0 = testObjects.createTestAccounting(0, period_sp0, account0);
        var accounting_sp1 = testObjects.createTestAccounting(0, period_sp1, account0);
        var accounting_sp2 = testObjects.createTestAccounting(0, period_sp2, account0);
        var accounting_sp3 = testObjects.createTestAccounting(0, period_sp3, account0);
        var accounting_sp4 = testObjects.createTestAccounting(0, period_sp2, account1);
        return Promise.resolve()
            .then(() => { return periodDAO.add(db, period_sp0); })
            .then(() => { return periodDAO.add(db, period_sp1); })
            .then(() => { return periodDAO.add(db, period_sp2); })
            .then(() => { return periodDAO.add(db, period_sp3); })
            .then(() => { return accountingDAO.add(db, accounting_sp0); })
            .then(() => { return accountingDAO.add(db, accounting_sp1); })
            .then(() => { return accountingDAO.add(db, accounting_sp2); })
            .then(() => { return accountingDAO.add(db, accounting_sp3); })
            .then(() => { return accountingDAO.add(db, accounting_sp4); })
            .then(() => { return accountingDAO.listSelfAndFollowing(db, accounting_sp1.id); })
            .then((rows) => {
                console.log(rows);
                assert(rows.length === 3, "Incorrect number of accountings retrieved");
                assert(rows[0].id == accounting_sp1.id);
                assert(rows[1].id == accounting_sp2.id);
                assert(rows[2].id == accounting_sp3.id);
            });
    });

    // ------------------------------------------------------------- TEST
    it(".peekDatesAndAccount", function () {
        return Promise.resolve()
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.peekDatesAndAccount(db, accounting0.id); })
            .then((obj) => {
                assert(obj["date_start"] === period0["date_start"], ".date_start does not match on peek");
                assert(obj["date_end"] === period0["date_end"], ".date_end does not match on peek");
                assert(obj["account_id"] === account0["id"], ".account_id does not match on peek");
            });
    });

    // ------------------------------------------------------------- TEST
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
