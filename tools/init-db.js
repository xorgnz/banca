// Import modules
const sqlite3   = require('sqlite3');
const fs        = require("fs");
const logger    = require("../lib/debug.js").logger;
const periodDAO = require("../dao/period.js");

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

    .then(() => { periodDAO.createOverDateRange(db, new Date("2000-01-01"), new Date("2020-12-31")); })
    .then(() => { db.close(); })
    .catch((err) => { console.log(err); });


console.log("Database initialization complete");


