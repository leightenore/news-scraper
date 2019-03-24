const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const axios = require("axios");
const cheerio = require("cheerio");

const db = require("./models");

const PORT = process.env.PORT || 8080;

const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));


const exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


// Routes

app.get("/", function (req, res) {
    res.render("index")
});

//Get Route for Article Scrape
app.get("/scrape", function (req, res) {

    axios.get("https://old.reddit.com/r/worldnews/").then(function (response) {

        const $ = cheerio.load(response.data);

        $("p.title").each(function (i, element) {

            const result = {};

            result.title = $(this)
                .text();
            result.link = $(this)
                .children()
                .attr("href");

            //instead of children, do .find("h2").text()
            console.log(result);

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

        res.redirect("/");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
            console.log(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route to delete scraped articles
app.get("/delete", function (req, res) {
    db.Article.remove({}, function (err) {
        if (err) throw err;
    })
        .then(function (result) {
            console.log("Articles Deleted");
        })
        .catch(function (err) {
            res.json(err);
        });
    res.redirect("/");
});

//Route for saving articles
app.put("/articles/update", function(req, res) {
    db.Article.findOneAndUpdate({ _id: req.body.id }, { saved : true })
    .then(dbArticle => {
        res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Route for displaying saved articles
app.get("/articles/saved", function (req, res) {
    db.Article.find({ saved : true })
        .then(function (dbArticle) {
            res.json(dbArticle);
            console.log(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id with it's note
app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
