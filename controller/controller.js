require("dotenv").config();
const { validationResult } = require("express-validator");
const modelA = require("../Model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let scretKey = process.env.JWT_SECRET_KEY;
const modelB = require("../Model/seller");
const modelC = require("../Model/admin");
const transporter = require("../middleware/middlewares");
let randNum = 0;
let RandomNumber = () => {
  return (randNum = Math.floor(Math.random() * 100000));
};

let mailOptions = {
  from: "Your_Email_Id",
  to: "Reciever_Email_Id",
  subject: `Verify Your Email`,
  text: `Plese Verify Your Email, Your Otp Is ${randNum}`,
};

async function basic(req, res) {
  res.send(`Hello There! You're on Port: ${process.env.Port}`);
}
async function signup(req, res) {
  let { email, password, name, age, mobile, userIntrests } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  const salt = await bcrypt.genSalt(10);
  let hashPass = await bcrypt.hash(password, salt);
  try {
    const user = await modelA.create({
      name,
      email,
      password: hashPass,
      age,
      mobile,
      userIntrests,
      type: "user",
    });
    res.status(201);
    console.log(user);
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
        type: "user",
        userId: user._id,
        intrests: user.userIntrests,
      },
      scretKey
    );
    console.log("user created successfuly");
    res.send({
      token: token,
      message:
        "Your Registration Is Successfully Processed, Please Verify Your Email-Id To Complete Registration",
    });
  } catch (error) {
    res.status(400);
    console.log(error);
    if (error.code == 11000) {
      res.send("duplication in key of one of provided fields");
    }
    res.send({ error: error });
  }
}

async function emailVerify(req, res) {
  try {
    let tokenA = req.headers.authorization;
    token = tokenA.split(" ");
    const verified = jwt.verify(token[1], scretKey);
    if (verified.type == "user") {
      let { city, state, postal_code, country, main_address_text, dob } =
        req.body;
      let address = { city, state, postal_code, country, main_address_text };
      let Dob = dob;
      RandomNumber();
      let updateOTP = await modelA.updateOne(
        { email: verified.email },
        { $set: { otp: randNum, address: [address], dob: Dob } }
      );
      console.log(updateOTP);
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.send(error);
        } else {
          console.log("Email sent: " + info.response);
          res.send({
            message:
              "Verify Your Requested Email With Given OTP sent: " +
              info.response,
          });
        }
      });
    } else if (verified.type == "seller") {
      let { city, state, postal_code, country, shop_address } = req.body;
      let address = { city, state, postal_code, country, shop_address };
      RandomNumber();
      let updateOTP = await modelB.updateOne(
        { email: verified.email },
        { $set: { otp: randNum, address: [address] } }
      );
      console.log(updateOTP);
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.send(error);
        } else {
          console.log("Email sent: " + info.response);
          res.send({
            message:
              "Verify Your Requested Email With Given OTP sent: " +
              info.response,
          });
        }
      });
    }
  } catch (e) {
    console.log(e);
    res.status(400);
    res.send({ error: e });
  }
}

async function otpPut(req, res) {
  try {
    let tokenA = req.headers.authorization;
    let otp = req.body.otp;
    token = tokenA.split(" ");
    const verified = jwt.verify(token[1], scretKey);
    if (verified.type == "user") {
      let findOTP = await modelA.findOne({ email: verified.email });
      if (otp == findOTP.otp && findOTP.attempt != 0)
        return (
          res.status(201),
          res.send({
            message: "Registration Completed",
          }),
          await modelA.updateOne(
            { email: verified.email },
            { $set: { verified: true } }
          )
        );
      if (findOTP.verified == false)
        await modelA.updateOne(
          { email: verified.email },
          { $set: { attempt: findOTP.attempt - 1 } }
        );
      if (findOTP.attempt == 1)
        await modelA.deleteOne({ email: verified.email });
      return (
        res.status(434),
        res.send({
          message:
            findOTP.attempt == 1 ? "Registration Failed" : "Please Try Again",
          attempt_left: findOTP.attempt - 1,
        })
      );
    } else if (verified.type == "seller") {
      let findOTP = await modelB.findOne({ email: verified.email });
      if (otp == findOTP.otp && findOTP.attempt != 0)
        return (
          res.status(201),
          res.send({
            message: "Registration As Seller Completed",
          }),
          await modelB.updateOne(
            { email: verified.email },
            { $set: { verified: true } }
          )
        );
      if (findOTP.verified == false)
        await modelB.updateOne(
          { email: verified.email },
          { $set: { attempt: findOTP.attempt - 1 } }
        );
      if (findOTP.attempt == 1)
        await modelB.deleteOne({ email: verified.email });
      return (
        res.status(434),
        res.send({
          message:
            findOTP.attempt == 1 ? "Registration Failed" : "Please Try Again",
          attempt_left: findOTP.attempt - 1,
        })
      );
    }
  } catch (e) {
    res.status(400);
    res.send({ error: e });
  }
}

