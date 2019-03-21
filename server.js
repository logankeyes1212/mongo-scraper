var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = 3000;
var app = express();
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
// mongoose.connect("mongodb://localhost/nytimes", { useNewUrlParser: true });

app.get("/scrape", function (req, res) {
  db.Article.remove({}, function (err, data) {
    axios.get("https://www.nytimes.com").then(function (response) {
      // console.log(response.data)
      var $ = cheerio.load(response.data);
      //starting path for scraping info
      $("article").each(function (i, element) {
        // console.log(element)  
        var result = {};
        //grabs the headlines, link and summary from nytimes
        result.title = $(this)
          .find("h2")
          .text();
        result.link = $(this) //does not work
          .children("a")
          .attr("href");
        result.summary = $(this)
          .find(".css-1rrs2s3").find("li")
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
app.get("/index", function (req, res) {
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
