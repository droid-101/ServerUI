var http = require("http")
var fs = require("fs");
var server = http.createServer((function(request, response)
{
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.writeHead(200, {"Content-Type": "text/plain"});

	fs.readFile("test.txt", function read(err, data)
	{
	if (err)
	{
	throw err;
	}

	const content = data;

	response.end(content);
	});
}));

server.listen(8080);
