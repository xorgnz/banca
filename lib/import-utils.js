"use strict";

const _ = require('lodash');

var tags = [];
tags.push("Bank");
tags.push("Books");
tags.push("Cash out");
tags.push("Clothes");
tags.push("Donation");
tags.push("Education");
tags.push("Entertainment");
tags.push("Food out");
tags.push("Games");
tags.push("Groceries");
tags.push("Health");
tags.push("Insurance");
tags.push("Joint");
tags.push("Liquor");
tags.push("Misc");
tags.push("Music");
tags.push("Pay");
tags.push("Phone");
tags.push("Project");
tags.push("Purchase");
tags.push("Sport");
tags.push("Tech");
tags.push("Transfer");
tags.push("Travel");
tags.push("Unknown");

exports.tags = tags;

exports.UNKNOWN_TAG = "Unknown";

exports.isValidTagString = function(str) {
    return _.indexOf(tags, str) != -1;
};
