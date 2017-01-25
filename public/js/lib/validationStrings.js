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
            "missing": "Budgets must have an allotted amount",
            "invalid": "Budget amount must be a non-negative number"
        }
    },
    "entry": {
        "date": {
            "missing": "Entries must have a date. Can be specified in most formats",
            "invalid": "Couldn't understand the date given. Try yyyy-mm-dd",
            "outside_range": "Date outside valid range for Banca"
        },
        "tag": {
            "missing": "Entries must have tags",
            "invalid": "This is not a valid entry tag. The error should never be visible",
        },
        "amount": {
            "missing": "Entries must have an amount",
            "invalid": "Entry amount must be a number"
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