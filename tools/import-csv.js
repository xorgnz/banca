"use strict";

const fs = require("fs");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database('database.sqlite');
const math = require("mathjs");
const mathUtils = require('../lib/math-utils.js');
const tags = require('../lib/tags.js');
const pad = require("pad-number");

// Show usage if requested
function usage() {
    console.log("node --harmony tools/import-csv.js [account_id] [filename]");
    process.exit();
}
if (process.argv[2] == "-h") {
    usage();
}

// Parse and validate command line arguments
const filename = process.argv[3];
const account_id = process.argv[2];
if (! account_id) {
    console.log("Cannot proceed - you must specify an account number");
    usage();
}
if (! filename) {
    console.log("Cannot proceed - you must specify a CSV file");
    usage();
}

// Verify that specified file exists
if (! fs.existsSync(filename)) {
    console.log("Cannot proceed - specified CSV file '" + filename + "' does not exist");
    process.exit();
}

// Pseudo
// Verify account exists.
// Load entries from CSV
// Filter entries
// Create entries
// Create periods over entry range
// Get periods over entry range
// Create accountings for periods
// Get accountings for periods
// Calc accountings
// Cascade descendant accountings



// Verify that specified account exists
var p = new Promise((resolve, reject) => {
    console.log("p1");
    var acct = db.get(
        "SELECT * FROM account WHERE account_id = ?",
        account_id,
        function (err, row)
        {
            if (err)
            {
                reject(err);
                return;
            }

            if (row === undefined) {
                console.log("Cannot proceed - no account exists with ID '" + account_id + "'");
                process.exit();
            }
            console.log("p1e");

            resolve();
        }
    );
});

// Import data from CSV
p = p.then(() => {
    console.log("p1");

    return new Promise((resolve, reject) => {

        var converter = new (require("csvtojson").Converter) ({
            noheader: true,
            headers: ["date", "tag", "where", "what", "note", "amount_pre", "amount_pre2"]
        });

        converter.on("end_parsed", function (data) {
            console.log("p1e");
            resolve(data);
        });

        require("fs").createReadStream(filename).pipe(converter);
    });
});

// Dump data
p = p.then((entries) => {
    console.log("p1");

    // Filter unusable rows
    // - ignore entries with no date
    // - ignore entries with no transaction amount
    var filteredEntries = [];
    for (var entry of entries) {

        // Parse numbers from amount strings
        entry.amount_pre = mathUtils.parseNumber(entry.amount_pre);
        entry.amount_pre2 = mathUtils.parseNumber(entry.amount_pre2);

        // Ignore if no date is provided
        if (! entry.date) {
            console.log("Ignoring CSV row - date column contains no value:");
            console.log(entry);
        }

        // Ignore if no amount is provided
        else if (isNaN(entry.amount_pre) && isNaN(entry.amount_pre2)) {
            console.log(entry.amount_pre);
            console.log(entry.amount_pre2);
            console.log("Ignoring CSV row - amount columns contain no numeric value:");
            console.log(entry);
        }

        else {
            filteredEntries.push(entry);
        }
    }
    console.log(entries.length + " entries found");
    console.log(filteredEntries.length + " entries valid for use");

    // Scrub and clean imported data
    var exceptions = [];
    for (var entry of filteredEntries) {
        // Calculate transaction amount from both cells
        // - Many bank outputs use different columns for debit and credit
        entry.amount = (isNaN(entry.amount_pre) ? 0 : entry.amount_pre)
                     + (isNaN(entry.amount_pre2) ? 0 : entry.amount_pre2);
        delete entry.amount_pre;
        delete entry.amount_pre2;

        // Parse transaction date field
        var d = new Date(entry.date);
        if (isNaN(d.getUTCFullYear()) || isNaN(d.getUTCMonth()) || isNaN(d.getUTCDate())) {
            exceptions.push({ entry: entry, message: "Import aborted - date string '" + entry.date + "' cannot be parsed"});
        } else {
            entry.date = pad(d.getUTCFullYear(),4) + "-" + pad(d.getUTCMonth()+1,2) + "-" +  pad(d.getUTCDate(),2);
        }

        // Clean up tags - use Unknown if not available
        entry.tag = tags.isValidTagString(entry.tag) ? entry.tag : tags.UNKNOWN_TAG;
    }

    if (exceptions.length > 0)
    {
        console.log("Import aborted - please fix the following rows: ");
        console.log(exceptions);
        process.exit();
    }
    else
    {
        var stmt = db.prepare(
            "INSERT INTO entry (            " +
            "   entry_account_id,           " +
            "   entry_amount,               " +
            "   entry_date,                 " +
            "   entry_what,                 " +
            "   entry_where,                " +
            "   entry_note,                 " +
            "   entry_tag                   " +
            ") VALUES (?,?,?,?,?,?,?)   ");

        for (var entry of filteredEntries)
        {
            console.log("Importing - " + entry.date + " :: " + entry.amount);
            stmt.run(
                account_id,
                entry.amount,
                entry.date,
                entry.what,
                entry.where,
                entry.note,
                entry.tag);
        }

        stmt.finalize();
    }
});