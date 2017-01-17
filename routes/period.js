const router = require('express').Router();
const shared = require("./_shared");
const HTTP   = require("http-status");

const periodDAO = require("../dao/period.js");

// GET list of all periods
router.get('/', function (req, res, next) {
    Promise.resolve()
        .then(() => { return periodDAO.listAll(req.db); })
        .then((rows) => {
            res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});

// DELETE - Blocked
router.delete('/*', function (req, res, next) {
    res.status(HTTP.OK).json({success: false, message: "Endpoint blocked"});
});

// PATCH - Blocked
router.patch('/*', function (req, res, next) {
    res.status(HTTP.OK).json({success: false, message: "Endpoint blocked"});
});

// POST - Blocked
router.post('/*', function (req, res, next) {
    res.status(HTTP.OK).json({success: false, message: "Endpoint blocked"});
});

// SPECIAL GET - By Date
router.get('/byDate/:date', function (req, res, next) {
    Promise.resolve()
        .then(() => { return periodDAO.getByDate(req.db, req.params.date); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});

module.exports = router;
