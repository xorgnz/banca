


exports.validateAccount = function(req, res, next) {
    var errors = [];

    if      (! req.body.hasOwnProperty("namae"))
        errors.push( "Account is missing name");
    else if (! req.body.hasOwnProperty("description"))
        errors.push("Account is missing description");

    if (errors.length > 0) {
        console.log("Account failed validation");
        console.log(req.body);
        res.status(200).json({success: false, message: 'Malformed account received', errors: errors});
    }
    else {
        console.log('pp');
        next();
    }
};


