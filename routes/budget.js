var express = require('express');
var router = express.Router();
var utils = require("../lib/ui-utils.js");
const _ = require('lodash');

const types = [
    { id: 1,  type: "Monthly Regular" },
    { id: 2,  type: "Yearly Regular" },
    { id: 3,  type: "One Off Special" },
    { id: 4,  type: "Ongoing Special" },
];


/* GET - List all budgets */
router.get('/', function(req, res, next) {

    req.db.all("SELECT * FROM budget", function (err, rows) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(utils.stripDatabasePrefix(rows)));
    });

});

/* POST - Create new budget */
router.post('/', function(req, res, next) {
    var validationResponse = validate(req.body);
    if (validationResponse != OK) {
        console.log("Bad budget received");
        console.log(req.body);
        res.status(400).json({status: 400, data: {message: 'Malformed input - ' + validationResponse }});
    }
    else {
        req.db.run(
            "INSERT INTO budget (budget_code, budget_type, budget_amount) VALUES (?, ?, ?)",
            req.body.code,
            req.body.type,
            req.body.amount,
            function (err, row)
            {
                if (err)
                    throw err;

                console.log("Successfully created budget '" + req.body.code + "' (" + this.lastID +")");
                res.status(200).json({status: 200, data: {id: this.lastID}});
            }
        );
    }
});

/* DELETE - Delete specified budget */
router.delete("/:id", function (req, res, next) {
    req.db.run(
        "DELETE FROM budget WHERE budget_id = ?",
        req.params.id,
        function (err, row)
        {
            if (err)
                throw err;

            console.log("Successfully deleted budget with ID " + req.params.id);
            res.status(200).json({status: 200});
        }
    );
});

/* PATCH - Update specified budget */
router.patch("/:id", function (req, res, next) {
    var validationResponse = validate(req.body);
    if (validationResponse != OK) {
        console.log("Bad budget received");
        console.log(req.body);
        res.status(400).json({status: 400, data: {message: 'Malformed input - ' + validationResponse }});
    }
    else {
        req.db.run(
            "UPDATE budget SET             " +
            "   budget_code = ?,           " +
            "   budget_type = ?,           " +
            "   budget_amount = ?          " +
            "WHERE budget_id = ?",
            req.body.code,
            req.body.type,
            req.body.amount,
            req.params.id,
            function (err, row)
            {
                console.log(this);

                if (err)
                    throw err;

                console.log("Successfully updated budget with ID " + req.params.id);
                res.status(200).json({status: 200});
            }
        );
    }
});

/* SPECIAL GET - List allowed budget types */
router.get('/types', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(types));
});


/* Validation */
const OK = "OK";
function validate(budget) {

    if      (! budget.hasOwnProperty("code"))
        return "Missing code";
    else if (! budget.hasOwnProperty("type"))
        return "Missing type";
    else if (! budget.hasOwnProperty("amount"))
        return "Missing amount";
    else if (! _.find(types, { id: budget.type }))
        return "Invalid type";
    else if (isNaN(utils.parseNumber(budget.amount)))
        return "Amount is not a number";

    return OK;
}

module.exports = router;
