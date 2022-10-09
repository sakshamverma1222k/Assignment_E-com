const mongoose = require("mongoose");

const address = new mongoose.Schema({
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postal_code: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  main_address_text: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: Number,
    dob: Date,
    mobile: Number,
    userIntrests: {
      type: Array,
    },
    address: [address],
    otp: {
      type: Number,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempt: {
      type: Number,
      default: 5,
    },
  },
  {
    collection: "user",
  },
  { timestamps: true }
);

const modelA = mongoose.model("user", userSchema);

module.exports = modelA;
