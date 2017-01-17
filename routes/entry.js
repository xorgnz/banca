const router = require('express').Router();
const HTTP   = require('http-status');
const shared = require('./_shared');

const accountingDAO = require("../dao/accounting.js");
const entryDAO      = require("../dao/entry.js");


// DELETE - Delete
router.delete("/:id", function (req, res, next) {
    Promise.resolve()
        .then(() => { return accountingDAO.getByEntry(req.db, req.params.id); })
        .then((accounting) => {
            return Promise.resolve()
                .then(() => { return entryDAO.remove(req.db, req.params.id); })
                .then(() => { return accountingDAO.calc(req.db, accounting.id); })
                .then(() => { return accountingDAO.cascade(req.db, accounting.id); });
        })
        .then(() => { res.status(HTTP.OK).json({success: true}); })
        .catch(next);
});


// GET - All
router.get('/', function (req, res, next) {
    Promise.resolve()
        .then(() => { return entryDAO.listAll(req.db); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});


// GET - Specific - Blocked
router.get('/:id', function (req, res, next) {
    res.status(HTTP.OK).json({success: false, message: "Endpoint blocked"});
});


// SPECIAL GET - List entries associated with given account
router.get('/byAccount/:id', function (req, res, next) {
    Promise.resolve()
        .then(() => { return entryDAO.listByAccount(req.db, req.params.id); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});


// SPECIAL GET - List entries associated with given account and period
router.get('/byAccountAndPeriod/:account_id/:period_id', function (req, res, next) {
    Promise.resolve()
        .then(() => { return entryDAO.listByAccountAndPeriod(req.db, req.params.account_id, req.params.period_id); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});


// SPECIAL GET - List allowed budget types
router.get('/tags', function (req, res, next) {
    res.status(HTTP.OK).json({success: true, data: entryDAO.tags});
});


// PATCH - Update
router.patch('/:id', function (req, res, next) { shared.validate(req, res, next, entryDAO.Entry); });
router.patch("/:id", function (req, res, next) {
    req.body.id = req.params.id;
    var entry   = entryDAO.Entry.fromObject(req.body);
    Promise.resolve()
        .then(() => { return entryDAO.update(req.db, entry); })
        .then(() => { return accountingDAO.getByEntry(req.db, req.params.id); })
        .then((accounting) => {
            if (!accounting) {
                console.log(entry.account_id);
                return Promise.resolve()
                    .then(() => { return accountingDAO.createOverDateRange(req.db, entry.date, entry.date, entry.account_id); })
                    .then(() => { return accountingDAO.getByEntry(req.db, req.params.id); })
            }
            else
                return accounting;
        })
        .then((accounting) => {
            return Promise.resolve()
                .then(() => { return accountingDAO.calc(req.db, accounting.id); })
                .then(() => { return accountingDAO.cascade(req.db, accounting.id); });
        })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: entry}); })
        .catch(next);
});


// POST - Create
router.post('/', function (req, res, next) { shared.validate(req, res, next, entryDAO.Entry); });
router.post('/', function (req, res, next) {
    var entry = entryDAO.Entry.fromObject(req.body);
    Promise.resolve()
        .then(() => { return entryDAO.add(req.db, entry); })
        .then(() => { return accountingDAO.getByEntry(req.db, entry.id); })
        .then((accounting) => {
            return Promise.resolve()
                .then(() => { return accountingDAO.calc(req.db, accounting.id); })
                .then(() => { return accountingDAO.cascade(req.db, accounting.id); });
        })
        .then(() => { res.status(HTTP.OK).json({success: true, data: {id: entry.id}}); })
        .catch(next);
});


module.exports = router;
