const express = require("express");
const mongoose = require("mongoose");

const requireLogin = require("../middleware/requireLogin");

const router = express.Router();
const Post = mongoose.model("Post");

router.get("/allpost", requireLogin,(req, res) => {
  Post.find()
    .populate('postedBy', "_id name")
    .then((posts) => res.json({posts}))
    .catch((err) => console.log("err:", err));
});

router.get("/mypost",requireLogin, (req, res) => {
  Post.find({postedBy: req.user._id})
    .populate('postedBy', "_id name")
    .then((posts) => res.json({posts}))
    .catch((err) => console.log("err:", err));
});

router.post("/createpost", requireLogin, (req, res) => {
  const { title, body, photoURL } = req.body;
  if (!title || !body || !photoURL) {
    console.log('title', title)
    console.log('body', body)
    console.log('photoURL', photoURL)
    res.status(422).json({
      error: "Plz input all fields.",
    });
  }
  req.user.password = undefined;
  const newPost = new Post({
    title,
    body,
    photoURL,
    postedBy: req.user,
  });
  newPost
    .save()
    .then((result) => {
      res.json({ result: result });
    })
    .catch((err) => console.log("err:", err));
});

module.exports = router;
