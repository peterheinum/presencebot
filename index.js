const SlackBot = require('slackbots');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

const envKey = process.env.slack;
const clientID = process.env.ClientID;
const ProjectId = process.env.ProjectId;
const ClientSecret = process.env.ClientSecret;

const bot = new SlackBot({
  token: envKey,
  name: 'presencebot'
});

const credentials = `{"installed":{"client_id":"${clientID}","project_id":"${ProjectId}","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"${ClientSecret}","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}`;

// FOR THE FUTURE
const params = { 'presencebot': true, icon_emoji: ':sun:' };
let todaysDate;
let randomNr;
let temp4name;
let position;
let presentUsers = [];
let users = [];


// INIT MY BOT

bot.on('start', function () {
  console.log("Good morning");
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
  fs.writeFile('cellCount.txt', "0", function (err, data) {
    if (err) console.log(err);
    bot.postMessageToUser(user.display_name, "Succesfully reset the cellcounter to 0", params);
  })
  checkCurrentPositionInExcell();
}

function changePositionFromLetter(letter) {
  for (let i = 0; i < alphabet.length; i++) {
    if (letter.toUpperCase() == alphabet[i]) {
      updateExcelCounter(i = i - 2);
      return i = i + 2;
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
  let tempdate = new Date();
  todaysDate = convertDateToString(tempdate);

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

function updateExcelCounter(data) {
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

function reportCurrentCellInexcell(user) {
  fs.readFile('cellCount.txt', function (err, buf) {
    if (buf != undefined) {
      let tempposition = buf.toString();
      tempposition++;
      tempposition++;
      bot.postMessageToUser(user.display_name, `Current position in excell is ${alphabet[tempposition]}`, params);
    }
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


function newDay(user) {
  PushThingsToGoogle(writeDateOnTop);
  position++;
  position++;
  updateExcelCounter(position);
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
          let letter = changePositionFromLetter(newRange);
          bot.postMessageToUser(user.display_name, `new range is ${alphabet[letter]}`, params);
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
            PushThingsToGoogle(appendStuff);
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
              PushThingsToGoogle(appendStuff);
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

function appendStuff(authClient) {
  let rangePosition = alphabet[position];
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


  sheets.spreadsheets.values.append(request, function (err, response) {
    if (err) {
      console.error(err);
      return;
    }
  });
}

function writeDateOnTop(authClient) {
  let tempdate = new Date();
  tempdate = convertDateToString(tempdate);
  let rangePosition = alphabet[position];
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


function appendSickPerson(authClient) {
  let tempdate = new Date();
  tempdate = convertDateToString(tempdate);
  let cellvalue = `SICK - ${temp4name} ${tempdate}`;
  let rangePosition = alphabet[position];
  const sheets = google.sheets({ version: 'v4', authClient });
  var request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: '1UNygp0ryulW0FtB45rkOyoOOsXtxw8UNR3LSVKQVBME',  // TODO: Update placeholder value.

    // The A1 notation of a range to search for a logical table of data.
    // Values will be appended after the last row of the table.
    range: `Sheet1!$Z1:$Z1`,  // TODO: Update placeholder value.

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

function PushThingsToGoogle(funct) {
  authorize(JSON.parse(credentials), funct);
  // fs.readFile('credentials.json', (err, content) => {
  //   if (err) return console.log('Error loading client secret file:', err);
  //   // Authorize a client with credentials, then call the Google Sheets API.
  //   
  //   authorize(JSON.parse(content), funct); 
  // });
}
//__________________________GOOOGLE STUFF___________________________\\
