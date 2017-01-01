const HTTP = require("http-status");

exports.validate = function (req, res, next, bancaObject) {
    this.errors = bancaObject.validate(req.body);

    if (this.errors.length > 0) {
        this.success = false;
        this.message = "Validation failed for object of type '" + bancaObject.constructor.name + "' ";
        res.status(HTTP.OK).json(self);
    }
    else {
        next();
    }
};