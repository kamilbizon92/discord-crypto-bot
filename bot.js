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
    if ((arrayWithAllCurrencies[i].MarketName === `USDT-${currency}`) || (arrayWithAllCurrencies[i].MarketName === `BTC-${currency}`)) {
      return showResult(arrayWithAllCurrencies[i], price, currency);
    }
  }
  return 'Currency does not exist!';
}

function showResult(cryptoArray, currency, btc) {
  let result = cryptoArray;
  let volume;
  let finalPrice = roundNumber(result['Last'] * currency[1]);

  // Bitcoin value in USD and the other currencies
  if (btc === 'BTC') {
    volume = roundNumber(result['BaseVolume']);
    if (currency[0] === 'USD') {
      return `${result['MarketName']}, Price: ${result['Last']} $, Volume: ${volume} $`;
    } else {
      let finalPrice = roundNumber(currency[1]);
      return `${result['MarketName']}, Price: ${finalPrice} ${currency[0]}, Volume: ${volume} $`;
    }
  } else {
    volume = roundNumber(result['Volume']);
    return `${result['MarketName']}, Price: ${result['Last']} BTC (${finalPrice} ${currency[0]}), Volume: ${volume}`;
  }
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
  // Store currency symbol and price in currencyArray
  let currencyArray = [];
  // Return bitcoin value in specific currency
  if (flags.length === 0) {
    currencyArray[0] = 'USD';
    currencyArray[1] = usd;
    return currencyArray;
  } else {
    for (let i = 0; i < flags.length; i++) {
      if (flags[i].toUpperCase() !== 'USD') {
        // Currency symbol
        currencyArray[0] = currencyPrice(flags)[0];
        currencyArray[1] = usd * currencyPrice(flags)[1];
        return currencyArray;
      } else {
        currencyArray[0] = 'USD';
        currencyArray[1] = usd;
        return currencyArray;
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

  // Help array with name of currency and value
  let helpArray = [];
  if (flags.length === 0) {
    helpArray[0] = 'USD';
    // Must be divided, because base currency of european central bank API is euro
    helpArray[1] = 1/ratesValues['USD'];
    return helpArray;
  }

  for (let i = 0; i < flags.length; i++) {
    let flag = flags[i].toUpperCase();
    if (ratesValues[flag]) {
      helpArray[0] = flag;
      // Must be divided, because base currency of european central bank API is euro
      helpArray[1] = ratesValues[flag]/ratesValues['USD'];
      return helpArray;
    } else {
      helpArray[0] = 'USD';
      helpArray[1] = 1;
      return helpArray;
    }
  }
}

function roundNumber(number) {
  return Math.round(number*100)/100;
}