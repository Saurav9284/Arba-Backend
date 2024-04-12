const UserModel = require('../Models/user.model');
const bcrypt = require('bcrypt');
const multer = require('multer')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
const express = require('express')
require('dotenv').config()
  
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

const UserController = express.Router()

const storage = multer.memoryStorage();

const upload = multer(({storage})).single('avatar');



UserController.post('/register', async (req, res) => {

  const { fullName, userName, email, password } = req.body;

  
  try {
    const exist = await UserModel.findOne({ email })

    if(exist){
      return res.send({msg:'User Already exists'})
    }
    upload(req, res, async function (err) {

      if (err instanceof multer.MulterError) {
        console.error('Error uploading file:', err);
        return res.status(500).json({ msg: 'Error uploading file' });

      } else if (err) {
        console.error('Unexpected error:', err);
        return res.status(500).json({ msg: 'Unexpected error' });
      }
    
      

      let avatarUrl = 'https://toppng.com/uploads/preview/icons-logos-emojis-user-icon-png-transparent-11563566676e32kbvynug.png'; 

      if (req.file) {
        try {
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ public_id: "profile-avatar" }, (err, result) => {
              if (err) reject(err);
              else resolve(result.url);
            }).end(req.file.buffer);
          });
    
          avatarUrl = result; 
        } catch (error) {
          console.error('Error uploading file to Cloudinary:', error);
          return res.status(500).json({ msg: 'Error uploading file to Cloudinary' });
        }
      }
    
      const hashedPassword = await bcrypt.hash(password, 10);
    
      const newUser = await UserModel.create({
        fullName,
        userName,
        email,
        password: hashedPassword,
        avatar: avatarUrl 
      });
    
      res.json({ message: "SignUp successful", user: newUser });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send("Server Error");
  }
});



UserController.post('/login',async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(200).json({ token, user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error);
  }
});



UserController.post('/email',async (req, res) => {
  try {
    const {email} = req.body;
    let user = await UserModel.findOne({email});
    console.log(user)
    res.status(200).send(user._id)
  } catch (error) {
    res.status(500).send(error);
  }
});



UserController.patch('/update/password',async (req, res) => {
  try {
    const {_id, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    let user = await UserModel.findByIdAndUpdate( _id, { password : hashedPassword }, {new : true});
    
    res.send(user.password)
    
  } catch (error) {
    res.status(500).send(error);
  }
});



UserController.patch('/update/profile',async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.error('Error uploading file:', err);
        return res.status(500).json({ msg: 'Error uploading file' });
      } else if (err) {
        console.error('Unexpected error:', err);
        return res.status(500).json({ msg: 'Unexpected error' });
      }
      const { _id, fullName, userName, avatar } = req.body;

      let user = await UserModel.findById(_id);

      if (fullName) user.fullName = fullName;
      if (userName) user.userName = userName;
      if (req.file) {
        try {
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ public_id: "profile-avatar" }, (err, result) => {
              if (err) reject(err);
              else resolve(result.url);
            }).end(req.file.buffer);
          });
    
          user.avatar = result; 
        } catch (error) {
          console.error('Error uploading file to Cloudinary:', error);
          return res.status(500).json({ msg: 'Error uploading file to Cloudinary' });
        }
      }
      res.status(200).json( user );
      await user.save();
    })
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error);
  }
});


module.exports = UserController;