const assert  = require("chai").assert;
const logger  = require("../lib/debug.js").logger;
const _       = require('lodash');

const db            = require("./_shared.js").db;
const testObjects   = require("./_shared.js").testObjects;
const periodDAO = require("../dao/period.js");

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;


var createTestPeriod     = function (num) {
    return new periodDAO.Period(null, "Name " + num, num, num + 1000);
};
exports.createTestPeriod = createTestPeriod;


describe("Period DAO", function () {
    const period0 = testObjects.createTestPeriod(0);
    const period1 = testObjects.createTestPeriod(1);
    const period2 = testObjects.createTestPeriod(2);

    beforeEach(function () {
        return Promise.resolve()
            .then(() => { return periodDAO.removeAll(db); })
    });

    it("CRUD", function () {
        return Promise.resolve()

            // Test Add
            .then(() => { return periodDAO.add(db, period0); })
            .then((id) => { return periodDAO.get(db, id); })
            .then((obj) => {
                assert(obj.id, "ID not set");
                for (var key of periodDAO.Period.equivalenceFields())
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
                for (var key of periodDAO.Period.equivalenceFields())
                    assert(obj[key] === period1[key], "Field '" + key + "' did not update");
            })

            // Test remove
            .then(() => { return periodDAO.remove(db, period0.id); })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
                assert(rows.length === 0, "Record remains after remove");
            });
    });

    // Test Create period range
    it(".createPeriodRange", function () {
        return Promise.resolve()
            .then(() => {
                return periodDAO.createPeriodRange(db,
                    (new Date("2015-06-01")).getTime(),
                    (new Date("2015-12-01")).getTime());
            })
            .then(() => { return periodDAO.listAll(db); })
            .then((rows) => {
                rows = _.sortBy(rows, "date_start");
                assert(rows[0].date_start == new Date("2015-06-01T00:00:00.000Z").getTime());
                assert(rows[0].date_end == new Date("2015-06-30T23:59:59.999Z").getTime());
                assert(rows[1].date_start == new Date("2015-07-01T00:00:00.000Z").getTime());
                assert(rows[1].date_end == new Date("2015-07-31T23:59:59.999Z").getTime());
                assert(rows[2].date_start == new Date("2015-08-01T00:00:00.000Z").getTime());
                assert(rows[2].date_end == new Date("2015-08-31T23:59:59.999Z").getTime());
                assert(rows[3].date_start == new Date("2015-09-01T00:00:00.000Z").getTime());
                assert(rows[3].date_end == new Date("2015-09-30T23:59:59.999Z").getTime());
                assert(rows[4].date_start == new Date("2015-10-01T00:00:00.000Z").getTime());
                assert(rows[4].date_end == new Date("2015-10-31T23:59:59.999Z").getTime());
                assert(rows[5].date_start == new Date("2015-11-01T00:00:00.000Z").getTime());
                assert(rows[5].date_end == new Date("2015-11-30T23:59:59.999Z").getTime());
                assert(rows[6].date_start == new Date("2015-12-01T00:00:00.000Z").getTime());
                assert(rows[6].date_end == new Date("2015-12-31T23:59:59.999Z").getTime());
                assert(rows.length === 7, "Incorrect sequence of periods created");
            });
    });

    // Test Get period containing date
    it(".getByDate", function () {
        return Promise.resolve()
            .then(() => { return periodDAO.add(db, period0); })
            .then(() => { return periodDAO.add(db, period1); })
            .then(() => { return periodDAO.add(db, period2); })
            .then(() => { return periodDAO.getByDate(db, new Date("2000-01-20").getTime()); })
            .then((obj) => {
                for (var key of periodDAO.Period.equivalenceFields())
                    assert(obj[key] === period0[key], "Incorrect period found");
            })
            .then(() => { return periodDAO.getByDate(db, new Date("2001-01-31T23:59:59.999Z").getTime()); })
            .then((obj) => {
                for (var key of periodDAO.Period.equivalenceFields())
                    assert(obj[key] === period1[key], "Incorrect period found");
            })
            .then(() => { return periodDAO.getByDate(db, new Date("2002-01-01T00:00:00.000Z").getTime()); })
            .then((obj) => {
                for (var key of periodDAO.Period.equivalenceFields())
                    assert(obj[key] === period2[key], "Incorrect period found");
            })
            .then(() => { return periodDAO.getByDate(db, new Date("2003-01-01T00:00:00.000Z").getTime()); })
            .then((obj) => {
                assert(obj === null, "Expecting null - no period should match - bad date");
            });
    });

    // Test removeAll
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
