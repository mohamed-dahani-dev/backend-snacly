const express = require("express");
const router = express.Router();
const { Order } = require("../models/Order");
const { User } = require("../models/User");
const Stripe = require("stripe");
const authMiddleware = require("../middleware/auth");
const dotenv = require("dotenv");
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
@desc placing user order for frontend
@route /order/place
@method post
@access public
**/

router.post("/place", authMiddleware, async (req, res) => {
  // url of frontend
  const frontend_url = "https://frontend-snacly.onrender.com";

  try {
    // create a new order
    const newOrder = new Order({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();

    // clear CartData
    await User.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // link with stripe
    // importent : you must define the variables like price_data not like priceData
    // you can't change anythig from the structure or the keys you have only change the values
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    // create session stripe
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });
    res.status(200).json({ session_url: session.url, success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

/**
@desc verify order
@route /order/verify
@method post
@access public
**/

router.post("/verify", async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success == "true") {
      await Order.findByIdAndUpdate(orderId, { payment: true });
      res.status(200).json({ message: "Paid successfully", success: true });
    } else {
      await Order.findByIdAndDelete(orderId);
      res
        .status(200)
        .json({ errorMessage: "Paid not successfully", success: false });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

/**
@desc user orders for frontend
@route /order/verify
@method post
@access public
**/

router.post("/userorders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.body.userId });
    res.status(200).json({ data: orders, success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

/**
@desc list of orders in admin page
@route /order/list
@method get
@access private
**/

router.get("/list", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json({ data: orders, success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

/**
@desc upading order status
@route /order/status
@method post
@access private
**/

router.post("/status", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.status(200).json({ message: "Status updated", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

module.exports = router;
