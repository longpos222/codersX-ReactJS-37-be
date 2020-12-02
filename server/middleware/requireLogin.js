const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../keys");
const User = mongoose.model("User");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(422).json({
      error: "You must login first.",
    });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(422).json({
        error: "You must login first.",
      });
    }
    const { _id } = payload;
    User.findById(_id).then((currentUser) => {
      req.user = currentUser;
      next();
    });
  });
};
