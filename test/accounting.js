const check = require('../lib/types.js').check;
const _     = require('lodash');

const db            = require("./_shared.js").db;
const testObjects   = require("./_shared.js").testObjects;
const periodDAO     = require("../dao/period.js");
const accountDAO    = require("../dao/account.js");
const entryDAO      = require("../dao/entry.js");
const accountingDAO = require("../dao/accounting.js");
const accountingAAO = require("./aao/accounting.js");

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;


describe("Accounting DAO", function () {
    const period0  = testObjects.createTestPeriod(0);
    const period1  = testObjects.createTestPeriod(1);
    const period2  = testObjects.createTestPeriod(2);
    const account0 = testObjects.createTestAccount(0);
    const account1 = testObjects.createTestAccount(1);
    const account2 = testObjects.createTestAccount(2);

    before(() => {
        return Promise.resolve()
            .then(() => { return accountDAO.removeAll(db); })
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return accountDAO.add(db, account1); })
            .then(() => { return accountDAO.add(db, account2); })
    });

    beforeEach(() => {
        return Promise.resolve()
            .then(() => { return periodDAO.removeAll(db); })
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.add(db, period1); })
            .then(() => { return periodDAO.add(db, period2); })
            .then(() => { return accountingDAO.removeAll(db); });
    });

    // ------------------------------------------------------------- TEST
    it("CRUD", function () {
        const accounting0 = testObjects.createTestAccounting(0, period0, account0);
        const accounting1 = testObjects.createTestAccounting(1, period1, account1);
        return Promise.resolve()
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then((id) => { return accountingDAO.get(db, id); })
            .then((obj) => {
                check.assert.assigned(obj, "Added object is null");
                check.assert.assigned(obj.id, "ID not set");
                accounting0.assertEquivalence(obj);
            })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 1, "Record not found by listAll after add");
            })

            .then(() => { accounting1.id = accounting0.id; })
            .then(() => { return accountingDAO.update(db, accounting1); })
            .then(() => { return accountingDAO.get(db, accounting1.id); })
            .then((obj) => { accounting1.assertEquivalence(obj); })

            .then(() => { return accountingDAO.remove(db, accounting0.id); })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 0, "Record remains after remove");
            });
    });

    // ------------------------------------------------------------- TEST
    it("Object construction", function () {
        describe("All fields passed in as strings", function () {
            var obj = new accountingDAO.Accounting("0", "1", "2", "-100.1", "-200.2");
            check.assert.equal(obj.id, 0);
            check.assert.equal(obj.period_id, 1);
            check.assert.equal(obj.account_id, 2);
            check.assert.equal(obj.amount_start, -100.1);
            check.assert.equal(obj.amount_end, -200.2);
        });
    });

    // ------------------------------------------------------------- TEST
    it(".calc", function () {
        const accounting0 = testObjects.createTestAccounting(0, period0, account0);
        return Promise.resolve()
            .then(() => { return entryDAO.removeAll(db); })
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => {
                var entry_good0    = testObjects.createTestEntry(0, account0);
                var entry_good1    = testObjects.createTestEntry(0, account0);
                var entry_good2    = testObjects.createTestEntry(0, account0);
                var entry_bad0     = testObjects.createTestEntry(0, account0);
                var entry_bad1     = testObjects.createTestEntry(0, account1);
                entry_good0.date   = period0.date_start + 1000;
                entry_good1.date   = period0.date_start + 1001;
                entry_good2.date   = period0.date_start + 1002;
                entry_bad0.date    = period2.date_start + 1003;
                entry_bad1.date    = period0.date_start + 1004;
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
            .then(() => { return accountingDAO.calc(db, accounting0.id); })
            .then(() => { return accountingDAO.get(db, accounting0.id); })
            .then((obj) => {
                check.assert.equal(obj.amount_start, 0.00);
                check.assert.equal(obj.amount_end, 5.77); // 2.95 - 1.00 + 3.82 + 0.02 (from test obj)
            });
    });

    // ------------------------------------------------------------- TEST
    it(".cascade", function () {
        var period_sp0     = new periodDAO.Period(null, "January-2010", new Date("2010-01-01"), new Date("2010-01-31"));
        var period_sp1     = new periodDAO.Period(null, "February-2010", new Date("2010-02-01"), new Date("2010-02-28"));
        var period_sp2     = new periodDAO.Period(null, "March-2010", new Date("2010-03-01"), new Date("2010-03-31"));
        var period_sp3     = new periodDAO.Period(null, "April-2010", new Date("2010-04-01"), new Date("2010-04-30"));
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
            .then((obj) => { accounting_sp0.assertEquivalence(obj); })
            .then(() => { return accountingDAO.get(db, accounting_sp1.id); })
            .then((obj) => { accounting_sp1.assertEquivalence(obj); })
            .then(() => { return accountingDAO.get(db, accounting_sp2.id); })
            .then((accounting) => {
                check.assert.equal(accounting.amount_start, 13.24);
                check.assert.equal(accounting.amount_end, 28.24);
            })
            .then(() => { return accountingDAO.get(db, accounting_sp3.id); })
            .then((accounting) => {
                check.assert.equal(accounting.amount_start, 28.24);
                check.assert.equal(accounting.amount_end, 18.24);
            })
            .then(() => { return accountingDAO.get(db, accounting_sp4.id); })
            .then((accounting) => {
                check.assert.equal(accounting.amount_start, accounting_sp4.amount_start);
                check.assert.equal(accounting.amount_end, accounting_sp4.amount_end);
            });
    });

    // ------------------------------------------------------------- TEST
    it(".createForPeriods (single period)", function () {
        return Promise.resolve()
            .then(() => { return accountingDAO.createForPeriods(db, [period0.id], account0.id); })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 1, "Incorrect number of accountings created");
                check.assert.equal(rows[0].period_id, period0.id, "Incorrect period ID on accounting");
                check.assert.equal(rows[0].account_id, account0.id, "Incorrect account ID on accounting");
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
            .then(() => {
                return accountingDAO.createForPeriods(db,
                    [period0.id, period1.id, period2.id],
                    account0.id);
            })
            .then(() => { return accountingDAO.listByAccount(db, account0.id); })
            .then((rows) => {
                check.assert.equal(rows.length, 3, "Incorrect number of accountings created");
                check.assert.equal(rows[0].period_id, period0.id, "Incorrect period ID on accounting");
                check.assert.equal(rows[0].account_id, account0.id, "Incorrect account ID on accounting");
                check.assert.equal(rows[1].period_id, period1.id, "Incorrect period ID on accounting");
                check.assert.equal(rows[1].account_id, account0.id, "Incorrect account ID on accounting");
                check.assert.equal(rows[2].period_id, period2.id, "Incorrect period ID on accounting");
                check.assert.equal(rows[2].account_id, account0.id, "Incorrect account ID on accounting");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".createOverDateRange", function () {
        var period_sp_0     = new periodDAO.Period(null, "September-2015",
            new Date("2015-09-01T00:00:00.000Z"),
            new Date("2015-09-30T23:59:59.999Z"));
        var accounting_sp_0 = new accountingDAO.Accounting(null, period_sp_0, account0, 0, 0);

        return Promise.resolve()
            .then(() => { return periodDAO.removeAll(db); })
            .then(() => { return periodDAO.add(db, period_sp_0); })
            .then(() => { return accountingDAO.add(db, accounting_sp_0); })

            .then(() => {
                return accountingDAO.createOverDateRange(db,
                    new Date("2015-08-01"),
                    new Date("2016-02-01"), account0.id);
            })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 7, "Incorrect number of periods created");
                check.assert.equal(rows[0].name, "August-2015");
                check.assert.equal(rows[1].name, "September-2015");
                check.assert.equal(rows[2].name, "October-2015");
                check.assert.equal(rows[3].name, "November-2015");
                check.assert.equal(rows[4].name, "December-2015");
                check.assert.equal(rows[5].name, "January-2016");
                check.assert.equal(rows[6].name, "February-2016");
                check.assert.equal(rows[0].date_start, new Date("2015-08-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[1].date_start, new Date("2015-09-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[2].date_start, new Date("2015-10-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[3].date_start, new Date("2015-11-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[4].date_start, new Date("2015-12-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[5].date_start, new Date("2016-01-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[6].date_start, new Date("2016-02-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[0].date_end, new Date("2015-08-31T23:59:59.999Z").getTime());
                check.assert.equal(rows[1].date_end, new Date("2015-09-30T23:59:59.999Z").getTime());
                check.assert.equal(rows[2].date_end, new Date("2015-10-31T23:59:59.999Z").getTime());
                check.assert.equal(rows[3].date_end, new Date("2015-11-30T23:59:59.999Z").getTime());
                check.assert.equal(rows[4].date_end, new Date("2015-12-31T23:59:59.999Z").getTime());
                check.assert.equal(rows[5].date_end, new Date("2016-01-31T23:59:59.999Z").getTime());
                check.assert.equal(rows[6].date_end, new Date("2016-02-29T23:59:59.999Z").getTime());
            })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 7, "Incorrect number of accountings created");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".getByDateAndAccount", function () {
        const accounting0 = testObjects.createTestAccounting(0, period0, account0);
        const accounting1 = testObjects.createTestAccounting(1, period1, account1);
        const accounting2 = testObjects.createTestAccounting(2, period2, account2);
        return Promise.resolve()
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.add(db, accounting1); })
            .then(() => { return accountingDAO.add(db, accounting2); })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2000-01-20"), account0.id);
            })
            .then((obj) => { accounting0.assertEquivalence(obj); })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2001-01-31T23:59:59.999Z"), account1.id);
            })
            .then((obj) => { accounting1.assertEquivalence(obj); })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2002-01-03T14:00:00.000Z"), account2.id);
            })
            .then((obj) => { accounting2.assertEquivalence(obj); })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2000-04-20"), account0.id);
            })
            .then((obj) => { check.assert.equal(obj, null, "Expected null - bad date"); })
            .then(() => {
                return accountingDAO.getByDateAndAccount(db, new Date("2000-01-20"), 999999999);
            })
            .then((obj) => { check.assert.equal(obj, null, "Expected null - bad account"); });
    });

    // ------------------------------------------------------------- TEST
    it(".getByEntry", function () {
        const accounting0 = testObjects.createTestAccounting(0, period0, account0);
        const accounting1 = testObjects.createTestAccounting(1, period1, account1);
        var entry_sp0     = testObjects.createTestEntry(0, account0);
        var entry_sp1     = testObjects.createTestEntry(0, account0);
        entry_sp0.date    = new Date("2000-01-20");
        entry_sp1.date    = new Date("2000-06-20");
        return Promise.resolve()
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.add(db, accounting1); })
            .then(() => { return entryDAO.add(db, entry_sp0); })
            .then(() => { return entryDAO.add(db, entry_sp1); })
            .then(() => { return accountingDAO.listAll(db); })
            .then(() => { return accountingDAO.getByEntry(db, entry_sp0.id); })
            .then((obj) => { accounting0.assertEquivalence(obj); })
            .then(() => { return accountingDAO.getByEntry(db, entry_sp1.id); })
            .then((obj) => { check.assert.equal(obj, null, "Expected null - entry outside accountings"); })
    });

    // ------------------------------------------------------------- TEST
    it(".getByAccountAndPeriod", function () {
        const accounting0 = testObjects.createTestAccounting(0, period0, account0);
        const accounting1 = testObjects.createTestAccounting(1, period1, account1);
        return Promise.resolve()
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.add(db, accounting1); })
            .then(() => { return accountingDAO.getByAccountAndPeriod(db, account0.id, period0.id); })
            .then((obj) => { accounting0.assertEquivalence(obj); })
            .then(() => { return accountingDAO.getByAccountAndPeriod(db, account1.id, period0.id); })
            .then((obj) => {
                check.assert.equal(obj, null, "Accounting found when should have been null");
            })
            .then(() => { return accountingDAO.getByAccountAndPeriod(db, account1.id, period1.id); })
            .then((obj) => { accounting1.assertEquivalence(obj); });
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
                check.assert.equal(rows.length, 2, "Incorrect number of accountings retrieved");
                check.assert.equal(rows[0].period_id, period0.id);
                check.assert.equal(rows[1].period_id, period1.id);
            });

    });

    // ------------------------------------------------------------- TEST
    it(".listOverDateRange", function () {
        return Promise.resolve()
            .then(() => {
                return periodDAO.createOverDateRange(db,
                    new Date("2015-06-01"),
                    new Date("2015-12-01"));
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
                    new Date("2015-07-05"),
                    new Date("2015-09-05"), account0.id);
            })
            .then((rows) => {
                check.assert.equal(rows.length, 3, "Incorrect number of accountings retrieved");
            })
            .then(() => {
                return accountingDAO.listOverDateRange(db,
                    new Date("2015-04-05"),
                    new Date("2015-06-05"), account0.id);
            })
            .then((rows) => {
                check.assert.equal(rows.length, 1, "Incorrect number of accountings retrieved");
            })
            .then(() => {
                return accountingDAO.listOverDateRange(db,
                    new Date("2015-11-05"),
                    new Date("2016-02-05"), account0.id);
            })
            .then((rows) => {
                check.assert.equal(rows.length, 2, "Incorrect number of accountings retrieved");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".listSelfAndFollowing", function () {
        var period_sp0     = new periodDAO.Period(null, "January-2010",
            new Date("2010-01-01"),
            new Date("2010-01-31"));
        var period_sp1     = new periodDAO.Period(null, "February-2010",
            new Date("2010-02-01"),
            new Date("2010-02-28"));
        var period_sp2     = new periodDAO.Period(null, "March-2010",
            new Date("2010-03-01"),
            new Date("2010-03-31"));
        var period_sp3     = new periodDAO.Period(null, "April-2010",
            new Date("2010-04-01"),
            new Date("2010-04-30"));
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
                check.assert.equal(rows.length, 3, "Incorrect number of accountings retrieved");
                check.assert.equal(rows[0].id, accounting_sp1.id);
                check.assert.equal(rows[1].id, accounting_sp2.id);
                check.assert.equal(rows[2].id, accounting_sp3.id);
            });
    });

    // ------------------------------------------------------------- TEST
    it(".peekDatesAndAccount", function () {
        const accounting0 = testObjects.createTestAccounting(0, period0, account0);
        return Promise.resolve()
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.peekDatesAndAccount(db, accounting0.id); })
            .then((obj) => {
                check.assert.equal(obj["date_start"], period0["date_start"], ".date_start does not match on peek");
                check.assert.equal(obj["date_end"], period0["date_end"], ".date_end does not match on peek");
                check.assert.equal(obj["account_id"], account0["id"], ".account_id does not match on peek");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".removeAll", function () {
        const accounting0 = testObjects.createTestAccounting(0, period0, account0);
        return Promise.resolve()
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.add(db, accounting0); })
            .then(() => { return accountingDAO.removeAll(db); })
            .then(() => { return accountingDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 0, "Records remain after removeAll");
            })
    });
});


