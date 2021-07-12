require('dotenv').config();
const express = require('express');
const app = express();

/**
 * Import MongoClient & connexion à la DB
 */
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = process.env.dbname || 'designer';
const port = process.env.port || 8989;
let db;

MongoClient.connect(url, function (err, client) {
  console.log('Connected successfully to server');
  db = client.db(dbName);
});

app.use(express.json());

app.get('/arts', async (req, res) => {
  try {
    const arts = await db.collection('arts').find({}).toArray();
    res.status(200).json(arts);
  } catch (err) {
    console.log(err);
    throw err;
  }
});

app.get('/art', async (req, res) => {
  try {
    const art = await db.collection('designer').find({ code:req.query.code }).toArray();
    res.status(200).json(art);
  } catch (err) {
    console.log(err);
    throw err;
  }
});

app.post('/art', async (req, res) => {
  try {
    let art = await db.collection('designer').find({ code:req.query.code }).toArray();

    if(art.length > 0) {
      var newvalues = { $set: req.body };
      db
        .collection('designer')
        .updateOne({code:req.body.code}, newvalues, function (err, res) {
          if (err) throw err;
          res.status(200).json({updated:true})
        });
    } else {
      var myobj = req.body;
      db.collection('designer').insertOne(myobj, function (err, res) {
        if (err) throw err;
        res.status(200).json({ inserted: true });
      });
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
});

app.listen(port, (args) => {
  console.log(`Serveur à l'écoute au port : ${port}`);
});
