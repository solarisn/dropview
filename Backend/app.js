/**
 * app.js
 *
 * Use `app.js` to run your app without `sails lift`.
 * To start the server, run: `node app.js`.
 *
 * This is handy in situations where the sails CLI is not relevant or useful.
 *
 * For example:
 *   => `node app.js`
 *   => `forever start app.js`
 *   => `node debug app.js`
 *   => `modulus deploy`
 *   => `heroku scale`
 *
 *
 * The same command-line arguments are supported, e.g.:
 * `node app.js --silent --port=80 --prod`
 */


// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
// > Note: This is not required in order to lift, but it is a convenient default.
process.chdir(__dirname);

// Attempt to import `sails`.
var sails;
try {
  sails = require('sails');
} catch (e) {
  console.error('To run an app using `node app.js`, you usually need to have a version of `sails` installed in the same directory as your app.');
  console.error('To do that, run `npm install sails`');
  console.error('');
  console.error('Alternatively, if you have sails installed globally (i.e. you did `npm install -g sails`), you can use `sails lift`.');
  console.error('When you run `sails lift`, your app will still use a local `./node_modules/sails` dependency if it exists,');
  console.error('but if it doesn\'t, the app will run with the global sails instead!');
  return;
}

// --•
// Try to get `rc` dependency (for loading `.sailsrc` files).
var rc;
try {
  rc = require('rc');
} catch (e0) {
  try {
    rc = require('sails/node_modules/rc');
  } catch (e1) {
    console.error('Could not find dependency: `rc`.');
    console.error('Your `.sailsrc` file(s) will be ignored.');
    console.error('To resolve this, run:');
    console.error('npm install rc --save');
    rc = function () { return {}; };
  }
}


// Start server
sails.lift(rc('sails'));

//ADDED POTENTIALLY TERRIBLE CODE TEST
var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+"/views/index.html"));
});

app.post('/upload', function(req, res){

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        sails.log("form on");
        fs.rename(file.path, path.join(form.uploadDir, file.name));
        //sails.config.conn.sendText(file.toString());
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        res.end('success');
    });

    // parse the incoming request containing the form data
    form.parse(req);

});

var server = app.listen(3000, function(){
    console.log('Server listening on port 3000');
});
