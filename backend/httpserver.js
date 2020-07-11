var http = require("http");
var fs = require("fs");
var spawn = require('child_process').spawn;
var server;
var online = false;

process.chdir("../../server");
var website = http.createServer((function(request, response)
{
	if (request.method == "POST")
	{
		var body = '';
		request.on('data', function(chunk)
		{
		return body += chunk.toString();
		});

		request.on('end', () => {

			if (body == "start")
			{
				startServer();
			}
			else if (body == "stop")
			{
				stopServer();
			}
			else if (body == "restart")
			{
				restartServer();
			}

		response.end('ok');
		});
	}

	if (request.method == "GET")
	{
		var body = '';
		request.on('data', function(chunk)
		{
		return body += chunk.toString();
		});

		console.log(body);
		if (body == "properties")
		{
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.writeHead(200, {"Content-Type": "text/plain"});

			fs.readFile("server.properties", function read(err, data)
			{
			if (err)
			{
			throw err;
			}

			const content = data;

			response.end(content);
			});
		}

	}
}));

website.listen(8080);



function startServer()
{
	if (online)
	{
		console.log("The server is currently running!");
		return;
	}

	online = true;
	server = spawn('java', ['-Xmx4096M', '-Xmx4096M', '-jar', 'server.jar', 'nogui']);
	server.stdin.setEncoding('utf-8');

	server.stdout.on('data', (data) => {
	console.log(`${data}`);
	});

	server.stderr.on('data', (data) => {
	console.error(`${data}`);
	});

	server.on('close', (code) => {
	console.log(`Minecraft server stopped with exit code (${code})`);
	});
}

function serverCommand(command)
{
	server.stdin.write(command + "\n");
}

function stopServer()
{
	if (!online)
	{
		console.log("The server is not running!");
		return;
	}

	online = false;
	serverCommand("/stop");
}

function restartServer()
{
	if (!online)
	{
		console.log("The server is not running!");
		return;
	}

	stopServer();
	startServer();
}