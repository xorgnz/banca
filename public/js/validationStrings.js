"use strict";

var validationDescriptors = {
    "account": {
        "name": {
            "missing": "Accounts must have a name",
        },
        "description": {
            "missing": "Accounts must have a description",
        }
    },
    "budget": {
        "code": {
            "missing": "Budgets must have a code. Should be a single word",
        },
        "type": {
            "missing": "Budgets must have a type. Should be selected from list available",
            "invalid": "Budget type is invalid. Should be selected from list available"
        },
        "amount": {
            "missing": "Budgets must have an allotted amount.",
            "invalid": "Budget amount must be a non-negative number"
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