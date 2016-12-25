const assert  = require("chai").assert;
const logger  = require("../lib/debug.js").logger;
const _       = require('lodash');

const db          = require("./_shared.js").db;
const testObjects = require("./_shared.js").testObjects;
const periodDAO   = require("../dao/period.js");

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;


describe("Period DAO", function () {
    const period0 = testObjects.createTestPeriod(0);
    const period1 = testObjects.createTestPeriod(1);
    const period2 = testObjects.createTestPeriod(2);

    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return periodDAO.removeAll(db); })
    });

    // ------------------------------------------------------------- TEST
    it("CRUD", function () {
        return Promise.resolve()

            // Test Add
            .then(() => { return periodDAO.add(db, period0); })
            .then((id) => {
                console.log(id);
                return periodDAO.get(db, id);
            })
            .then((obj) => {
                assert(obj, "Added object is null");
                assert(obj.id, "ID not set");
                for (var key of periodDAO.Period.fieldNames())
                    assert(obj[key] === period0[key], "Field '" + key + "' did not add");
            })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length == 1, "Record not found by listAll after add");
            })

            // Test Update
            .then(() => { period1.id = period0.id; })
            .then(() => { return periodDAO.update(db, period1); })
            .then(() => { return periodDAO.get(db, period1.id); })
            .then((obj) => {
                for (var key of periodDAO.Period.fieldNames())
                    assert(obj[key] === period1[key], "Field '" + key + "' did not update");
            })

            // Test remove
            .then(() => { return periodDAO.remove(db, period0.id); })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 0, "Record remains after remove");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".createOverDateRange", function () {
        return Promise.resolve()
            .then(() => {
                var period_sp_0 = new periodDAO.Period(null, "September-2015",
                    new Date("2015-09-01T00:00:00.000Z").getTime(),
                    new Date("2015-09-30T23:59:59.999Z").getTime());
                return periodDAO.add(db, period_sp_0); })
            .then(() => {
                return periodDAO.createOverDateRange(db,
                    new Date("2015-08-01").getTime(),
                    new Date("2016-02-01").getTime());
            })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
                console.log(rows);
                assert(rows[0].name == "August-2015");
                assert(rows[1].name == "September-2015");
                assert(rows[2].name == "October-2015");
                assert(rows[3].name == "November-2015");
                assert(rows[4].name == "December-2015");
                assert(rows[5].name == "January-2016");
                assert(rows[6].name == "February-2016");
                assert(rows[0].date_start == new Date("2015-08-01T00:00:00.000Z").getTime());
                assert(rows[1].date_start == new Date("2015-09-01T00:00:00.000Z").getTime());
                assert(rows[2].date_start == new Date("2015-10-01T00:00:00.000Z").getTime());
                assert(rows[3].date_start == new Date("2015-11-01T00:00:00.000Z").getTime());
                assert(rows[4].date_start == new Date("2015-12-01T00:00:00.000Z").getTime());
                assert(rows[5].date_start == new Date("2016-01-01T00:00:00.000Z").getTime());
                assert(rows[6].date_start == new Date("2016-02-01T00:00:00.000Z").getTime());
                assert(rows[0].date_end == new Date("2015-08-31T23:59:59.999Z").getTime());
                assert(rows[1].date_end == new Date("2015-09-30T23:59:59.999Z").getTime());
                assert(rows[2].date_end == new Date("2015-10-31T23:59:59.999Z").getTime());
                assert(rows[3].date_end == new Date("2015-11-30T23:59:59.999Z").getTime());
                assert(rows[4].date_end == new Date("2015-12-31T23:59:59.999Z").getTime());
                assert(rows[5].date_end == new Date("2016-01-31T23:59:59.999Z").getTime());
                assert(rows[6].date_end == new Date("2016-02-29T23:59:59.999Z").getTime());
                assert(rows.length === 7, "Incorrect number of periods created");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".getByDate", function () {
        return Promise.resolve()
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.add(db, period1); })
            .then(() => { return periodDAO.add(db, period2); })
            .then(() => { return periodDAO.getByDate(db, new Date("2000-01-20").getTime()); })
            .then((obj) => {
                for (var key of periodDAO.Period.fieldNames())
                    assert(obj[key] === period0[key], "Incorrect period found");
            })
            .then(() => { return periodDAO.getByDate(db, new Date("2001-01-31T23:59:59.999Z").getTime()); })
            .then((obj) => {
                for (var key of periodDAO.Period.fieldNames())
                    assert(obj[key] === period1[key], "Incorrect period found");
            })
            .then(() => { return periodDAO.getByDate(db, new Date("2002-01-01T00:00:00.000Z").getTime()); })
            .then((obj) => {
                for (var key of periodDAO.Period.fieldNames())
                    assert(obj[key] === period2[key], "Incorrect period found");
            })
            .then(() => { return periodDAO.getByDate(db, new Date("2003-01-01T00:00:00.000Z").getTime()); })
            .then((obj) => {
                assert(obj === null, "Expecting null - no period should match - bad date");
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
            .then(() => {
                return periodDAO.listOverDateRange(db,
                    new Date("2015-07-05").getTime(),
                    new Date("2015-09-05").getTime());
            })
            .then((rows) => {
                assert(rows[0].date_start == new Date("2015-07-01T00:00:00.000Z").getTime());
                assert(rows[0].date_end == new Date("2015-07-31T23:59:59.999Z").getTime());
                assert(rows[1].date_start == new Date("2015-08-01T00:00:00.000Z").getTime());
                assert(rows[1].date_end == new Date("2015-08-31T23:59:59.999Z").getTime());
                assert(rows[2].date_start == new Date("2015-09-01T00:00:00.000Z").getTime());
                assert(rows[2].date_end == new Date("2015-09-30T23:59:59.999Z").getTime());
                assert(rows.length === 3, "Incorrect number of periods retrieved");
            })
            .then(() => {
                return periodDAO.listOverDateRange(db,
                    new Date("2015-04-05").getTime(),
                    new Date("2015-06-05").getTime());
            })
            .then((rows) => {
                assert(rows[0].date_start == new Date("2015-06-01T00:00:00.000Z").getTime());
                assert(rows[0].date_end == new Date("2015-06-30T23:59:59.999Z").getTime());
                assert(rows.length === 1, "Incorrect number of periods retrieved");
            })
            .then(() => {
                return periodDAO.listOverDateRange(db,
                    new Date("2015-11-05").getTime(),
                    new Date("2016-02-05").getTime());
            })
            .then((rows) => {
                assert(rows[0].date_start == new Date("2015-11-01T00:00:00.000Z").getTime());
                assert(rows[0].date_end == new Date("2015-11-30T23:59:59.999Z").getTime());
                assert(rows[1].date_start == new Date("2015-12-01T00:00:00.000Z").getTime());
                assert(rows[1].date_end == new Date("2015-12-31T23:59:59.999Z").getTime());
                assert(rows.length === 2, "Incorrect number of periods retrieved");
            });
    });

    // ------------------------------------------------------------- TEST
    it(".removeAll", function () {
        return Promise.resolve()
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.removeAll(db); })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 0, "Records remain after removeAll");
            })
    });
});
