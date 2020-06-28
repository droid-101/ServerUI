function button(name)
{
    switch (name)
    {
        case "HOME":
            restyle(name);
            document.getElementById("home").innerHTML = "Note: This is a private server!";
            break;

        case "CONTROLS":
            restyle(name);
            break;

        case "WORLDS":
            restyle(name);
            break;

        case "TERMINAL":
            restyle(name);
            break;

        case "HELP":
            restyle(name);
            break;
    }
}

function restyle(name)
{
    document.getElementById("content").innerHTML = "";
    document.getElementById("subtitle").innerHTML = name;
}