function switchTab(name)
{
	var tabs = document.getElementsByClassName("tab");

	for (var i = 0; i < tabs.length; i++)
	{
		tabs[i].style.display = "none";
	}

	switch (name)
	{
		case "settings":
		document.getElementById("settings").innerHTML = loadFile("http://firestorm.local:8080");
		break;
	}

	document.getElementById(name).style.display = "block";
}

function pressButton(action)
{
	var button = document.getElementsByClassName(action)[0];
	press(action, button)

	setTimeout(release, 100, action, button);
	sendData("http://firestorm.local:8080", action);
}

function press(action, button)
{
	button.src = "../icons/buttons/" + action + "-pressed.png";
}

function release(action, button)
{
	button.src = "../icons/buttons/" + action + "-released.png";
}

function loadFile(filePath)
{
	var request = new XMLHttpRequest();
	request.open("GET", filePath);
	request.send("properties");

	request.onreadystatechange = function()
    {
        if (request.readyState == 4 && request.status == 200)
        {
			document.getElementById("settings").innerHTML = (request.response);
        }
	}
}

function sendData(filePath, action)
{
	var request = new XMLHttpRequest();
	request.open("POST", filePath);
	request.setRequestHeader("Content-Type", "text/plain");
	request.send(action);
}

function getStatus(filePath)
{
	var request = new XMLHttpRequest();
	request.open("GET", filePath);
	request.send("status");

	request.onreadystatechange = function()
    {
        if (request.readyState == 4 && request.status == 200)
        {
			document.getElementById("status").innerHTML = (request.response);
        }
	}
}