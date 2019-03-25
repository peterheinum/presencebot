const store = require('../helpers/sharedvars');
const MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

const dbName = process.env.MONGO_DB_NAME;
const url = process.env.MONGODB_URI;
const dbHelper = {
  insert: (data) => {
    MongoClient.connect(url, function (err, db) {
      console.log("connected");
      assert.equal(null, err);
      let dbo = db.db(dbName);
      console.log("inserting: " + data);
      dbo.collection('externalvars').insertOne(data, (err, res) => {
        if (err) console.log(err);
        console.log("inserted");
      })
      db.close();
    });
  },
  update: (cell, data) => {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      let dbo = db.db(dbName);
      let cellmatcher = { [cell]: /.*.*/ };
      let dataObj = { [cell]: data };
      dbo.collection('externalvars').updateOne(cellmatcher, dataObj, (err, res) => {
        if (err) console.log(err);
        console.log(`updated: ${cell}: ${data}`);
      })
      db.close();
    });
  },

  read: (cell) => {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      let dbo = db.db(dbName);
      console.log("trying to read");
      let cellmatcher = { [cell]: /.*.*/ };
      dbo.collection('externalvars').find(cellmatcher, (err, res) => {
        if (err) console.log(err);
        res.forEach(e => {
          console.log(e['registered']);
          switch (cell) {
            case 'position': store.position = e[cell];
              console.log("read position: " + store.position.toString());
              break;
            case 'todaysdate': store.todaysdate = e[cell];
              console.log("read todaysdate: " + store.todaysdate);
              break;
            case 'randomnr': store.randomNr = e[cell];
              console.log("read randomNr: " + store.randomNr.toString());
              break;
            case 'sheet': store.schoolSheet = e[cell];
              console.log('read sheet: ' + store.schoolSheet);
              break;
            case 'registered': store.registeredPeople = e[cell];
              console.log('read Registeredpeople: ' + e[cell]);
              break;
            case 'alphabetswitch': store.alphabetswitch = e[cell];
              console.log('read alphabetswitch: ' + e[cell]);
              break;
          }
        });
      })
      db.close();
    });
  },

  updateCount: (cell) => {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      let dbo = db.db(dbName);
      dbo.collection('people').findOneAndUpdate({[cell]: "person"}, {$inc: {'points': 1}}, (err, res) => {
        if (err) console.log(err);
        console.log(`updated: ${cell}`);
      })
      db.close();
    });
  },

  insertFirst: (data) => {
    MongoClient.connect(url, function (err, db) {
      let person = data;
      data = {[data]: 'person', 'points': 0};
      assert.equal(null, err);
      let dbo = db.db(dbName);
      console.log("inserting: " + data);
      // dbo.collection('people').insertOne(data, (err, res) => {
      //   if (err) console.log(err);
      //   console.log("inserted");
      // })
      let dataObj = { $push: { 'registered': person }}
      dbo.collection('externalvars').updateOne({'list': 'people'}, dataObj, (err, res) => {
        if (err) console.log(err);
        console.log("inserted array too");
      })
      db.close();
    });
  },
  UpdateOrInsertFirst(data){
    store.registeredPeople.forEach(e => {
      console.log(e);
    });
  }


}
module.exports = dbHelper;