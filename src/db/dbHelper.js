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
        db.close();
      })
    });
  },
  update: (cell, data) => {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      let dbo = db.db(dbName);
      let cellmatcher = { [cell]: /.*.*/ };
      let dataObj = { [cell]: data };
      dbo.collection('externalvars').updateOne(cellmatcher, dataObj, { upsert: true, save: false }, (err, res) => {
        if (err) console.log(err);
        console.log(`updated: ${cell}: ${data}`);
        db.close();
      })
    });
  },

  read: (cell) => {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      let dbo = db.db(dbName);
      let cellmatcher = { [cell]: /.*.*/ };
      dbo.collection('externalvars').find(cellmatcher, (err, res) => {
        if (err) console.log(err);
        res.forEach(e => {
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
            case 'currentalphabet': store.currentAlphabet = e[cell];
              console.log('read currentalphabet: ' + e[cell]);
              break;
          }
        });
        db.close();
      })

    });
  },

  updateCount: (cell) => {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      let dbo = db.db(dbName);
      dbo.collection('people').updateOne({ [cell]: "person" }, { $inc: { 'points': 1 } }, { upsert: true, save: false }, (err, res) => {
        if (err) console.log(err);
        console.log(`updated: ${cell}`);
        db.close();
      })
    });
  },

  dropAndRestartCollections: (newSheet) => {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      let dbo = db.db(dbName);
      console.log("Trying to drop table externalvars");
      dbo.dropCollection('externalvars', (err, res) => {
        console.log("Trying to create table externalvars");
        dbo.createCollection('externalvars', (err, res) => {
          if (res) {
            dbo.collection('externalvars').updateOne({ 'positon': '0' }, { 'position': '0' }, { upsert: true, save: false }, (err, res) => {
              if (err) console.log(err);
              console.log(`updated: position 0`);
            })
            dbo.collection('externalvars').updateOne({ 'randomnr': '0000' }, { 'randomnr': '0000' }, { upsert: true, save: false }, (err, res) => {
              if (err) console.log(err);
              console.log(`updated: randomnr 0000`);
            })
            dbo.collection('externalvars').updateOne({ 'todaysdate': '0000' }, { 'todaysdate': '0000' }, { upsert: true, save: false }, (err, res) => {
              if (err) console.log(err);
              console.log(`updated: todaysdate 0000`);
            })
            dbo.collection('externalvars').updateOne({ 'sheet': newSheet }, { 'sheet': newSheet }, { upsert: true, save: false }, (err, res) => {
              if (err) console.log(err);
              console.log(`updated: sheet ${newSheet}`);
            })
            dbo.collection('externalvars').updateOne({ 'currentalphabet': 'first' }, { 'currentalphabet': 'first' }, { upsert: true, save: false }, (err, res) => {
              if (err) console.log(err);
              console.log(`updated: sheet 0000`);
            })
            
          }
        });
        console.log("dropping table people");
        dbo.dropCollection('people', (err, res) => {
          console.log("Trying to create table externalvars");
          dbo.createCollection('people', (err, res) => {
            console.log("People table succesfully created"); 
            db.close();
          })
        });
      });
    });
  },
}
module.exports = dbHelper;