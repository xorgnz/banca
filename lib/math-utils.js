exports.parseNumber = function (num) {

    if (!num && num !== 0) {
        return NaN;
    }


    if (typeof(num) === "number") {
        return num;
    }

    if (typeof(num) === "string") {
        return parseFloat(num.replace(",", ""));
    }

    return NaN;
};

