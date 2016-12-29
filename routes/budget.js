const router     = require('express').Router();
const validation = require('../lib/validation');
const HTTP       = require('http-status');

const budgetDAO = require("../dao/budget.js");


/* GET - List all budgets */
router.get('/', function (req, res, next) {
    return Promise.resolve()
        .then(() => { return budgetDAO.listAll(req.db); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});


/* SPECIAL GET - List allowed budget types */
router.get('/types', function (req, res, next) {
    res.status(HTTP.OK).json({success: true, data: budgetDAO.types});
});


/* GET - Retrieve particular budget */
router.get('/:id', function (req, res, next) {
    console.log("fish");
    Promise.resolve()
        .then(() => { return budgetDAO.get(req.db, req.params.id); })
        .then((row) => { res.status(HTTP.OK).json({success: true, data: row}); })
        .catch(next);
});


/* POST - Create new budget */
router.post('/', function (req, res, next) { validation.validateBudget(req, res, next); });
router.post('/', function (req, res, next) {
    var budget = budgetDAO.Budget.fromObject(req.body);
    Promise.resolve()
        .then(() => { return budgetDAO.add(req.db, budget); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: {id: budget.id}}); })
        .catch(next);
});


/* DELETE - Delete specified budget */
router.delete("/:id", function (req, res, next) {
    Promise.resolve()
        .then(() => { budgetDAO.remove(req.db, req.params.id); })
        .then(() => { res.status(HTTP.OK).json({success: true}); })
        .catch(next);
});


/* PATCH - Update specified budget */
router.patch('/:id', function (req, res, next) { validation.validateBudget(req, res, next) });
router.patch("/:id", function (req, res, next) {
    req.body.id = req.params.id;
    var budget  = budgetDAO.Budget.fromObject(req.body);
    Promise.resolve()
        .then(() => { return budgetDAO.update(req.db, budget); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: budget}); })
        .catch(next);
});


module.exports = router;
