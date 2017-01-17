const router = require('express').Router();
const HTTP   = require('http-status');
const shared = require('./_shared');

const budgetDAO = require("../dao/budget.js");


// DELETE - Delete
router.delete("/:id", function (req, res, next) {
    Promise.resolve()
        .then(() => { budgetDAO.remove(req.db, req.params.id); })
        .then(() => { res.status(HTTP.OK).json({success: true}); })
        .catch(next);
});

// GET - All
router.get('/', function (req, res, next) {
    return Promise.resolve()
        .then(() => { return budgetDAO.listAll(req.db); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: rows}); })
        .catch(next);
});


// GET - Specific - Blocked
router.get('/:id', function (req, res, next) {
    res.status(HTTP.OK).json({success: false, message: "Endpoint blocked"});
});


// SPECIAL GET - List allowed budget types 
router.get('/types', function (req, res, next) {
    res.status(HTTP.OK).json({success: true, data: budgetDAO.types});
});


// SPECIAL GET - Retrieve particular budget 
router.get('/:id', function (req, res, next) {
    Promise.resolve()
        .then(() => { return budgetDAO.get(req.db, req.params.id); })
        .then((row) => { res.status(HTTP.OK).json({success: true, data: row}); })
        .catch(next);
});


// PATCH - Update
router.patch('/:id', function (req, res, next) { shared.validate(req, res, next, budgetDAO.Budget); });
router.patch("/:id", function (req, res, next) {
    req.body.id = req.params.id;
    var budget  = budgetDAO.Budget.fromObject(req.body);
    Promise.resolve()
        .then(() => { return budgetDAO.update(req.db, budget); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: budget}); })
        .catch(next);
});


// POST - Create
router.post('/', function (req, res, next) { shared.validate(req, res, next, budgetDAO.Budget); });
router.post('/', function (req, res, next) {
    var budget = budgetDAO.Budget.fromObject(req.body);
    Promise.resolve()
        .then(() => { return budgetDAO.add(req.db, budget); })
        .then((rows) => { res.status(HTTP.OK).json({success: true, data: {id: budget.id}}); })
        .catch(next);
});


module.exports = router;
