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
				document.getElementById(name).innerHTML = target;
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
	button.src = "../icons/buttons/" + action + "-pressed.png";
}

function release(action, button)
{
	button.src = "../icons/buttons/" + action + "-released.png";
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

			if (target == "online")
			{
				result = "ONLINE";
			}
			else if (target == "offline")
			{
				result = "OFFLINE";
			}
			else
			{
				result = "ERROR";
			}

			document.getElementById("status").innerHTML = result;
		}
	);
}
