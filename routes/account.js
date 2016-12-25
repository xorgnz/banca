const express = require('express');
const router = express.Router();
const uiUtils = require("../lib/ui-utils.js");
const validation = require("../lib/validation.js");
const HTTP = require("http-status");

const accountDAO = require("../dao/account.js");

/* GET list of all accounts */
router.get('/', function (req, res, next) {
    Promise.resolve()
        .then(() => { return accountDAO.listAll(req.db); })
        .then((rows) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(HTTP.OK).json({success: true, data: rows});
        })
        .catch((err) => { res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message) });
});


/* POST - Create new account */
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


/* DELETE - Delete specified account */
router.delete("/:id", function (req, res, next) {
    Promise.resolve()
        .then(() => { accountDAO.remove(req.db, req.params.id); })
        .then(() => { res.status(HTTP.OK).json({success: true}); })
        .catch((err) => { res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message); });
});


/* PATCH - Update specified account */
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

/* SPECIAL GET - List entries associated with account */
router.get('/:id/entries', function (req, res, next) {
    req.db.all(
        "SELECT * FROM entry WHERE entry_account_id = ?",
        req.params.id,
        function (err, rows) {
            if (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message);
            }
            else {
                res.status(HTTP.OK).json({success: true, data: uiUtils.stripDatabasePrefix(rows)});
            }
        }
    );
});

module.exports = router;
