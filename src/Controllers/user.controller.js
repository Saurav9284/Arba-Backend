const express = require('express')
const UserModel = require('../Models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {upload} = require('../Utils/multer')
const cloudinary = require('../Utils/cloudinary')
const {JWT_SECRET} = require('../Config/db')


const UserController = express.Router()

// Register

UserController.post('/register', upload.single('avatar'), async (req,res) => {

    const { fullName , userName , email , password } = req.body

    if(!fullName) {
        return res.send({msg:'Name is required!'})
    }
    if(!userName) {
        return res.send({msg:'User name is required!'})
    }
    if(!email) {
        return res.send({msg:'Email is required!'})
    }
    if(!password) {
        return res.send({msg:'Password is required!'})
    }

    try {
        const exist = await UserModel.findOne({ email });

        if(exist){
            return res.send({msg:'User already exist wih this email, try another!'})
        }

        cloudinary.uploader.upload(req.file.path, function(error, result) {
            
            if(error){
                return res.send({msg:'Internal server error'})
            }
             const avatar = result.secure_url;

             bcrypt.hash(password,5, async function(err,hash) {

                if(err) {
                    return res.send({msg:``})
                }
                try {
                    const user = await UserModel.create({
                        fullName:fullName,
                        userName:userName,
                        email:email,
                        password:hash,
                        avatar:avatar
                    })
                    console.log(user)
                    res.send({msg:'Signup successfull'})
    
                } catch (error) {
                    console.log(error)
                    res.send({msg:'Internal server error'})
                }
            })
        });
        
        
    } catch (error) {
        console.log(error)
        res.send({msg:'Internal servser error'})
    }
});



// Login 

UserController.post('/login', async (req,res) => {

    const { email , password } = req.body;

    if(!email) {
        return res.send({msg:'Email is required!'})
    }
    if(!password) {
        return res.send({msg:'Password is required!'})
    }

    try {
        const user = await UserModel.findOne({ email })
        if(!user){
            return res.send({msg:'Please signup first'})
        }
        bcrypt.compare(password,user.password, function(err,result){
            if(result){
                const token = jwt.sign({userId:user._id},JWT_SECRET)
                return res.send({
                    msg:'Login successfull',
                    token:token,
                    UserData:{
                        name:user.fullName,
                        userName:user.userName,
                        email:user.email,
                        avatar:user.avatar,
                    }
                })
            }
            else{
                res.send({msg:'Invalid credentials'})
            }
        })
    } catch (error) {
        console.log(error)
        res.send({msg:'Internal server error'})
    }
});

module.exports = UserController