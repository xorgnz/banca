exports.parseNumber = function (num) {

    console.log(num);

    if (!num && num !== 0) {
        return NaN;
    }


    if (typeof(num) === "number") {
        return num;
    }

    if (typeof(num) === "string") {
        console.log("Parsing number as float");
        console.log(num);
        return parseFloat(num.replace(",", ""));
    }

    return NaN;
};
