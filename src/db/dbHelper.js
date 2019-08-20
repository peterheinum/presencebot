const store = require('../helpers/sharedvars');
const helpers = require('../helpers/helperFunctions');
const MongoClient = require('mongodb').MongoClient
  , assert = require('assert');


const dbName = process.env.MONGO_DB_NAME;
const url = process.env.MONGODB_URI;
const dbHelper = {
  insert: (data) => {
    MongoClient.connect(url, (err, db) => {
      console.log("connected");
      assert.equal(null, err);
      let dbo = db.db(dbName);
      console.log("inserting: " + data);
      dbo.collection('externalvars:' + store.dbSwitch).insertOne(data, (err, res) => {
        if (err) console.log(err);
        console.log("inserted");
        db.close();
      })
    });
  },
  update: (cell, data) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      let dbo = db.db(dbName);
      let cellmatcher = { [cell]: /.*.*/ };
      let dataObj = { [cell]: data };
      dbo.collection('externalvars:' + store.dbSwitch).updateOne(cellmatcher, dataObj, { upsert: true, save: false }, (err, res) => {
        if (err) console.log(err);
        console.log(`updated: ${cell}: ${data}`);
        db.close();
      })
    });
  },

  
  addPersonToDate: (cell, data) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      let dbo = db.db(dbName);
      let dataObj = { [cell]: data };
      dbo.collection(`dates:${store.dbSwitch}`).updateOne({ [cell]: data}, dataObj, (err, res) => {
        if (err) console.log(err);
        console.log(`updated: ${cell}: ${data}`);
        db.close();
      })
    });
  },



  read: (cell) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      let dbo = db.db(dbName);
      let cellmatcher = { [cell]: /.*.*/ };
      dbo.collection('externalvars:' + store.dbSwitch).find(cellmatcher, (err, res) => {
        if (err) console.log(err);
        console.log(`Current Db: ${store.dbSwitch}`);
        res.forEach(e => {
          switch (cell) {
            case 'position': store.position = e[cell];
              console.log(`read position: ` + store.position.toString());
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

  readDate: (cell) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      let dbo = db.db(dbName);
      dbo.collection('dates:0').find({}).toArray((err, res) => {
        console.log(res)
        db.close();
      })

    });
  },

  

  updateCount: (cell) => {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      let dbo = db.db(dbName);
      dbo.collection('people' + store.dbSwitch).updateOne({ [cell]: "person" }, { $inc: { 'points': 1 } }, { upsert: true, save: false }, (err, res) => {
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
      dbo.dropCollection('externalvars' + store.dbSwitch, (err, res) => {
        console.log("Trying to create table externalvars");
        dbo.createCollection('externalvars' + store.dbSwitch, (err, res) => {
          if (res) {
            dbo.collection('externalvars' + store.dbSwitch).updateOne({ 'positon': '0' }, { 'position': '0' }, { upsert: true, save: false }, (err, res) => {
              if (err) console.log(err);
              if(res) console.log(`updated: position 0`);
            })
            dbo.collection('externalvars' + store.dbSwitch).updateOne({ 'randomnr': '0000' }, { 'randomnr': '0000' }, { upsert: true, save: false }, (err, res) => {
              if (err) console.log(err);
              if(res) console.log(`updated: randomnr 0000`);
            })
            dbo.collection('externalvars' + store.dbSwitch).updateOne({ 'todaysdate': '0000' }, { 'todaysdate': '0000' }, { upsert: true, save: false }, (err, res) => {
              if (err) console.log(err);
              if(res) console.log(`updated: todaysdate 0000`);
            })
            dbo.collection('externalvars' + store.dbSwitch).updateOne({ 'sheet': newSheet }, { 'sheet': newSheet }, { upsert: true, save: false }, (err, res) => {
              if (err) console.log(err);
              if(res) console.log(`updated: sheet ${newSheet}`);
            })
            dbo.collection('externalvars' + store.dbSwitch).updateOne({ 'currentalphabet': 'first' }, { 'currentalphabet': 'first' }, { upsert: true, save: false }, (err, res) => {
              if (err) console.log(err);
              if(res) console.log(`updated: sheet 0000`);
            })
          }
        });
        console.log("dropping table people");
        dbo.dropCollection('people' + store.dbSwitch, (err, res) => {
          console.log("Trying to create table externalvars");
          dbo.createCollection('people' + store.dbSwitch, (err, res) => {
            console.log("People table succesfully created"); 
            db.close();
          })
        });
      });
    });
  },


  getAllPeople: async () => {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      dbo.collection('people' + store.dbSwitch).find({}).toArray(function(err, result) {
        if (err) throw err;
        const people = result.reduce((acc, val) => {
          acc.push({name: Object.keys(val)[1], points: val.points});
          return acc;
        }, []);
        db.close();

        const alphabeticlySortedPeople = people.sort((a, b) => a.name.localeCompare(b.name));
        
        store.people = alphabeticlySortedPeople;
      });
    });
  }









}
module.exports = dbHelper;