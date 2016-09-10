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
    readVideoStr = fs.createReadStream(stream);
    vStream = fs.createWriteStream('./logs/videostream.mp4');
    readVideoStr.pipe(vStream);
}

function videoStop(stream){

    console.log(' chop it off at the knees ');
    //vStream.end();
}


module.exports.videoStarted = videoStarted;
module.exports.videoStop = videoStop;