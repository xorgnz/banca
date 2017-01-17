const router = require('express').Router();
const HTTP   = require('http-status');
const shared = require('./_shared');

const periodDAO = require("../dao/period.js");


// DELETE - Delete - Blocked
router.delete('/*', function (req, res, next) {
    res.status(HTTP.OK).json({success: false, message: "Endpoint blocked"});
});

// GET - All
router.get('/', function (req, res, next) {
    Promise.resolve()
        .then(() => { return periodDAO.listAll(req.db); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});


// SPECIAL GET - By Date
router.get('/byDate/:date', function (req, res, next) {
    Promise.resolve()
        .then(() => { return periodDAO.getByDate(req.db, req.params.date); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});


// GET - Specific
router.get('/:id', function (req, res, next) {
    Promise.resolve()
        .then(() => { return periodDAO.get(req.db, req.params.id); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});


// PATCH - Update - Blocked
router.patch('/*', function (req, res, next) {
    res.status(HTTP.OK).json({success: false, message: "Endpoint blocked"});
});


// POST - Create - Blocked
router.post('/*', function (req, res, next) {
    res.status(HTTP.OK).json({success: false, message: "Endpoint blocked"});
});

module.exports = router;
