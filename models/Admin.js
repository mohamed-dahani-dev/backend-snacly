const mongoose = require("mongoose");
const Joi = require("joi");

const adminSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

// validation login admin
const validateLoginAdmin = (bodyparameter) => {
  const schema = Joi.object({
    email: Joi.string().email().trim().min(5).max(255).required(),
    password: Joi.string().trim().min(6).required(),
  });
  // run the validation
  return schema.validate(bodyparameter);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = { Admin, validateLoginAdmin };
