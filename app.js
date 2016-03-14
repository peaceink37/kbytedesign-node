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

var models = require('./model/app-model-main');
var ChatRoom = require('./chatspace/chatroom');

// kick off express
var app = express();

//app.use('/angular-dev',
//	express.static(__dirname  + '/kbyteui/public'));
app.use(express.static('kbyteui/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.get('/api', function(req, res) {
	res.send('hello Brooklyn');
});

// video mime type - needed for Chrome
mime.extension('video/mp4');
console.log(mime.lookup('.mp4'));

var server = http.createServer(app);
var room = {}
server.listen(3000, function() {
	console.log("Server listening on port 3000  and dirname "+__dirname);
	room =  new ChatRoom();
	var thingy = room.getPing("poof");
	console.log(thingy);
});

// Kick off socket server then declare socket specific vars
io = io.listen(server);
require('./sockets/socket-main')(io);

// Routes
/*********** Retrieve Entries **********/
app.get('/users/uentries', function(req, res) {

	// use mongoose to get all user entries in the database
	models.UserEntries.find(function(err, uentries) {

		// if there is an error retrieving, send the error. nothing after res.send(err) will execute
		if (err)
			res.send(err)

		res.json(uentries); // return all friend locations in JSON format
	});
});

app.get('/users/ulocations', function(reg, res){

	var pullEntries = models.LocationEntries.find({});
	pullEntries.exec(function(err, ulocations){
		if(err)
			res.send(err);

		// If no errors are found, it responds with a JSON of all users
		res.json(ulocations);
	});

})

// create user entry
/*********** Post Entries *************/
app.post('/users/uentries', function(req, res) {

	//models.UserEntries.remove({}, function(err) {
	//	console.log('collection removed');
	//	return;
	//});

	console.log(" req.body "+req.body.userName);

	// create a friend location, information comes from AJAX request from Angular
	var newEntry = new models.UserEntries();
		newEntry.uid = req.body.userId;
		newEntry.title = req.body.title;
		newEntry.author = req.body.userName;
		newEntry.body = req.body.bodyBooty;
		newEntry.comments = req.body.comments;
		newEntry.hidden = req.body.hidden;

	newEntry.save(function(err){

		if(err){
			throw err;
			//res.json.({Result:false})
		} else {
			res.json({Result:true})
		}


		console.log(" user "+req.body.userName+" saved ");

		// respond with save is true

	});

});

// create location entry
app.post('/users/ulocations', function(req, res) {

	console.log(" req.body.username "+req.body.username);

	// create a friend location, information comes from AJAX request from Angular
	var newEntry = new models.LocationEntries(req.body);

	newEntry.save(function(err){

		if(err){
			throw err;
			//res.json({Result:false})
		} else {
			res.json({Result:true})
		}


		console.log(" user "+req.body+" saved ");

		// respond with save is true

	});

});

// create user location query
app.post('/users/locationquery', function(req, res){

	// Grab all of the query parameters from the body.
	var lat             = req.body.latitude;
	var long            = req.body.longitude;
	var distance        = req.body.distance;

	// Opens a generic Mongoose Query. Depending on the post body we will...
	var locQuery = models.LocationEntries.find({});

	if(distance){

		// Using MongoDB's geospatial querying features. (Note how coordinates are set [long, lat]
		locQuery = locQuery.where('location').near({ center: {type: 'Point', coordinates: [long, lat]},

			// Converting meters to miles. Specifying spherical geometry (for globe)
			maxDistance: distance * 3218.68, spherical: true});
	}

	locQuery.exec(function(err, users){
		if(err)
			res.send(err);

		// If no errors, respond with a JSON of all users that meet the criteria
		res.json(users);
	});


})

