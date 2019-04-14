require('dotenv').config();
const store = require('../helpers/sharedvars');
const helpers = require('../helpers/helperFunctions');
const db = require('../db/dbHelper');
const express = require('express')();
const expressThings = require('express');
var path = require('path');
const guid = require('uuid');


express.use(expressThings.urlencoded());
express.use(expressThings.json());   


helpers.init();

let okLoggin = false;
let currentToken = guid();

express.post('/verifypassword' , (req, res) => {
	verifyPassword(req.body.key);
	console.log("do i even exist ", okLoggin);
	okLoggin ? res.send("ok") : res.send("denied");
})


express.get('/' , (req, res) => {
	res.sendFile(path.join(__dirname + '/login.html'));
})

express.get('/login', (req, res) => {
	if(okLoggin) {
		res.sendFile(path.join(__dirname + '/adminView.html'));
	} else {
		res.send('<span style="height:98vh;display:flex;justify-content:center;align-items:center;font-size:24px;color:firebrick;text-decoration:underline"><b> Access Denied </b> </span>')
	}
})

express.get('/style.css', function(req, res) {
	res.sendFile(__dirname + "/" + "style.css");
});

const port = process.env.PORT || 3000;
console.log('Api running at ' + port);
express.listen(port);
// ---- For the splash page ---- ||'

function verifyPassword(password){
	if(password === process.env.PASSWORD) {
		store.token = guid();
		currentToken = store.token;
		okLoggin = true;
		startCountdown(60 * 3);
	} else {
		return false;
	}
}

function startCountdown(duration) {
	let timer = duration, minutes, seconds;
	setInterval(function () {
			minutes = parseInt(timer / 60, 10)
			seconds = parseInt(timer % 60, 10);

			minutes = minutes < 10 ? "0" + minutes : minutes;
			seconds = seconds < 10 ? "0" + seconds : seconds;

			if((minutes+seconds>0) === false){
				currentToken = guid();
				okLoggin = false;
				store.token = guid();
			}
			if (--timer < 0) {
					timer = duration;
			}
	}, 1000);
}

function hasch(string) {
	var hash = 0;
	if (string.length == 0) {
	  return hash;
	}
	for (var i = 0; i < string.length; i++) {
	  var char = string.charCodeAt(i);
	  hash = ((hash << 5) - hash) + char;
	  hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
  }
