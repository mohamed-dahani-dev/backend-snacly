const mongoose = require("mongoose");
const Joi = require("joi");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 255,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      minLength: 10,
      maxLength: 255,
      required: true,
    },
    price: {
      type: Number,
      minLength: 0,
      maxLength: 9999,
      required: true,
    },
    rating: {
      type: Number,
      minLength: 0,
      maxLength: 5,
      required: true,
    },
    category: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 100,
      required: true,
    },
    image: {
      type: String,
      trim: true,
      // required: true,
    },
  },
  { timestamps: true }
);

// validate create food
const validateCreateFood = (bodyParameter) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).max(255).required(),
    description: Joi.string().trim().min(10).max(255).required(),
    price: Joi.number().min(0).max(9999).required(),
    rating: Joi.number().min(0).max(5).required(),
    category: Joi.string().trim().min(3).max(100).required(),
    image: Joi.string().trim(),
  });
  // run the validation
  return schema.validate(bodyParameter);
};

// validate update food
const validateUpdateFood = (bodyParameter) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).max(255),
    description: Joi.string().trim().min(10).max(255),
    price: Joi.number().min(0).max(9999),
    price: Joi.number().min(0).max(5),
    category: Joi.string().trim().min(3).max(100),
    image: Joi.string().trim(),
  });
  // run the validation
  return schema.validate(bodyParameter);
};

const Food = mongoose.model("Food", foodSchema);
module.exports = { Food, validateCreateFood, validateUpdateFood };
