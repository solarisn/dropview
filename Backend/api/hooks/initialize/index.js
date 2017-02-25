module.exports = function initialize(sails) {
	return {

		initialize: function(cb) {
			sails.log("Initializing in progress");

			var ws = require("nodejs-websocket")

			// Scream server example: "hi" -> "HI!!!"
			var server = ws.createServer(function (conn) {
				sails.config.conn = conn;
			    sails.log("New connection")
			    //conn.sendText("HI THERE!");
			    conn.on("text", function (str) {
			        sails.log("Received "+str)
			        conn.sendText(str.toUpperCase()+"!!!")
			    })
			    conn.on("close", function (code, reason) {
			        sails.log("Connection closed")
			    })
			}).listen(8001)

			return cb();
		}

	};
}