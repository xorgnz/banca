const sqlite3 = require('sqlite3');
const logger = require("./lib/debug.js").logger;

const db = new sqlite3.Database('database.sqlite');
const accountingDAO = require("./dao/accounting.js");
const periodDAO = require("./dao/period.js");

var p = Promise.resolve();


// Periods
const p0 = new periodDAO.Period(null, "Name 1", 1.01, 2.01);
const p1 = new periodDAO.Period(null, "Name 2", 1.02, 2.02);

p = p
    .then(() =>         { return periodDAO.removeAll(db); })

    // Test Add
    .then(() =>         { return periodDAO.add(db, p0); })
    .then((id) =>       { return periodDAO.get(db, id); })
    .then((period) => {
        if (period.name       !== p0.name)       logger.warn("Test failed on period name");
        if (period.date_start !== p0.date_start) logger.warn("Test failed on period date_start");
        if (period.date_end   !== p0.date_end)   logger.warn("Test failed on period date_end");
    })
    .then(() =>         { return periodDAO.listAll(db); })
    .then ((rows) => {
        if (rows.length != 1) logger.warn("Test failed on period list");
    })


    // Test Update
    .then(() =>         { p1.id = p0.id; })
    .then(() =>         { return periodDAO.update(db, p1); })
    .then(() =>         { return periodDAO.get(db, p1.id); })
    .then((period) => {
        if (period.name       !== p1.name)       logger.warn("Test failed on period name");
        if (period.date_start !== p1.date_start) logger.warn("Test failed on period date_start");
        if (period.date_end   !== p1.date_end)   logger.warn("Test failed on period date_end");
    })

    // Test remove
    .then(() =>         { return periodDAO.remove(db, p0.id); })
    .then (() =>        { return periodDAO.listAll(db); })
    .then ((rows) => {
        if (rows.length !== 0) logger.warn("Test failed on period list");
    })
    .then(() =>         { return periodDAO.removeAll(db); })
    .catch((e) => {
        logger.error("Promising error");
        logger.error(e);
    });


// Accountings
p = p.then(() =>         { return periodDAO.add(db, p0); });
p = p.then(() =>         { return periodDAO.add(db, p0); });

const a0 = new accountingDAO.Accounting(p0.id, "Name 1", 1.01, 2.01);
const a1 = new accountingDAO.Accounting(p0.id, "Name 2", 1.02, 2.02);
p = p
    .then(() =>         { return accountingDAO.removeAll(db); })

    // Test Add
    .then(() =>         { return accountingDAO.add(db, p0); })
    .then((id) =>       { return accountingDAO.get(db, id); })
    .then((period) => {
        if (period.name       !== p0.name)       logger.warn("Test failed on period name");
        if (period.date_start !== p0.date_start) logger.warn("Test failed on period date_start");
        if (period.date_end   !== p0.date_end)   logger.warn("Test failed on period date_end");
    })
    .then(() =>         { return accountingDAO.listAll(db); })
    .then ((rows) => {
        if (rows.length != 1) logger.warn("Test failed on period list");
    })


    // Test Update
    .then(() =>         { p1.id = p0.id; })
    .then(() =>         { return accountingDAO.update(db, p1); })
    .then(() =>         { return accountingDAO.get(db, p1.id); })
    .then((period) => {
        if (period.name       !== p1.name)       logger.warn("Test failed on period name");
        if (period.date_start !== p1.date_start) logger.warn("Test failed on period date_start");
        if (period.date_end   !== p1.date_end)   logger.warn("Test failed on period date_end");
    })

    // Test remove
    .then(() =>         { return accountingDAO.remove(db, p0.id); })
    .then (() =>        { return accountingDAO.listAll(db); })
    .then ((rows) => {
        if (rows.length !== 0) logger.warn("Test failed on period list");
    })
    .catch((e) => {
        logger.error("Promising error");
        logger.error(e);
    });

