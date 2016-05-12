/**
 * Created by kellysmith on 3/27/16.
 *
 * 2016 pokingBears.com
 */

var controllerMain = require('../controllers/controllermain');
var models = require('../model/app-model-main');

/*************** ROUTES ****************/

function Routes(app, express) {
    /************** Authorize ***************/

    app.post('/api/userauth', function (req, res) {

        console.log(" request received " + req.body.displayname);
        controllerMain.ProcessUserAuth(req, res);

    });

    /************ Retrieve Entries **********/
    app.get('/users/uentries', function(req, res){
        getUserEntries(req, res, null, null);
    });

    app.get('/users/ulocations', function (req, res) {

        var pullEntries = models.LocationEntries.find({});
        pullEntries.exec(function (err, ulocations) {
            if (err)
                res.send(err);

            // If no errors are found, it responds with a JSON of all users
            res.json(ulocations);
        });

    })

    /*********** Post Entries *************/
    // create user entry
    var entryRouter = express.Router();
    app.post('/users/setuentry', controllerMain.VerifyToken, controllerMain.SetEntry);

    // create location entry
    app.post('/users/ulocations', function (req, res) {

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

    });

// create user location query
    app.post('/users/locationquery', function (req, res) {

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


    })

    app.get('/logs/access', controllerMain.accessLog);

    app.use('/api', function(req, res) {
        res.send('<div><h2>hello Brooklyn</h2><p>Api Base Test. Using app.use</p></div>');
    });

    app.get('/dynamic', greetMethod);

    function greetMethod(req, res){

        var mainMessage = getUserEntries(req,res,null,true);

        setTimeout(function(){
           console.log(' main message '+mainMessage);
           }, 500);
        
    }

    function testReturn(){

        return 'There is no poo in woo unless old people screw';
    }
    // use a callback or promise here
    function getUserEntries (req, res, next, dyno) {
        console.log(" routes seem to be working "+req.body);
        // use mongoose to get all user entries in the database
        var _this = this;
            _this.dyno = dyno;
            _this.stro; 

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
            }

        });
    }

}

module.exports = Routes;