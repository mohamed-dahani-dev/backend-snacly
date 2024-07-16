const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 4,
      maxLength: 255,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 5,
      maxLength: 255,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
    },
    cartData: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
  { minimize: false }
);

// validation register user
const validateRegisterUser = (bodyparameter) => {
  const schema = Joi.object({
    email: Joi.string().email().trim().min(5).max(255).required(),
    name: Joi.string().trim().min(4).max(255).required(),
    password: Joi.string().trim().min(6).required(),
  });
  // run the validation
  return schema.validate(bodyparameter);
};

// validation login user
const validateLoginUser = (bodyparameter) => {
  const schema = Joi.object({
    email: Joi.string().email().trim().min(5).max(255).required(),
    password: Joi.string().trim().min(6).required(),
  });
  // run the validation
  return schema.validate(bodyparameter);
};

// validation Reset Password
const validateResetPasswordUser = (bodyparameter) => {
  const schema = Joi.object({
    password: Joi.string().trim().min(6).required(),
  });
  // run the validation
  return schema.validate(bodyparameter);
};

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateResetPasswordUser,
};
