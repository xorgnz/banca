const check = require('../lib/types.js').check;
const convert = require('../lib/types.js').convert;
const _     = require('lodash');

const db            = require("./_shared.js").db;
const testObjects   = require("./_shared.js").testObjects;
const entryDAO      = require("../dao/entry.js");
const accountDAO    = require("../dao/account.js");
const accountingDAO = require("../dao/accounting.js");
const periodDAO     = require("../dao/period.js");

const beforeEach = require("mocha").beforeEach;
const describe   = require("mocha").describe;
const it         = require("mocha").it;


describe("Core libraries", function () {
    // ------------------------------------------------------------- TEST
    describe("check-type", function () {
        it("__datelike", function () {
            check.assert(check.__datelike(new Date()));
            check.assert(check.__datelike(1451606400000));
            check.assert(check.__datelike("1451606400000"));
            check.assert(check.__datelike("2016-7-01"));
            check.assert(! check.__datelike("2016-a7-z1"));
            check.assert(! check.__datelike("Tuesday"));
            check.assert(check.__datelike("06-03-1979"));
        });
    });
    describe("conversions", function () {
        it("toDate", function () {
            check.assert.equal(1451606400000, convert.toDate(1451606400000).getTime());
            check.assert.equal(1451606400000, convert.toDate("1451606400000").getTime());
            check.assert.equal(1467331200000, convert.toDate("2016-07-01").getTime());
            check.assert(isNaN(convert.toDate("2016-7-1").getTime()));
            check.assert(isNaN(convert.toDate("2016-a7-z1").getTime()));
            check.assert(isNaN(convert.toDate("Tuesday").getTime()));
            check.assert(isNaN(convert.toDate("06-03-1979").getTime()));
        });
    });
});
