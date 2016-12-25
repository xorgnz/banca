const _ = require('lodash');
const logger  = require("./debug.js").logger;

var stripDatabasePrefix = function(obj) {

    if (obj === undefined) {
        return null;
    }

    else if (Array.isArray(obj)) {
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
exports.generateDBResponseFunctionGet    = function (resolve, reject) {
    return function (err, obj) {
        if (err) {
            logger.error(err);
            reject(err);
        } else {
            resolve(stripDatabasePrefix(obj));
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

exports.db_insert = function(db, table, fieldNames, obj) {

    // Prepare field names
    _.pull(fieldNames, "id");
    var dbFieldNames = [];
    _.forEach(fieldNames, (v) => { dbFieldNames.push(table + "_" + v); });

    // Prepare field values
    var dbFields = [];
    for (var fieldName of fieldNames)
        dbFields.push(obj[fieldName]);

    // Create SQL insert
    var sql =
        "INSERT INTO " + table +
        "   (" + _.join(dbFieldNames, ",") + ") " +
        "VALUES " +
        "   (" + _.join(Array(fieldNames.length).fill("?"), ",") + ")";

    // Trigger query execution
    return new Promise((resolve, reject) => {
        db.run(sql, dbFields, function (err) {
            if (err) {
                logger.error(err);
                reject(err);
            }
            else {
                if (obj) obj.id = this.lastID;
                    resolve(this.lastID);
            }
        });
    });
};