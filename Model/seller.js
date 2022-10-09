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
  shop_address: {
    type: String,
    required: true,
  },
});

const sellerSchema = new mongoose.Schema(
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
    mobile: Number,
    otp: {
      type: Number,
    },
    address: [address],
    sellerFeatures: {
      type: Array,
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
    collection: "seller",
  },
  { timestamps: true }
);

const modelB = mongoose.model("seller", sellerSchema);

module.exports = modelB;
