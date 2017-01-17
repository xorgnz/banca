const router = require('express').Router();
const HTTP   = require('http-status');
const shared = require('./_shared');

const accountingDAO = require("../dao/accounting.js");


// DELETE - Blocked
router.delete('/*', function (req, res, next) {
    res.status(HTTP.OK).json({success: false, message: "Endpoint blocked"});
});


// GET - All - Blocked
router.get('/', function (req, res, next) {
    res.status(HTTP.OK).json({success: false, message: "Endpoint blocked"});
});


// SPECIAL GET - Retrieve accountings for given account
router.get('/byAccount/:account_id', function (req, res, next) {
    Promise.resolve()
        .then(() => { return accountingDAO.listByAccount(req.db, req.params.account_id); })
        .then((rows) => {
            res.status(HTTP.OK).json({success: true, data: rows});
        })
        .catch(next);
});


// SPECIAL GET - Retrieve accountings spanning date range 
router.get('/byDate/:start/:end/:account_id', function (req, res, next) {
    Promise.resolve()
        .then(() => {
            return accountingDAO.listOverDateRange(
                req.db,
                req.params.start,
                req.params.end,
                req.params.account_id);
        })
        .then((row) => { res.status(HTTP.OK).json({success: true, data: row}); })
        .catch(next);
});


// GET - Specific
router.get('/:id', function (req, res, next) {
    Promise.resolve()
        .then(() => { return accountingDAO.get(req.db, req.params.id); })
        .then((rows) => {
            res.status(HTTP.OK).json({success: true, data: rows});
        })
        .catch(next);
});


// PATCH - Blocked
router.patch('/*', function (req, res, next) {
    res.status(HTTP.OK).json({success: false, message: "Endpoint blocked"});
});


// POST - Blocked
router.post('/*', function (req, res, next) {
    res.status(HTTP.OK).json({success: false, message: "Endpoint blocked"});
});


module.exports = router;
