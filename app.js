// Import libraries
const express    = require('express');
const path       = require('path');
const bodyParser = require('body-parser');
const sqlite3    = require('sqlite3');
const HTTP       = require('http-status');
const logger     = require("./lib/debug.js").logger;

var createApp = function (type) {
    // Express engine
    var app = express();

    // Configure standard middleware
    app.use(require('morgan')('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(require('cookie-parser')());
    app.use(express.static(path.join(__dirname, 'public')));

    // Configure middleware - DB connection
    app.use(function (req, res, next) {
        if (type == "live")
            req.db = new sqlite3.Database('database.sqlite');
        else
            req.db = new sqlite3.Database('test.sqlite');
        next();
    });

    // Configure views
    if (type == "live") {
        require('nunjucks').configure('views', {
            autoescape: true,
            express:    app
        });
        app.use('/', require('./routes/index'));
    }
    app.use('/rest/account', require('./routes/account'));
    app.use('/rest/budget', require('./routes/budget'));
    app.use('/rest/entry', require('./routes/entry'));

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err    = new Error("Not Found");
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function (err, req, res, next) {
        if (err.status === undefined)
            err.status = HTTP.INTERNAL_SERVER_ERROR;

        if (err.status != HTTP.NOT_FOUND)
            logger.error(err);

        res.status(err.status).json({error: err.message});
    });

    return app;
};


module.exports.createApp = createApp;
