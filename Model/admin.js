const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
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
    },
    {
      collection: "admin",
    },
  );
  
  const modelC = mongoose.model("admin", userSchema);
  
  module.exports = modelC;