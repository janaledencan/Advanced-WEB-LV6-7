var express = require("express");
var router = express.Router();
const User = require("../models/User");
const passport = require("passport");
const bcrypt = require("bcryptjs");

//  /users/register - Render registration form
router.get("/register", (req, res) => {
  res.render("register");
});

//  /users/login - Render login form
router.get("/login", (req, res) => {
  res.render("login");
});

// Registration route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // First check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    res.redirect("/users/login"); // after registration, go to login
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Handle login POST
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/projects",
    failureRedirect: "/users/login",
    failureFlash: false,
  })
);

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/users/login");
  });
});

module.exports = router;
