var express = require('express');
var router = express.Router();
var utils = require('../lib/ui-utils.js');


router.get('/', function (req,res, next) {
    res.redirect('/ui/');
});

router.get('/ui', function (req,res, next) {
    res.render('base.html', {
        title: 'Base page'
    });
});

router.get('/ui/accounts', function(req, res, next) {
    req.db.all("SELECT * FROM account", function (err, rows)
    {
        res.render('accounts.html', {
            title: 'Accounts'
        });
    });
});

module.exports = router;
