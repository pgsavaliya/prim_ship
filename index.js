const express = require("express");
const mongoose = require("mongoose");
const v1 = require("./router/v1");
const app = express();
const path = require("path");
const cors = require("cors");
const setUpModel = require("./model/setup");
require("dotenv").config({ path: path.join(__dirname, "./config/.env") });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,UPDATE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res, next) => {
  res.status(200).json({ message: "Initial Route for Courier Servicing!!" });
});

app.use("/v1", v1);

mongoose.connect(process.env.MONGODB_URL_COURIERSERVICE, (err, result) => {
  if (err) {
    console.log("bufbwe");
    console.log("mongodb connection error: ", err);
  } else {
    let setUpData = setUpModel.find();
    if (setUpData.length > 0) {
      let newSetup = new setUpModel({ isSetup: false });
      let saveData = newSetup.save();
    }
    else {
      console.log("data already exist!!");
    }
    app.listen(process.env.PORT || 1600, () => {
      console.log("Server Started... at: ", process.env.PORT || 1600);
    });
  }
});