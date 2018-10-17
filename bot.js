// Create Discord bot
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = '!';
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

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
    // First word after prefix determines currency for which user wants to know price, it is stored in 'command' variable
    let command = args[0];
    // 'value' is variable which contains market name, last price and volume of desired currency
    let value = getCrypto(command);
    message.channel.send(value);
  }
});

// Function returns informations (volume and price) about one currency
function getCrypto(currency) {
  const url = 'https://bittrex.com/api/v1.1/public/getmarketsummaries';
  let api_request = new XMLHttpRequest();
  api_request.open('GET', url, false);
  api_request.send(null);

  // api_request returns all informations about all cryptocurrencies from exchange
  return convertJson(api_request.responseText, currency);
}

// Function needed to obtain the most important informations about one desired currency
function convertJson(response, currency) {
  let result = JSON.parse(response).result[0];
  let volume = roundNumber(result['Volume']);

  return `${result['MarketName']}, Price: ${result['Last']} BTC, Volume: ${volume}`;
}

function roundNumber(number) {
  return Math.round(number*100)/100;
}