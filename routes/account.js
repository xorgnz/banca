const express = require('express');
const router = express.Router();
const uiUtils = require("../lib/ui-utils.js");
const validation = require("../lib/validation.js");
const HTTP = require("http-status");

/* GET users listing. */
router.get('/', function (req, res, next) {
    req.db.all("SELECT * FROM account",
        function (err, rows) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.status(HTTP.OK).json({success: true, data: uiUtils.stripDatabasePrefix(rows)});
            }
            console.log("fish");
        }
    );
});


/* POST - Create new budget */
router.post('/', function (req, res, next) {
    validation.validateAccount(req, res, next);
});
router.post('/', function (req, res, next) {
    req.db.run(
        "INSERT INTO account (account_name, account_description) VALUES (?, ?)",
        req.body.name,
        req.body.description,
        function (err, row) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                console.log("Created account with name '" + req.body.name + "' (" + this.lastID + ")");
                res.status(HTTP.OK).json({success: true, data: {id: this.lastID}});
            }
        }
    );
});


/* DELETE - Delete specified budget */
router.delete("/:id", function (req, res, next) {
    req.db.run(
        "DELETE FROM account WHERE account_id = ?",
        req.params.id,
        function (err, row) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                console.log("Successfully deleted account with ID " + req.params.id);
                res.status(HTTP.OK).json({success: true});
            }
        }
    );
});


/* PATCH - Update specified budget */
router.patch('/:id', function (req, res, next) {
    validation.validateAccount(req, res, next)
});
router.patch("/:id", function (req, res, next) {
    req.db.run(
        "UPDATE account SET             " +
        "   account_name = ?,           " +
        "   account_description = ?     " +
        "WHERE account_id = ?",
        req.body.name,
        req.body.description,
        req.params.id,
        function (err, row) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                console.log("Successfully updated account with ID " + req.params.id);
                res.status(HTTP.OK).json({success: true});
            }
        }
    );
});

module.exports = router;
