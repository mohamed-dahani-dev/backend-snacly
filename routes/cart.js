const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const authMiddleware = require("../middleware/auth");

/**
@desc get cart
@route /cart
@method post
@access public
**/

router.post("/", authMiddleware, async (req, res) => {
  try {
    let cartList = await User.findById(req.body.userId);
    let cartData = await cartList.cartData;
    res.status(200).json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

/**
@desc add to cart
@route /cart/add
@method post
@access public
**/

router.post("/add", authMiddleware, async (req, res) => {
  try {
    let userData = await User.findById(req.body.userId);
    let cartData = await userData.cartData;
    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId]++;
    }
    await User.findByIdAndUpdate(req.body.userId, { cartData });
    res.status(200).json({ message: "Added cart successfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "somthing went wrong", success: false });
  }
});

/**
@desc delete from cart
@route /cart/delete
@method post
@access public
**/

router.post("/delete", authMiddleware, async (req, res) => {
  try {
    let userData = await User.findById(req.body.userId);
    let cartData = await userData.cartData;
    if (cartData[req.body.itemId] > 0) {
      cartData[req.body.itemId]--;
    }
    await User.findByIdAndUpdate(req.body.userId, { cartData });
    res
      .status(200)
      .json({ message: "Cart deleted successfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

module.exports = router;
