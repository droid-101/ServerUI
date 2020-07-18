var http = require("http");
var fs = require("fs");
var path = require('path');
var spawn = require('child_process').spawn;

const PORT = 8080;

var contentTypes = {
	".css": "text/css",
	".js": "text/javascript",
	".png": "image/png"
};

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
				else if (body.split(" ")[0] == "RAM:")
				{
					let value = body.split(" ")[1];
					fs.writeFile("ram.txt", value,
						function(err)
						{
							if (err)
							{
								return console.log(err);
							}
						}
					);
				}
				else if (body.split("^")[0] == "properties")
				{
					let propertiesJSON = body.split("^")[1];
					let properties = JSONtoProperties(propertiesJSON);

					fs.writeFile("server.properties", properties,
						function(err)
						{
							if (err)
							{
								return console.log(err);
							}
						}
					);
				}
				else if (body.split(" ")[0] == "addPlayer")
				{
					serverCommand("/whitelist add " + body.split(" ")[1]);
				}
				else if (body.split(" ")[0] == "removePlayer")
				{
					serverCommand("/whitelist remove " + body.split(" ")[1])
				}
				else if (body.split(" ")[0] == "op")
				{
					serverCommand("/op " + body.split(" ")[1])
				}
				else if (body.split(" ")[0] == "deop")
				{
					serverCommand("/deop " + body.split(" ")[1])
				}
			}
		);
	}
	else if (request.method == "GET")
	{
		response.setHeader("Access-Control-Allow-Origin", "*");

		let target = request.url;
		console.log(request.method, target);

		if (target == "/mcserver")
		{
			fs.readFile("../repo/frontend/structure.html",
				function(err, data)
				{
					if (err)
					{
						throw err;
					}

					response.writeHead(200, {"Content-Type": "text/html"});
					response.write(data);
					response.end();
				}
			);
		}
		else if (target == "/properties")
		{
			fs.readFile("server.properties",
				function(err, data)
				{
					if (err)
					{
						throw err;
					}

					data = propertiesToJSON(data.toString());
					response.writeHead(200, {"Content-Type": "text/plain"});
					response.write(data);
					response.end();
				}
			);
		}
		else if (target == "/whitelist")
		{
			fs.readFile("whitelist.json",
				function(err, data)
				{
					if (err)
					{
						throw err;
					}

					response.writeHead(200, {"Content-Type": "text/plain"});
					response.write(data.toString());
					response.end();
				}
			);
		}
		else if (target == "/ops")
		{
			fs.readFile("ops.json",
				function(err, data)
				{
					if (err)
					{
						throw err;
					}

					response.writeHead(200, {"Content-Type": "text/plain"});
					response.write(data.toString());
					response.end();
				}
			);
		}
		else if (target == "/worlds")
		{
			let getWorlds = spawn('ls', ['-1', '../worlds']);
			let worlds = "";

			getWorlds.stdout.on('data',
				function(data)
				{
					worlds += data.toString();
				}
			);

			getWorlds.on('close',
				function(code)
				{
					worlds = worlds.split("\n");
					response.writeHead(200, {"Content-Type": "text/plain"});
					response.write(worlds.toString());
					response.end();
				}
			);
		}
		else if (target == "/ram")
		{
			fs.readFile("ram.txt",
				function(err, data)
				{
					if (err)
					{
						return console.log(err);
					}

					response.writeHead(200, {"Content-Type": "text/plain"});
					response.write(data.toString());
					response.end();
				}
			);
		}
		else if (target == "/status")
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

			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write(currentStatus);
			response.end();
		}
		else
		{
			getFrontendResource(target, response);
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
	let ram;

	fs.readFile("ram.txt",
		function(err, data)
		{
			if (err)
			{
				return console.log(err);
			}

			ram = (data.toString());

			server = spawn('java', ['-Xmx' + ram + "M", '-Xms' + ram + "M", '-jar', 'server.jar', 'nogui']);

			server.stdin.setEncoding('utf-8');
			console.log("Minecraft server starting with " + ram + " of RAM");

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
	);
}

function serverCommand(command)
{
	if (!online)
	{
		console.log("Server is offline: Command cannot be executed");
		return;
	}

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
	return jsonData;
}

function JSONtoProperties(jsonData)
{
	let properties = "#Minecraft Server Settings\n";
	jsonData = JSON.parse(jsonData);

	for (key in jsonData)
	{
		properties = properties.concat(key, "=", jsonData[key], "\n");
	}

	return properties;
}

function getFrontendResource(target, response)
{
	let ext = path.extname(target);
	let type = contentTypes[ext];
	let filePath = "../repo/frontend" + target;

	fs.readFile(filePath,
		function(err, data)
		{
			if (err)
			{
				response.writeHead(404);
			}
			else
			{
				response.writeHead(200, {"Content-Type": type});
				response.write(data);
			}

			response.end();
		}
	);
}