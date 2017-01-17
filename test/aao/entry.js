const request = require("request-json");
const logger  = require("../../lib/debug.js").logger;
const shared  = require("./_shared.js");

const client = request.createClient('http://localhost:3001/');


exports.listByAccountAndPeriod = function (account_id, period_id) {
    logger.trace("Entry AJAX - .listByAccountAndPeriod:");
    logger.trace(account_id);
    logger.trace(period_id);
    return new Promise((resolve, reject) => {
        client.get("/rest/entry/byAccountAndPeriod/" + account_id + "/" + period_id, shared.fn_response_get(resolve, reject));
    });
};
