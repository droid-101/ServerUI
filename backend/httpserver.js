var http = require("http");
var fs = require("fs");
var path = require('path');
const { openStdin } = require("process");
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

					// you will need to manually convert the .properties string to json
					// first split data.toString using "\n".
					// then make each part of the resulting array an entry in the json string
					// the equals sign will become a colon and the value on right side should have quotes.
					// finally stringify json and write it in the response
					data = propertiesToJSON(data.toString());
					console.log(data);
					response.write(data);
					response.end();
				}
			);
		}
		else if (target == "whitelist")
		{
			fs.readFile("whitelist.json",
				function(err, data)
				{
					if (err)
					{
						throw err;
					}

					response.write(data.toString());
					response.end();
				}
			);
		}
		else if (target == "status")
		{
			let currentStatus = "";

			if (online == true)
			{
				currentStatus = "online";
			}
			else if (online == false)
			{
				currentStatus = "offline";
			}
			else
			{
				currentStatus = "error";
			}

			response.write(currentStatus);
			response.end();
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

function propertiesToJSON(properties)
{
	var jsonData = {};
	var entry = [];
	let key = "";
	let value = "";

	properties = properties.split("\n");

	for (let i = 0; i < properties.length - 1; i++)
	{
		entry = properties[i].split("=");
		key = entry[0];
		value = entry[1];
		jsonData[key] = value;
	}

	jsonData = JSON.stringify(jsonData);
	console.log(jsonData);
	return jsonData;
}