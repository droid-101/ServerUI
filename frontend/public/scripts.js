const HOSTNAME = document.location.hostname;
const PORT = "80";
const SERVER_URL = "http://" + HOSTNAME + ":" + PORT;
const PICTURE_COUNT = 17;
var worlds = {};
var playerList = {};
var playerRefresh;
var opacity;
var slideshow;
var slide = 16;

function switchTab(name)
{
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
					line += "<span class='onlineStatus' id='online-" + whitelist[player]["name"] + "'></span>"
					line += "</p>";

					document.getElementById("whitelist").innerHTML += line;
					playerList[player] = whitelist[player]["name"];
				}

				getPlayers("players");
			}
		);
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
	document.getElementById("pic0").style.display = "block";
	getStatus();
	setInterval(getStatus, 30000);
}