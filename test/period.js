const assert  = require("chai").assert;
const sqlite3 = require('sqlite3');
const logger  = require("../lib/debug.js").logger;
const _       = require('lodash');

const db        = new sqlite3.Database('test.sqlite');
const periodDAO = require("../dao/period.js");

const describe = require("mocha").describe;
const it       = require("mocha").it;


describe("Period DAO", function () {
    describe("CRUD", function () {

        const period0 = new periodDAO.Period(null, "Name 1", 1.01, 2.01);
        const period1 = new periodDAO.Period(null, "Name 2", 1.02, 2.02);

        before(function () {
            return Promise.resolve()
                .then(() => { return periodDAO.removeAll(db); })
        });

        it("Should run CRUD ops correctly", function () {
            return Promise.resolve()
                .then(() => { return periodDAO.removeAll(db); })

                // Test Add
                .then(() => { return periodDAO.add(db, period0); })
                .then((id) => { return periodDAO.get(db, id); })
                .then((period) => {
                    console.log(Object.getOwnPropertyNames(period0));
                    _.forIn(period0, function (value, key) {
                        assert(period[key.substr(1)] === period0[key], "Field '" + key + "' did not add");
                    });
                })
                .then(() => { return periodDAO.listAll(db); })
                .then((rows) => {
                    assert(rows.length == 1, "Record not found by listAll after add");
                })

                // Test Update
                .then(() => { period1.id = period0.id; })
                .then(() => { return periodDAO.update(db, period1); })
                .then(() => { return periodDAO.get(db, period1.id); })
                .then((period) => {
                    _.forIn(period1, function (value, key) {
                        assert(period[key.substr(1)] === period1[key], "Field '" + key + "' did not update");
                    });
                })

                // Test remove
                .then(() => { return periodDAO.remove(db, period0.id); })
                .then(() => { return periodDAO.listAll(db); })
                .then((rows) => {
                    assert(rows.length === 0, "Record remains after remove");
                });
        });

        // Test removeAll
        it("Should run removeAll correctly", function () {
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
});
