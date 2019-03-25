const store = require('../helpers/sharedvars');
const { google } = require('googleapis');

const sheetsFunctions = {
  writeDateOnTop(authClient) {
    let rangePosition = store.alphabet[store.position];
    const sheets = google.sheets({ version: 'v4', authClient });
    let request = {
      spreadsheetId: store.schoolSheet2, 
      range: `Sheet1!${rangePosition}1:${rangePosition}1`,  
      valueInputOption: 'RAW',  
      insertDataOption: 'OVERWRITE',  
      resource: {
        'values': [
          [store.todaysdate],
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

  storeRegisteredName(authClient){ //TODO !IMPORTANT Change the spreadsheet id to store var
    let rangePosition = store.alphabet[store.position];
    const sheets = google.sheets({ version: 'v4', authClient });
    let request = {
      spreadsheetId: "1q_68-0ctovY23_htvoQr0WDp-HIQlI2fpysNx4dEADA", 
      range: `dbsheet!A1:A1`,  
      valueInputOption: 'RAW',  
      insertDataOption: 'OVERWRITE',  
      resource: {
        'values': [
          [store.name],
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

  readRegisteredUsers(authClient) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get({
      spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      range: 'Class Data!A2:E',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const rows = res.data.values;
      if (rows.length) {
        console.log('Name, Major:');
        // Print columns A and E, which correspond to indices 0 and 4.
        rows.map((row) => {
          console.log(`${row[0]}, ${row[4]}`);
        });
      } else {
        console.log('No data found.');
      }
    });
  },

  appendName(authClient) {
    let rangePosition = store.alphabet[store.position];
    const sheets = google.sheets({ version: 'v4', authClient });
    let request = {
      spreadsheetId: store.schoolSheet2,  
      range: `Sheet1!${rangePosition}1:${rangePosition}1`,  
      valueInputOption: 'RAW',  
      insertDataOption: 'OVERWRITE',  
      resource: {
        'values': [
          [store.name],
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
    let cellvalue = `${store.name}`;
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