describe("Accounting AJAX", function () {
    const account0 = testObjects.createTestAccount(0);
    const account1 = testObjects.createTestAccount(1);

    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return accountDAO.removeAll(db); })
            .then(() => { return accountDAO.add(db, account0); })
            .then(() => { return accountDAO.add(db, account1); })
            .then(() => { return periodDAO.removeAll(db); })
            .then(() => { return accountingDAO.removeAll(db); })
    });

    // ------------------------------------------------------------- TEST
    it(".listByAccount", function () {
        return Promise.resolve()
            .then(() => {
                return accountingDAO.createOverDateRange(db, new Date("2015-06-01"), new Date("2015-12-01"), account0.id);
            })
            .then(() => {
                return accountingDAO.createOverDateRange(db, new Date("2015-06-01"), new Date("2015-12-01"), account1.id);
            })
            .then(() => { return accountingAAO.listByAccount(account0.id); })
            .then((rows) => {
                check.assert.equal(rows.data.length, 7, "Incorrect number of accountings retrieved");
            })
    });

    // ------------------------------------------------------------- TEST
    it(".listOverDateRange", function () {
        return Promise.resolve()
            .then(() => {
                return accountingDAO.createOverDateRange(db, new Date("2015-06-01"), new Date("2015-12-01"), account0.id);
            })
            .then(() => {
                return accountingDAO.createOverDateRange(db, new Date("2015-06-01"), new Date("2015-12-01"), account1.id);
            })
            .then(() => {
                return accountingAAO.listOverDateRange(
                    new Date("2015-07-05").getTime(),
                    new Date("2015-09-05").getTime(), account0.id);
            })
            .then((rows) => {
                check.assert.equal(rows.data.length, 3, "Incorrect number of accountings retrieved");
            })
            .then(() => {
                return accountingAAO.listOverDateRange(
                    new Date("2015-04-05").getTime(),
                    new Date("2015-06-05").getTime(), account0.id);
            })
            .then((rows) => {
                check.assert.equal(rows.data.length, 1, "Incorrect number of accountings retrieved");
            })
            .then(() => {
                return accountingAAO.listOverDateRange(
                    new Date("2015-11-05").getTime(),
                    new Date("2016-02-05").getTime(), account0.id);
            })
            .then((rows) => {
                check.assert.equal(rows.data.length, 2, "Incorrect number of accountings retrieved");
            });
    });
});
