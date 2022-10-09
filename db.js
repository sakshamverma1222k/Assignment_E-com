const mongoose = require("mongoose");
const mongodb = require("mongodb");
const modelC = require("./Model/admin");
const bcrypt = require("bcrypt");
require("dotenv").config();

const createAdmin = async () => {
  const salt = await bcrypt.genSalt(10);
  let hashPass = await bcrypt.hash(process.env.PASS, salt);
  const findAdmin = await modelC.find({})
  if(findAdmin.length > 1)
  await modelC.create({
    email: process.env.ADMIN,
    password: hashPass,
    mobile: 1000000000, //admin phone number
    type: "admin",
  });
};

connectToDb = async () => {
  mongoose.connect(
    "mongodb://localhost:27017/signup",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    () => {
      console.log("DB connected"), createAdmin();
    }
  );
};

module.exports = connectToDb;
