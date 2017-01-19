/**
 * Created by kellysmith on 8/11/16.
 *
 * 2016 pokingBears.com
 */
//var child = require('child_process');
var fs = require('fs');

var vStream;

function videoStarted(stream){

    console.log(' shit is on bodie '+stream);
    
}

function videoStop(stream){

    var tracky;
    
    var sfile = blobToFile(stream, 'pooky');
    fs.writeFile('./logs/blobs', stream, function(err){
        console.log(' what the hell, man '+err)
    })
    //vStream = fs.createWriteStream('./logs/videostream.mp4', stream);
   
}

function postVideoBlob(req, res){


     fs.writeFile('./logs/blobsposts', req, function(err){
        console.log(' POST VIDEO what the hell, man '+err)
    })

    res.json({
            success: true,
            message: 'video has been posted'
    })

}

function blobToFile(theBlob, fileName){
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}

module.exports.postVideoBlob = postVideoBlob;
module.exports.videoStarted = videoStarted;
module.exports.videoStop = videoStop;