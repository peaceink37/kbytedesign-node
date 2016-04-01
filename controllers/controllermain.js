/**
 * Created by kellysmith on 4/1/16.
 *
 * 2016 pokingBears.com
 */

var models = require('../model/app-model-main');
var jwt = require('jsonwebtoken');

// User Authentication Controller
function ProcessUserAuth(reqObject, res){

	//models.UserSchema.remove({}, function(err) {
	//	console.log(' user schema collection removed');
	//	return;
	//});

	console.log(' processUserAuth happening email and display name '+reqObject.body.email+' disp name '+reqObject.body.displayname);
	var requestObject = reqObject;
	var responseObject = res;
	var resObject = {};

	// create token for new user
	function createToken(user) {
		var token = jwt.sign(user, models.getTokenSecret(), {
			expiresInMinutes: 2880
		});

		responseObject.json({
			success: true,
			message: 'Token Has Been Set',
			token: token
		})
	}

	function authNewUser(){

		console.log(" auth new user "+requestObject.body.email);

		var aPerson = new models.UserSchema({
			email: requestObject.body.email,
			password: requestObject.body.userpass,
			displayname: requestObject.body.displayname,
			admin: true
		});

		aPerson.save(function(error){
			if(error){
				console.log(' user save error '+error);
				throw error;
			}
			resObject.message = "true";
			// Process request and respond with a token
			responseObject.json(resObject);
		});

	}

	// see if current user
	function authExistingUser(){

	    models.UserSchema.findOne({
		    email: requestObject.body.email
	        }, function(error, user){

		        if(error){
			        console.log('something happened trying to find user '+error);
		        }

		        if(!user){
			        console.log(' user not found ');
			        authNewUser();
		        } else if(user){

			        var userSchemaMethods = new models.UserSchema();
                    userSchemaMethods.comparePassword(requestObject.body.userpass, user.password, passFail);

			        function passFail(err, match){

				        if(match){
					        user.displayname = requestObject.body.displayname;
					        createToken(user);
					    } else {
					        responseObject.json({success:false, message:'Auth failed! Passwords do not match'+err});
				        }
			        }

		        }

	    })

	}

	function verifyToken(){

		// check header or url parameters or post parameters for token
		var token = requestObject.body.token || requestObject.query.token || requestObject.headers['x-access-token'];

		if (token) {

			// verifies secret and checks exp
			jwt.verify(token, models.getTokenSecret(), function(err, decoded) {
				if (err) {
					return responseObject.json({ success: false, message: 'Failed to authenticate token.' });
				} else {
					// if everything is good, save to request for use in other routes
					requestObject.decoded = decoded;
				}
			});

		} else {

			// if there is no token
			// return an error
			return responseObject.status(403).send({
				success: false,
				message: 'No token provided.'
			});

		}
	};

	authExistingUser();

	//models.UserEntries.remove({}, function(err) {
	//	console.log('collection removed');
	//});


}

module.exports.ProcessUserAuth = ProcessUserAuth;