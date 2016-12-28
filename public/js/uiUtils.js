exports.formatDateIso8601 = function (date) {
    var d = new Date(date);
    return pad(d.getUTCFullYear(), 4) + "-" + pad(d.getUTCMonth(), 2) + "-" + pad(d.getUTCDate(), 2);
};

