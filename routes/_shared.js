const HTTP = require("http-status");

exports.validate = function (req, res, next, bancaObject) {
    bancaObject.prototype.validate(req.body, req.db)
        .then((errors) => {
            if (!Array.isArray(errors)) {
                throw new Error("Validation return non-array of errors");
            }

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
        })
        .catch((err) => {
            console.log(err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send(
                "Validation failed to complete for object of type '" + bancaObject.name + "'. " +
                "Error received: " + err);
        });
};