const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    return res
      .status(404)
      .json({ success: false, errorMesage: "You are not authorized" });
  }
  try {
    // decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    console.log(error);
    res
      .status(401)
      .json({ success: false, errorMesage: "somthing went wrong" });
  }
};

module.exports = authMiddleware;
