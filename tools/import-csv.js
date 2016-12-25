"use strict";

const fs       = require("fs");
const sqlite3  = require("sqlite3");
const db       = new sqlite3.Database('database.sqlite');
const importer = require("./importer.js");

// Utilities
function usage() {
    console.log("node --harmony tools/import-csv.js [account_id] [filename]");
    process.exit();
}
function abort(why) {
    console.log(why);
    process.exit();
}

// Parse and validate command line arguments
const filename   = process.argv[3];
const account_id = process.argv[2];
if (process.argv[2] == "-h") {
    usage();
}
if (!account_id) {
    console.log("Cannot proceed - you must specify an account number");
    usage();
}
if (!filename) {
    console.log("Cannot proceed - you must specify a CSV file");
    usage();
}
if (!fs.existsSync(filename)) {
    console.log("Cannot proceed - specified CSV file '" + filename + "' does not exist");
    process.exit();
}

importer.importFromCsv(db, filename, account_id);
