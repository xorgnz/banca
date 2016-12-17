const _ = require('lodash');

var stripDatabasePrefix = function(obj) {

    if (Array.isArray(obj)) {
        var fixedArray = [];
        for (var item of obj) {
            fixedArray.push(stripDatabasePrefix(item));
        }
        return fixedArray;
    }

    else if (typeof(obj) === "object") {
        var fixedObject = {};
        _.forIn(obj, function(value, key) {
            fixedObject[key.substr(key.indexOf("_") + 1)] = value;
        });
        return fixedObject;
    }

    else
        return obj;
};

exports.stripDatabasePrefix = stripDatabasePrefix;