const router     = require('express').Router();
const validation = require('../lib/validation');
const HTTP       = require('http-status');

const budgetDAO = require("../dao/budget.js");


/* GET - List all budgets */
router.get('/', function (req, res, next) {
    Promise.resolve()
        .then(() => { return budgetDAO.listAll(req.db); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch((err) => { res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message) });
});


/* POST - Create new budget */
router.post('/', function (req, res, next) { validation.validateBudget(req, res, next) });
router.post('/', function (req, res, next) {
    var budget = budgetDAO.Budget.fromObject(req.body);
    Promise.resolve()
        .then(() => { return budgetDAO.add(req.db, budget); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: {id: budget.id}}); })
        .catch((err) => { res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message) });
});


/* DELETE - Delete specified budget */
router.delete("/:id", function (req, res, next) {
    Promise.resolve()
        .then(() => { budgetDAO.remove(req.db, req.params.id); })
        .then(() => { res.status(HTTP.OK).json({success: true}); })
        .catch((err) => { res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message); });
});


/* PATCH - Update specified budget */
router.patch('/:id', function (req, res, next) { validation.validateBudget(req, res, next) });
router.patch("/:id", function (req, res, next) {
    req.body.id = req.params.id;
    var budget  = budgetDAO.Budget.fromObject(req.body);
    Promise.resolve()
        .then(() => { return budgetDAO.update(req.db, budget); })
        .then((rows) => { res.status(HTTP.OK).json({success: true}); })
        .catch((err) => { res.status(HTTP.INTERNAL_SERVER_ERROR).send(err.message) });
});


/* SPECIAL GET - List allowed budget types */
router.get('/types', function (req, res, next) {
    res.status(HTTP.OK).json({success: true, data: budgetDAO.types});
});


module.exports = router;
