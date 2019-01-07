const SlackBot = require('slackbots');
const fs = require('fs');
const envKey = "";
//const envKey = process.env.COMPLAINTBOTKEY;
const params = { 'complaintbot': true, icon_emoji: ':skull:' };
let todaysDate;
let randomNr;

// create a bot
const bot = new SlackBot({
  token: envKey, // Add a bot https://my.slack.com/services/new/bot and put the token 
  name: 'complaintbot'
});


function newNervaro() {
  let tempdate = new Date();
  todaysDate = convertDateToString(tempdate);

  fs.readFile('datekey.txt', function (err, buf) {
    if (buf != undefined) {
      let dateKey = buf.toString().split('@');
      if (todaysDate !== dateKey[0]) {
        if (newDay(todaysDate) == true) {
          return dateKey[1];
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

bot.on('start', function () {
  // more information about additional params https://api.slack.com/methods/chat.postMessage

  // let randomcomplaint = getRandomComplaint();
  //bot.postMessageToChannel('fuck-shit-up', randomcomplaint, params);
  const logthis = bot._api();

  // let users = [];
  // users = bot.getUsers();
  // users._value.members.forEach(e => {
  //     console.log(e.profile);    
  // });





  //console.log(rightuser);
  // If you add a 'slackbot' property, 
  // you will post to another user's slackbot channel instead of a direct message
  //bot.postMessageToUser('user_name', 'meow!', { 'slackbot': true, icon_emoji: ':cat:' }); 
});

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



function newDay() {
  try {
    randomNr = randomNumberGenerator();
    bot.postMessageToUser('pete', randomNr, params);
    let data = `${todaysDate}@${randomNr.toString()}`;
    writeFile(data);
    return true;
  }
  catch (error) {
    return false;
  }
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


let lastmessage = "";
bot.on("message", msg => {
  switch (msg.type) {
    case "message":
      if (msg.channel[0] === "D" && msg.bot_id === undefined) {
        let users = [];
          users = bot.getUsers();

          lastmessage = msg.text;
          let user;
          users._value.members.forEach(e => {
            if (e.id === msg.user) {
              user = e.profile;
            }
          });

        if (msg.text === "närvaro") {
          let savedcode = newNervaro();
          if(!savedcode == undefined) randomNr = savedcode;
          bot.postMessageToUser(user.display_name, randomNr, params)
        } else {
          
          if (user.display_name === "") {
            if (msg.text == randomNr) {
              bot.postMessage(msg.user, `Du har nu fått närvaro ${user.real_name}`, params);
            } else {
              bot.postMessage(msg.user, "Du har tyvärr skrivit fel kod", { 'complaintbot': true, icon_emoji: ':skull:' });
            }
          } else {
            if (msg.text == randomNr) {
              bot.postMessageToUser(user.display_name, `Du har nu fått närvaro ${user.real_name}`, params);
            } else {
              bot.postMessageToUser(user.display_name, "Du har tyvärr skrivit fel kod", { 'complaintbot': true, icon_emoji: ':skull:' });
            }
          }
        }
      }
  }
})







function getRandomComplaint() {
  let complaint = wordList[Math.floor(Math.random() * wordList.length)];
  return complaint;
}



wordList = [
  'Life is definitely not worth it.',
  'I regret waking up today.',
  'Come on shitheads do something productive.',
  'Remember that time I said I thought you were cool? I lied.',
  'Do you ever wonder what life would be like if you’d gotten enough oxygen at birth?',
  'Can you die of constipation? I ask because I’m worried about how full of shit you are.',
  'You’ll never be the man your mom is.',
  'Earth is full. Go home.',
  'Your family tree must be a cactus ‘cause you’re all a bunch of pricks.',
  'I was going to give you a nasty look but I see that you’ve already got one.',
  'Eat shit die',
  'Go fuck yourself'
]