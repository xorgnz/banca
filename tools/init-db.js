// Import modules
var sqlite3 = require('sqlite3');
var fs = require("fs");

// Define constants
const filename_db = "database.sqlite";
const filename_schema = "schema.sql";


// Test that the database does not already exist
if (fs.existsSync(filename_db))
{
    console.log("Cannot initialize database - a database file already exists.");
    console.log("If you want to replace it, you must either rename or manually delete it.");
    process.exit();
}

// Test that the schema exists
if (!fs.existsSync(filename_schema))
{
    console.log("Cannot initialize database - schema file does not exist.");
    console.log("If you want to replace it, you must either rename or manually delete it.");
    process.exit();
}

// Connect to DB
var db = new sqlite3.Database(filename_db);

db.serialize(function () {

    var schema = fs.readFileSync(filename_schema);
    var queries = schema.toString().split(';');

    for (var query of queries)
    {
        if (query.trim().length > 0)
            db.run(query);
    }
});

console.log("Database initialization complete");


