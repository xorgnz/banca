const router = require('express').Router();
const HTTP   = require('http-status');
const shared = require('./_shared');

const accountDAO = require("../dao/account.js");
const entryDAO   = require("../dao/entry.js");


// DELETE - Delete
router.delete("/:id", function (req, res, next) {
    console.log(req.params.id);
    Promise.resolve()
        .then(() => { accountDAO.remove(req.db, req.params.id); })
        .then(() => { res.status(HTTP.OK).json({success: true}); })
        .catch(next);
});


// GET - All
router.get('/', function (req, res, next) {
    Promise.resolve()
        .then(() => { return accountDAO.listAll(req.db); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});


// GET - Specific
router.get('/:id', function (req, res, next) {
    Promise.resolve()
        .then(() => { return accountDAO.get(req.db, req.params.id); })
        .then((row) => { res.status(HTTP.OK).json({success: true, data: row}); })
        .catch(next);
});


// PATCH - Update
router.patch('/:id', function (req, res, next) { shared.validate(req, res, next, accountDAO.Account); });
router.patch("/:id", function (req, res, next) {
    req.body.id = req.params.id;
    var account = accountDAO.Account.fromObject(req.body);
    Promise.resolve()
        .then(() => { return accountDAO.update(req.db, account); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: account}); })
        .catch(next);
});


// POST - Create
router.post('/', function (req, res, next) { shared.validate(req, res, next, accountDAO.Account); });
router.post('/', function (req, res, next) {
    var account = accountDAO.Account.fromObject(req.body);
    Promise.resolve()
        .then(() => { return accountDAO.add(req.db, account); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: {id: account.id}}); })
        .catch(next);
});


module.exports = router;
