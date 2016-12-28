var log4js = require('log4js');
log4js.configure("log4js.json");
exports.logger = log4js.getLogger();