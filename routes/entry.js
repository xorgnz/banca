/**
 * Created by xorgnz on 2016-12-13.
 */
const express = require('express');
const router = express.Router();
const uiUtils = require("../lib/ui-utils.js");
const validation = require("../lib/validation.js");
const HTTP = require("http-status");
const tags = require("../lib/tags.js");

/* GET list of all entries */
router.get('/', function (req, res, next) {
    req.db.all("SELECT * FROM entry",
        function (err, rows) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.status(HTTP.OK).json({success: true, data: uiUtils.stripDatabasePrefix(rows)});
            }
        }
    );
});


/* POST - Create new entry */
router.post('/', function (req, res, next) {
    validation.validateEntry(req, res, next);
});
router.post('/', function (req, res, next) {
    req.db.run(
        "INSERT INTO entry (" +
        "   entry_account_id, " +
        "   entry_amount, " +
        "   entry_date, " +
        "   entry_bank_note, " +
        "   entry_note, " +
        "   entry_tag, " +
        "   entry_what, " +
        "   entry_where) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        req.body.account_id,
        req.body.amount,
        req.body.date,
        req.body.bank_note,
        req.body.note,
        req.body.tag,
        req.body.what,
        req.body.where,
        function (err, row) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                console.log("Created entry with name '" + req.body.name + "' (" + this.lastID + ")");
                res.status(HTTP.OK).json({success: true, data: {id: this.lastID}});
            }
        }
    );
});


/* DELETE - Delete specified budget */
router.delete("/:id", function (req, res, next) {
    req.db.run(
        "DELETE FROM entry WHERE entry_id = ?",
        req.params.id,
        function (err, row) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                console.log("Successfully deleted entry with ID " + req.params.id);
                res.status(HTTP.OK).json({success: true});
            }
        }
    );
});


/* PATCH - Update specified budget */
router.patch('/:id', function (req, res, next) {
    validation.validateEntry(req, res, next)
});
router.patch("/:id", function (req, res, next) {
    req.db.run(
        "UPDATE entry SET           " +
        "   entry_account_id = ?,   " +
        "   entry_amount = ?,       " +
        "   entry_date = ?,         " +
        "   entry_bank_note = ?,    " +
        "   entry_note = ?,         " +
        "   entry_tag = ?,          " +
        "   entry_what = ?,         " +
        "   entry_where = ?         " +
        "WHERE entry_id = ?",
        req.body.account_id,
        req.body.amount,
        req.body.date,
        req.body.bank_note,
        req.body.note,
        req.body.tag,
        req.body.what,
        req.body.where,
        req.params.id,
        function (err, row) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                console.log("Successfully updated entry with ID " + req.params.id);
                res.status(HTTP.OK).json({success: true, data: { amount: req.body.amount }});
            }
        }
    );
});

module.exports = router;
