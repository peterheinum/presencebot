const SlackBot = require('slackbots');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

let users = [];
//credentials = {"installed":{"client_id":process.env.ClientId,"project_id":process.env.Project_id,"auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":process.env.ClientSecret,"redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}
// FOR THE FUTURE


const envKey = "";
//const envKey = process.env.SlackBotKey;
const params = { 'complaintbot': true, icon_emoji: ':skull:' };
let todaysDate;
let randomNr;
let temp4name;
let position;


// INIT MY BOT
const bot = new SlackBot({
  token: envKey,
  name: 'complaintbot'
});

bot.on('start', function () {
  users = bot.getUsers();
  checkCurrentPositionInExcell();

  //TODO IF DateAtTopFunction is a succes add +1 to the number file
  
  
  let tempdate = new Date();
  //todaysDate = convertDateToString(tempdate);
  fs.readFile('datekey.txt', function (err, buf) {
    if (buf != undefined) {
      let dateKey = buf.toString().split('@');
      console.log("Good morning");
      console.log([dateKey[1]])
      if (todaysDate === dateKey[0]) {
        randomNr = dateKey[1];
      }
      else {
        //DO something if todays date is not the one in current configuration   
        //if you want     
      }
    }
    else {
      logError("Couldn't read file: " + todaysDate)
    }
  });
});





function newNervaro() {
  let tempdate = new Date();
  todaysDate = convertDateToString(tempdate);

  fs.readFile('datekey.txt', function (err, buf) {
    if (buf != undefined) {
      let dateKey = buf.toString().split('@');
      if (todaysDate !== dateKey[0]) {
        if (newDay() == true) {
          return dateKey[1];
        }
      } else {
        return dateKey[1];
      }
    }
    else {
      logError("Couldn't read file: " + todaysDate)
    }
  });
}

function updateExcelCounter(data){
  fs.writeFile('cellCount.txt', data, function (err, data) {
    if (err) console.log(err);
    console.log("Successfully updated cellcount to File.");
  })
}

function checkCurrentPositionInExcell() {
  fs.readFile('cellCount.txt', function (err, buf) {
    position = buf.toString();
  })
}

function writeFile(data) {
  fs.writeFile('datekey.txt', data, function (err, data) {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
}

function logError(data) {
  fs.writeFile('errors.txt', data, function (err, data) {
    if (err) console.log(err);
  });
}


function newDay() {
  try {
    checkCurrentPositionInExcell();
    PushThingsToGoogle(writeDateOnTop);
    position++;
    position++;
    updateExcelCounter(position);
    randomNr = randomNumberGenerator();
    bot.postMessageToUser('pete', randomNr, params);
    let data = `${todaysDate}@${randomNr.toString()}`;
    writeFile(data);
    return true;
  }
  catch (error) {
    return false;
  }
}

function randomNumberGenerator() {
  let number = Math.floor((Math.random() * 9999));
  if (number < 1000) number += 1000;
  return number;
}

function convertDateToString(date) {
  let newDate = "";
  newDate += `${date.getFullYear()}-`;
  newDate += `${date.getMonth() + 1}-`;
  newDate += date.getDate();
  return newDate;
}


let lastmessage = "";
bot.on("message", msg => {
  switch (msg.type) {
    case "message":
      if (msg.channel[0] === "D" && msg.bot_id === undefined) {
        let users = [];
        users = bot.getUsers();

        lastmessage = msg.text;
        let user;
        users._value.members.forEach(e => {
          if (e.id === msg.user) {
            user = e.profile;
          }
        });

        if (msg.text === "närvaro") {
          let savedcode = newNervaro();
          if (!savedcode == undefined) randomNr = savedcode;
          bot.postMessageToUser(user.display_name, randomNr, params)
        } else {

          if (user.display_name === "") {
            if (msg.text == randomNr) {
              bot.postMessage(msg.user, `Du har nu fått närvaro ${user.real_name}`, params);
            } else {
              bot.postMessage(msg.user, "Du har tyvärr skrivit fel kod", { 'complaintbot': true, icon_emoji: ':skull:' });
            }
          } else {
            if (msg.text == randomNr) {
              temp4name = user.real_name;
              PushThingsToGoogle(appendStuff);
              bot.postMessageToUser(user.display_name, `Du har nu fått närvaro ${user.real_name}`, params);
            } else {
              bot.postMessageToUser(user.display_name, "Du har tyvärr skrivit fel kod", { 'complaintbot': true, icon_emoji: ':skull:' });
            }
          }
        }
      }
  }
})

const alphabet = [
  'Please lord forgive me for my sins',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z'
]

//__________________________GOOOGLE STUFF___________________________\\
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function appendStuff(authClient) {  
  console.log("we are in appending shit" + position);
  let rangePosition = alphabet[position];
  console.log("rangeposition in append" + rangePosition);
  const sheets = google.sheets({ version: 'v4', authClient });
  var request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: '1UNygp0ryulW0FtB45rkOyoOOsXtxw8UNR3LSVKQVBME',  // TODO: Update placeholder value.

    // The A1 notation of a range to search for a logical table of data.
    // Values will be appended after the last row of the table.
    range: `Sheet1!${rangePosition}1:${rangePosition}1`,  // TODO: Update placeholder value.

    // How the input data should be interpreted.
    valueInputOption: 'RAW',  // TODO: Update placeholder value.

    // How the input data should be inserted.
    insertDataOption: 'OVERWRITE',  // TODO: Update placeholder value.

    resource: {
      'values': [
        [temp4name],
      ]
      // TODO: Add desired properties to the request body.
    },
    auth: authClient,
  };
  console.log(request.range);

  sheets.spreadsheets.values.append(request, function (err, response) {
    if (err) {
      console.error(err);
      return;
    }
  });
}

function writeDateOnTop(authClient) {
  checkCurrentPositionInExcell();
  let tempdate = new Date();
  tempdate = convertDateToString(tempdate);
  let rangePosition = alphabet[position];
  console.log(position + "writedataontop");
  const sheets = google.sheets({ version: 'v4', authClient });
  var request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: '1UNygp0ryulW0FtB45rkOyoOOsXtxw8UNR3LSVKQVBME',  // TODO: Update placeholder value.

    // The A1 notation of a range to search for a logical table of data.
    // Values will be appended after the last row of the table.
    range: `Sheet1!${rangePosition}1:${rangePosition}1`,  // TODO: Update placeholder value.

    // How the input data should be interpreted.
    valueInputOption: 'RAW',  // TODO: Update placeholder value.

    // How the input data should be inserted.
    insertDataOption: 'OVERWRITE',  // TODO: Update placeholder value.

    resource: {
      'values': [
        [tempdate],
      ]
      // TODO: Add desired properties to the request body.
    },
    auth: authClient,
  };

  sheets.spreadsheets.values.append(request, function (err, response) {
    if (err) {
      //console.error(err);
      return;
    }
  });
}

function PushThingsToGoogle(funct) {
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), funct);
  });
}
//__________________________GOOOGLE STUFF___________________________\\
