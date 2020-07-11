var http = require("http");
var fs = require("fs");
var path = require('path');
var spawn = require('child_process').spawn;

const PORT = 8080;

var server;
var online = false;

process.chdir("../../server");

var website = http.createServer(requestHandler);
website.listen(PORT);

function requestHandler(request, response)
{
	let body = "";

	if (request.method == "POST")
	{
		request.on('data', (chunk) => {body += chunk.toString()});
		request.on('end',
			function()
			{
				console.log(request.method, body);
				if (body == "start")
				{
					// startServer();
				}
				else if (body == "stop")
				{
					// stopServer();
				}
				else if (body == "restart")
				{
					// restartServer();
				}
			}
		);
	}
	else if (request.method == "GET")
	{
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.writeHead(200, {"Content-Type": "text/plain"});

		let target = path.basename(request.url);
		console.log(request.method, target);

		if (target == "properties")
		{
			fs.readFile("server.properties",
				function(err, data)
				{
					if (err)
					{
						throw err;
					}

					response.write(data);
					response.end();
				}
			);
		}
	}
}

function startServer()
{
	if (online)
	{
		console.log("The server is currently running!");
		return;
	}

	online = true;
	console.log("Starting Minecraft server");
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
	console.log("Stopping Minecraft server");
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
