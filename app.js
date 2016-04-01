/**
 * Created by kellysmith on 6/26/15.
 *
 * 2016 pokingBears.com
 */
// load 3rd party libraries

var express =  require('express');
var http = require('http');
var io = require('socket.io');
var morgan = require('morgan');            // log requests to the console
var bodyParser = require('body-parser');     // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var mime = require('mime-types');
var uuid = require('node-uuid');        // for unique user identifications

var ChatRoom = require('./chatspace/chatroom');

// kick off express
var app = express();

var port = process.env.PORT || '3000'

// body parser and headers should be set before calling in Routes
app.use(express.static('kbyteui/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


// bring in the api routes, injecting express
var routes = require('./routes/routes')(app);

app.get('/api', function(req, res) {
	res.send('hello Brooklyn');
});

// video mime type - needed for Chrome
mime.extension('video/mp4');
console.log(mime.lookup('.mp4'));

var server = http.createServer(app);
var room = {}
server.listen(port, function() {
	console.log("Server listening on port 3000  and dirname "+__dirname);
	room =  new ChatRoom();
	var thingy = room.getPing("poof");
	console.log(thingy);
});

// Kick off socket server then declare socket specific vars
io = io.listen(server);
require('./sockets/socket-main')(io);








