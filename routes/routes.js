/**
 * Created by kellysmith on 3/27/16.
 *
 * 2016 pokingBears.com
 */

// Require the associated top-level business logic
var controllerMain = require('../controllers/controllermain');
var videoControllerMain = require('../controllers/videoControllerMain');
var imageControllerMain = require('../controllers/imageControllerMain');
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


    /******* Post Images **********/

    app.post('/users/postimage', imageControllerMain.postUserImage);

    /******* Post Video ***********/
    app.post('/content/blob', videoControllerMain.postVideoBlob);

    function testReturn(){

        return 'There is no poo in woo unless old people screw';
    }

    /****** Book Shop *********/
    
    
    app.get('/books/booklist', function(req, res){
        
        var booklist = getBookList();
        res.send(booklist);
    })

    app.get('/books/booklist/:id', function(req, res){

        var book = getBookList().filter(function(obj){

            if(obj.id === req.params.id){
                console.log('  book object in filter '+obj.id+'  req params id '+req.params.id);
                return obj;
            }
        });
        console.log(' book object '+book+'  book id '+book[0]);

        res.send(book[0]);
    })

    function getBookList(){

        var booklist = [{"id":"1","createdAt":1472613028,"title":"title 5","imageUrl":"imageUrl 5","author":"author 5","price":78,"year":"year 5"},{"id":"2","createdAt":1472612968,"title":"title 6","imageUrl":"imageUrl 6","author":"author 6","price":5,"year":"year 6"},{"id":"3","createdAt":1472612908,"title":"title 7","imageUrl":"imageUrl 7","author":"author 7","price":30,"year":"year 7"},{"id":"4","createdAt":1472613093,"title":"React Base Fiddle (JSX)","imageUrl":"imageUrl 8","author":"Obinna","price":"32","year":"2007"},{"id":"5","createdAt":1472696784,"title":"React Hello World Example with ES6+JSX","imageUrl":"imageUrl 9","author":"Jade","price":"22","year":"2010"},{"id":"6","createdAt":1472696747,"title":"Asynchronous HTTP Requests with Observables in Angular 2","imageUrl":"imageUrl 10","author":"author 3","price":"30","year":"2015"}];
        return booklist;
    }

    



}




module.exports = Routes;