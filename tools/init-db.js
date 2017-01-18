// Import modules
const sqlite3 = require('sqlite3');
const fs      = require("fs");
const logger  = require("../lib/debug.js").logger;

const accountDAO    = require("../dao/account.js");
const accountingDAO = require("../dao/accounting.js");
const periodDAO     = require("../dao/period.js");

// Define constants
const FILENAME_DB_LIVE = "database.sqlite";
const FILENAME_DB_TEST = "test.sqlite";
const FILENAME_SCHEMA  = "schema.sql";

// Show usage if requested
function usage() {
    console.log("node --harmony tools/init-db.js [live|test]");
    process.exit();
}
if (process.argv[2] == "-h") {
    usage();
}

// Parse and validate command line argument
var filename = process.argv[2] == "test" ? FILENAME_DB_TEST : FILENAME_DB_LIVE;
console.log("About to initialize database file: " + filename);


// Test that the database does not already exist
if (fs.existsSync(filename)) {
    console.log("Cannot initialize database - a database file already exists.");
    console.log("If you want to replace it, you must either rename or manually delete it.");
    process.exit();
}

// Test that the schema exists
if (!fs.existsSync(FILENAME_SCHEMA)) {
    console.log("Cannot initialize database - schema file does not exist.");
    console.log("If you want to replace it, you must either rename or manually delete it.");
    process.exit();
}

// Connect to DB
var db = new sqlite3.Database(filename);

// Load schema
var schema  = fs.readFileSync(FILENAME_SCHEMA);
var queries = schema.toString().split(';');

// Deploy schema
Promise.resolve()
    .then(() => {
        var promises = [];
        for (var query of queries) {
            if (query.trim().length > 0) {
                promises.push(new Promise((resolve, reject) => {
                    logger.trace("DB Initialization: " + query.trim());
                    db.run(query, (err) => {
                        if (err) {
                            logger.error(err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }));
            }
        }

        return Promise.all(promises);
    })

    .then(() => {
        logger.trace("Creating initial periods from 2015 to 2017");
        return periodDAO.createOverDateRange(db, new Date("2015-01-01"), new Date("2017-12-31"));
    })
    .then(() => {
        logger.trace("Creating initial account");
        return accountDAO.add(db, new accountDAO.Account(null, "First Account", "Your first account"));
    })
    .then((id) => {
        logger.trace("Creating accountings for initial account");
        return accountingDAO.createForAccount(db, id);
    })
    .then(() => {
        logger.trace("Database initialization complete");
        db.close();
    })
    .catch((err) => {
        logger.error("Database initialization failed");
        console.log(err);
    });




