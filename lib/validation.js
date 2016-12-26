const _ = require('lodash');
const mathUtils = require("./math-utils.js");
const HTTP = require("http-status");
const budgetTypes = require("../routes/budget.js").types;
const tags = require("../dao/entry.js").tags;


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


exports.validateAccount = function(req, res, next) {
    let response = new ValidationResponse("account");

    if (     ! req.body.hasOwnProperty("name")) {
        response.addError("name", VET_MISSING);
    } else if (req.body.name === '') {
        response.addError("name", VET_MISSING);
    }

    if (     ! req.body.hasOwnProperty("description")) {
        response.addError("description", VET_MISSING);
    } else if (req.body.description === '') {
        response.addError("description", VET_MISSING);
    }

    response.respond(req, res, next);
};


exports.validateBudget = function(req, res, next) {
    let response = new ValidationResponse("budget");

    if (     ! req.body.hasOwnProperty("code")) {
        response.addError("code", VET_MISSING);
    } else if (req.body.code === '') {
        response.addError("code", VET_MISSING);
    }

    if (       ! req.body.hasOwnProperty("type")) {
        response.addError("type", VET_MISSING);
    } else if (! _.find(budgetTypes, {id: req.body.type})) {
        response.addError("type", VET_INVALID);
    }

    if (     ! req.body.hasOwnProperty("amount")) {
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



exports.validateEntry = function(req, res, next) {
    let response = new ValidationResponse("entry");

    console.log(req.body);

    if (! req.body.hasOwnProperty("account_id")) {
        response.addError("account_id", VET_MISSING);
    }

    if (     ! req.body.hasOwnProperty("date")) {
        response.addError("date", VET_MISSING);
    } else if (req.body.date === '') {
        response.addError("date", VET_MISSING);
    } else {
        var dateResults = /^[0-9][0-9][0-9][0-9]\-[0-9][0-9]\-[0-9][0-9]$/.exec(req.body.date);
        if (dateResults === null) {
            response.addError("date", VET_INVALID);
        }
    }

    if (! req.body.hasOwnProperty("bank_note")) {
        response.addError("bank_note", VET_MISSING);
    }

    if (! req.body.hasOwnProperty("note")) {
        response.addError("note", VET_MISSING);
    }

    if (! req.body.hasOwnProperty("tag")) {
        response.addError("tag", VET_MISSING);
    } else if (_.indexOf(tags, req.body.tag) == -1) {
        response.addError("tag", VET_INVALID);
    }

    if (! req.body.hasOwnProperty("where")) {
        response.addError("where", VET_MISSING);
    }

    if (! req.body.hasOwnProperty("what")) {
        response.addError("what", VET_MISSING);
    }

    if (! req.body.hasOwnProperty("amount")) {
        response.addError("amount", VET_MISSING);
    } else if (req.body.amount === '') {
        response.addError("amount", VET_MISSING);
    } else if (isNaN(mathUtils.parseNumber(req.body.amount))) {
        response.addError("amount", VET_INVALID);
    }
    req.body.amount = mathUtils.parseNumber(req.body.amount);

    response.respond(req, res, next);
};


