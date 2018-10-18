// Create Discord bot
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = '!';
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const apiUrls = require('./api.json');

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
    let command = args[0].toUpperCase();
    // Flags describes additional arguments like real currency, when user want to know price in EUR or another real currency
    let flags = args.splice(1);
    // 'value' is variable which contains market name, last price and volume of desired currency
    let value = getCrypto(command, flags);
    message.channel.send(value);
  }
});

// Function returns informations (volume and price) about one currency
function getCrypto(currency, flags) {
  const url = apiUrls.bittrex;
  let api_request = new XMLHttpRequest();
  api_request.open('GET', url, false);
  api_request.send(null);

  // api_request returns all informations about all cryptocurrencies from exchange
  return convertJson(api_request.responseText, currency, flags);
}

// Function needed to obtain the most important informations about one desired currency
function convertJson(response, currency, flags) {
  let arrayWithAllCurrencies = JSON.parse(response).result;
  let result;
  let volume;
  let convertedPrice;
  let price = convertPrice(arrayWithAllCurrencies, flags);

  // Looping to find the right object
  for (let i = 0; i < arrayWithAllCurrencies.length; i++) {
    if (currency === 'BTC') {
      if (arrayWithAllCurrencies[i].MarketName === `USDT-${currency}`) {
        result = arrayWithAllCurrencies[i];
        volume = roundNumber(result['BaseVolume']);
        convertedPrice = roundNumber(result['Last'] * price);
        console.log(result);
        
        return `${result['MarketName']}, Price: ${roundNumber(result['Last']) * currencyPrice(flags)} USDT, Volume: ${volume} USDT`;
      }
    } else {
      if (arrayWithAllCurrencies[i].MarketName === `BTC-${currency}`) {
        result = arrayWithAllCurrencies[i];
        volume = roundNumber(result['Volume']);
        convertedPrice = roundNumber(result['Last']* price);
        console.log(result);

        return `${result['MarketName']}, Price: ${result['Last']} BTC (${convertedPrice} $), Volume: ${volume} BTC`;
      }
    }
  }
  return 'Currency does not exist!';
}

// Convert to real currency if flag is set (default USD)
function convertPrice(array, flags) {
  // Get the bitcoin price in usd from usdt
  let usd;
  for (let i = 0; i < array.length; i++) {
    if (array[i].MarketName === 'USDT-BTC') {
      usd = array[i].Last;
    }
  }
  
  // Return bitcoin value in specific currency
  if (flags.length === 0) {
    return usd;
  } else {
    for (let i = 0; i < flags.length; i++) {
      if (flags[i].toUpperCase() !== 'USD') {
        return usd * currencyPrice(flags);
      } else {
        return usd;
      }
    }
  }
}

// Return in other real currency (if user does not want dollars)
function currencyPrice(flags) {
  // Currency ratio from european central bank
  const url = `${apiUrls.ecb}${auth.ecb_token}`;
  let api_request = new XMLHttpRequest();
  api_request.open('GET', url, false);
  api_request.send(null);

  // Get rates value from european central bank in JSON format
  let ratesValues = JSON.parse(api_request.responseText).rates;
  
  for (let i = 0; i < flags.length; i++) {
    let flag = flags[i].toUpperCase();
    if (ratesValues[flag]) {
      // Return ratio dolar/desired currency
      return ratesValues[flag]/ratesValues['USD'];
    }
  }
  return 1/ratesValues['USD'];
}

function roundNumber(number) {
  return Math.round(number*100)/100;
}