require('dotenv').config();
const fs = require('fs');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const readline = require('readline');
const { google } = require('googleapis');

const TOKEN_PATH = 'src/token.json';
const CLIENTID = process.env.clientID;
const PROJECTID = process.env.ProjectId;
const CLIENTSECRET = process.env.ClientSecret;

const credentials = `{"installed":{"client_id":"${CLIENTID}","project_id":"${PROJECTID}","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"${CLIENTSECRET}","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}`;

const Auth = {
  authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    if(client_id == undefined) client_id = CLIENTID;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0],
    );
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  },

  AuthorizeSheetsFunction(funct) {
    this.authorize(JSON.parse(credentials), funct);
  },

  getNewToken(oAuth2Client, callback) {
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
  },
};
module.exports = Auth;




