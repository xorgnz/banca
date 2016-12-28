const request = require("request-json");
const logger  = require("../../lib/debug.js").logger;
const shared  = require("./_shared.js");

const client = request.createClient('http://localhost:3001/');


exports.add = function (obj) {
    logger.trace("Budget AJAX - .add:");
    logger.trace(obj);
    return new Promise((resolve, reject) => {
        client.post("/rest/budget", obj, shared.fn_response_post(resolve, reject, obj));
    });
};

exports.get = function (id) {
    logger.trace("Budget AJAX - .get: " + id);
    return new Promise((resolve, reject) => {
        client.get("/rest/budget/" + id, shared.fn_response_get(resolve, reject));
    });
};

exports.listAll = function (id) {
    logger.trace("Budget AJAX - .listAll");
    return new Promise((resolve, reject) => {
        client.get("/rest/budget/", shared.fn_response_get(resolve, reject));
    });
};

exports.remove = function (id) {
    logger.trace("Budget AJAX - .remove: " + id);
    return new Promise((resolve, reject) => {
        client.delete("/rest/budget/" + id, shared.fn_response(resolve, reject));
    });
};

exports.update = function (obj) {
    logger.trace("Budget AJAX - .update:");
    logger.trace(obj);
    return new Promise((resolve, reject) => {
        client.patch("/rest/budget/" + obj.id, obj, shared.fn_response(resolve, reject));
    });
};