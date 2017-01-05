var express = require('express');
var router  = express.Router();


router.get('/', function (req, res, next) {
    res.redirect('/ui/');
});

router.get('/ui', function (req, res, next) {
    res.render('base.html', {
        title: 'Base page'
    });
});

router.get('/ui/account/:id/entries', function (req, res, next) {
    res.render('entries.html', {
        title:      'Entries',
        account_id: req.params.id
    });
});

router.get('/ui/accounts', function (req, res, next) {
    res.render('accounts.html', {
        title: 'Accounts'
    });
});

router.get('/ui/budgets', function (req, res, next) {
    res.render('budgets.html', {
        title: 'Budgets'
    });
});

module.exports = router;
