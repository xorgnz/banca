const router = require('express').Router();
const shared = require("./_shared");
const HTTP   = require("http-status");

const periodDAO = require("../dao/period.js");


/* GET list of all periods */
router.get('/', function (req, res, next) {
    Promise.resolve()
        .then(() => { return periodDAO.listAll(req.db); })
        .then((rows) => {
            res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});

module.exports = router;
