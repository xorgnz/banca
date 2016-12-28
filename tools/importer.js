const fs  = require("fs");
const _   = require("lodash");

const mathUtils     = require('../lib/math-utils.js');
const accountDAO    = require("../dao/account.js");
const accountingDAO = require("../dao/accounting.js");
const entryDAO      = require("../dao/entry.js");
const periodDAO     = require("../dao/period.js");

// ----------------
// Worker functions

// Retrieve given account to verify that it exists
function verifyAccount(db, account_id) {

    return new Promise((resolve, reject) => {
        return accountDAO.get(db, account_id)
            .then((account) => {
                if (!account) {
                    reject(new Error("Import aborted - no account exists with ID: " + account_id));
                }
                resolve();
            });
    });
}

// Load import data from CSV
function loadFromCsv(filename) {
    return new Promise((resolve, reject) => {
        var converter = new (require("csvtojson").Converter)({
            noheader: true,
            headers:  ["date", "tag", "where", "what", "note", "amount_pre", "amount_pre2"]
        });

        var stream = require("fs").createReadStream(filename);
        stream.on("error", () => { reject(new Error("Import file does not exist")); });
        converter.on("end_parsed", (data) => { resolve(data); });
        stream.pipe(converter);
    });
}

// Proces imported rows
function processImportedRows(rows) {

    return new Promise((resolve, reject) => {
        var badRows = [];
        for (var row of rows) {
            var reasons = [];

            var d = new Date(row.date);
            if (!row.date) {
                reasons.push("Date column is empty");
            }
            else if (isNaN(d.getUTCFullYear()) || isNaN(d.getUTCMonth()) || isNaN(d.getUTCDate())) {
                reasons.push("Date string '" + row.date + "' cannot be parsed");
            }
            else {
                row.date = d.getTime();
            }

            row.amount_pre  = mathUtils.parseNumber(row.amount_pre);
            row.amount_pre2 = mathUtils.parseNumber(row.amount_pre2);
            if (isNaN(row.amount_pre) && isNaN(row.amount_pre2)) {
                reasons.push("Amount columns empty or non-numeric");
            }
            else {
                row.amount = (isNaN(row.amount_pre) ? 0 : row.amount_pre)
                    + (isNaN(row.amount_pre2) ? 0 : row.amount_pre2);
                delete row.amount_pre;
                delete row.amount_pre2;
            }

            // Clean up tags - use Unknown if not available
            row.tag = entryDAO.isValidTagString(row.tag) ? row.tag : entryDAO.tags.UNKNOWN_TAG;

            if (reasons.length > 0) {
                row.reasons = reasons;
                badRows.push(row);
            }
        }

        if (badRows.length > 0) {
            var err     = new Error("Import aborted - " + badRows.length + " bad rows must be corrected manually");
            err.badRows = badRows;
            reject(err);
        }
        else {
            resolve(rows);
        }
    });
}

// Import rows as entries into DB
function importEntries(db, entries, account_id) {
    var promises = [];
    _.each(entries, (entry) => {
        promises.push(entryDAO.add(db, new entryDAO.Entry(
            null,
            account_id,
            entry.amount,
            entry.date,
            "",
            entry.note,
            entry.tag,
            entry.where,
            entry.what
        )));
    });

    return Promise.all(promises)
        .then(() => { return entries; });
}

// Create periods and accountings, as necessary
function createPeriodsAndAccountings(db, entries, account_id) {
    var sortedEntries   = _.sortBy(entries, "date");
    var dateRange_start = sortedEntries[0].date;
    var dateRange_end   = _.last(sortedEntries).date;

    return Promise.resolve()
        .then(() => { return periodDAO.listOverDateRange(db, dateRange_start, dateRange_end); })
        .then(() => { return periodDAO.createOverDateRange(db, dateRange_start, dateRange_end); })
        .then(() => { return accountingDAO.listAll(db); })
        .then(() => { return periodDAO.listOverDateRange(db, dateRange_start, dateRange_end); })
        .then((periods) => {
            return accountingDAO.createForPeriods(db, _.map(periods, 'id'), account_id);
        })
        .then(() => { return accountingDAO.listAll(db); })
        .then(() => { return accountingDAO.listOverDateRange(db, dateRange_start, dateRange_end, account_id); })
}

// Cascade all imported accountings
function calcAndCascadeAccountings(db, accountings) {
    // contract - accountings is array
    // contract - accountings first is earliest

    return Promise.resolve()
        .then(() => {
            var promises = [];
            _.each(accountings, (a) => {
                promises.push(accountingDAO.calc(db, a.id));
            });
            return Promise.all(promises);
        })
        .then(() => {
            return accountingDAO.cascade(db, accountings[0].id);
        });
}

// Entry Point - Import from CSV
exports.importFromCsv = function (db, filename, account_id) {
    return Promise.resolve()
        .then(() => { return verifyAccount(db, account_id); })
        .then(() => { return loadFromCsv(filename); })
        .then((rows) => { return processImportedRows(rows); })
        .then((entries) => { return importEntries(db, entries, account_id); })
        .then((entries) => { return createPeriodsAndAccountings(db, entries, account_id); })
        .then((accountings) => { return calcAndCascadeAccountings(db, accountings); })
        .then(() => { console.log("Import complete!"); });
};