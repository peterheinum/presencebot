const store = require('../helpers/sharedvars');
const db = require('../db/dbHelper');

const helperFunctions = {
  pickAlphabet: () => {
    if(store.currentAlphabet === 'first') {      
      if (store.position > 25) {
        store.alphabet = secondAlphabet();
        store.position = 0;
        store.currentAlphabet = 'second';
        db.update('position', '0');
        db.update('currentalphabet', 'second');
        console.log("Switched from first to second Alphabet");
      }
    } 

    if (store.currentAlphabet === 'first' && store.position < 24 || store.position === 24) {
      store.alphabet = firstAlphabet();
      console.log("using firstAlphabet");
    }

    if (store.currentAlphabet === 'second') {
      if(store.position > 673){
        store.alphabet = thirdAlphabet();
        store.position = 0;
        store.currentAlphabet = 'third';
        db.update('position', '0');
        db.update('currentalphabet', 'third');
      }
    }
    if (store.currentAlphabet === 'second' && store.position < 672 || store.position === 672) {
      store.alphabet = secondAlphabet();
      console.log("using second alphabet");
    }

    if (store.currentAlphabet === 'third') {
      console.log("miracles happen");
      store.alphabet = thirdAlphabet();
    }

  },
}

function firstAlphabet() {
  const alphabet = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ];
  return alphabet;
}

function secondAlphabet() {
  const alphabet = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
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
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
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