const express = require('express');
const router = express.Router();
const utils = require("../lib/ui-utils.js");
const validation = require('../lib/validation');
const HTTP = require('http-status');

const types = [
    {id: 1, type: "Monthly Regular"},
    {id: 2, type: "Yearly Regular"},
    {id: 3, type: "One Off Special"},
    {id: 4, type: "Ongoing Special"},
];


/* GET - List all budgets */
router.get('/', function (req, res, next) {

    req.db.all("SELECT * FROM budget",
        function (err, rows) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(utils.stripDatabasePrefix(rows)));
            }
        }
    );
});

/* POST - Create new budget */
router.post('/', function (req, res, next) {
    validation.validateBudget(req, res, next)
});
router.post('/', function (req, res, next) {
    req.db.run(
        "INSERT INTO budget (budget_code, budget_type, budget_amount) VALUES (?, ?, ?)",
        req.body.code,
        req.body.type,
        req.body.amount,
        function (err, row) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                console.log("Successfully created budget '" + req.body.code + "' (" + this.lastID + ")");
                res.status(HTTP.OK).json({success: true, data: {id: this.lastID}});
            }
        }
    );
});

/* DELETE - Delete specified budget */
router.delete("/:id", function (req, res, next) {
    req.db.run(
        "DELETE FROM budget WHERE budget_id = ?",
        req.params.id,
        function (err, row) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                console.log("Successfully deleted budget with ID " + req.params.id);
                res.status(HTTP.OK).json({success: true});
            }
        }
    );
});

/* PATCH - Update specified budget */
router.patch('/', function (req, res, next) {
    validation.validateBudget(req, res, next)
});
router.patch("/:id", function (req, res, next) {
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
        function (err, row) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                console.log("Successfully updated budget with ID " + req.params.id);
                res.status(HTTP.OK).json({success: true});
            }
        }
    );
});

/* SPECIAL GET - List allowed budget types */
router.get('/types', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(types));
});


module.exports = router;
