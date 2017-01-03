const router = require('express').Router();
const shared = require("./_shared");
const HTTP   = require("http-status");

const accountDAO = require("../dao/account.js");
const entryDAO   = require("../dao/entry.js");


/* GET list of all accounts */
router.get('/', function (req, res, next) {
    Promise.resolve()
        .then(() => { return accountDAO.listAll(req.db); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});

/* SPECIAL GET - Retrieve particular budget */
router.get('/:id', function (req, res, next) {
    Promise.resolve()
        .then(() => { return accountDAO.get(req.db, req.params.id); })
        .then((row) => { res.status(HTTP.OK).json({success: true, data: row}); })
        .catch(next);
});


/* POST - Create new account */
router.post('/', function (req, res, next) { shared.validate(req, res, next, accountDAO.Account); });
router.post('/', function (req, res, next) {
    var account = accountDAO.Account.fromObject(req.body);
    Promise.resolve()
        .then(() => { return accountDAO.add(req.db, account); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: {id: account.id}}); })
        .catch(next);
});


/* DELETE - Delete specified account */
router.delete("/:id", function (req, res, next) {
    console.log(req.params.id);
    Promise.resolve()
        .then(() => { accountDAO.remove(req.db, req.params.id); })
        .then(() => { res.status(HTTP.OK).json({success: true}); })
        .catch(next);
});


/* PATCH - Update specified account */
router.patch('/:id', function (req, res, next) { shared.validate(req, res, next, accountDAO.Account); });
router.patch("/:id", function (req, res, next) {
    req.body.id = req.params.id;
    var account = accountDAO.Account.fromObject(req.body);
    Promise.resolve()
        .then(() => { return accountDAO.update(req.db, account); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: account}); })
        .catch(next);
});

/* SPECIAL GET - List entries associated with account */
router.get('/:id/entries', function (req, res, next) {
    Promise.resolve()
        .then(() => { return entryDAO.listByAccount(req.db, req.params.id); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});


module.exports = router;
