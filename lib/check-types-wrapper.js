// Stupid wrapper class to fix erroneous warnings in WebStorm
// without completely disabling unresolved variable checking.
//
// Depending on how a Node.JS module is constructed, WebStorm
// sometimes doesn't believe it provides the functions that it does.
// Re-assigning them to themselves like this makes it notice.
//
// This is very stupid, but it works and has essentially no
// performance impact


var check = require("check-types");

//noinspection SillyAssignmentJS
check.assert = check.assert;
//noinspection SillyAssignmentJS
check.assigned = check.assigned;
//noinspection SillyAssignmentJS
check.emptyString = check.emptyString;
//noinspection SillyAssignmentJS
check.instance = check.instance;
//noinspection SillyAssignmentJS
check.instanceStrict = check.instanceStrict;
//noinspection SillyAssignmentJS
check.like = check.like;
//noinspection SillyAssignmentJS
check.nonEmptyString = check.nonEmptyString;
//noinspection SillyAssignmentJS
check.not = check.not;
//noinspection SillyAssignmentJS
check.number = check.number;
//noinspection SillyAssignmentJS
check.string = check.string;

exports.check = check;
exports.check.__numberlike = function (n) {
    return check.number(n) || (check.string(n) && check.number(Number.parseFloat(n)));
};

