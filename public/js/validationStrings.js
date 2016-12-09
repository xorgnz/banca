"use strict";

var validationDescriptors = {
    "account": {
        "name": {
            "missing": "Accounts must have a name",
        },
        "description": {
            "missing": "Accounts must have a description",
        }
    }
};


function errorToString(error, objectType) {
    try {
        return validationDescriptors[objectType][error.field][error.type];
    } catch (e) {
        return "Unknown validation error";
    }
}