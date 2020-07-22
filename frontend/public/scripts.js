const HOSTNAME = "firestorm.local";
const PORT = "8080";
const SERVER_URL = "http://" + HOSTNAME + ":" + PORT;
const PICTURE_COUNT = 17;
var propertiesEditable = true;
var addingPlayer = false;
var worlds = {};
var playerList = {};
var statRefresh;
var playerRefresh;
var serverPort;
var opacity;
var slideshow;
var slide = 16;

function switchTab(name)
{
	clearInterval(statRefresh);
	clearInterval(playerRefresh);
	clearInterval(slideshow);
	var tabs = document.getElementsByClassName("tab");

	for (var i = 0; i < tabs.length; i++)
	{
		tabs[i].style.display = "none";
	}

	if (name == "players")
	{
		playerList = {};
		playerRefresh = setInterval(function()
		{
			getPlayers("players");
		}
		, 30000);

		requestData("whitelist",
			function(target)
			{
				document.getElementById("whitelist").innerHTML = "";
				let whitelist = JSON.parse(target);
				for (player in whitelist)
				{
					let line = "<p>";
					line += whitelist[player]["name"];
					line += "<button class='deletePlayer' id='delete-" + whitelist[player]["name"] + "' onclick='removePlayer(this.id)'>-</button>";
					line += "<label class='switch'><input type='checkbox' id='op-" + whitelist[player]["name"] + "' oninput='editOps(this.id)'><span class='switch-slider round'></span></label>";
					line += "<span class='onlineStatus' id='online-" + whitelist[player]["name"] + "'></span>"
					line += "</p>";

					document.getElementById("whitelist").innerHTML += line;
					playerList[player] = whitelist[player]["name"];
				}

				getPlayers("players");

				document.getElementById("newPlayer").style.display = "none";
				document.getElementById("savePlayers").style.display = "none";
			}
		);

		setTimeout(function()
		{
			requestData("ops",
				function(target)
				{
					let ops = JSON.parse(target);
					for (player in ops)
					{
						document.getElementById("op-" + ops[player]["name"]).checked = true;
					}
				}
			);
		}
		, 500);
	}
	else if (name == "worlds")
	{
		requestData("worlds",
			function(target)
			{
				document.getElementById("world-list").innerHTML = "";

				if (target == "")
				{
					return;
				}

				target = target.split(",");

				for (let i = 0; i < target.length; i++)
				{
					let line = "<p>";
					line += "<button class='world' id='setWorld*" + target[i] + "' onclick='selectWorld(\"" + target[i] + "\")'>" + target[i] + "</button>";
					line += "<button class='deleteWorld' id='delete*" + target[i] + "' onclick='deleteWorld(this.id)'>-</button>";
					line += "</p>";
					document.getElementById("world-list").innerHTML += line;

					worlds[i] = target[i];
				}

				getCurrentWorld("worlds");
			}
		);
	}
	else if (name == "home")
	{
		slideshow = setInterval(function()
		{
			changeSlide("pic" + slide);
		}
		, 8000);
	}

	document.getElementById(name).style.display = "block";
}


function pressButton(action)
{
	sendData(action, "");
	setTimeout(getStatus, 5000);
}

function generateURL(action)
{
	return SERVER_URL + "/" + action;
}

function requestData(target, handler)
{
	var request = new XMLHttpRequest();
	request.timeout = 10000;
	request.open("GET", generateURL(target));
	request.send(null);

	request.onreadystatechange = function()
	{
		if (request.readyState == 4 && request.status == 200)
		{
			handler(request.response);
		}
	}

	request.ontimeout = function()
	{
		console.log("Request timed out.");
	}
}

function sendData(target, data)
{
	var request = new XMLHttpRequest();
	request.timeout = 10000;
	request.open("POST", generateURL(target));
	request.setRequestHeader("Content-Type", "text/plain");
	request.send(data);
}

function sendWorld(file)
{
	var request = new XMLHttpRequest();
	request.timeout = 10000;
	request.open("POST", generateURL("addWorld"));
	request.setRequestHeader("Content-Type", "application/x-zip-compressed");
	request.send(file);
}

