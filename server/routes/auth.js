const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../keys");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();
const User = mongoose.model("User");

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(422).json({ error: "Please add all fields" });
  }

  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({
          error: "User already exists with that email.",
        });
      }

      bcrypt.genSalt(12, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          const newUser = new User({
            name,
            email,
            password: hash,
          });
          newUser
            .save()
            .then((user) => {
              res.json({ message: "Sign up Done !!" });
            })
            .catch((error) => console.log(error));
        });
      });
    })
    .catch((err) => console.log(err));
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).json({
      error: "Plz input email or password.",
    });
  }
  User.findOne({ email: email }).then((currentUser) => {
    if (!currentUser) {
      res.status(422).json({
        error: "This user is not exists.",
      });
    }
    bcrypt
      .compare(password, currentUser.password)
      .then((isMatch) => {
        if (isMatch) {
          jwt.sign(
            {
              _id: currentUser._id,
            },
            JWT_SECRET,
            { expiresIn: "1h" },
            (err, token) => {
              if (err) {
                console.log("err:", err);
              }
              res.json({
                token: token,
                message: `Hi ${currentUser.name}, welcome back!`,
                user: {
                  _id: currentUser._id,
                  name: currentUser.name,
                },
              });
            }
          );
        } else {
          res.status(422).json({
            error: "Wrong password.",
          });
        }
      })
      .catch((err) => console.log("err:=>", err));
  });
});

module.exports = router;