async function login(req, res) {
  try {
    let { email, password } = req.body;
    let findUser = await modelA.findOne({ email: email });
    let com = await bcrypt.compare(password, findUser.password);
    if (com) {
      const token = jwt.sign(
        {
          name: findUser.name,
          email: findUser.email,
          type: "user",
          userId: findUser._id,
          intrests: findUser.userIntrests,
        },
        scretKey
      );
      return (
        res.status(200),
        res.send({ message: "Successfully Logged In", token: token })
      );
    }
    return res.status(400), res.send({ message: "Something Went Wrong" });
  } catch (e) {
    res.status(400);
    res.send({ error: e });
  }
}

async function loginSeller(req, res) {
  try {
    let { email, password } = req.body;
    let findSeller = await modelB.findOne({ email: email });
    let com = await bcrypt.compare(password, findSeller.password);
    if (com) {
      const token = jwt.sign(
        {
          name: findSeller.name,
          email: findSeller.email,
          type: "seller",
          userId: findSeller._id,
          intrests: findSeller.sellerFeatures,
        },
        scretKey
      );
      return (
        res.status(200),
        res.send({ message: "Seller Successfully Logged In", token: token })
      );
    }
    return res.status(400), res.send({ message: "Something Went Wrong" });
  } catch (e) {
    res.status(400);
    res.send({ error: e });
  }
}

async function signupSeller(req, res) {
  let { email, password, name, mobile, sellerFeatures } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  const salt = await bcrypt.genSalt(10);
  let hashPass = await bcrypt.hash(password, salt);
  try {
    const seller = await modelB.create({
      name,
      email,
      password: hashPass,
      mobile,
      sellerFeatures,
      type: "seller",
    });
    res.status(201);
    console.log(seller);
    const token = jwt.sign(
      {
        name: seller.name,
        email: seller.email,
        type: "seller",
        sellerId: seller._id,
        features: seller.sellerFeatures,
      },
      scretKey
    );
    console.log("seller created successfuly");
    res.send({
      token: token,
      message:
        "Your Registration Is Successfully Processed, Please Verify Your Email-Id To Complete Registration",
    });
  } catch (error) {
    res.status(400);
    if (error.code == 11000) {
      res.send({ error: "duplication in key of one of provided fields" });
    }
    res.send({ error: error });
  }
}

async function getAllUsers(req, res) {
  let tokenA = req.headers.authorization;
  token = tokenA.split(" ");
  const verified = jwt.verify(token[1], scretKey);
  if (verified.type == "admin") {
    let users = await modelA.find(
      {},
      {
        email: 1,
        _id: 0,
        sellerFeatures: 1,
        mobile: 1,
        name: 1,
        address: 1,
        age: 1,
      }
    );
    return res.status(200), res.send({ users: users, message: users.length });
  }
}

async function getAllSeller(req, res) {
  let tokenA = req.headers.authorization;
  token = tokenA.split(" ");
  const verified = jwt.verify(token[1], scretKey);
  if (verified.type == "admin") {
    let users = await modelB.find(
      {},
      { email: 1, _id: 0, userIntrests: 1, mobile: 1, name: 1, address: 1 }
    );
    return res.status(200), res.send({ sellers: users, message: users.length });
  }
}

