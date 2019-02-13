const sharedvars = require('../helpers/sharedvars');
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
      let cellmatcher = { [cell]: /.*.*/ };
      dbo.collection('externalvars').find(cellmatcher, (err, res) => {
        if (err) console.log(err);
        res.forEach(e => {
          switch (cell) {
            case 'position': sharedvars.position = e[cell];
              console.log("position is " + sharedvars.position.toString());
              break;
            case 'todaysdate': sharedvars.todaysdate = e[cell];
              console.log("todaysdate is " + sharedvars.todaysdate);
              break;
            case 'randomnr': sharedvars.randomNr = e[cell];
              console.log("randomnr is " + sharedvars.randomNr.toString());
              break;
          }
        });
      })
      db.close();
    });
  },
}
module.exports = dbHelper;