const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Admin, validateLoginAdmin } = require("../models/Admin");

/**
@desc login admin
@route /admin/login
@method post
@access public
**/

router.post("/login", async (req, res) => {
  try {
    // check validation
    const { error } = validateLoginAdmin(req.body);
    if (error) {
      return res
        .status(400)
        .json({ errorMessage: error.details[0].message, success: false });
    }
    // check if the admin already exists
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      res.status(400).json({
        errorMessage: "email or password incorrect or invalid",
        success: false,
      });
    }

    // check the password is match before login
    if (req.body.password !== admin.password) {
      return res.json({
        errorMessage: "email or password incorrect or invalid",
        success: false,
      });
    }

    // create a new jwt
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY);
    res
      .status(200)
      .json({ token: token, success: true, message: "Login successful" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

module.exports = router;
