const HTTP = require("http-status");

exports.validate = function (req, res, next, bancaObject) {
    var errors = bancaObject.prototype.validate(req.body);

    if (errors.length > 0) {
        res.status(HTTP.OK).json({
            success: false,
            message: "Validation failed for object of type '" + bancaObject.name + "' ",
            errors: errors,
        });
    }
    else {
        next();
    }
};