require('dotenv').config();
const express = require('express')();
const SlackBot = require('slackbots');
const fs = require('fs');
const { google } = require('googleapis');
const Auth = require('./google/auth');
const oAuth2Client = require('./google/auth')

express.get('/', (req, res) => {
	res.sendFile(__dirname + '/test.html');
});

const port = process.env.PORT;
express.listen(port);

const envKey = process.env.slack;
const bot = new SlackBot({
	token: envKey,
	name: 'presencebot'
});

const schoolSheet2 = process.env.SCHOOLSHEET;
const sickSheet = '1gZr80-DRYvz6tY4e3skVmHZ2oMeecoWaUHwPgLClsVU';
const params = { 'presencebot': true, icon_emoji: ':sun:' };
let todaysDate;
let randomNr;
let temp4name;
let position;
let presentUsers = [];

// INIT MY BOT
bot.on('start', function () {
	console.log('Good morning');
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
	if (msg[1] != undefined && msg[0] == 'jumpcell') {
		return msg[1].charAt(0);
	} else {
		return false;
	}
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function ResetCellCount(user) {
	fs.writeFile('src/cellCount.txt', '0', function (err, data) {
		if (err) console.log(err);
		bot.postMessageToUser(user.display_name, 'Succesfully reset the cellcounter to 0', params);
	});
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
	fs.writeFile('src/datekey.txt', 'lol', function (err, data) {
		if (err) console.log(err);
		bot.postMessageToUser(user.display_name, 'Succesfully reset the datekey file', params);
	});
}

function pushUsertopresent(userid) {
	presentUsers.push(userid);
}
function checkIfUserPresent(userid) {
	let temp = false;
	presentUsers.forEach(USERID => {
		if (USERID == userid) {
			temp = true;
		}
	});
	return temp;
}

function newPresence(user) {
	checkCurrentPositionInExcell();
	let tempdate = new Date();
	todaysDate = convertDateToString(tempdate);

	fs.readFile('src/datekey.txt', function (err, buf) {
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
			logError('Couldn\'t read file: ' + todaysDate);
		}
	});
}

function updateExcelCounter(data) {
	fs.writeFile('src/cellCount.txt', data, function (err, data) {
		if (err) console.log(err);
		console.log('Successfully updated cellcount to File.');
	});
}

function checkCurrentPositionInExcell() {
	fs.readFile('src/cellCount.txt', function (err, buf) {
		position = buf.toString();
	});
}

function reportCurrentCellInexcell(user) {
	fs.readFile('src/cellCount.txt', function (err, buf) {
		if (buf != undefined) {
			let tempposition = buf.toString();
			tempposition++;
			tempposition++;
			bot.postMessageToUser(user.display_name, `Current position in excell is ${alphabet[tempposition]}`, params);
		}
	});
}


function writeFile(data) {
	fs.writeFile('src/datekey.txt', data, function (err, data) {
		if (err) console.log(err);
		console.log('Successfully Written to File.');
	});
}

function logError(data) {
	fs.writeFile('src/errors.txt', data, function (err, data) {
		if (err) console.log(err);
	});
}


function newDay(user) {
	Auth.AuthorizeSheetsFunction(writeDateOnTop);
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
	let newDate = '';
	newDate += `${date.getFullYear()}-`;
	newDate += `${date.getMonth() + 1}-`;
	newDate += date.getDate();
	return newDate;
}


bot.on('message', msg => {
	switch (msg.type) {
		case 'message':
			if (msg.channel[0] === 'D' && msg.bot_id === undefined) {
				let users = bot.getUsers();
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
					case 'cellreset': {
						if (msg.user === 'UCLA6T2AY' || msg.user === 'U4WU831BJ' || msg.user === 'U2TFNKWBT') {
							ResetCellCount(user);
						}
						break;
					}

					case 'närvaro': {
						if (user.display_name === 'peter.heinum' || msg.user === 'U4WU831BJ' || msg.user === 'U2TFNKWBT') { //Peters och Axels  
							presentUsers = [];
							bot.postMessageToUser(msg.user, `Good morning ${user.real_name}`, params);
							newPresence(user.display_name);
							bot.postMessageToUser(msg.user, randomNr, params);
						}
						break;
					}
					case 'sick': {
						let tempdate = new Date();
						tempdate = convertDateToString(tempdate);
						temp4name = `SICK ${nameMassager(user.real_name)} ${tempdate}`;
						Auth.AuthorizeSheetsFunction(appendSickPerson);
						bot.postMessageToUser(user.display_name, `Du har nu blivit sjukanmäld ${temp4name}`, params);
						bot.postMessageToUser('info', `${temp4name} har nu anmält sig sjuk`, params);
					}
						break;

					case 'datereset': if (msg.user === 'UCLA6T2AY' || msg.user === 'U4WU831BJ' || msg.user === 'U2TFNKWBT') {
						ResetDateKeyCount(user);
					}
						break;

					case 'help': {
						if (msg.user === 'UCLA6T2AY' || msg.user === 'U4WU831BJ' || msg.user === 'U2TFNKWBT') {
							bot.postMessageToUser(user.display_name, '\'närvaro\' för att starta botten, \'datereset\' för att ta bort dagens kod, \'currentcell\' för att ta reda på vart botten kommer skriva härnäst, \'jumpcell-*\' för att byta  till cell', params);
						} else { bot.postMessageToUser(user.display_name, 'Skriv koden Axel uppger för att få närvaro, eller om du är sjuk skriv \'sick\'', params); }
						break;
					}

					case 'currentcell': {
						reportCurrentCellInexcell(user);
						break;
					}

					default: bot.postMessageToUser(user.display_name, 'Någonting förstods ej, skriv help ifall du behöver stöd (de flesta utav kommandon kommer bara axel åt!)', params);
						break;

					case randomNr.toString(): {
						let userPresent = checkIfUserPresent(msg.user);
						if (userPresent === false) {
							temp4name = nameMassager(user.real_name);
							Auth.AuthorizeSheetsFunction(appendStuff);
							pushUsertopresent(msg.user);
							bot.postMessageToUser(user.display_name, `${user.real_name} har nu fått närvaro ${todaysDate}`, params);
							break;
						} else {
							bot.postMessageToUser(user.display_name, 'Du är redan närvarande', params);
							break;
						}
					}
				}

			}

	}
});

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
];

function appendStuff(authClient) {
	let rangePosition = alphabet[position];
	const sheets = google.sheets({ version: 'v4', authClient });
	let request = {
		// The ID of the spreadsheet to update.
		spreadsheetId: schoolSheet2,  // TODO: Update placeholder value.

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
	const sheets = google.sheets({ version: 'v4', authClient });
	let request = {
		// The ID of the spreadsheet to update.
		spreadsheetId: schoolSheet2,  // TODO: Update placeholder value.

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
	let cellvalue = `${temp4name}`;
	const sheets = google.sheets({ version: 'v4', authClient });
	let request = {
		// The ID of the spreadsheet to update.
		spreadsheetId: sickSheet,  // TODO: Update placeholder value.

		// The A1 notation of a range to search for a logical table of data.
		// Values will be appended after the last row of the table.
		range: 'Sheet1!$A1:$A1',  // TODO: Update placeholder value.

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



