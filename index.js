var SlackBot = require('slackbots');
const envKey = process.env.COMPLAINTBOTKEY;


// create a bot
var bot = new SlackBot({
  token: envKey, // Add a bot https://my.slack.com/services/new/bot and put the token 
  name: 'complaintbot'
});

bot.on('start', function () {
  // more information about additional params https://api.slack.com/methods/chat.postMessage
  var params = {
    icon_emoji: ':skull:'
  };

  // define channel, where bot exist. You can adjust it there https://my.slack.com/services 
  //bot.postMessageToChannel('general', 'https://www.youtube.com/watch?v=ZXsQAXx_ao0', params);
  //var logthis = bot._api();
  
  // If you add a 'slackbot' property, 
  // you will post to another user's slackbot channel instead of a direct message
  //bot.postMessageToUser('user_name', 'meow!', { 'slackbot': true, icon_emoji: ':cat:' }); 

  // define private group instead of 'private_group', where bot exist
  //bot.postMessageToGroup('private_group', 'meow!', params); 
});

let lastmessage = "";

bot.on("message", msg => {
  switch (msg.type) {
    case "message":
    if(msg.text !== lastmessage){
      bot.postMessageToChannel("general", msg.text, { 'slackbot': true, icon_emoji: ':skull:' })
      lastmessage = msg.text;
      break;
    }
     
  }
})