var express = require('express');
var router = express.Router();
var utils = require("../lib/ui-utils.js");
var validation = require("../lib/validation.js");

router.post('/', function(req, res, next) { validation.validateAccount(req, res, next) });
router.patch('/:id', function(req, res, next) { validation.validateAccount(req, res, next) });

/* GET users listing. */
router.get('/', function(req, res, next) {

    req.db.all("SELECT * FROM account", function (err, rows) {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({success: true, data: utils.stripDatabasePrefix(rows)});
    });
});

/* POST - Create new budget */
router.post('/', function(req, res, next) {
    req.db.run(
        "INSERT INTO account (account_name, account_description) VALUES (?, ?)",
        req.body.name,
        req.body.description,
        function (err, row)
        {
            if (err)
                throw err;

            console.log("Successfully created account with name '" + req.body.name + "' (" + this.lastID +")");
            res.status(200).json({success: true, id: this.lastID});
        }
    );
});

/* DELETE - Delete specified budget */
router.delete("/:id", function (req, res, next) {
    req.db.run(
        "DELETE FROM account WHERE account_id = ?",
        req.params.id,
        function (err, row)
        {
            if (err)
                throw err;

            console.log("Successfully deleted account with ID " + req.params.id);
            res.status(200).json({success: true});
        }
    );
});

/* PATCH - Update specified budget */
router.patch("/:id", function (req, res, next) {
    req.db.run(
        "UPDATE account SET             " +
        "   account_name = ?,           " +
        "   account_description = ?     " +
        "WHERE account_id = ?",
        req.body.name,
        req.body.description,
        req.params.id,
        function (err, row)
        {
            console.log(this);

            if (err)
                throw err;

            console.log("Successfully updated account with ID " + req.params.id);
            res.status(200).json({success: true});
        }
    );
});

module.exports = router;
