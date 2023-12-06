const User = require("../models/user");
const ForgotPassword = require("../models/forgotPassword");
const { validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
const uuid = require('uuid/v4');
const { sendEmail } = require("../utils/sendEmail");
const path = require('path');
const crypto = require("crypto");
const logger = require("../logger");

exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.error(errors.array()[0].msg);
    return res.status(400).json({
      error: errors.array()[0].msg
    });
  }

  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      logger.error(err);
      return res.status(500).json({
        err: "NOT able to save user in DB"
      });
    }

    const token = jwt.sign({ _id: user._id, role:user.role }, process.env.SECRET);
    res.cookie("token", token, { expire: new Date() + 9999 });
    logger.info("User created successfully");
    res.status(200).json({
      name: user.name,
      email: user.email,
      username: user.username,
      id: user._id,
      token
    });
  });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { username, password } = req.body;

  if (!errors.isEmpty()) {
    logger.error(errors.array()[0].msg);
    return res.status(400).json({
      error: errors.array()[0].msg
    });
  }

  User.findOne({ username })
    .then(user => {
      if (!user) { 
        logger.error("Username does not exists");
        return res.status(400).json({
          error: "Username does not exists"
        });
      }
  
      if (!user.autheticate(password)) {
        logger.error("Username and password do not match");
        return res.status(401).json({
          error: "Username and password do not match"
        });
      }
  
      const token = jwt.sign({ _id: user._id, role:user.role }, process.env.SECRET);
      res.cookie("token", token, { expire: new Date() + 9999 });
  
      const { _id, name, email, username, opento, isOpen } = user;
      logger.info("User signed in successfully");
      return res.json({ user: { id:_id, name, email, token, username, opento, isOpen } });
    })
    .catch(err => {
      console.log(err);
      return res.status(400).json({
        error: "Username does not exists"
      });
    }
  );
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User signout successfully"
  });
  logger.info("User signout successfully");
};

exports.resetPasswordIntitiate = async(req, res) => {
  
  const { email } = req.body;
  console.log(email);

try {
    const user = await User.findOne({ email })
    if(!user) {
      logger.error("User with this Email does not exists");
      return res.status(400).json({
        error: "User with this Email does not exists"
      });
    }
    const resetToken = uuid();
    const forgotPassword = new ForgotPassword({ userId:user._id, resetToken });
    await forgotPassword.save()
  
    const link = `http://localhost:8000/api/resetpassword?token=${resetToken}`;
    await sendEmail(email, "Reset Password", link);
  
    logger.info("Reset Password link has been sent to your email");
    return res.status(200).json({
      message: "Reset Password link has been sent to your email"
    });
  } 
  catch (error) {
    logger.error(error);
    return res.status(500).json({
      error: "Something went wrong"
    });
  }
}

exports.resetPassword = async(req, res) => {
  res.sendFile('resetPassword.html', { root: path.join(__dirname, '../views') });
}

exports.resetPasswordSet = async(req, res) => {
  let { token, password } = req.body;

  try{
    const isTokenValid = await ForgotPassword
    .findOne({ resetToken:token })
    .populate('userId', '_id, salt')
    if(!isTokenValid) {
      return res.status(400).json({
        error: "Invalid Token"
      });
    }
    const salt = await uuid();
    password = await crypto.createHmac("sha256", salt).update(password).digest("hex")
    await User.findByIdAndUpdate(isTokenValid.userId._id, { salt:salt ,encry_password: password }, { new: true })
    await ForgotPassword.deleteOne({ resetToken:token })
    res.status(200).json({
      status:true,
      message: "Password reset successfully"
    });
  }
  catch(error) {
    console.log(error);
    return res.status(500).json({
      error: "Something went wrong"
    });
  }
}
