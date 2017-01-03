const router = require('express').Router();
const shared = require("./_shared");
const HTTP   = require("http-status");

const accountingDAO = require("../dao/accounting.js");
const entryDAO      = require("../dao/entry.js");


/* GET list of all objects of this type */
router.get('/', function (req, res, next) {
    Promise.resolve()
        .then(() => { return entryDAO.listAll(req.db); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});


/* SPECIAL GET - List allowed budget types */
router.get('/tags', function (req, res, next) {
    res.status(HTTP.OK).json({success: true, data: entryDAO.tags});
});


/* POST - Create new object */
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


/* DELETE - Delete specified object */
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


/* PATCH - Update specified object */
router.patch('/:id', function (req, res, next) { shared.validate(req, res, next, entryDAO.Entry); });
router.patch("/:id", function (req, res, next) {
    req.body.id = req.params.id;
    var entry   = entryDAO.Entry.fromObject(req.body);
    Promise.resolve()
        .then(() => { return entryDAO.update(req.db, entry); })
        .then(() => { return accountingDAO.getByEntry(req.db, req.params.id); })
        .then((accounting) => {
            if (! accounting) {
                console.log(entry.account_id);
                return Promise.resolve()
                    .then(() => { return accountingDAO.createOverDateRange(req.db, entry.date, entry.date, entry.account_id); })
                    .then(() => { return accountingDAO.getByEntry(req.db, req.params.id); })
            }
            else
                return accounting;
        })
        .then ((accounting) => {
            return Promise.resolve()
                .then(() => { return accountingDAO.calc(req.db, accounting.id); })
                .then(() => { return accountingDAO.cascade(req.db, accounting.id); });
        })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: entry}); })
        .catch(next);
});


module.exports = router;