function getStatus()
{
	requestData("status",
		function(target)
		{
			let result = "";
			let colour = "";

			if (target == "online")
			{
				result = "ONLINE";
				colour = "rgb(22, 158, 22)";
			}
			else if (target == "offline")
			{
				result = "OFFLINE";
				colour = "rgb(100, 100, 100)";
			}
			else
			{
				result = "ERROR";
				colour = "rgb(180, 16, 16)";
			}

			document.getElementById("status").innerHTML = result;
			document.getElementById("status").style.color = colour;
			document.getElementById("status").style.borderColor = colour;
		}
	);
}

function setValue(value)
{
	value = Math.trunc(value / 1024) * 1024;
	document.getElementById("allocated-ram").innerHTML = "Allocated RAM: " + value + "MB (" + Math.trunc(value / 1024) + "GB)";
}

function sendRAM()
{
	let value = document.getElementById("slider").value;
	value = Math.trunc(value / 1024) * 1024;
	sendData("ram", value.toString());
}

function getRAM()
{
	requestData("ram",
		function(target)
		{
			document.getElementById("allocated-ram").innerHTML = "Allocated RAM: " + target  + "MB (" + target[0] + "GB)";
			document.getElementById("slider").value = target;
		}
	);
}

function toggleAdd()
{
	if (!addingPlayer)
	{
		document.getElementById("newPlayer").style.display = "block";
		document.getElementById("newPlayer").value = "";
		addingPlayer = true;
		document.getElementById("addPlayer").style.backgroundColor = "red";
		document.getElementById("addPlayer").innerHTML = "CANCEL";
		document.getElementById("savePlayers").style.display = "inline";
	}
	else
	{
		addingPlayer = false;
		document.getElementById("addPlayer").style.backgroundColor = "rgb(55, 168, 55)";
		document.getElementById("addPlayer").innerHTML = "+";
		document.getElementById("newPlayer").style.display = "none";
		document.getElementById("savePlayers").style.display = "none";
	}
}

function addPlayer()
{
	playerList = {};
	let player = document.getElementById("newPlayer").value;
	sendData("addPlayer", player);

	addingPlayer = true;
	setTimeout(function()
	{
		requestData("whitelist",
			function(target)
			{
				document.getElementById("whitelist").innerHTML = "";
				let whitelist = JSON.parse(target);
				for (player in whitelist)
				{
					let line = "<p>";
					line += whitelist[player]["name"];
					line += "<button class='deletePlayer' id='delete-" + whitelist[player]["name"] + "' onclick='removePlayer(this.id)'>-</button>";
					line += "<label class='switch'><input type='checkbox' id='op-" + whitelist[player]["name"] + "' oninput='editOps(this.id)'><span class='switch-slider round'></span></label>";
					line += "<span class='onlineStatus' id='online-" + whitelist[player]["name"] + "'></span>";
					line += "</p>";

					document.getElementById("whitelist").innerHTML += line;
					playerList[player] = whitelist[player]["name"];
				}

				toggleAdd();
				getPlayers("players");
			}
		);

		requestData("ops",
			function(target)
			{
				let ops = JSON.parse(target);
				for (player in ops)
				{
					document.getElementById("op-" + ops[player]["name"]).checked = true;
				}
			}
		);
	} , 500);
}

function removePlayer(id)
{
	playerList = {};
	let player = id.split("-")[1];
	sendData("removePlayer", player);

	setTimeout(function()
	{
		requestData("whitelist",
			function(target)
			{
				document.getElementById("whitelist").innerHTML = "";
				let whitelist = JSON.parse(target);
				for (player in whitelist)
				{
					let line = "<p>";
					line += whitelist[player]["name"];
					line += "<button class='deletePlayer' id='delete-" + whitelist[player]["name"] + "' onclick='removePlayer(this.id)'>-</button>";
					line += "<label class='switch'><input type='checkbox' id='op-" + whitelist[player]["name"] + "' oninput='editOps(this.id)'><span class='switch-slider round'></span></label>";
					line += "<span class='onlineStatus' id='online-" + whitelist[player]["name"] + "'></span>";
					line += "</p>";

					document.getElementById("whitelist").innerHTML += line;
					playerList[player] = whitelist[player]["name"];
				}

				getPlayers("players");
			}
		);

		requestData("ops",
			function(target)
			{
				let ops = JSON.parse(target);
				for (player in ops)
				{
					document.getElementById("op-" + ops[player]["name"]).checked = true;
				}
			}
		);
	} , 500);
}

