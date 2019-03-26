require('dotenv').config();
const express = require('express')();
const SlackBot = require('slackbots');
const fs = require('fs');
const Auth = require('./google/auth');
const sheets = require('./google/sheets')
const store = require('./helpers/sharedvars');
const db = require('./db/dbHelper');

// // ---- For the splash page ---- ||
// express.get('/', (req, res) => {
// 	res.sendFile(__dirname + '/test.html');
// });
// const port = process.env.PORT;
// express.listen(port);
// // ---- For the splash page ---- ||'

//TODO LIST

/* alphabet switch, alphabet has to use the second function and third function once the first one is used. 

Start saving people when they register presence in the mongodb

create INIT FUNCTION for setting up the presencebot once a new class starts


there will be alot of sheets ids and creating and setup
but it will work.
I pray.

*/

const params = { 'presencebot': true, icon_emoji: ':sun:' };
let presentUsers = [];

const envKey = process.env.slack;
const bot = new SlackBot({
	token: envKey,
	name: 'presencebot'
});

store.alphabet = secondAlphabet();

function firstAlphabet() {
	const alphabet = [
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
	return alphabet;
}

function secondAlphabet() {
	const alphabet = [
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

	let brandNewAlphabet = [];
	for (let i = 0; i < 26; i++) {
		for (let j = 0; j < alphabet.length; j++) {
			brandNewAlphabet.push(alphabet[i] + alphabet[j]);
		}
	}
	return brandNewAlphabet;
}

// INIT MY BOT
bot.on('start', function () {
	console.log('Good morning');
	init();
});

function init() {
	store.randomNr = randomNumberGenerator();
	db.read('randomnr');
	db.read('position');
	db.read('todaysdate');
	db.read('sheet');
}

bot.on('message', msg => {
	switch (msg.type) {
		case 'message':
			if (msg.channel[0] === 'D' && msg.bot_id === undefined) {
				let users = bot.getUsers();
				let user;
				users._value.members.find(e => {
					if (e.id === msg.user) {
						user = e.profile;
					}
				});

				checkIfMessageIsOperation(msg.text, user);
			
				msg.text = msg.text.toLowerCase();
				switch (msg.text) {
					case 'närvaro': {
						if (user.display_name === 'peter.heinum' || msg.user === 'U4WU831BJ' || msg.user === 'U2TFNKWBT') { //Peters och Axels  
							presentUsers = [];
							db.updateCount('total');
							bot.postMessageToUser(msg.user, `Good morning ${user.real_name}`, params);
							newPresence(user.display_name);
							bot.postMessageToUser(msg.user, store.randomNr, params);
						}
						break;
					}
					case 'sick': {
						let tempdate = new Date();
						tempdate = convertDateToString(tempdate);
						store.name = `SICK ${nameMassager(user.real_name)} ${tempdate}`;
						Auth.Authorize(sheets.appendSickPerson);
						bot.postMessageToUser(user.display_name, `Du har nu blivit sjukanmäld ${store.name}`, params);
						bot.postMessageToUser('info', `${store.name} har nu anmält sig sjuk`, params);
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
						checkCurrentPositionInExcell();
						reportCurrentCellInexcell(user);
						break;
					}

					case 'currentsheet': {
						bot.postMessageToUser(user.display_name, `Current sheet: ${store.schoolSheet}`, params);
					}

					default: bot.postMessageToUser(user.display_name, ' I\'m confused, what do you want to achieve?', params);
						break;

					case store.randomNr.toString(): {
						if (!checkIfUserPresent(msg.user)) {
							store.name = nameMassager(user.real_name);
							db.updateCount(nameMassager(user.real_name));
							Auth.Authorize(sheets.appendName);
							if (presentUsers.length == 0) {
								bot.postMessageToUser(user.display_name, `DING DING DING! Du var först att få närvaro den ${store.todaysdate}, bra jobbat ${user.real_name}`, params);
								bot.postMessageToChannel('reminders', `Kom ihåg att skriva koden på tavlan om du är här, Happy coding! :]`, params);
							} else { bot.postMessageToUser(user.display_name, `Yo yo yo, goodmorning ${user.real_name} \n Present [✓]`, params); }
							pushUsertopresent(msg.user);
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


function nameMassager(name) {
	name = name.split('.');
	if (name[1] != undefined) {
		name = `${capitalizeFirstLetter(name[0])} ${capitalizeFirstLetter(name[1])}`;
	}
	return name.toString();
}

function checkIfMessageIsOperation(msg, user) {
	msg = msg.split(':');
	if (msg[1] != undefined) {
		switch (msg[0]) {
			case 'jumpcell':
				let letter = changePositionFromLetter(msg[1]);
				bot.postMessageToUser(user.display_name, `new range is ${store.alphabet[letter]}`, params);
				break;
			case 'sheet':
				changeSheetId(msg[1]);
				bot.postMessageToUser(user.display_name, `new sheet is ${store.schoolSheet}`, params);
				break;
			default: bot.postMessageToUser(user.display_name, `Error, command not recognized: ${msg[0]}`);
				break;
		}
	}
}



function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function changePositionFromLetter(letter) {
	for (let i = 0; i < store.alphabet.length; i++) {
		if (letter.toUpperCase() == store.alphabet[i]) {
			updateExcelCounter(i = i - 2);
			return i = i + 2;
		}
	}
}

function changeSheetId(sheetId) {
	store.schoolSheet = sheetId;
	db.update('sheet', sheetId);
}



function ResetDateKeyCount(user) {
	store.todaysdate = 'node is cool';
	db.update('todaysdate', 'I\'m glad you\'re spying on my code');
	bot.postMessageToUser(user.display_name, 'Succesfully reset the datekey file', params);
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
	try {
		let tempdate = convertDateToString(new Date());
		if (tempdate != store.todaysdate) {
			store.todaysdate = tempdate;
			Auth.Authorize(sheets.writeDateOnTop);
			store.position = parseInt(store.position) + 2;
			store.randomNr = randomNumberGenerator();
			bot.postMessageToUser(user, store.randomNr, params);
			db.update('position', store.position.toString());
			db.update('randomnr', store.randomNr.toString());
			db.update('todaysdate', tempdate);
		}
		else if (tempdate == store.todaysdate) {
			bot.postMessageToUser(user, ` You have already started the presencecheck today, but here's the code: ${store.randomNr}`, params);
		}
	} catch (error) {
		console.log(error);
	}
}

function updateExcelCounter(data) {
	store.position = data.toString();
	db.update('position', data.toString());
}

function checkCurrentPositionInExcell() {
	db.read('position');
}

function reportCurrentCellInexcell(user) {
	let tempposition = parseInt(store.position) + 2;
	console.log(store.alphabet[tempposition]);
	bot.postMessageToUser(user.display_name, `Current position in excell is ${store.alphabet[tempposition]} which is number ${tempposition}`, params);
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