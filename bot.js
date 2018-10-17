// Create Discord bot
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = '!';

// Login as a bot
const auth = require('./auth.json');
client.login(auth.token);

// Console message when bot is ready
client.on('ready', () => {
  console.log('Info: connected');
  console.log(`Logged as: ${client.user.username} - ${client.user.id}`);
});