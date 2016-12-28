//  Module dependencies.
const createApp = require('../app').createApp;
const logger    = require("../lib/debug.js").logger;
const http      = require('http');

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

// Usage
function usage() {
    console.log("node --harmony bin/www.js [test|live]");
    process.exit();
}

// Parse and validate command line arguments
if (process.argv[2] == "-h") { usage(); }
var type = process.argv[2] == "test" ? "test" : "live";

// Determine port
const PORT_LIVE = 3000;
const PORT_TEST = 3001;
var port = type == "test" ? PORT_TEST : PORT_LIVE;

// Create test server
var app = createApp(type);
app.set('port', port);
var server = http.createServer(app);
server.listen(port);
server.on('error', createErrorFunction(port));
server.on('listening', () => { logger.trace("Server '" + type + "' listening on " + server.address().port); });

