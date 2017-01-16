// Import modules
const sqlite3   = require('sqlite3');
const logger    = require("../lib/debug.js").logger;
const periodDAO = require("../dao/period.js");

// Define constants
const FILENAME_DB_LIVE = "database.sqlite";
const FILENAME_DB_TEST = "test.sqlite";

// Define requested date range
// TODO - Get these from command line
const DATE_START = "2000-01-01";
const DATE_END = "2020-12-31";

// Show usage if requested
function usage() {
    console.log("node --harmony tools/extend-periods.js [live|test]");
    process.exit();
}
if (process.argv[2] == "-h") {
    usage();
}

// Command Line - Select database file
var filename = process.argv[2] == "test" ? FILENAME_DB_TEST : FILENAME_DB_LIVE;
console.log("Using database: " + filename);

// Command Line - Select date range
var date_start = new Date(process.argv[3]);
var date_end = new Date(process.argv[4]);
if (isNaN(date_start.getTime()) || isNaN(date_end.getTime())) {
    logger.error("Cannot proceed - requested date range includes invalid dates:");
    logger.error("Parsed start date: " + date_start + " from " + process.argv[3]);
    logger.error("Parsed end date: " + date_start + " from " + process.argv[4]);
    process.exit(-1);
}
else {
    logger.trace("Periods requested over range " + date_start + " to " + date_end);
}

// Connect to DB
var db = new sqlite3.Database(filename);

// Create periods

Promise.resolve()
    .then(() => { return periodDAO.listAll(db); })
    .then((rows) => {
        var first = rows[0];
        var last = rows[rows.length - 1];

        date_start = date_start.getTime() < first.date_start ? date_start : new Date(first.date_start);
        date_end = date_end.getTime() > last.date_end ? date_end : new Date(date_end.date_end);

        return periodDAO.createOverDateRange(db, date_start, date_end);
    })
    .then(() => {

    })
    .then(() => {
        logger.trace("Periods now span " + date_start + " to " + date_end);
        db.close();
    })
    .catch((err) => { console.log(err); });
