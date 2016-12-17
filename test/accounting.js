const assert  = require("chai").assert;
const sqlite3 = require('sqlite3');
const logger  = require("../lib/debug.js").logger;
const _       = require('lodash');

const db            = new sqlite3.Database('test.sqlite');
const periodDAO     = require("../dao/period.js");
const accountDAO    = require("../dao/account.js");
const accountingDAO = require("../dao/accounting.js");

const describe = require("mocha").describe;
const it       = require("mocha").it;


describe("Accounting DAO", function () {
    describe("CRUD", function () {

        const period0     = new periodDAO.Period(null, "Name 1", 1.01, 2.01);
        const account0    = new accountDAO.Account(null, "Name 1", "Description 1");
        const period1     = new periodDAO.Period(null, "Name 1", 1.01, 2.01);
        const account1    = new accountDAO.Account(null, "Name 1", "Description 1");
        const accounting0 = new accountingDAO.Accounting(null, period0.id, account0.id, 1.01, 1.02);
        const accounting1 = new accountingDAO.Accounting(null, period1.id, account1.id, 1.01, 1.02);

        before(function () {
            return Promise.resolve()
                .then(() => { return accountingDAO.removeAll(db); })
                .then(() => { return periodDAO.add(db, period0); })
                .then(() => { return accountDAO.add(db, account0); })
                .then(() => { return periodDAO.add(db, period1); })
                .then(() => { return accountDAO.add(db, account1); });
        });

        it("Should run CRUD ops correctly", function () {
            return Promise.resolve()
                .then(() => { return accountingDAO.removeAll(db); })

                // Test Add
                .then(() => { return accountingDAO.add(db, accounting0); })
                .then((id) => { return accountingDAO.get(db, id); })
                .then((obj) => {
                    console.log(Object.getOwnPropertyNames(accounting0));
                    _.forIn(accounting0, function (value, key) {
                        assert(obj[key.substr(1)] === accounting0[key], "Field '" + key + "' did not add");
                    });
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
                    _.forIn(accounting1, function (value, key) {
                        assert(obj[key.substr(1)] === accounting1[key], "Field '" + key + "' did not update");
                    });
                })

                // Test remove
                .then(() => { return accountingDAO.remove(db, accounting0.id); })
                .then(() => { return accountingDAO.listAll(db); })
                .then((rows) => {
                    assert(rows.length === 0, "Record remains after remove");
                });
        });

        // Test removeAll
        it("Should run removeAll correctly", function () {
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
});
