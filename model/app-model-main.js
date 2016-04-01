var mongoose = require('mongoose');     // mongoose for mongodb
var bcrypt = require('bcrypt');    // password encryption
var SALT_WORK_FACTOR = 10;      // encryption hashing strength

var MAX_LOGIN_ATTEMPS = 4;
// results in milliseconds
var LOCK_TIME = 2 * 60 * 60 * 1000;
var Schema = mongoose.Schema;

var config = require('../config');

// db connection  and model
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("hello flint");
});

// enable retrieve of token secret
var tokenSecret = config.secret;

var getTokenSecret = function(){
	return tokenSecret;
}

// create schema for collection

var entrySchema  = new Schema ({
	uid: String,
	title: String,
	author: String,
	body: String,
	comments: String,
	date: { type: Date, default: Date.now },
	hidden: {type: Boolean, default: false}
});

var userSchema = new Schema ({
	email: { type: String, required: true, index: { unique: true } },
	password: { type: String, required: true },
	displayname: {type: String},
	admin: {type:Boolean},
	loginAttempts: { type: Number, required: true, default: 0 },
	lockUntil: { type: Number }
});

userSchema.virtual('isLocked').get(function(){
	return !!(this.lockUntil && this.lockUntil > Date.now());
});

// map failed login reasons to the model so we can track and respond accordingly
userSchema.statics.failedLogin = {
	NOT_FOUND: 0,
	PASSWORD_INCORRECT: 1,
	MAX_ATTEMPTS: 4
};

userSchema.pre('save', function(next) {
	var user = this;
	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
		if (err) return next(err);

		// hash the password along with our new salt
		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) return next(err);

			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.comparePassword = function(candidatePassword, hashp, cb) {
	bcrypt.compare(candidatePassword, hashp, function(err, isMatch) {

		console.log(" hash p "+hashp);

		if (err) return cb(err);
		cb(null, isMatch);
	});
};

/***** Location Schema *****/

// Creates Location Schema. This will be the basis of how user data is stored in the db
var locationSchema = new Schema({
	username: {type: String, required: true},
	gender: {type: String, required: true},
	age: {type: Number, required: true},
	favlang: {type: String, required: true},
	location: {type: [Number], required: true}, // [Long, Lat]
	htmlverified: String,
	created_at: {type: Date, default: Date.now},
	updated_at: {type: Date, default: Date.now}
});

// Sets the created_at parameter equal to the current time
locationSchema.pre('save', function(next){
	now = new Date();
	this.updated_at = now;
	if(!this.created_at) {
		this.created_at = now
	}
	next();
});

// Indexes this schema in 2dsphere format (critical for running proximity searches)
locationSchema.index({location: '2dsphere'});

/***** end Location Schema ******/

var LocationEntries = mongoose.model('LocationEntries', locationSchema);
var UserEntries = mongoose.model('UserEntries', entrySchema);
var UserSchema = mongoose.model('UserSchema', userSchema);

module.exports.LocationEntries = LocationEntries;
module.exports.UserEntries = UserEntries;
module.exports.UserSchema = UserSchema;
module.exports.getTokenSecret = getTokenSecret;
