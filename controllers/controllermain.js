/**
 * Created by kellysmith on 4/1/16.
 *
 * 2016 pokingBears.com
 */

const jwt = require('jsonwebtoken');

const fs = require('fs');

// User Authentication Controller
function ProcessUserAuth(reqObject, res, next){

	//models.UserSchema.remove({}, function(err) {
	//	console.log(' user schema collection removed');
	//	return;
	//});

	console.log(' processUserAuth happening email and display name '+reqObject.body.email);
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
			displayname:user.displayname,
			email:user.email,
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

			// Process request and respond with a token
			createToken(aPerson);
		});

	}

	// see if current user
	function authUser(){

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

	authUser();

}




function VerifyToken(req, res, next){

    var responseObj;
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	//var verifyObj;

	console.log(' verify called ');
	
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, models.getTokenSecret(), function(err, decoded) {
			if (err) {
				console.log(' token bad '+token);
				res.json({ success: false, message: 'Failed to authenticate token.' });
			} else {
				// if everything is good, save to request for use in other routes
                token.decoded = decoded;
                //verifyObj.token = token.decoded;
                //verifyObj.verified = true;
                return next();

			}
		});

	} else {

		// if there is no token
		// return an error
		res.status(403).send({
			success: false,
			message: 'No token provided.'
		});

	}

};

function SetEntry(req, res){
	

	// create a friend location, information comes from AJAX request from Angular
	console.log(" we are in the set entry world ");
	var newEntry = new models.UserEntries();
	newEntry.uid = req.body.userId;
	newEntry.title = req.body.title;
	newEntry.author = req.body.userName;
	newEntry.body = req.body.bodyBooty;
	newEntry.comments = req.body.comments;
	newEntry.hidden = req.body.hidden;

	newEntry.save(function (err) {

		if (err) {
			throw err;
			//res.json.({Result:false})
		} else {
			res.json({Result: true})
		}

		console.log(" user " + req.body.userName + " saved ");

		// respond with save is true

	});

}

// use a callback or promise here
function GetUserEntries (req, res, next) {
    console.log(" routes seem to be working "+req.body);
    // use mongoose to get all user entries in the database
    var _this = this;
        _this.stro;
        _this.dyno = false; 

    models.UserEntries.find(function (err, uentries) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err){
            res.send(err)
        } else if (_this.dyno === true){
            
            var stripedEntries = [];
            for(foo in uentries){
                console.log(' foo '+uentries[foo].body+'   '+typeof uentries[foo].body+' '+stripedEntries);

                    stripedEntries.push(uentries[foo].body);
                //}
            }
            _this.stro = stripedEntries.join('\n');
            res.render('dynamic', { title: 'Hey', message: 'Hello there!', bodyMessage:'You\'re a mean grinch'}); 
                        
        } else {
            res.json(uentries); // return all friend locations in JSON format
            return next();    
        }

    });
}

module.exports.accessLog = function(req, res, next){



}

module.exports.VerifyToken = VerifyToken;
module.exports.GetUserEntries = GetUserEntries;
module.exports.SetEntry = SetEntry;
module.exports.ProcessUserAuth = ProcessUserAuth;

