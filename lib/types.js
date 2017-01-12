var check                  = require("check-types");
exports.check              = check;

exports.check.__numberlike = function (n) {
    return !isNaN(n);
};

exports.check.__datelike   = function (d) {
    // Is an actual date
    if (check.instance(d, Date) && check.number(d.getTime()))
        return true;

    // Is a numeric date in string or number form
    if (exports.check.__numberlike(d) && check.number(new Date(Number.parseInt(d)).getTime()))
        return true;

    // Is a string date
    return check.string(d) && check.number(new Date(d).getTime());
};




// Type conversion tools
exports.convert        = {};
exports.convert.toDate = function (d) {
    // Is an actual date
    if (check.instance(d, Date))
        return d;

    // Is a numeric date in string or number form
    if (exports.check.__numberlike(d)) {
        var d1 = new Date(Number.parseInt(d));
        if (check.number(d1.getTime()))
            return d1;
    }

    // Is a string date
    if (check.string(d) && d.match(/(\d{4})-(\d{2})-(\d{2})/)) {
        var d2 = new Date(d);
        if (check.number(d2.getTime()))
            return d2;
    }

    return new Date("invalid");
};