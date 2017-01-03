const check   = require('../../lib/types.js').check;

var fn_response = function (resolve, reject) {
    return function (error, response, body) {
        if (error) {
            reject(error);
        }
        else if (response.statusCode == 500) {
            reject(new Error(response.request.href + " threw internal error: " + body.error));
        }
        else {
            check.assert.assigned(body.success, "Response object success indicator missing");
            check.assert(body.success, "Response object indicates failure");
            resolve(body);
        }
    }
};
exports.fn_response = fn_response;


exports.fn_response_get = function (resolve, reject) {
    return fn_response((body) => {
        check.assert.assigned(body.data, "GET request - No data returned");
        resolve(body);
    }, reject);
};


exports.fn_response_post = function (resolve, reject, obj) {
    return fn_response((body) => {
        check.assert.assigned(body.data, "POST request - No data returned");
        check.assert.assigned(body.data.id, "POST request - New object ID not returned");
        check.assert(check.__numberlike(body.data.id, ".add - New object ID not number"));
        obj.id = body.data.id;
        resolve(body);
    }, reject);
};


