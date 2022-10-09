const express = require("express");
const { AppRoutes } = require("./route");
const cors = require("cors");
require("dotenv").config();
const connectToDb = require("./db");
const app = express();
app.use(express.json());
app.use(cors());
const { check } = require("express-validator");


connectToDb();
AppRoutes.forEach((route) => {
  app[route.method](
    route.path,
    [
      check("email", "Please Input A Valid Email").isEmail(),
      check(
        "password",
        "Your Provided Password Must Have Equal Or More Than 8 Characters"
      ).isLength({
        min: 8,
      }),
    ],
    (request, response) => {
      route.action(request, response);
    }
  );
});

app.listen(process.env.PORT, () => {
  console.log("express running at port", process.env.PORT);
});
