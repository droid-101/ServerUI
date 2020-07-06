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
		loadFile("http://firestorm.local:8080");
		break;
	}

	document.getElementById(name).style.display = "block";
}

function press(action)
{
	var animation = document.getElementsByClassName(action)[0];
	animation.src = "icons/buttons/" + action + "-pressed.png";
}

function release(action)
{
	var animation = document.getElementsByClassName(action)[0];
	animation.src = "icons/buttons/" + action + "-released.png";
}

function loadFile(filePath)
{
	var request = new XMLHttpRequest();
	request.open("GET", filePath);
	request.send();

	request.onreadystatechange = function()
    {
        if (request.readyState == 4 && request.status == 200)
        {
			document.getElementById("settings").innerHTML = (request.response);
        }
	}
}