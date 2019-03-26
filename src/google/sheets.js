const store = require('../helpers/sharedvars');
const { google } = require('googleapis');

const sheetsFunctions = {
  writeDateOnTop(authClient) {
    let rangePosition = store.alphabet[store.position];
    const sheets = google.sheets({ version: 'v4', authClient });
    let request = {
      spreadsheetId: store.schoolSheet,
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

  storeRegisteredName(authClient) { //TODO !IMPORTANT Change the spreadsheet id to store var
    const sheets = google.sheets({ version: 'v4', authClient });
    let request = {
      spreadsheetId: store.dbSheet,
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
    store.registeredPeople.push(store.name);
    console.log(store.registeredPeople);
  },


  appendName(authClient) {
    let rangePosition = store.alphabet[store.position];
    const sheets = google.sheets({ version: 'v4', authClient });
    let request = {
      spreadsheetId: store.schoolSheet,
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