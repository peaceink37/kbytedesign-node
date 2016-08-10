/**
 * Created by kellysmith on 6/26/15.
 *
 *  2016 pokingBears.com
 */
// load middleware modules
'use strict';

var express =  require('express');
var http = require('http');
var io = require('socket.io');
var morgan = require('morgan');            // log requests to the console
var bodyParser = require('body-parser');     // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var mime = require('mime-types');          // for unique user identifications
var port = process.env.PORT || '3000';


// kick off express
var app = express();
app.set('view engine', 'pug');
// these are for the dynamic views, not the angular views
app.set('views', './views');
app.use(express.static(__dirname+'/kbyteui/public'));
app.use(express.static(__dirname+'/logs'));
app.use(morgan('dev'));

// body parser and headers should be set before calling in Routes
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

/* Bring in the routes for application, injecting express
 * Router and middleware logic is defined therein. Passing in express 
 * as well so granular routes do not clutter up the main file
 */
require('./routes/routes')(app, express);

// video mime type - needed for Chrome
mime.extension('video/mp4');
console.log(mime.lookup('.mp4'));

var server = http.createServer(app);

server.listen(port, function() {
	console.log(`Server listening on port 3000  and dirname ${1+5} `+__dirname);

});

// Kick off socket server then declare socket specific vars
io = io.listen(server);
require('./sockets/socket-main')(io);








