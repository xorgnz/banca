#!/usr/bin/env node

//  Module dependencies.
var app = require('../app');
var debug = require('debug')('banca:server');
var http = require('http');

// Get port from environment and store in Express.
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Create HTTP server.
var server = http.createServer(app);


// Normalize a port into a number, string, or false.
function normalizePort(val)
{
    var port = parseInt(val, 10);

    // named pipe
    if (isNaN(port))
        return val;

    // port number
    if (port >= 0)
        return port;

    return false;
}


// Listener function - HTTP error
function onError(error)
{
    if (error.syscall !== 'listen')
        throw error;

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code)
    {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}


// Event listener for HTTP server "listening" event.
function onListening()
{
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}


// Listen on provided port, on all network interfaces.
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
