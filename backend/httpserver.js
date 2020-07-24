var http = require("http");
var fs = require("fs");
var path = require('path');
var pidusage = require('pidusage');
var spawn = require('child_process').spawn;
var WebSocket = require('ws');

const PRIVATE_PORT = 8080;
const PUBLIC_PORT = 80;

var server = null;
var error = false;
var commandOutput = null;
var socketServer = null;
var terminalSocket = null;
var streamTerminal= false;

var contentTypes = {
	".css": "text/css",
	".js": "text/javascript",
	".png": "image/png"
};

process.chdir("../../server");

var privateWebsite = http.createServer(requestHandler);
openSocketServer();
privateWebsite.listen(PRIVATE_PORT);

var publicWebsite = http.createServer(requestHandler)
publicWebsite.listen(PUBLIC_PORT);

function requestHandler(request, response)
{
	let target = request.url;
	let body = [];
	let serverType = "";

	if (this === privateWebsite)
	{
		serverType = "private";
	}
	else if (this === publicWebsite)
	{
		serverType = "public";
	}

	console.log(serverType, request.method, target);

	if (request.method == "POST")
	{
		request.on('data', (chunk) => {body.push(chunk)});
		request.on('end',
			function()
			{
				body = Buffer.concat(body)

				if (target != "/addWorld")
				{
					body = body.toString();
				}

				if (target == "/start")
				{
					startServer();
				}
				else if (target == "/stop")
				{
					stopServer();
				}
				else if (target == "/restart")
				{
					restartServer();
				}
				else if (target == "/ram")
				{
					fs.writeFile("ram.txt", body,
						function(err)
						{
							if (err)
							{
								return console.log(err);
							}
						}
					);
				}
				else if (target == "/properties")
				{
					let properties = JSONtoProperties(body);

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
				else if (target == "/addPlayer")
				{
					serverCommand("/whitelist add " + body);
				}
				else if (target == "/removePlayer")
				{
					serverCommand("/deop " + body);
					serverCommand("/whitelist remove " + body);
				}
				else if (target == "/op")
				{
					serverCommand("/op " + body);
				}
				else if (target == "/deop")
				{
					serverCommand("/deop " + body);
				}
				else if (target == "/setWorld")
				{
					setWorld(body);
				}
				else if (target == "/addWorld")
				{
					fs.writeFile("../temp/world.zip", body,
						function(err)
						{
							if (err)
							{
								return console.log(err);
							}

							let addWorld = spawn('../repo/tools/add-world.sh');

							addWorld.stdout.on('data',
								function(data)
								{
									console.log(data.toString());
								}
							);

							addWorld.on('close',
								function(code)
								{
									console.log("Attempted to add a new world");
								}
							);
						}
					);
				}
				else if (target == "/deleteWorld")
				{
					let deleteWorld = spawn('../repo/tools/archive-world.sh', [body]);

					deleteWorld.stdout.on('data',
						function(data)
						{
							console.log(data.toString());
						}
					);

					deleteWorld.on('close',
						function(code)
						{
							console.log("Attempted to archive world")
						}
					);
				}
				else if (target == "/backupWorlds")
				{
					let backup = spawn('../repo/tools/backup-worlds.sh');

					backup.stdout.on('data',
						function(data)
						{
							console.log(data.toString())
						}
					);

					backup.on('close',
						function(code)
						{
							console.log("Worlds backed up")
						}
					);
				}
			}
		);
	}
	else if (request.method == "GET")
	{
		response.setHeader("Access-Control-Allow-Origin", "*");

		if (target == "/mcserver")
		{
			fs.readFile("../repo/frontend/" + serverType + "/structure.html",
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

					for (var i = 0; i < worlds.length; i++)
					{
						worlds[i] = worlds[i].replace(/'/g, "");

						if (worlds[i] == "")
						{
							worlds.splice(i, 1);
						}
					}

					response.writeHead(200, {"Content-Type": "text/plain"});
					response.write(worlds.toString());
					response.end();
				}
			);
		}
		else if (target == "/currentWorld")
		{
			currentWorld(response);
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
		else if (target == "/playersOnline")
		{
			response.writeHead(200, {"Content-Type": "text/plain"});

			if (serverRunning())
			{
				playersOnline(response);
			}
			else
			{
				response.write("Server Offline*" + "Server Offline");
				response.end();
				console.log("Cannot get player count: Server is offline")
			}
		}
		else if (target == "/systemStats")
		{
			let stats = spawn('../repo/tools/system-stats.sh');
			let usage = "";

			stats.stdout.on('data',
				function(data)
				{
					usage = data.toString();
				}
			);

			stats.on('close',
				function(code)
				{
					response.writeHead(200, {"Content-Type": "text/plain"});
					response.write(usage);
					response.end();
				}
			);
		}
		else if (target == "/serverRAM")
		{
			serverRAM(response);
		}
		else if (target == "/status")
		{
			let currentStatus = "";

			if (error)
			{
				currentStatus = "error";
			}
			else if (serverRunning())
			{
				currentStatus = "online";
			}
			else
			{
				currentStatus = "offline";
			}

			console.log("Server status: " + currentStatus);

			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write(currentStatus);
			response.end();
		}
		else if (target == "/terminal")
		{
			if (!serverRunning())
			{
				response.writeHead(200, {"Content-Type": "text/plain"});
				response.write("The server is not running");
				response.end();
			}
		}
		else
		{
			getFrontendResource(target, response, serverType);
		}
	}
}

function serverRunning()
{
	if (server == null)
	{
		return false;
	}

	if (server.exitCode == null)
	{
		return true;
	}

	return false;
}

function startServer()
{
	if (serverRunning())
	{
		console.log("The server is currently running!");
		return;
	}

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
				commandOutput = (`${data}`);
				console.log(commandOutput);
				sendTerminalOutput(commandOutput);
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
	if (!serverRunning())
	{
		console.log("Server is offline: Command cannot be executed");
		return;
	}

	server.stdin.write(command + "\n");
}

function stopServer()
{
	if (!serverRunning())
	{
		console.log("The server is not running!");
		return;
	}

	console.log("Stopping Minecraft server");
	serverCommand("/stop");
	server = null;
}

function restartServer()
{
	if (!serverRunning())
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

function setWorld(name)
{
	if (serverRunning())
	{
		console.log("Server running: World cannot be changed");
		return;
	}

	let setWorld = spawn('../repo/tools/set-world.sh', [name]);

	setWorld.stdout.on('data',
		function(data)
		{
			console.log(`${data}`);
		}
	);
}

function currentWorld(response)
{
	let currentWorld = spawn('ls', ['-l', "world"]);
	let world = "";

	currentWorld.stdout.on('data',
		function(data)
		{
			data = data.toString();
			data = data.split("\n")[0];
			data = data.split("/");
			world = data[data.length - 1];
		}
	);

	currentWorld.on('close',
		function(code)
		{
			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write(world);
			response.end();
		}
	);
}

function playersOnline(response)
{
	if (!serverRunning())
	{
		response.write("Server Offline*" + "Server Offline");
		response.end();
		console.log("Cannot get player count: Server is offline")
		return;
	}


	serverCommand("/list");

	setTimeout(function()
	{
		let players = commandOutput;
		if (players.match(/players online:/gi) == null)
		{
			response.write("Unknown*Unknown");
			console.log("Could not get player online count")
		}
		else
		{
			let playerCount = players.split(" ");
			let playersOnline = players.split(": ")[2];
			playersOnline = playersOnline.split("\n")[0];
			console.log("Sending player online count");

			if (playerCount[5] == 0)
			{
				playersOnline = "None";
			}

			playerCount = playerCount[5] + " / " + playerCount[9];
			response.write(playerCount + "*" + playersOnline);
		}

		response.end()
	}
	, 500);
}

function serverRAM(response)
{
	if (serverRunning())
	{
		pidusage(server.pid,
			function(err, stats)
			{
				let usage = (stats["memory"] * Math.pow(10, -9));
				usage = Math.round(usage * 10) / 10;
				usage = usage.toString() + "GB"
				response.writeHead(200, {"Content-Type": "text/plain"});
				response.write(usage)
				response.end();
			}
		);
	}
	else
	{
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write("Server Offline")
		response.end();
	}
}

function getFrontendResource(target, response, serverType)
{
	let ext = path.extname(target);
	let type = contentTypes[ext];
	let filePath = "../repo/frontend/"+ serverType + target;

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

function openSocketServer()
{
	socketServer = new WebSocket.Server({ server: privateWebsite })

	socketServer.on('connection',
		function(socket)
		{
			socket.on('message',
				function(message)
				{
					let command = `${message}`;
					console.log("Received command " + command);

					if (command == "stop" || command == "/stop")
					{
						terminalSocket.send("Please use the STOP button");
					}
					else
					{
						serverCommand(command);
					}
				}
			);

			streamTerminal = true;
			terminalSocket = socket;
			console.log("Connected server console to client")
			terminalSocket.send("Connected to Minecraft server console .......")
		}
	);
}

function sendTerminalOutput(data)
{
	if (!streamTerminal)
	{
		console.log("Server terminal streaming disabled")
		return;
	}

	terminalSocket.send(data)
}