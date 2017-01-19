/**
 * Created by kellysmith on 10/21/16.
 *
 * 2016 pokingBears.com
 */
//var child = require('child_process');
var fs = require('fs');


function postUserImage (req,res){

    var imageData, rawData;

    req.on('data', function (data) {
        
        rawData = data;
       
    });
    req.on('end', function(){

        imageData = decodeBase64Image(rawData);
        
        fs.writeFile('./image'+Date.now()+'.jpg', imageData.data, function(err) { 

            if(err){
                throw new Error(' Unable To Write Image File '+err);    
            }

        });
        res.json({Result: true});

    });

}

function decodeBase64Image(dataString){
    console.log(" data and boobies makes me high LOW "+dataString);
    var matches = String(dataString).match(/data:([A-Za-z-+\/]+);base64,(.*)/);
        response = {};

    if (matches.length !== 3) {
       return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    console.log("  response type  "+matches[1]);

    return response;
    
}




module.exports.postUserImage = postUserImage;