function editOps(id)
{
	let player = id.split("-")[1];

	if (document.getElementById(id).checked)
	{
		sendData("op", player);
	}
	else
	{
		sendData("deop", player);
	}
}

function selectWorld(world)
{
	sendData("setWorld", world);
	setTimeout(switchTab("worlds"), 500)
}

function getCurrentWorld(tab)
{
	requestData("currentWorld",
		function(target)
		{
			if (target == null || target == "")
			{
				return;
			}

			document.getElementById("setWorld*" + target).style.color = "rgb(8, 179, 8)";
		}
	);
}

function triggerUpload()
{
	document.getElementById('addWorld').click();
}

function addWorld(file)
{
	file = file[0];
	sendWorld(file);
	setTimeout(switchTab, 2500, "worlds")
}

function deleteWorld(id)
{
	world = id.split("*")[1]
	sendData("deleteWorld", world);
	setTimeout(switchTab, 2500, "worlds")
}

function getPlayers(tab)
{
	requestData("playersOnline",
		function(target)
		{
			for (player in playerList)
			{
				document.getElementById("online-" + playerList[player]).style.backgroundColor = "rgb(212, 212, 212)";
			}

			if (tab == "players")
			{
				target = target.split("*")[1];
				target = target.split(", ");

				for (let i = 0; i < target.length; i++)
				{
					if (target[i] == "Server Offline" || target[i] == "None")
					{
						return;
					}

					target[i]
					document.getElementById("online-" + target[i]).style.backgroundColor = "rgb(40, 224, 23)";
				}
			}
		}
	);
}

function getRAMusage()
{
	requestData("serverRAM",
		function(target)
		{
			document.getElementById("server-ram").innerHTML = "Server RAM Usage: " + target;
		}
	);
}

function getSystemStats()
{
	requestData("systemStats",
		function(target)
		{
			let data = target.split(" ");
			document.getElementById("cpu-usage").innerHTML = "CPU Usage: " + data[0];
			document.getElementById("linux-ram").innerHTML = "Machine RAM Usage: " + data[1];
			document.getElementById("server-ip").innerHTML = "Server IP: " + data[2].trim() + ":" + serverPort;
		}
	);
}

function getServerPort()
{
	requestData("properties",
		function(target)
		{
			let properties = JSON.parse(target);
			serverPort = properties["server-port"];
		}
	);
}

function backup()
{
	sendData("backupWorlds")
}

function changeSlide(id)
{
	id = id.split("pic")[1];
	id = parseInt(id, 10);

	let newID = id + 1;
	newID = ++newID % PICTURE_COUNT;
	newID = newID.toString();

	id = ++id % PICTURE_COUNT;
	slide = id;
	id = id.toString();

	fade(id, newID);
}

function fade(id, newID)
{
	opacity = 100;
	document.getElementById("pic" + id).style.opacity = opacity + "%";

	let fadeOut = setInterval(function()
	{
		opacity--;
		document.getElementById("pic" + id).style.opacity = opacity + "%";
		document.getElementById("pic" + id).style.display = "block";

		if (opacity == 0)
		{
			document.getElementById("pic" + id).style.display = "none";
			clearInterval(fadeOut);

			let fadeIn = setInterval(function()
			{
				opacity++;
				document.getElementById("pic" + newID).style.opacity = opacity + "%";
				document.getElementById("pic" + newID).style.display = "block";

				if (opacity == 100)
				{
					clearInterval(fadeIn);
					return;
				}
			}
			, 10)
		}
	}
	, 10);
}

function init()
{
	switchTab("home");
	document.getElementById("pic0").style.display = "block"
	getStatus();
	setInterval(getStatus, 30000);
	getRAM();
	getServerPort();
}