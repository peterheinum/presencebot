require('dotenv').config();
const SlackBot = require('slackbots');
const fs = require('fs');
const Auth = require('./google/auth');
const sheets = require('./google/sheets')
const store = require('./helpers/sharedvars');
const helpers = require('./helpers/helperFunctions');
const db = require('./db/dbHelper');



const params = { 'presencebot': true, icon_emoji: ':sun:' };
let presentUsers = [];

const envKey = process.env.slack;
const bot = new SlackBot({
	token: envKey,
	name: 'presencebot'
});

// INIT MY BOT
bot.on('start', function () {
	console.log('Good morning');
	// helpers.init();
	// db.update('todaysdate', 'yeet');
	db.readDate('dates:0')
	// db.addPersonToDate(convertDateToString(new Date()), 'yeete the meat')
	store.dbSwitch = "0";
	store.alphabet = helpers.firstAlphabet();
	store.randomNr = helpers.randomNumberGenerator();
});





bot.on('message', msg => {
	switch (msg.type) {
		case 'message':
			if (msg.channel[0] === 'D' && msg.bot_id === undefined) {
				let users = bot.getUsers();
				let user;
				users._value.members.find(e => {
					if (e.id === msg.user) {
						user = e.profile;
						checkIfMessageIsOperation(msg, user);
					}
				});

				switch (msg.text) {
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
						break;
					}						

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
						console.log(store.schoolSheet)
						bot.postMessageToUser(user.display_name, `Current sheet: ${store.schoolSheet}`, params);
						break;
					}

					case store.randomNr.toString(): {
						if (!presentUsers.includes(msg.user)) {
							store.name = nameMassager(user.real_name);
							db.updateCount(nameMassager(user.real_name));
							Auth.Authorize(sheets.appendName);
							if (presentUsers.length == 0) {
								bot.postMessageToUser(user.display_name, `DING DING DING! Du var först att få närvaro den ${store.todaysdate}, bra jobbat ${user.real_name}`, params);
								// bot.postMessageToChannel('reminders', `Kom ihåg att skriva koden på tavlan om du är här, Happy coding! :]`, params);
							} else { 
								bot.postMessageToUser(user.display_name, `Yo yo yo, goodmorning ${user.real_name} \n Present [✓]`, params);
							}
							presentUsers.push(msg.user);
							break;
						} else {
							bot.postMessageToUser(user.display_name, 'Du är redan närvarande', params);
							break;
						}
					}
					default: bot.postMessageToUser(user.display_name, ' I\'m confused, what do you want to achieve?', params);
						break;
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


const startPresenceAndMsgUser = (user) => {
	presentUsers = [];
	bot.postMessageToUser(user.display_name, `Good morning ${user.real_name} \n Class initiated: ${store.dbSwitch}`, params);
	newPresence(user.display_name);
	bot.postMessageToUser(user.display_name, store.randomNr, params);
	console.log(store.randomNr)
}

function checkIfMessageIsOperation(msg, user) {
	if (user.display_name === 'peter.heinum' || msg.user === 'U4WU831BJ' || msg.user === 'U2TFNKWBT') {
		if (msg.text.split(':')[1] != undefined) {
			msg.text = msg.text.split(':');
		} else return;
		if (msg.text[1] != undefined) {
			msg.text[0] = msg.text[0].toLowerCase();
			switch (msg.text[0]) {
				case 'jumpcell':
					let letter = changePositionFromLetter(msg.text[1]);
					bot.postMessageToUser(user.display_name, `new range is ${store.alphabet[letter]}`, params);
					return;
				case 'sheet':
					changeSheetId(msg.text[1]);
					bot.postMessageToUser(user.display_name, `new sheet is ${store.schoolSheet}`, params);
					return;
				case 'testsheet':
					changeSheetId(msg.text[1]);
					console.log(msg.text[1], 'is your new id')
				case 'startover':
					resetBot(msg.text[2], user, msg.text[1]);
					return;
				case 'närvaro': {
					store.dbSwitch = msg.text[1];
					helpers.init();
					setTimeout(startPresenceAndMsgUser, 3000, user);	
					break;			
				}
				case 'people': {
					store.dbSwitch = msg.text[1];
					helpers.init();
					setTimeout(db.getAllPeople, 3000);
					setTimeout(logger, 4000, user);
					break;
				}
				default: bot.postMessageToUser(user.display_name, `Error, command not recognized: ${msg.text[0]}`);
					return;
			}
		} else return;
	}
}

function logger(user) {
	const total = store.people.find(e => e.name === 'total');
	store.people.forEach(e => {
		const x = e.points;
		const y = total.points;
		const res = x / y;
		const desiredNumberOfDecimals = 2;
		const floatRes = res.toPrecision(String(res).length + desiredNumberOfDecimals);
		const percent = floatRes.toString().split('0.')[1] != undefined ? floatRes.toString().split('0.')[1].slice(0,2) : "";
		if(e.name !== 'total') bot.postMessageToUser(user.display_name, `${e.name}: ${percent}%`, params);
	});
}



function resetBot(sheetId, user, classNr){
	store.dbSwitch = classNr;
	db.dropAndRestartCollections(sheetId);
	bot.postMessageToUser(user.display_name, 'It\'s been a pleasure', params);
	setTimeout(helpers.init, 5000);
	setTimeout(sendIntroMessage, 5000, user);
}

function sendIntroMessage(user){
	bot.postMessageToUser(user.display_name, 'Succesfully reset my inner core. Ready for re:use', params)
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



function newPresence(user) {
	try {
		let tempdate = convertDateToString(new Date());
		if (tempdate != '') {// store.todaysdate) { This will allow several class presence checks every day
			store.position = parseInt(store.position) + 2;
			helpers.pickAlphabet();
			store.todaysdate = tempdate;
			Auth.Authorize(sheets.writeDateOnTop);
			store.randomNr = helpers.randomNumberGenerator();
			bot.postMessageToUser(user, store.randomNr, params);
			db.update('position', store.position.toString());
			db.update('randomnr', store.randomNr.toString());
			db.update('todaysdate', tempdate);
			db.updateCount('total');
		}
		else if (tempdate === store.todaysdate) {
			bot.postMessageToUser(user, ` You have already started the presencecheck today, but here's the code: ${store.randomNr}`, params);
		}
	} catch (error) {
		bot.postMessageToUser(user, `Fuck fuck fuck fuck ${error}`, params);
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

function convertDateToString(date) {
	let newDate = '';
	newDate += `${date.getFullYear()}-`;
	newDate += `${date.getMonth() + 1}-`;
	newDate += date.getDate();
	return newDate;
}