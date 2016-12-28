//  Module dependencies.
const createApp = require('../app').createApp;
const logger    = require("../lib/debug.js").logger;
const http      = require('http');

const PORT_LIVE = 3000;
const PORT_TEST = 3001;

// Listener function - HTTP error
function createErrorFunction (port) {
    return function onError(error) {
        if (error.syscall !== 'listen')
            throw error;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(port + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(port + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}

// Create live server
var app_live = createApp("live");
app_live.set('port', PORT_LIVE);
var server_live = http.createServer(app_live);
server_live.listen(PORT_LIVE);
server_live.on('error', createErrorFunction(PORT_LIVE));
server_live.on('listening', () => { logger.trace("Live server listening on " + server_live.address().port); });

// Create test server
var app_test = createApp("test");
app_test.set('port', PORT_TEST);
var server_test = http.createServer(app_test);
server_test.listen(PORT_TEST);
server_test.on('error', createErrorFunction(PORT_TEST));
server_test.on('listening', () => { logger.trace("Test Server listening on " + server_test.address().port); });
