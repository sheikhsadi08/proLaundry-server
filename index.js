const express = require('express');
const app = express();
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const fs = require('fs-extra');
require('dotenv').config();


const port = 5000;

app.get('/', (req,res) => {
    res.send('working');
  })


app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//  connect to database..
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g00s5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const serviceCollection = client.db("prolaundry").collection("services");
  
    app.get('/services', (req,res) => {
      serviceCollection.find({})
      .toArray((err, items) => {
        res.send(items);
      })
    });

    app.get('/service/:price', (req,res) => {
      serviceCollection.find({ price: req.params.price})
      .toArray((err, items) => {
        res.send(items[0]);
      })
    })
  
    app.post('/addService', (req, res) => {
      const file = req.files.file;
      const title = req.body.title;
      const price = req.body.price;
      const description = req.body.description;
      
     
      const newImg = file.data;
      const encImg = newImg.toString('base64');

      var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
      };

      serviceCollection.insertOne({title, description, price, image})
      .then(result => {
          res.send(result.insertedCount > 0);
      })
    })
});



client.connect(err => {
  const serviceCollection = client.db("prolaundry").collection("orderedServices");

  app.get('/orderedServices', (req,res) => {
    serviceCollection.find({})
    .toArray((err, items) => {
      res.send(items);
    })
  })

  app.post('/orderService', (req, res) => {
    const productOrder = req.body;
    serviceCollection.insertOne(productOrder)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })
});


client.connect(err => {
  const serviceCollection = client.db("prolaundry").collection("reviews");

  app.get('/reviews', (req,res) => {
    serviceCollection.find({})
    .toArray((err, items) => {
      res.send(items);
    })
  });


  app.post('/addReview', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const designation = req.body.designation;
    const description = req.body.description;
    
      const newImg = file.data;
      const encImg = newImg.toString('base64');

      var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
      };

      serviceCollection.insertOne({name, designation, description, image})
      .then(result => {
          res.send(result.insertedCount > 0);
      })
    
  })
});




app.listen(process.env.PORT || port);