async function adminLogIn(req, res) {
  try {
    let { email, password } = req.body;
    let findAdmin = await modelC.findOne({ email: email });
    let com = await bcrypt.compare(password, findAdmin.password);
    if (com) {
      const token = jwt.sign(
        {
          email: findAdmin.email,
          type: "admin",
          Id: findAdmin._id,
        },
        scretKey
      );
      return (
        res.status(200),
        res.send({ message: "Admin Successfully Logged In", token: token })
      );
    }
    return res.status(400), res.send({ message: "Something Went Wrong" });
  } catch (e) {
    res.status(400), res.send({ error: e });
  }
}

async function deleteOneUser(req, res) {
  let tokenA = req.headers.authorization;
  let { email } = req.body;
  token = tokenA.split(" ");
  const verified = jwt.verify(token[1], scretKey);
  if (verified.type == "admin") {
    let deleteUser = await modelA.deleteOne({ email: email });
    return res.status(200), res.send({ message: deleteUser });
  }
  return res.status(400), res.send({ error: "something went wrong" });
}

async function deleteOneSeller(req, res) {
  let tokenA = req.headers.authorization;
  let { email } = req.body;
  token = tokenA.split(" ");
  const verified = jwt.verify(token[1], scretKey);
  if (verified.type == "admin") {
    let deleteUser = await modelB.deleteOne({ email: email });
    return res.status(200), res.send({ message: deleteUser });
  }
  return res.status(400), res.send({ error: "something went wrong" });
}

async function updateSellerPassword(req, res) {
  try {
    let tokenA = req.headers.authorization;
    let { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return (
        res.status(401),
        res.send({ error: "Please Provide Both Old_Password & New_Password" })
      );
    }
    token = tokenA.split(" ");
    const verified = jwt.verify(token[1], scretKey);
    if (verified.type == "seller") {
      let seller = await modelB.findOne({ email: verified.email });
      let com = await bcrypt.compare(oldPassword, seller.password);
      if (com) {
        const salt = await bcrypt.genSalt(10);
        let hashPass = await bcrypt.hash(newPassword, salt);
        let updatePass = await modelB.updateOne(
          { email: verified.email },
          { $set: { password: hashPass } }
        );
        console.log("Hii", updatePass);
        return res.status(200), res.send({ message: "Password Updated" });
      }
      return res.status(401), res.send({ message: "Password Doesn't Match" });
    }
    return res.status(401), res.send({ error: "you're not authorized to change seller password" });
  } catch (e) {
    res.status(400), res.send({ error: e });
  }
}

async function updateUserPassword(req, res) {
  try {
    let tokenA = req.headers.authorization;
    let { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return (
        res.status(401),
        res.send({ error: "Please Provide Both Old_Password & New_Password" })
      );
    }
    token = tokenA.split(" ");
    const verified = jwt.verify(token[1], scretKey);
    if (verified.type == "user") {
      let seller = await modelA.findOne({ email: verified.email });
      let com = await bcrypt.compare(oldPassword, seller.password);
      if (com) {
        const salt = await bcrypt.genSalt(10);
        let hashPass = await bcrypt.hash(newPassword, salt);
        await modelA.updateOne(
          { email: verified.email },
          { $set: { password: hashPass } }
        );
        return res.status(200), res.send({ message: "Password Updated" });
      }
      return res.status(401), res.send({ message: "Password Doesn't Match" });
    }
    return res.status(401), res.send({ error: "you're not authorized to change user password" });
  } catch (e) {
    console.log(e)
    res.status(400), res.send({ error: e });
  }
}

module.exports = {
  basic,
  signup,
  login,
  emailVerify,
  otpPut,
  signupSeller,
  loginSeller,
  getAllUsers,
  getAllSeller,
  adminLogIn,
  deleteOneUser,
  deleteOneSeller,
  updateSellerPassword,
  updateUserPassword,
};
