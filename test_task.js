var express = require('express');

var WebServer_PORT = 8000;

var web_server = express();

web_server.use(express.static('./app'));

web_server.get('/*', function(req, res) {
  res.sendFile(__dirname+'/app/')
});

web_server.listen(WebServer_PORT, function () {
	console.log("Web Server is listening on: http://localhost:%s", WebServer_PORT);
	console.log("API is located at /api");
});