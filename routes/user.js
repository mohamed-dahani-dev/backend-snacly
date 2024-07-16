const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrybt = require("bcrypt");
const {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateResetPasswordUser,
} = require("../models/User");
const nodemailer = require("nodemailer");

/**
@desc register new user
@route /user/register
@method post
@access public
**/

router.post("/register", async (req, res) => {
  try {
    // ckeck validation
    const { error } = validateRegisterUser(req.body);
    if (error) {
      return res.status(400).json({ errorMessage: error.details[0].message });
    }

    // check if the user is already registered
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.json({ errorMessage: "Email already exist", success: false });
    }

    // hashing password
    const salt = await bcrybt.genSalt(10);
    req.body.password = await bcrybt.hash(req.body.password, salt);

    // Create a new user
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    const newUser = await user.save();

    // create a jwt
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY);
    res.status(200).json({ token, success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Somthing went wrong", success: false });
  }
});

/**
@desc login user
@route /admin/login
@method post
@access public
**/

router.post("/login", async (req, res) => {
  try {
    // check validation
    const { error } = validateLoginUser(req.body);
    if (error) {
      return res.status(400).json({ errorMessage: error.details[0].message });
    }
    // check if the user already exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        errorMessage: "email or password incorrect or invalid",
        success: false,
      });
    }

    // unhash the password before login
    const isPasswordMatch = await bcrybt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordMatch) {
      return res.json({
        errorMessage: "email or password incorrect or invalid",
        success: false,
      });
    }

    // create a new jwt
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
    res.status(200).json({ token: token, userName: user.name, success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

// ---------------- Forgot Password ----------------

/**
@desc send forgot password link
@route /user/forgot-password
@method post
@access public
**/

router.post("/forgot-password", async (req, res) => {
  try {
    // check if user if found
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ errorMessage: "user not found", success: false });
    }

    // create new token
    const secret = process.env.JWT_SECRET_KEY + user.password;
    const token = jwt.sign({ email: user.email, id: user.id }, secret, {
      expiresIn: "10m",
    });
    const link = `http://localhost:5173/user/reset-password/${user._id}/${token}`;
    console.log(link);

    // send the link of reset password to the user
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // create the options of email
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: user.email,
      subject: "Reset Password",
      html: `
      <div>
        <h4>Click on the link below to reset your password</h4>
        <p>${link}</p>
      </div>
      `,
    };

    // send the email
    transporter.sendMail(mailOptions, (error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log("email sent successfully " + success.response);
      }
    });
    res.status(200).json({
      message: "Check your email to reset password ",
      sendEmail: true,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

/**
@desc get reset password view
@route /reset-password/:userId/:token
@method get
@access public
**/

router.get("/reset-password/:userId/:token", async (req, res) => {
  try {
    // check if the user is found
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ errorMessage: "user not found", success: false });
    }

    const secret = process.env.JWT_SECRET_KEY + user.password;

    // verify the token
    try {
      jwt.verify(req.params.token, secret);
      res.status(200).json({ email: user.email, success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errorMessage: "somthing wrong! please try again",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

/**
@desc change password
@route /reset-password/:userId/:token
@method Post
@access public
**/

router.post("/reset-password/:userId/:token", async (req, res) => {
  try {
    // validate the password
    const { error } = validateResetPasswordUser(req.body);
    if (error) {
      return res.status(400).json({ errorMessage: error.details[0].message });
    }

    // check if the user is found
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.json({ errorMessage: "user not found", success: false });
    }

    const secret = process.env.JWT_SECRET_KEY + user.password;

    // verify the the token
    try {
      jwt.verify(req.params.token, secret);
      const salt = await bcrybt.genSalt(10);
      req.body.password = await bcrybt.hash(req.body.password, salt);
      user.password = req.body.password;
      await user.save();
      res.status(200).json({
        message: "the password is updated successfully",
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errorMessage: "somthing wrong! please try again",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errorMessage: "somthing wrong! please try again",
      success: false,
    });
  }
});

module.exports = router;
