const check = require('../lib/types.js').check;
const _     = require('lodash');

const db          = require("./_shared.js").db;
const testObjects = require("./_shared.js").testObjects;
const periodDAO   = require("../dao/period.js");
const periodAAO   = require("./aao/period.js");

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;


describe("Period DAO", function () {
    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return periodDAO.removeAll(db); })
    });

    // ------------------------------------------------------------- TEST
    it("CRUD", function () {
        const period0 = testObjects.createTestPeriod(0);
        const period1 = testObjects.createTestPeriod(1);
        return Promise.resolve()
            // Test Add
            .then(() => { return periodDAO.add(db, period0); })
            .then((id) => {
                return periodDAO.get(db, id);
            })
            .then((obj) => {
                check.assert.assigned(obj, "Added object is null");
                check.assert.assigned(obj.id, "ID not set");
                period0.assertEquivalence(obj);
            })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 1, "Record not found by listAll after add");
            })

            // Test Update
            .then(() => { period1.id = period0.id; })
            .then(() => { return periodDAO.update(db, period1); })
            .then(() => { return periodDAO.get(db, period1.id); })
            .then((obj) => { period1.assertEquivalence(obj); })

            // Test remove
            .then(() => { return periodDAO.remove(db, period0.id); })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 0, "Record remains after remove");
            });
    });

    // ------------------------------------------------------------- TEST
    it("Object construction", function () {
        describe("All fields passed in as strings", function () {
            var obj = new periodDAO.Period("0", "name", "2016-01-02", "2016-01-03");
            check.assert.equal(obj.id, 0);
            check.assert.equal(obj.name, "name");
            check.assert.equal(obj.date_start, 1451692800000);
            check.assert.equal(obj.date_end, 1451779200000);
        });
    });

    // ------------------------------------------------------------- TEST
    it(".createOverDateRange", function () {
        return Promise.resolve()
            .then(() => {
                var period_sp_0 = new periodDAO.Period(null, "September-2015",
                    new Date("2015-09-01T00:00:00.000Z"),
                    new Date("2015-09-30T23:59:59.999Z"));
                return periodDAO.add(db, period_sp_0);
            })
            .then(() => {
                return periodDAO.createOverDateRange(db,
                    new Date("2015-08-01"),
                    new Date("2016-02-01"));
            })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
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
                check.assert.equal(rows.length, 7, "Incorrect number of periods created");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".getByDate", function () {
        const period0 = testObjects.createTestPeriod(0);
        const period1 = testObjects.createTestPeriod(1);
        const period2 = testObjects.createTestPeriod(2);
        return Promise.resolve()
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.add(db, period1); })
            .then(() => { return periodDAO.add(db, period2); })
            .then(() => { return periodDAO.getByDate(db, new Date("2000-01-20")); })
            .then((obj) => { period0.assertEquivalence(obj); })
            .then(() => { return periodDAO.getByDate(db, new Date("2001-01-31T23:59:59.999Z")); })
            .then((obj) => { period1.assertEquivalence(obj); })
            .then(() => { return periodDAO.getByDate(db, new Date("2002-01-01T00:00:00.000Z")); })
            .then((obj) => { period2.assertEquivalence(obj); })
            .then(() => { return periodDAO.getByDate(db, new Date("2003-01-01T00:00:00.000Z")); })
            .then((obj) => {
                check.assert.equal(obj, null, "Expecting null - no period should match - bad date");
            });
    });

    // ------------------------------------------------------------- TEST
    it.only("getFirst", function () {
        const period0 = testObjects.createTestPeriod(0);
        const period1 = testObjects.createTestPeriod(1);
        const period2 = testObjects.createTestPeriod(2);
        return Promise.resolve()
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.add(db, period1); })
            .then(() => { return periodDAO.add(db, period2); })
            .then(() => { return periodDAO.getFirst(db); })
            .then((obj) => { period0.assertEquivalence(obj); })
    });

    // ------------------------------------------------------------- TEST
    it.only("getLast", function () {
        const period0 = testObjects.createTestPeriod(0);
        const period1 = testObjects.createTestPeriod(1);
        const period2 = testObjects.createTestPeriod(2);
        return Promise.resolve()
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.add(db, period1); })
            .then(() => { return periodDAO.add(db, period2); })
            .then(() => { return periodDAO.getLast(db); })
            .then((obj) => { period2.assertEquivalence(obj); })
    });

    // ------------------------------------------------------------- TEST
    it(".listOverDateRange", function () {
        return Promise.resolve()
            .then(() => {
                return periodDAO.createOverDateRange(db,
                    new Date("2015-06-01"),
                    new Date("2015-12-01"));
            })
            .then(() => {
                return periodDAO.listOverDateRange(db,
                    new Date("2015-07-05"),
                    new Date("2015-09-05"));
            })
            .then((rows) => {
                check.assert.equal(rows[0].date_start, new Date("2015-07-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[0].date_end, new Date("2015-07-31T23:59:59.999Z").getTime());
                check.assert.equal(rows[1].date_start, new Date("2015-08-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[1].date_end, new Date("2015-08-31T23:59:59.999Z").getTime());
                check.assert.equal(rows[2].date_start, new Date("2015-09-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[2].date_end, new Date("2015-09-30T23:59:59.999Z").getTime());
                check.assert.equal(rows.length, 3, "Incorrect number of periods retrieved");
            })
            .then(() => {
                return periodDAO.listOverDateRange(db,
                    new Date("2015-04-05"),
                    new Date("2015-06-05"));
            })
            .then((rows) => {
                check.assert.equal(rows[0].date_start, new Date("2015-06-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[0].date_end, new Date("2015-06-30T23:59:59.999Z").getTime());
                check.assert.equal(rows.length, 1, "Incorrect number of periods retrieved");
            })
            .then(() => {
                return periodDAO.listOverDateRange(db,
                    new Date("2015-11-05"),
                    new Date("2016-02-05"));
            })
            .then((rows) => {
                check.assert.equal(rows[0].date_start, new Date("2015-11-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[0].date_end, new Date("2015-11-30T23:59:59.999Z").getTime());
                check.assert.equal(rows[1].date_start, new Date("2015-12-01T00:00:00.000Z").getTime());
                check.assert.equal(rows[1].date_end, new Date("2015-12-31T23:59:59.999Z").getTime());
                check.assert.equal(rows.length, 2, "Incorrect number of periods retrieved");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".removeAll", function () {
        const period0 = testObjects.createTestPeriod(0);
        const period1 = testObjects.createTestPeriod(1);
        return Promise.resolve()
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.add(db, period1); })
            .then(() => { return periodDAO.removeAll(db); })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
                check.assert.equal(rows.length, 0, "Records remain after removeAll");
            })
    });
});


describe("Period AJAX", function () {
    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return periodDAO.removeAll(db); });
    });

    // ------------------------------------------------------------- TEST
    it(".getByDate", function () {
        return Promise.resolve()
            .then(() => {
                return periodDAO.createOverDateRange(db, new Date("2015-06-01"), new Date("2015-12-01"));
            })
            .then(() => {
                return periodAAO.getByDate(new Date("2015-09-01"));
            })
            .then((r) => {
                check.assert.equal(r.data.name, "September-2015");
            })
    });
});
