const router = require('express').Router();
const shared = require("./_shared");
const HTTP   = require("http-status");

const accountingDAO = require("../dao/accounting.js");



/* SPECIAL GET - Retrieve accountings for given account*/
router.get('/byAccount/:account_id', function (req, res, next) {
    Promise.resolve()
        .then(() => { return accountingDAO.listByAccount(req.db, req.params.account_id); })
        .then((rows) => {
            res.status(HTTP.OK).json({success: true, data: rows});
        })
        .catch(next);
});

/* SPECIAL GET - Retrieve accountings spanning date range */
router.get('/byDate/:start/:end/:account_id', function (req, res, next) {
    console.log(req.params);
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

module.exports = router;
