// get library and build in methods
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");

// get the database
const connectToMongoDB = require("./config/db");

// get the path of routes
const foodsPath = require("./routes/food"); // import foods from routes files
const userPath = require("./routes/user"); // import user from routes files
const cartPath = require("./routes/cart"); // import cart from routes files
const orderPath = require("./routes/order"); // import order from routes files
const adminPath = require("./routes/admin"); // import admin from routes files

// run dotenv
dotenv.config();

// middlewares
app.use(express.json()); // read the body parameters
app.use(cors()); //use the api from anywhere
app.use("/images", express.static(path.join(__dirname, "uploads/images"))); // read the static file like images

// connect to MongoDB
connectToMongoDB();

// call all routes
app.use("/food", foodsPath);
app.use("/user", userPath);
app.use("/cart", cartPath);
app.use("/order", orderPath);
app.use("/admin", adminPath);

// start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `the server is running in ${process.env.NODE_ENV} on http://localhost:${port}/`
  );
});
