/**
 * Created by kellysmith on 3/27/16.
 *
 * 2016 pokingBears.com
 */

// Require the associated top-level business logic
var controllerMain = require('../controllers/controllermain');
var mapsControllerMain = require('../controllers/mapscontrollermain');

/*************** ROUTES ****************/

function Routes(app, express) {
    /************** Authorize ***************/

    app.post('/api/userauth', controllerMain.ProcessUserAuth);
    app.post('/api/resetpass', controllerMain.EmailVerify);

    /************ Retrieve Entries **********/
    app.get('/users/uentries', controllerMain.GetUserEntries);
    
    app.get('/users/ulocations', mapsControllerMain.PullUserLocations); 

    /*********** Post Entries *************/
    // create user entry
    var entryRouter = express.Router();
    app.post('/users/setuentry', controllerMain.VerifyToken, controllerMain.SetEntry);

    // create location entry
    app.post('/users/ulocations', mapsControllerMain.PostUserLocations);

    // create user location query
    app.post('/users/locationquery', mapsControllerMain.QueryLocations); 

    app.get('/logs/access', controllerMain.accessLog);

    app.use('/api', function(req, res) {
        res.send('<div><h2>hello Brooklyn</h2><p>Api Base Test. Using app.use</p></div>');
    });

    app.get('/dynamic', greetMethod);

    function greetMethod(req, res){

        var mainMessage = controllerMain.GetUserEntries(req,res,null,true);

        setTimeout(function(){
           console.log(' main message '+mainMessage);
           }, 500);
        
    }

    function testReturn(){

        return 'There is no poo in woo unless old people screw';
    }
    

}

module.exports = Routes;