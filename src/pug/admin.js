require('dotenv').config();
const store = require('../helpers/sharedvars');
const helpers = require('../helpers/helperFunctions');
const db = require('../db/dbHelper');
const express = require('express')();
const handlebars = require('handlebars');

const compiledAdminView = pug.compileFile('src/pug/adminView.pug');

const init = () => {
		db.read('randomnr');
		db.read('todaysdate');
		db.read('sheet');
		db.read('position');
		db.read('currentalphabet');	
}
init();


function getData() {
	if(store.position) helpers.pickAlphabet();
	return { position: store.position, randomNr: store.randomNr, excellPosition: store.alphabet[store.position] }
}

// ---- For the splash page ---- ||
express.get('/', (req, res) => {
	if(store.position) helpers.pickAlphabet();
});

express.get('/admin', (req, res) => {
	if(store.position) helpers.pickAlphabet();
	res.send(`randomnr: ${store.randomNr.toString()} | current position in excell ${store.alphabet[store.position]} | 
	sheetId: ${store.schoolSheet}
	`)
})

const port = process.env.PORT || 3000;
console.log('Api running at ' + port);
express.listen(port);
// ---- For the splash page ---- ||'

