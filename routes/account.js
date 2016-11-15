var express = require('express');
var router = express.Router();
var utils = require("../lib/ui-utils.js");

/* GET users listing. */
router.get('/', function(req, res, next) {

    req.db.all("SELECT * FROM account", function (err, rows) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(utils.stripDatabasePrefix(rows)));
    });

});

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
            res.status(200).json({status: 200, data: {id: this.lastID}});
        }
    );
});

router.delete("/:id", function (req, res, next) {
    req.db.run(
        "DELETE FROM account WHERE account_id = ?",
        req.params.id,
        function (err, row)
        {
            if (err)
                throw err;

            console.log("Successfully deleted account with ID " + req.params.id);
            res.status(200).json({status: 200});
        }
    );
});

router.patch("/:id", function (req, res, next) {

    console.log(req.body);
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
            res.status(200).json({status: 200});
        }
    );
});

module.exports = router;
