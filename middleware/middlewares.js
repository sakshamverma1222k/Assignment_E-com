const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "Your_Email_Id",
    pass: "Your_Email's_Password",
  },
});

module.exports = transporter;
