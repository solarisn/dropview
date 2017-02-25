/**
 * SocketController
 *
 * @description :: Server-side logic for managing sockets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var util = require('util');

module.exports = {

	upload: function (req, res) {

	  req.file('uploads[]').upload({
	    // don't allow the total upload size to exceed ~10MB
	    dirname: require('path').resolve(sails.config.appPath, 'assets/uploads'),
	    maxBytes: 10000000000
	  },function whenDone(err, uploadedFiles) {
	    if (err) {
	      return res.negotiate(err);
	    }

	    // If no files were uploaded, respond with an error.
	    if (uploadedFiles.length === 0){
	      return res.badRequest('No file was uploaded');
	    }

	    for (var i = 0; i < uploadedFiles.length; i++) {
	    	sails.log("fileDescriptor: " + uploadedFiles[i].fd);
	    }

	    // Send uploaded file URL to service that sends file over socket connection to the Unity client
	    SocketService.sendFileToUnity(uploadedFiles, function() {
	    	sails.log("Socket Service callback activated");

	    });

	    //sails.log("fileDescriptor: " + uploadedFiles[0].fd);
	    //sails.log("avatarURL: " + require('util').format('%s/user/avatar/%s', sails.getBaseUrl(), 'solaris'));

	    // Save the "fd" and the url where the avatar for a user can be accessed
	    /*
	    User.update(req.session.me, {

	      // Generate a unique URL where the avatar can be downloaded.
	      avatarUrl: require('util').format('%s/user/avatar/%s', sails.getBaseUrl(), req.session.me),

	      // Grab the first file and use it's `fd` (file descriptor)
	      avatarFd: uploadedFiles[0].fd
	    })
	    .exec(function (err){
	      if (err) return res.negotiate(err);
	      return res.ok();
	    });
	    */
	  });
	},

	cb: function (uploadedFiles) {
		sails.config.conn.sendBinary(uploadedFiles[0].fd);
	}

};

