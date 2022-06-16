const express = require("express");
const User = require("../models/User");
const Router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchUser");

const { body, validationResult } = require("express-validator");

//Secret Key for Jason Web Token(JWT)
const JWT_SECRET = "sanketucasc872t21e";

//Route 1: Create New User using POST "/api/auth/createuser". No Login Required
Router.post("/createuser", [body("name", "Enter a valid name").isLength({ min: 3 }), body("email", "Enter valid Email").isEmail(), body("password", "Password too short").isLength({ min: 5 })], async (req, res) => {
  //If there are errors, return Bad Request.
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  try {
    //check if email already exists.
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ success, error: "User Already Exists" });
    }
    //Generate Salt for Password hashing
    const salt = await bcrypt.genSalt(10);
    //Generate Password hash
    const secPass = await bcrypt.hash(req.body.password, salt);

    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
    });
    const data = {
      user: {
        id: user.id,
      },
    };
    success = true;
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({ success, authtoken });
    //res.json(user);
  } catch (error) {
    //Ideally send error to Logger or SQS but for now just log it
    res.status(500).send("Internal Server Error");
  }
});

//Route 2: Authenticate User using POST "/api/auth/login". No Login Required
Router.post("/login", [body("email", "Enter valid Email").isEmail(), body("password", "Password cannot be empty").exists()], async (req, res) => {
  //If there are errors, return Bad Request.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      const success = false;
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }
    const data = {
      user: {
        id: user.id,
      },
    };
    const authtoken = jwt.sign(data, JWT_SECRET);
    const success = true;
    res.json({ success, authtoken });
  } catch (error) {
    //Ideally send error to Logger or SQS but for now just log it
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Route 3: Get Logged in User Detail using POST "/api/auth/getuser".Login Required
Router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    //Ideally send error to Logger or SQS but for now just log it
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = Router;
