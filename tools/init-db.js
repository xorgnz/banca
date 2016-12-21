// Import modules
var sqlite3 = require('sqlite3');
var fs = require("fs");

// Define constants
const FILENAME_DB_LIVE = "database.sqlite";
const FILENAME_DB_TEST = "test.sqlite";
const FILENAME_SCHEMA = "schema.sql";

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
if (fs.existsSync(filename))
{
    console.log("Cannot initialize database - a database file already exists.");
    console.log("If you want to replace it, you must either rename or manually delete it.");
    process.exit();
}

// Test that the schema exists
if (!fs.existsSync(FILENAME_SCHEMA))
{
    console.log("Cannot initialize database - schema file does not exist.");
    console.log("If you want to replace it, you must either rename or manually delete it.");
    process.exit();
}

// Connect to DB
var db = new sqlite3.Database(filename);

db.serialize(function () {

    var schema = fs.readFileSync(FILENAME_SCHEMA);
    var queries = schema.toString().split(';');

    for (var query of queries)
    {
        if (query.trim().length > 0)
            db.run(query);
    }
});

console.log("Database initialization complete");


