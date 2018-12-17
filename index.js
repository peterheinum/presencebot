var SlackBot = require('slackbots');
const envKey = "xoxb-93368932182-496000936290-RQPGIg3fbmXJGuMaAW4IZ7a1";
//const envKey = process.env.COMPLAINTBOTKEY;


// create a bot
var bot = new SlackBot({
  token: envKey, // Add a bot https://my.slack.com/services/new/bot and put the token 
  name: 'complaintbot'
});

bot.on('start', function () {
  // more information about additional params https://api.slack.com/methods/chat.postMessage
  const params = { 'slackbot': true, icon_emoji: ':skull:' };

  // define channel, where bot exist. You can adjust it there https://my.slack.com/services 
  let randomcomplaint = getRandomComplaint();
  bot.postMessageToChannel('fuck-shit-up', randomcomplaint, params);
  var logthis = bot._api();

  // If you add a 'slackbot' property, 
  // you will post to another user's slackbot channel instead of a direct message
  //bot.postMessageToUser('user_name', 'meow!', { 'slackbot': true, icon_emoji: ':cat:' }); 

  // define private group instead of 'private_group', where bot exist
  //bot.postMessageToGroup('private_group', 'meow!', params); 
});

lastmessage = "";
bot.on("message", msg => {
  switch (msg.type) {
    case "message":
      if (msg.text !== lastmessage) { 
        if (msg.channel[0] === "D" && msg.bot_id === undefined){
          //bot.postMessageToChannel("fuck-shit-up", msg.text, { 'slackbot': true, icon_emoji: ':skull:' })
          lastmessage = msg.text;
          msg.user;

          let get = httpGet(`https://slack.com/api/users.identity/${msg.user}`);
          console.log(get);
          break;
        }        
      }
  }
})

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function getRandomComplaint(){
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
  'Eat shit die'
]