



exports.formatDateIso8601 = function(date) {
    "use strict";

    var d = new Date(date);
    return d.getUTCFullYear() + "-" + d.getUTCMonth() + "-" + d.getUTCDate();
};

