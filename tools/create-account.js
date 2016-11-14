"use strict";

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database('database.sqlite');

// Show usage if requested
if (process.argv[2] == "-h") {
    usage();
}

// Parse and validate command line arguments
const name = process.argv[2];
const description = process.argv[3] ? process.argv[3] : "";
if (! name) {
    console.log("Cannot proceed - you must specify an account name");
    usage();
}


db.run("INSERT INTO account (account_name, account_description) VALUES (?, ?)", name, description, function (err, row) {
    if (err)
        throw err;

    console.log("Account '" + name + "' created with ID " + this.lastID);
});

