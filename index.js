const SlackBot = require('slackbots');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
//const dbhelper = require('./helpers/googleWriteDb.js');

// const envKey = process.env.slack;
// const clientID = process.env.ClientID;
// const ProjectId = process.env.ProjectId;
// const ClientSecret = process.env.ClientSecret;

const dbsheetid = "1q_68-0ctovY23_htvoQr0WDp-HIQlI2fpysNx4dEADA";
const bot = new SlackBot({
  token: envKey,
  name: 'presencebot'
});

const testSheet = "125zKfvOuNmW6BplK6TaHiGHfqC1VVdsXVYFnvtahlq4";
const schoolSheet = "1UNygp0ryulW0FtB45rkOyoOOsXtxw8UNR3LSVKQVBME";
// const credentials = `{"installed":{"client_id":"${clientID}","project_id":"${ProjectId}","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"${ClientSecret}","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}`;

// FOR THE FUTURE
const params = { 'presencebot': true, icon_emoji: ':sun:' };
let todaysDate;
let randomNr;
let temp4name;
let position;
let presentUsers = [];
let users = [];
let tempRange;
let latestPosition;

// INIT MY BOT

bot.on('start', function () {
  todaysDate = convertDateToString(new Date());
  console.log("Good morning, todays date is " + todaysDate);
  randomNr = randomNumberGenerator();
  checkCurrentPositionInExcell();
});

function nameMassager(name) {
  name = name.split('.');
  if (name[1] != undefined) {
    name = `${capitalizeFirstLetter(name[0])} ${capitalizeFirstLetter(name[1])}`;
  }
  return name.toString();
}

function checkIfMessageIsSplittable(msg) {
  msg = msg.split('-');
  if (msg[1] != undefined && msg[0] == "jumpcell") {
    return msg[1].charAt(0);
  } else {
    return false;
  }

}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function ResetCellCount(user) {
  updateExcelCounterFromNumber('2');
  checkCurrentPositionInExcell();
  bot.postMessageToUser(user.display_name, "Succesfully reset the cellcounter to 0", params);
}

function changePositionFromLetter(letter) {
  for (let i = 0; i < alphabet.length; i++) {
    if (letter.toUpperCase() == alphabet[i]) {
       return [(i = i + 2),(i = i-2)];
    }
  }
}

function ResetDateKeyCount(user) {
  fs.writeFile('datekey.txt', "lol", function (err, data) {
    if (err) console.log(err);
    bot.postMessageToUser(user.display_name, "Succesfully reset the datekey file", params);
  })
}

function pushUsertopresent(userid) {
  presentUsers.push(userid);
}
function checkIfUserPresent(userid) {
  let temp = false;
  presentUsers.forEach(USERID => {
    if (USERID == userid) {
      temp = true;
    };
  });
  return temp;
}

