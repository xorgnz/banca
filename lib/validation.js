const _ = require('lodash');
const mathUtils = require("./math-utils.js");
const HTTP = require("http-status");
const budgetTypes = require("../routes/budget.js").types;


const ValidationError = function (field, type, message) {
    this.field = field;
    this.type = type;
    if (message !== undefined) {
        this.message = message;
    }
};
const VET_MISSING = "missing";
const VET_INVALID = "invalid";


const ValidationResponse = function (type) {
    let self = this;
    this.type = type;
    this.errors = [];

    // Add Error
    this.addError = function (field, message) {
        console.log(field);
        console.log(message);

        this.errors.push(new ValidationError(field, message));
    };

    // Handle a response
    this.respond = function (req, res, next) {
        if (this.errors.length > 0) {
            this.success = false;
            this.message = "Validation failed for object of type '" + this.type + "'";

            res.status(HTTP.OK).json(self);

            console.log(this.message);
            console.log(this.errors);
        }
        else {
            next();
        }
    };
};


exports.validateBudget = function(req, res, next) {
    let response = new ValidationResponse("budget");

    if (!req.body.hasOwnProperty("code")) {
        response.addError("code", VET_MISSING);
    } else if (! req.body.code) {
        response.addError("code", VET_MISSING);
    }

    console.log(req.body);
    if (!req.body.hasOwnProperty("type")) {
        response.addError("type", VET_MISSING);
    } else if (!_.find(budgetTypes, {id: req.body.type})) {
        response.addError("type", VET_INVALID);
    }

    if (! req.body.hasOwnProperty("amount")) {
        response.addError("amount", VET_MISSING);
    } else if (req.body.amount === '') {
        response.addError("amount", VET_MISSING);
    } else if (isNaN(mathUtils.parseNumber(req.body.amount))) {
        response.addError("amount", VET_INVALID);
    } else if (req.body.amount < 0) {
        response.addError("amount", VET_INVALID);
    }
    req.body.amount = mathUtils.parseNumber(req.body.amount);

    response.respond(req, res, next);
};


exports.validateAccount = function(req, res, next) {
    let response = new ValidationResponse("account");

    if (!req.body.hasOwnProperty("name")) {
        response.addError("name", VET_MISSING);
    } else if (! req.body.name) {
        response.addError("name", VET_MISSING);
    }

    if (!req.body.hasOwnProperty("description")) {
        response.addError("description", VET_MISSING);
    } else if (! req.body.description) {
        response.addError("description", VET_MISSING);
    }

    response.respond(req, res, next);
};


