require('dotenv').config();
const express = require('express');
var fs = require('fs-extra');
var path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors')
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

app.use(cors())
app.use('/covers', express.static('covers'));
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
    const art = await db
      .collection('arts')
      .find({ code: req.query.code })
      .toArray();
    res.status(200).json(art);
  } catch (err) {
    console.log(err);
    throw err;
  }
});

app.post('/art', async (req, res) => {
  try {
    if (req.body.code) {
      if (req.body.base64) {
        let base64Image = req.body.base64.split(';base64,').pop();
        var png = new Buffer.from(base64Image, 'base64');
        fs.writeFileSync(
          path.join(__dirname, 'covers', req.body.code + '.png'),
          png,
          {
            encoding: 'base64',
          },
        );
      }
      let art = await db
        .collection('arts')
        .find({ code: req.body.code })
        .toArray();

      if (art.length > 0) {
        var newvalues = { $set: {name:req.body.name, json: req.body.json, cover: '/covers/'+req.body.code+'.png'} };
        db.collection('arts').updateOne(
          { code: req.body.code },
          newvalues,
          function (err, res) {
            if (err) throw err;
            res.status(200).json({ updated: true });
          },
        );
      } else {
        var myobj = {
          code: req.body.code,
          name: req.body.name,
          json: req.body.json,
          cover: '/covers/' + req.body.code + '.png',
        };
        db.collection('arts').insertOne(myobj, function (err, res) {
          if (err) throw err;
          res.status(200).json({ inserted: true });
        });
      }
    } else {
      var code = uuidv4();
      if (req.body.base64) {
        let base64Image = req.body.base64.split(';base64,').pop();
        var png = new Buffer.from(base64Image, 'base64');
        fs.writeFileSync(
          path.join(__dirname, 'covers', code + '.png'),
          png,
          {
            encoding: 'base64',
          },
        );
      }
      var myobj = {
        name: req.body.name,
        json: req.body.json,
        code : code,
        cover: '/covers/' + code + '.png',
      };
      db.collection('arts').insertOne(myobj, function (err, res) {
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
