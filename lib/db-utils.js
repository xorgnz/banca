const _      = require('lodash');
const logger = require("./debug.js").logger;
const check  = require('../lib/check-types-wrapper.js').check;

var stripDatabasePrefix     = function (obj) {

    if (obj === undefined) {
        return null;
    }

    else if (check.array(obj)) {
        var fixedArray = [];
        for (var item of obj) {
            fixedArray.push(stripDatabasePrefix(item));
        }
        return fixedArray;
    }

    else if (check.object(obj)) {
        var fixedObject = {};
        _.forIn(obj, function (value, key) {
            fixedObject[key.substr(key.indexOf("_") + 1)] = value;
        });
        return fixedObject;
    }

    else
        return obj;
};


exports.generateDBResponseFunctionDelete = function (resolve, reject) {
    return function (err) {
        if (err) {
            logger.error(err);
            reject(err);
        } else {
            resolve();
        }
    }
};
exports.generateDBResponseFunctionGet    = function (resolve, reject, convert) {
    return function (err, obj) {
        if (err) {
            logger.error(err);
            reject(err);
        } else {
            obj = stripDatabasePrefix(obj);

            if (check.function(convert)) {
                if (check.array(obj)) {
                    for (var i = 0; i < obj.length; i++) {
                        obj[i] = convert(obj[i]);
                    }
                }
                else if (check.object(obj)) {
                    obj = convert(obj);
                }
            }
            resolve(obj);
        }
    }
};
exports.generateDBResponseFunctionInsert = function (resolve, reject, obj) {
    return function (err) {
        if (err) {
            logger.error(err);
            reject(err);
        }
        else {
            if (obj) obj.id = this.lastID;
            resolve(this.lastID);
        }
    }
};
exports.generateDBResponseFunctionUpdate = function (resolve, reject) {
    return function (err) {
        if (err) {
            logger.error(err);
            reject(err);
        } else {
            resolve();
        }
    }
};