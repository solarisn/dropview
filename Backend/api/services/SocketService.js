var fs = require('fs');
module.exports = {

	sendFileToUnity: function (uploadedFiles, cb) {

		if (uploadedFiles.length < 2) {
			console.log("Sending .obj without material")
			var file = fs.readFileSync(uploadedFiles[0].fd, null);
			sails.config.conn.sendBinary(file);
		} else {
			console.log("Sending .obj with .mtl");
			sails.config.conn.sendText("START_OBJECT");
			for (var i = 0; i < uploadedFiles.length; i++) {
				var file;
				if (uploadedFiles[i].fd.includes(".obj")) {
					sails.config.conn.sendText("incomingObj");
					file = fs.readFileSync(uploadedFiles[i].fd, null);
					sails.config.conn.sendText(file);
				} else if (uploadedFiles[i].fd.includes(".mtl")) {
					sails.config.conn.sendText("incomingMtl");
					file = fs.readFileSync(uploadedFiles[i].fd, null);
					sails.config.conn.sendText(file);
				} else {
					sails.config.conn.sendText("incomingTexture");
					file = fs.readFileSync(uploadedFiles[i].fd, null);
					sails.config.conn.sendBinary(file);
				}
			}
			sails.config.conn.sendText("END_OBJECT");
			/*
			if (uploadedFiles[0].fd.split('.')[1] === 'obj') {
				var obj = fs.readFileSync(uploadedFiles[0].fd, null);
				sails.config.conn.sendText(obj);
				var mtl = fs.readFileSync(uploadedFiles[1].fd, null);
				sails.config.conn.sendText(mtl);
			} else {
				var obj = fs.readFileSync(uploadedFiles[1].fd, null);
				sails.config.conn.sendText(obj);
				var mtl = fs.readFileSync(uploadedFiles[0].fd, null);
				sails.config.conn.sendText(mtl);
			}
			*/
		}

		return cb();
	}
}