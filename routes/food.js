const express = require("express");
const router = express.Router();
const { Food, validateCreateFood } = require("../models/Food");
const upload = require("../uploads/upload"); // get the multer upload
const fs = require("fs");

/**
@desc get all foods
@route /food
@method get
@access public
**/
router.get("/", async (req, res) => {
  try {
    const foodList = await Food.find();
    res.status(200).json({ data: foodList, success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

/**
@desc post food
@route /food/add
@method post
@access private
**/
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { error } = validateCreateFood(req.body);
    if (error) {
      return res.status(400).json({ errorMessage: error.details[0].message });
    }
    // lets take the file name and transfor him to string
    const imageFileName = `${req.file.filename}`;
    const food = new Food({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      rating: req.body.rating,
      image: imageFileName,
    });
    await food.save();
    res.status(200).json({ message: "Food added successfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

/**
@desc delete food by id fom body
@route /food/delete
@method post
@access private
**/
router.post("/delete", async (req, res) => {
  try {
    const food = await Food.findById(req.body.id);
    if (food) {
      // delete the image of food from the uploads/images folder
      fs.unlink(`uploads/images/${food.image}`, () => {});

      await Food.findByIdAndDelete(req.body.id);
      res
        .status(200)
        .json({ message: "Food deleted successfully", success: true });
    } else {
      res.status(404).json({ errorMessage: "Food not found", success: false });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

/**
@desc delete all foods
@route /food/deletealldata
@method post
@access private
**/
router.post("/deletealldata", async (req, res) => {
  try {
    const food = await Food.deleteMany();
    if (food) {
      res
        .status(200)
        .json({ message: " All Foods deleted successfully", success: true });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong", success: false });
  }
});

module.exports = router;
