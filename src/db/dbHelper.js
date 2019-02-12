const MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

const url = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@ds119445.mlab.com:19445/heroku_wgxl79cm`;
const dbHelper = {
  insert: (data) => {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      let dbo = db.db("heroku_wgxl79cm");
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
      let dbo = db.db("heroku_wgxl79cm");
      console.log("updating: " + data);
      let cellmatcher = { [cell] : /.*.*/ };
      let dataObj = {[cell] : data};      
      dbo.collection('externalvars').updateOne(cellmatcher, dataObj, (err, res) => {
        if (err) console.log(err);
        console.log("updated");
      })
      db.close();
    });
  },
  

  
}

module.exports = dbHelper;

