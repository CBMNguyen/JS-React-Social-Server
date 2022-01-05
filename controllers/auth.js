const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const serverError = require("../utils/serverError");

// Register
module.exports.register = async (req, res) => {
  try {
    const email = await User.findOne({ email: req.body.email });
    if (email) return res.status(409).json({ message: "email already exist" });
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // create new user
    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    res.status(201).json({ message: "Sign up successful", user });
  } catch (error) {
    serverError(res, error);
  }
};

// Login
module.exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: "Email does not exist" });
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(401).json({ message: "wrong password" });

    const accessToken = jwt.sign(
      { email: user.email, userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: "2h" }
    );
    const refreshToken = jwt.sign(
      { email: user.email, userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: "7d" }
    );
    res
      .status(200)
      .json({ message: "Welcome back!", accessToken, refreshToken });
  } catch (error) {
    serverError(res, error);
  }
};
