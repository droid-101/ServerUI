const HOSTNAME = "firestorm.local";
const PORT = "8080";
const SERVER_URL = "http://" + HOSTNAME + ":" + PORT;

function switchTab(name)
{
	var tabs = document.getElementsByClassName("tab");

	for (var i = 0; i < tabs.length; i++)
	{
		tabs[i].style.display = "none";
	}

	if (name == "settings")
	{
		requestData("properties",
			function(target)
			{
				document.getElementById("properties").innerHTML = "";
				let properties = JSON.parse(target);
				for (key in properties)
				{
					let line = "<p>";
					line = line.concat(key, " = ", properties[key]);
					line += "</p>";

					document.getElementById("properties").innerHTML += line;
				}
			}
		);
	}
	else if (name == "players")
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
					line += "</p>";

					document.getElementById("whitelist").innerHTML += line;
				}
			}
		);
	}
	else if (name == "worlds")
	{
		requestData("worlds",
			function(target)
			{
				target = target.split(",");
				document.getElementById("world-list").innerHTML = "";

				for (i = 0; i < target.length; i++)
				{
					let line = "<p>";
					line += target[i];
					line += "</p>";

					document.getElementById("world-list").innerHTML += line;
				}
			}
		);
	}

	document.getElementById(name).style.display = "block";
}


function pressButton(action)
{
	var button = document.getElementsByClassName(action)[0];
	press(action, button);
	setTimeout(release, 100, action, button);
	sendData(action);
}

function press(action, button)
{
	button.src = "icons/buttons/" + action + "-pressed.png";
}

function release(action, button)
{
	button.src = "icons/buttons/" + action + "-released.png";
}

function generateURL(action)
{
	return SERVER_URL + "/" + action;
}

function requestData(target, handler)
{
	var request = new XMLHttpRequest();
	request.open("GET", generateURL(target));
	request.send(null);

	request.onreadystatechange = function()
	{
		if (request.readyState == 4 && request.status == 200)
		{
			handler(request.response);
		}
	}
}

function sendData(data)
{
	var request = new XMLHttpRequest();
	request.open("POST", SERVER_URL);
	request.setRequestHeader("Content-Type", "text/plain");
	request.send(data);

	getStatus();
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
	document.getElementById("allocated-ram").innerHTML = value;
}

function init()
{
	getStatus();
	switchTab("home");
}