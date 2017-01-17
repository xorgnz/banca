const request = require("request-json");
const logger  = require("../../lib/debug.js").logger;
const shared  = require("./_shared.js");

const client = request.createClient('http://localhost:3001/');


exports.getByDate = function (date) {
    logger.trace("Period AJAX - .getByDate:");
    logger.trace(date);
    return new Promise((resolve, reject) => {
        client.get("/rest/period/byDate/" + date.getTime(), shared.fn_response_get(resolve, reject));
    });
};
