/**
 * Created by kellysmith on 8/1/16.
 *
 * 2016 pokingBears.com
 */

 var models = require('../model/app-model-main');

 function PullUserLocations(req, res, next){

    var pullEntries = models.LocationEntries.find({});
    pullEntries.exec(function (err, ulocations) {
        if (err)
            res.send(err);

        // If no errors are found, it responds with a JSON of all users
        res.json(ulocations);
    });

 }

 function PostUserLocations(req,res,next){


    console.log(" req.body.username " + req.body.username);

    // create a friend location, information comes from AJAX request from Angular
    var newEntry = new models.LocationEntries(req.body);

    newEntry.save(function (err) {

        if (err) {
            throw err;
            //res.json({Result:false})
        } else {
            res.json({Result: true})
        }

        console.log(" user " + req.body + " saved ");

        // respond with save is true

    });

 }

 function QueryLocations(req,res,next){

    // Grab all of the query parameters from the body.
    var lat = req.body.latitude;
    var long = req.body.longitude;
    var distance = req.body.distance;

    // Opens a generic Mongoose Query. Depending on the post body we will...
    var locQuery = models.LocationEntries.find({});

    if (distance) {

        // Using MongoDB's geospatial querying features. (Note how coordinates are set [long, lat]
        locQuery = locQuery.where('location').near({
            center: {type: 'Point', coordinates: [long, lat]},

            // Converting meters to miles. Specifying spherical geometry (for globe)
            maxDistance: distance * 3218.68, spherical: true
        });
    }

    locQuery.exec(function (err, users) {
        if (err)
            res.send(err);

        // If no errors, respond with a JSON of all users that meet the criteria
        res.json(users);
    });

 }

module.exports.PullUserLocations = PullUserLocations;
module.exports.PostUserLocations = PostUserLocations;
module.exports.QueryLocations = QueryLocations;
