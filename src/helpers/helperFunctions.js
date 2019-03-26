const store = require('../helpers/sharedvars');
const db = require('../db/dbHelper');

const helperFunctions = { 
  pickAlphabet: (position, currentAlphabet) => {
    // if(position && currentAlphabet){
    //   switch (currentAlphabet) {
    //     case 'first':
    //       // if(store.position > 23) {
    //       //   store.alphabet = secondAlphabet();
    //       //   store.position = '0';
    //       //   db.update('position', '0');
    //       //   db.update('currentalphabet', 'second');
    //       // }
    //       store.alphabet = firstAlphabet();
    //       break;
    //     case 'second':
    //       store.alphabet = secondAlphabet();
    //       break;
    //     case 'third':
    //       store.alphabet = thirdAlphabet();
    //       break;
    //     default: store.alphabet = firstAlphabet();
    //       break;
    //   }
    //   console.log(store.alphabet);
    // } else return "error";
    console.log("im picking alphabet you fucker");
  },
}
function firstAlphabet() {
	const alphabet = [
		'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
	];
	return alphabet;
}

function secondAlphabet() {
	const alphabet = [
		'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
	];

	let brandNewAlphabet = [];
	for (let i = 0; i < 26; i++) {
		for (let j = 0; j < alphabet.length; j++) {
			brandNewAlphabet.push(alphabet[i] + alphabet[j]);
		}
	}
	return brandNewAlphabet;
}

function thirdAlphabet() {
  const alphabet = [
		'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
	];
  let coolArray = [];
  for (let o = 0; o < 26; o++) {
    for (let i = 0; i < 26; i++) {
      for (let j = 0; j < alphabet.length; j++) {
        let pushThis = alphabet[o] + alphabet[i] + alphabet[j];
        coolArray.push(pushThis);
      }
    }
  }
  return coolArray;
}

module.exports = helperFunctions;