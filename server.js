var express = require("express");
var path = require("path");
var app = express();
var port = 2000;
var bodyParser = require('body-parser');
var multer = require('multer');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

var mongoose = require("mongoose");
var new_db = "mongodb://localhost:27017/my_symp_tracker_db";

mongoose.Promise = global.Promise;
mongoose.connect(new_db, { useNewUrlParser: true });
var userSchema = new mongoose.Schema({
    name: String,
    email: String,
    pass: String,
    phone: Number
});
var User = mongoose.model("User", userSchema);

var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./img_upload/public/Images");
    },
    filename: function (req, file, callback) {
        callback(null, "uploadedimage.jpg");
    }
});

var upload = multer({ storage: Storage }).array("imgUploader", 3);

// renders initial sign-up/ login page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// renders preliminary questions
app.post("/questions", (req, res) => {
    var myData = new User(req.body);
    myData.save()
        .then(
            res.sendFile(__dirname + "/public/prelimquestions.html"))
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

// should render photo upload page
app.post("/upload", (req, res) => {
        res.sendFile(__dirname + "/img_upload/Index.html");
});

// showing uploaded image before analysis
app.get("/show", function (req, res) {
     return res.render(__dirname + "/img_upload/views/imagepage");
});

// should either render image or error
app.post("/api/Upload", (req, res) => {
  upload(req, res, function (err) {
      if (err) {
          console.log(err);
          return res.end("Something went wrong!");
      }
     res.redirect("/show");
  });
});

// not sure how receiving this data yet !!! purely hypothetical
// ALSO todo: change html site names
// should render respective symptomatic questions site
app.post("/symptomaticquestions", (req, res) => {
  var myData = req; // need specifically the max
  myData.save()
  var situation = max(myData) // need the situation associated w/ that max value
                  // of the symptoms JSON ? or was it an array
  switch(myData) {
    case "Anger":
      res.sendFile(__dirname + "/public/angerquestions.html");
    break;
    case "Fear":
      res.sendFile(__dirname + "/public/fearquestions.html");
    break;
    case "Sadness":
      res.sendFile(__dirname + "/public/sadquestions.html");
    break;
  }
});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});