function newPresence(user) {
  checkCurrentPositionInExcell();
  todaysDate = convertDateToString(new Date());

  fs.readFile('datekey.txt', function (err, buf) {
    if (buf != undefined) {
      let dateKey = buf.toString().split('@');
      if (todaysDate !== dateKey[0]) {
        if (newDay(user) == true) {
          //If creating new day succeeded
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

function updateExcelCounterFromLetter(data, user) {
  let letter = changePositionFromLetter(data);
  tempRange = letter[1];
  console.log(data + " " + letter[1]);
  AuthorizeSheetFunction(updateGoogleDb);
  //console.log(`${alphabet[letter[0]]}`);
  if(user != undefined) 
    bot.postMessageToUser(user.display_name, `new range is ${alphabet[letter[0]]}`, params);
}

function updateExcelCounterFromNumber(data) {
  tempRange = data;
  position++;
  position++;
  AuthorizeSheetFunction(updateGoogleDb);
}


function checkCurrentPositionInExcell() {
  AuthorizeSheetFunction(ReadDateDb);
}

function reportCurrentCellInexcell(user) {
  let temp = position;
  temp++;
  temp++;
  bot.postMessageToUser(user.display_name, `Current position in excell is ${alphabet[temp]}`, params);
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


function newDay(user) {
  AuthorizeSheetFunction(writeDateOnTop);  
  updateExcelCounterFromNumber(position);
  randomNr = randomNumberGenerator();
  bot.postMessageToUser(user, randomNr, params);
  let data = `${todaysDate}@${randomNr.toString()}`;
  writeFile(data);
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


bot.on("message", msg => {
  switch (msg.type) {
    case "message":
      if (msg.channel[0] === "D" && msg.bot_id === undefined) {
        users = bot.getUsers();
        lastmessage = msg.text;
        let user;


        users._value.members.forEach(e => {
          if (e.id === msg.user) {
            user = e.profile;
          }
        });



        let newRange = checkIfMessageIsSplittable(msg.text);
        if (newRange != false) {
          updateExcelCounterFromLetter(newRange, user);          
        }

        switch (msg.text) {
          case "cellreset": {
            if (msg.user === "UCLA6T2AY" || msg.user === "U4WU831BJ") {
              ResetCellCount(user);
            }
            break;
          }

          case "närvaro": {
            if (user.display_name === "peter.heinum" || msg.user === "U4WU831BJ") { //Peters och Axels  
              presentUsers = [];
              bot.postMessageToUser(msg.user, `Good morning ${user.real_name}`, params);
              newPresence(user.display_name);
              bot.postMessageToUser(msg.user, randomNr, params);
            }
            break;
          }
          case "sick": {
            let tempdate = new Date();
            tempdate = convertDateToString(tempdate);
            temp4name = `SICK ${nameMassager(user.real_name)} ${tempdate}`;
            AuthorizeSheetFunction(appendName);
            bot.postMessageToUser(user.display_name, `Du har nu blivit sjukanmäld ${temp4name}`, params);
            bot.postMessageToUser("info", `${temp4name} har nu anmält sig sjuk`, params);
          }
            break;

          case "datereset": if (msg.user === "UCLA6T2AY" || msg.user === "U4WU831BJ") {
            ResetDateKeyCount(user);
          }
            break;

          case "help": {
            if (msg.user === "UCLA6T2AY" || msg.user === "U4WU831BJ") {
              bot.postMessageToUser(user.display_name, "'närvaro' för att starta botten, 'datereset' för att ta bort dagens kod, 'cellreset för att få botten att börja om i excell dokumentet', 'currentcell' för att ta reda på vart botten kommer skriva härnäst, 'jumpcell-a' för att byta  till cell a (kmr snart)", params);
            } else { bot.postMessageToUser(user.display_name, "Skriv koden Axel uppger för att få närvaro, eller om du är sjuk skriv 'sick'", params); }
            break;
          }

          case "currentcell": {
            reportCurrentCellInexcell(user);
            break;
          }

          default: bot.postMessageToUser(user.display_name, `Någonting förstods ej, skriv help ifall du behöver stöd (de flesta utav kommandon kommer bara axel åt!)`, params);
            break;

          case randomNr.toString(): {
            let userPresent = checkIfUserPresent(msg.user);
            if (userPresent === false) {
              temp4name = nameMassager(user.real_name);
              AuthorizeSheetFunction(appendName);
              pushUsertopresent(msg.user);
              bot.postMessageToUser(user.display_name, `${user.real_name} har nu fått närvaro ${todaysDate}`, params);
              break;
            } else {
              bot.postMessageToUser(user.display_name, `Du är redan närvarande`, params);
              break;
            }
          }
        }

      }

  }
})

const alphabet = [
  'this aint no ordinary thing',
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

function appendName(authClient) { 
  let rangePosition = alphabet[position];
  console.log(rangePosition) + " rangeposition for name";
  const sheets = google.sheets({ version: 'v4', authClient });
  var request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: `${testSheet}`,  // TODO: Update placeholder value.

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


  sheets.spreadsheets.values.append(request, function (err, response) {
    if (err) {
      //console.error(err);
      return;
    }
  });
}

function writeDateOnTop(authClient) {
  let tempdate = new Date();
  tempdate = convertDateToString(tempdate);
  let rangePosition = alphabet[position];
  console.log("positiong for date" + rangePosition);
  const sheets = google.sheets({ version: 'v4', authClient });
  var request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: `${testSheet}`,  // TODO: Update placeholder value.

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




function appendSickPerson(authClient) {
  let tempdate = new Date();
  tempdate = convertDateToString(tempdate);
  let cellvalue = `SICK - ${temp4name} ${tempdate}`;
  let rangePosition = alphabet[position];
  const sheets = google.sheets({ version: 'v4', authClient });
  var request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: `${testSheet}`,  // TODO: Update placeholder value.

    // The A1 notation of a range to search for a logical table of data.
    // Values will be appended after the last row of the table.
    range: `Sheet1!Z1:Z1`,  // TODO: Update placeholder value.

    // How the input data should be interpreted.
    valueInputOption: 'RAW',  // TODO: Update placeholder value.

    // How the input data should be inserted.
    insertDataOption: 'OVERWRITE',  // TODO: Update placeholder value.

    resource: {
      'values': [
        [cellvalue],
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

function updateGoogleDb(authClient) {
  let tempdate = new Date();
  tempdate = convertDateToString(tempdate);
  const sheets = google.sheets({ version: 'v4', authClient });
  var request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: `${dbsheetid}`,  // TODO: Update placeholder value.

    // The A1 notation of a range to search for a logical table of data.
    // Values will be appended after the last row of the table.
    range: `dbsheet!A1:A1`,  // TODO: Update placeholder value.

    // How the input data should be interpreted.
    valueInputOption: 'RAW',  // TODO: Update placeholder value.

    // How the input data should be inserted.
    insertDataOption: 'OVERWRITE',  // TODO: Update placeholder value.

    resource: {
      "values": [
        [
          `${tempdate}@${tempRange}`
        ]
      ]
      // TODO: Add desired properties to the request body.
    },
    auth: authClient,
  };

  sheets.spreadsheets.values.append(request, function(err, response) {
    if (err) {
      //console.error(err);
      return;
    }
  });
}

function ReadDateDb(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: `${dbsheetid}`,
    range: 'dbsheet!A:B',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {      
      let lastItem = rows[rows.length-1];      
      lastItem = lastItem.toString().split('@');
      position = lastItem[1];
      console.log(position);
    } else {
      console.log('No data found.');
    }
    
  });
}

function AuthorizeSheetFunction(funct) {
  authorize(JSON.parse(credentials), funct);
}
//__________________________GOOOGLE STUFF___________________________\\
