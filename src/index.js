require('dotenv').config();
const express = require('express')();
const SlackBot = require('slackbots');
const fs = require('fs');
const Auth = require('./google/auth');
const sheetsFunctions = require('./google/sheets')
const sharedvars = require('./helpers/sharedvars');

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

const params = { 'presencebot': true, icon_emoji: ':sun:' };

let presentUsers = [];


sharedvars.alphabet = [
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
sharedvars.schoolSheet2 = process.env.SCHOOLSHEET;
// INIT MY BOT
bot.on('start', function () {
	console.log('Good morning');
	sharedvars.randomNr = randomNumberGenerator();
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
	for (let i = 0; i < sharedvars.alphabet.length; i++) {
		if (letter.toUpperCase() == sharedvars.alphabet[i]) {
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
	sharedvars.todaysDate = convertDateToString(tempdate);
	console.log("station 1.5 checking in");
	fs.readFile('src/datekey.txt', function (err, buf) {
		if (buf != undefined) {
			let dateKey = buf.toString().split('@');
			if (sharedvars.todaysDate !== dateKey[0]) {
				if (newDay(user) == true) {
					//If creating new day succeeded
				}
			} else {
				return dateKey[1];
			}
		}
		else {
			logError('Couldn\'t read file: ' + sharedvars.todaysDate);
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
		sharedvars.position = buf.toString();
	});
}

function reportCurrentCellInexcell(user) {
	fs.readFile('src/cellCount.txt', function (err, buf) {
		if (buf != undefined) {
			let tempposition = buf.toString();
			tempposition++;
			tempposition++;
			bot.postMessageToUser(user.display_name, `Current position in excell is ${sharedvars.alphabet[tempposition]}`, params);
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
	Auth.AuthorizeSheetsFunction(sheetsFunctions.writeDateOnTop);
	sharedvars.position =	parseInt(sharedvars.position) + 2;

	updateExcelCounter(sharedvars.position);
	sharedvars.randomNr = randomNumberGenerator();
	bot.postMessageToUser(user, sharedvars.randomNr, params);
	let data = `${sharedvars.todaysDate}@${sharedvars.randomNr.toString()}`;
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
					bot.postMessageToUser(user.display_name, `new range is ${sharedvars.alphabet[letter]}`, params);
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
							console.log("station 1 checking in");
							presentUsers = [];
							bot.postMessageToUser(msg.user, `Good morning ${user.real_name}`, params);
							newPresence(user.display_name);
							bot.postMessageToUser(msg.user, sharedvars.randomNr, params);
						}
						break;
					}
					case 'sick': {
						let tempdate = new Date();
						tempdate = convertDateToString(tempdate);
						sharedvars.name = `SICK ${nameMassager(user.real_name)} ${tempdate}`;
						Auth.AuthorizeSheetsFunction(sheetsFunctions.appendSickPerson);
						bot.postMessageToUser(user.display_name, `Du har nu blivit sjukanmäld ${sharedvars.name}`, params);
						bot.postMessageToUser('info', `${sharedvars.name} har nu anmält sig sjuk`, params);
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

					case sharedvars.randomNr.toString(): {
						let userPresent = checkIfUserPresent(msg.user);
						if (userPresent === false) {
							sharedvars.name = nameMassager(user.real_name);
							Auth.AuthorizeSheetsFunction(sheetsFunctions.appendName);
							pushUsertopresent(msg.user);
							bot.postMessageToUser(user.display_name, `${user.real_name} har nu fått närvaro ${sharedvars.todaysDate}`, params);
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

