var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var MongoClient = require('mongodb').MongoClient
var mongodb = require('mongodb');

var PORT = 8080;
var app = express();
// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://heroku_xt011v1w:password123456789@ds121026.mlab.com:21026/heroku_xt011v1w";
// mongoose.connect(MONGODB_URI);
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/nytimes";

mongoose.connect(MONGODB_URI);
//lets require/import the mongodb native drivers.


//We need to work with "MongoClient" interface in order to connect to a mongodb server.
// var MongoClient = mongodb.MongoClient;

// // Connection URL. This is where your mongodb server is running.

// //(Focus on This Variable)
// var url = 'mongodb://heroku_3jp3nqll:password123456789@ds221416.mlab.com:21416/nytimes' ;      
// //(Focus on This Variable)

// // Use connect method to connect to the Server
//   MongoClient.connect(url, function (err, db) {
//   if (err) {
//     console.log('Unable to connect to the mongoDB server. Error:', err);
//   } else {
//     console.log('Connection established to', url);

//     // do some work here with the database.

//     //Close connection
//     // db.close();
//   }
// });

// mongoose.connect(MONGODB_URI, function (err) {
//   if (err) console.error(err);
//   else console.log('mongo connected');
// });

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
// mongoose.connect("mongodb://localhost/nytimes", { useNewUrlParser: true });

app.get("/scrape", function (req, res) {
  db.Article.remove({}, function (err, data) {
    axios.get("https://www.nytimes.com/section/politics").then(function (response) {
      // console.log(response.data)
      var $ = cheerio.load(response.data);
      //starting path for scraping info
      $("article").each(function (i, element) {
        // console.log(element)  
        var result = {};
        //grabs the headlines, link and summary from nytimes
        result.title = $(this)
          .find("h2").find("a")
          .text();
        result.link = $(this) //does not work
          .find("div.css-1dqkjed").find("a")
          .attr("href");
          if( $(this).find("div.css-1dqkjed").find("a").attr("href") === "undefined"){
            $(this).text("This links does not")
          }
        result.summary = $(this)
          .find("p")
          .text();
        // console.log(result)

        db.Article.create(result)
          .then(function (dbArticle) {
            // View the added result in the console
          })
          .catch(function (err) {
            console.log(err);
          });
      });
    });
    res.send("Scrape Complete");
  });
});

app.get("/articles", function (req, res) {
  //Route for grabbing all Articles 
  db.Article.find({}, function (err, data) {
    if (err) {
      console.log(err);
    }
    else {
      res.json(data);
    }
  });
  // console.log(req)
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // console.log(req.params)
  db.Article.find({ _id: req.params.id }, function (err, data) {
    if (err) {
      console.log(err);
    }
    else {
      // console.log(data)
      res.json(data);
    }
  });
});

// Route for updating an article note
app.post("/articles/:id", function(req, res) {

  db.Note.create(req.body)

    .then( dbNote => db.Article.findOneAndUpdate(
            {_id:req.params.id},
            {$set:{note:dbNote._id}})           
    )
    .then(dbArticle => res.json(dbArticle))
    .catch( err => res.json(500, err))
  });
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/index.html"))
})

app.get("/notes", function (req, res) {
  //Route for grabbing all Articles 
  db.Note.find({}, function (err, data) {
    if (err) {
      console.log(err);
    }
    else {
      res.json(data);
    }
  });
  // console.log(req)
});


// Start server
app.listen(PORT, function () {
  console.log("App running on port " + PORT);
});
