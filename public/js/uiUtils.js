var formatDateIso8601 = function (date) {

    // Is a numeric date in string or number form
    if (!isNaN(date)) {
        return new Date(Number.parseInt(date)).toISOString().substr(0, 10);
    }

    // Is a string date
    else if (typeof(date) === "string" && date.match(/(\d{4})-(\d{2})-(\d{2})/)) {
        return new Date(date).toISOString().substr(0, 10);
    }

    // Is invalid
    else {
        return "Invalid";
    }
};

