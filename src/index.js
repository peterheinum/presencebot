require('dotenv').config();
const express = require('express')();
const SlackBot = require('slackbots');
const fs = require('fs');
const Auth = require('./google/auth');
const sheetsFunctions = require('./google/sheets')
const sharedvars = require('./helpers/sharedvars');
const db = require('./db/dbHelper');

// ---- For the splash page ---- ||
express.get('/', (req, res) => {
	res.sendFile(__dirname + '/test.html');
});
const port = process.env.PORT;
express.listen(port);
// ---- For the splash page ---- ||

const params = { 'presencebot': true, icon_emoji: ':sun:' };
let presentUsers = [];

const envKey = process.env.slack;
const bot = new SlackBot({
	token: envKey,
	name: 'presencebot'
});

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

// INIT MY BOT
bot.on('start', function () {
	console.log('Good morning');
	sharedvars.randomNr = randomNumberGenerator();
	 db.read('randomnr');
	 db.read('position');
	 db.read('todaysdate');
	// db.insert({
	// 	randomnr: sharedvars.randomNr.toString()
	// })
	// db.insert({
	// 	todaysdate: convertDateToString(new Date())
	// })
	// db.insert({
	// 	position: '6'
	// })
});

bot.on('message', msg => {
	switch (msg.type) {
		case 'message':
			if (msg.channel[0] === 'D' && msg.bot_id === undefined) {
				msg.text = msg.text.toLowerCase();
				let users = bot.getUsers();
				let user;
				users._value.members.find(e => {
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
					case 'närvaro': {
						if (user.display_name === 'peter.heinum' || msg.user === 'U4WU831BJ' || msg.user === 'U2TFNKWBT') { //Peters och Axels  
							sharedvars.schoolSheet2 = process.env.SCHOOLSHEET;
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
						checkCurrentPositionInExcell();
						reportCurrentCellInexcell(user);
						break;
					}

					default: bot.postMessageToUser(user.display_name, ' skrev du fel kod? Eller är boten som är kodad fel? Inte vet jag', params);
						break;

					case sharedvars.randomNr.toString(): {
						if (!checkIfUserPresent(msg.user)) {
							sharedvars.name = nameMassager(user.real_name);
							Auth.AuthorizeSheetsFunction(sheetsFunctions.appendName);
							pushUsertopresent(msg.user);
							bot.postMessageToUser(user.display_name, `${user.real_name} har nu fått närvaro ${sharedvars.todaysdate}`, params);
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

function changePositionFromLetter(letter) {
	for (let i = 0; i < sharedvars.alphabet.length; i++) {
		if (letter.toUpperCase() == sharedvars.alphabet[i]) {
			updateExcelCounter(i = i - 2);
			return i = i + 2;
		}
	}
}

function ResetDateKeyCount(user) {
	sharedvars.todaysdate = 'node is cool';
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
		console.log(tempdate);
		console.log(sharedvars.todaysdate);
		if (tempdate != sharedvars.todaysdate) {	
			sharedvars.todaysdate = tempdate;
			Auth.AuthorizeSheetsFunction(sheetsFunctions.writeDateOnTop);
			sharedvars.position = parseInt(sharedvars.position) + 2;
			sharedvars.randomNr = randomNumberGenerator();
			bot.postMessageToUser(user, sharedvars.randomNr, params);
			db.update('position', sharedvars.position.toString());
			db.update('randomnr', sharedvars.randomNr.toString());
			db.update('todaysdate', tempdate);
		}
		else if(tempdate == sharedvars.todaysdate)
		{
			bot.postMessageToUser(user, ` You have already started the presencecheck today, but here's the code: ${sharedvars.randomNr}`, params);
		}
	} catch (error) {
		console.log(errror);
	}
}

function updateExcelCounter(data) {
	db.update('position', data.toString());
}

function checkCurrentPositionInExcell() {
	db.read('position');
}

function reportCurrentCellInexcell(user) {
	console.log(sharedvars.position);
	let tempposition = parseInt(sharedvars.position)+2;
	console.log(sharedvars.alphabet[tempposition]);
	bot.postMessageToUser(user.display_name, `Current position in excell is ${sharedvars.alphabet[tempposition]}`, params);
}


function logError(error){
	//TODO give message to pete 
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