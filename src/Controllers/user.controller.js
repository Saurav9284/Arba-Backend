const express = require("express");
const UserModel = require("../Models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { upload } = require("../Utils/multer");
const cloudinary = require("../Utils/cloudinary");
const { JWT_SECRET } = require("../Config/db");
const authorization = require("../Middlewares/authorization");
const { check, validationResult } = require("express-validator");

const UserController = express.Router();

const validateRegistration = [
  check("fullName").notEmpty().withMessage("Name is required!"),
  check("userName").notEmpty().withMessage("User name is required!"),
  check("email").isEmail().withMessage("Valid email is required!"),
  check("password").notEmpty().withMessage("Password is required!"),
];

const validateLogin = [
  check("email").isEmail().withMessage("Valid email is required!"),
  check("password").notEmpty().withMessage("Password is required!"),
];

// Register
UserController.post("/register",upload.single("avatar"),validateRegistration,async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, userName, email, password } = req.body;

    try {
      const exist = await UserModel.findOne({ email });

      if (exist) {
        return res.status(400).json({
          msg: "User already exists with this email, try another!",
        });
      }

      cloudinary.uploader.upload(req.file.path, function (error, result) {
        if (error) {
          return res.status(500).json({ msg: "Internal server error" });
        }
        const avatar = result.secure_url;

        bcrypt.hash(password, 5, async function (err, hash) {
          if (err) {
            return res.status(500).json({ msg: "Internal server error" });
          }
          try {
            const user = await UserModel.create({
              fullName: fullName,
              userName: userName,
              email: email,
              password: hash,
              avatar: avatar,
            });
            console.log(user);
            res.status(201).json({ msg: "Signup successful" });
          } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
          }
        });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
);

// Login
UserController.post("/login", validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Please signup first" });
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        return res.status(200).json({
          msg: "Login successful",
          token: token,
          UserData: {
            name: user.fullName,
            userName: user.userName,
            email: user.email,
            avatar: user.avatar,
          },
        });
      } else {
        res.status(401).json({ msg: "Invalid credentials" });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Update profile

UserController.patch("/profile/update",upload.single("avatar"),authorization,async (req, res) => {
    const { fullName, password } = req.body;
    const userId = req.userId;

    try {
      let updates = {};
      if (fullName) updates.fullName = fullName;
      if (password) {
        const hash = await bcrypt.hash(password, 5);
        updates.password = hash;
      }
      if (req.file) {
        // Delete old avatar
        const user = await UserModel.findById(userId);
        if (user.avatar && user.avatar.public_id) {
          await cloudinary.uploader.destroy(user.avatar.public_id);
        }
        // Upload new avatar
        const result = await cloudinary.uploader.upload(req.file.path);
        updates.avatar = result.secure_url;
      }

      const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
        new: true,
      });

      if (!updatedUser) {
        return res.status(404).json({ msg: "User not found" });
      }

      res.status(200).json({ msg: "Profile updated successfully", updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
);

module.exports = UserController;
