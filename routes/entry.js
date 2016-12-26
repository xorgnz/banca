const router     = require('express').Router();
const validation = require("../lib/validation.js");
const HTTP       = require("http-status");

const entryDAO = require("../dao/entry.js");


/* GET list of all objects of this type */
router.get('/', function (req, res, next) {
    Promise.resolve()
        .then(() => { return entryDAO.listAll(req.db); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch((err) => { res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message) });
});


/* POST - Create new object */
router.post('/', function (req, res, next) { validation.validateEntry(req, res, next); });
router.post('/', function (req, res, next) {
    var entry = entryDAO.Entry.fromObject(req.body);
    Promise.resolve()
        .then(() => { return entryDAO.add(req.db, entry); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: {id: entry.id}}); })
        .catch((err) => { res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message) });
});


/* DELETE - Delete specified object */
router.delete("/:id", function (req, res, next) {
    Promise.resolve()
        .then(() => { entryDAO.remove(req.db, req.params.id); })
        .then(() => { res.status(HTTP.OK).json({success: true}); })
        .catch((err) => { res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message); });
});


/* PATCH - Update specified object */
router.patch('/:id', function (req, res, next) { validation.validateEntry(req, res, next) });
router.patch("/:id", function (req, res, next) {
    req.body.id = req.params.id;
    var entry   = entryDAO.Entry.fromObject(req.body);
    Promise.resolve()
        .then(() => { return entryDAO.update(req.db, entry); })
        .then((rows) => { res.status(HTTP.OK).json({success: true}); })
        .catch((err) => { res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message) });
});


module.exports = router;
