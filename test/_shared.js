const accountDAO    = require("../dao/account.js");
const accountingDAO = require("../dao/accounting.js");
const budgetDAO     = require("../dao/budget.js");
const entryDAO      = require("../dao/entry.js");
const periodDAO     = require("../dao/period.js");

const sqlite3 = require('sqlite3');
exports.db = new sqlite3.Database('test.sqlite');

exports.testObjects = {};

var createTestAccount     = function (num) {
    return new accountDAO.Account(null, "Name " + num, "Description " + num);
};
exports.testObjects.createTestAccount = createTestAccount;


var createTestAccounting     = function (num, period, account) {
    return new accountingDAO.Accounting(null, period, account, num * 0.01, num * 1.01);
};
exports.testObjects.createTestAccounting = createTestAccounting;


var createTestBudget     = function (num) {
    return new budgetDAO.Budget(null, "Code " + num, num, num + 1000);
};
exports.testObjects.createTestBudget = createTestBudget;


var createTestEntry     = function (num, account) {
    return new entryDAO.Entry(
        null,
        account,
        num * 0.01,
        num + 1000,
        "Bank Note " + num,
        "Note " + num,
        "Tag " + num,
        "Where " + num,
        "What " + num)
};
exports.testObjects.createTestEntry = createTestEntry;


var createTestPeriod     = function (num) {
    var d_start = new Date((2000 + num) + "-01-01T00:00:00.000Z");
    var d_end = new Date((2000 + num) + "-01-31T23:59:59.999Z");
    return new periodDAO.Period(null, "Name " + num, d_start.getTime(), d_end.getTime());
};
exports.testObjects.createTestPeriod = createTestPeriod;