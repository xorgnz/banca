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
check.not = check.not;
//noinspection SillyAssignmentJS
check.instance = check.instance;
//noinspection SillyAssignmentJS
check.instanceStrict = check.instanceStrict;
//noinspection SillyAssignmentJS
check.like = check.like;

exports.check = check;

