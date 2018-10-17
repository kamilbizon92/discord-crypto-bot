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

client.on ('message', (message) => {
  let msg = message.content;
  if(msg.substring(0, 1) === prefix) {
    let args = msg.substring(1).split(' ');
    // First word after prefix determines currency for which user wants to know price 
    let command = args[0];
    message.channel.send('It works')
  }
});