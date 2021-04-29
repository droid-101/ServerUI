const Discord = require('discord.js');
require('dotenv').config();
var fs = require("fs");
const client = new Discord.Client();

const MCSERVER = process.env.MCSERVER
const LOGS_FILE = MCSERVER + "/server/logs/latest.txt"

CHANNEL_IDS = {
	'announcements': "837330937569607720",
	'chat': "837391785768255488"
}

var announcements = null;
var chat = null;

module.exports = {
	connect: function()
	{
		client.login(process.env.DISCORD_BOT_TOKEN);
	},

	disconnect: function()
	{
		console.log("Disconnected bot from Discord server");
		client.user.setStatus('offline').then(() => client.destroy());
	},

	send_announcement: function(message)
	{
		announcements.send(message)
	},

	forward_chat: function(log)
	{
		//log = "[23:56:25] [Server thread/INFO]: <MonsterSlayer914> goodnight sdf sdf sdf sdf"
		tokens = log.split(' ');

		if (!tokens[3].startsWith('<'))
		{
			return;   // this was not a chat log
		}

		tokens = tokens.slice(3, tokens.length);
		chat.send(tokens.join(' '));
	}
};


client.on('ready', function()
{
	console.log("Connected bot to Discord server");
	client.user.setStatus('online');

	const channels = client.channels.cache;
	announcements = channels.get(CHANNEL_IDS['announcements']);
	chat = channels.get(CHANNEL_IDS['chat']);
});

client.on('disconnect', function()
{
	console.log("Disconnected bot from Discord server");
	client.user.setStatus('offline');
});

/*
client.on('message', function(msg)
{

});
*/