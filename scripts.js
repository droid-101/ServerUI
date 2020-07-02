function switchTab(name)
{
	var tabs = document.getElementsByClassName("tab");

	for (var i = 0; i < tabs.length; i++)
	{
		tabs[i].style.display = "none";
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