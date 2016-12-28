// Import libraries
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3');

// Express engine
var app = express();

// View engine
require('nunjucks').configure('views', {
    autoescape: true,
    express: app
});

// Configure standard middleware
app.use(require('morgan')('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cookie-parser')());
app.use(express.static(path.join(__dirname, 'public')));

// Configure middleware - DB connection
app.use(function(req, res, next) {
    req.db = new sqlite3.Database('database.sqlite');
    next();
});

// Configure routes
app.use('/', require('./routes/index'));
app.use('/rest/account', require('./routes/account'));
app.use('/rest/budget', require('./routes/budget'));
app.use('/rest/entry', require('./routes/entry'));

// catch 404 and forward to error handler
app.use(function(req, res, next)
{
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use( function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error.html');
});

module.exports = app;
