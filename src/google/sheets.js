const sharedvars = require('../helpers/sharedvars');
const { google } = require('googleapis');

const sheetsFunctions = {
  writeDateOnTop(authClient) {
    let rangePosition = sharedvars.alphabet[sharedvars.position];
    const sheets = google.sheets({ version: 'v4', authClient });
    let request = {
      spreadsheetId: sharedvars.schoolSheet2, 
      range: `Sheet1!${rangePosition}1:${rangePosition}1`,  
      valueInputOption: 'RAW',  
      insertDataOption: 'OVERWRITE',  
      resource: {
        'values': [
          [sharedvars.todaysDate],
        ]
      },
      auth: authClient,
    };
    sheets.spreadsheets.values.append(request, function (err, response) {
      if (err) {
        //console.error(err);
        return;
      }
    });
  },

  appendName(authClient) {
    let rangePosition = sharedvars.alphabet[sharedvars.position];
    const sheets = google.sheets({ version: 'v4', authClient });
    let request = {
      spreadsheetId: sharedvars.schoolSheet2,  
      range: `Sheet1!${rangePosition}1:${rangePosition}1`,  
      valueInputOption: 'RAW',  
      insertDataOption: 'OVERWRITE',  
      resource: {
        'values': [
          [sharedvars.name],
        ]
      },
      auth: authClient,
    };
    sheets.spreadsheets.values.append(request, function (err, response) {
      if (err) {
        //console.error(err);
        return;
      }
    });
  },
  appendSickPerson(authClient) {
    let cellvalue = `${sharedvars.name}`;
    const sheets = google.sheets({ version: 'v4', authClient });
    let request = {
      spreadsheetId: '1gZr80-DRYvz6tY4e3skVmHZ2oMeecoWaUHwPgLClsVU', 
      range: 'Sheet1!$A1:$A1', 
      valueInputOption: 'RAW',   
      insertDataOption: 'OVERWRITE',  
      resource: {
        'values': [
          [cellvalue],
        ]
      },
      auth: authClient,
    };
  
    sheets.spreadsheets.values.append(request, function (err, response) {
      if (err) {
        //console.error(err);
        return;
      }
    });
  },
}

module.exports = sheetsFunctions;