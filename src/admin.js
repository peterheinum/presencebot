require('dotenv').config();
const store = require('./helpers/sharedvars');
const helpers = require('./helpers/helperFunctions');
const db = require('./db/dbHelper');

const express = require('express')();

// ---- For the splash page ---- ||
express.get('/', (req, res) => {
	res.sendFile(__dirname + '/test.html');
});
const port = process.env.PORT || 3000;
console.log('Api running at ' + port);
express.listen(port);
// ---- For the splash page ---- ||'
