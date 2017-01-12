const request = require("request-json");
const logger  = require("../../lib/debug.js").logger;
const shared  = require("./_shared.js");

const client = request.createClient('http://localhost:3001/');


exports.listByAccount = function (account_id) {
    logger.trace("Budget AJAX - .listOverDateRange:");
    logger.trace(account_id);
    return new Promise((resolve, reject) => {
        client.get("/rest/accounting/byAccount/" + account_id, shared.fn_response_get(resolve, reject));
    });
};


exports.listOverDateRange = function (date_start, date_end, account_id) {
    logger.trace("Budget AJAX - .listOverDateRange:");
    logger.trace(date_start);
    logger.trace(date_end);
    logger.trace(account_id);
    return new Promise((resolve, reject) => {
        client.get("/rest/accounting/byDate/" + date_start + "/" + date_end + "/" + account_id, shared.fn_response_get(resolve, reject));
    });
};