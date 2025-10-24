import { generateToken } from "../lib/utils.js"
import User from "../models/user.js"
import bcrypt from "bcryptjs"
import { ENV } from "../lib/env.js"
import cloudinary from "../lib/cloudinary.js"

export const signup =  async (req,res) => {
    const {fullName, email, password} = req.body

    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required to fill"})
        }

        if(password.length < 8){
            return res.status(400).json({message: "The password should be atleast 8 characters"})
        }

        //check if the email is valid or not 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^s@]+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).json({message: "Invalid email format"})
        }


        const user = await User.findOne({email})
        if(user) 
            return res.status(400).json({message:"Email already exists"})

        // pwd hashing 123456 -> sjkhf$hjhd097@_?sd
        const salt = await bcrypt.genSalt(10)  
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })
    
        if(newUser) {
            // generateToken(newUser._id, res)
            // await newUser.save()

            // before generating the token make sure to 
            // save the user to database
            // optimised approach
            // persist user first, then issue auth cookie
            const savedUser = await newUser.save()
            generateToken(savedUser._id, res)
            


            res.status(201).json({
                _id: newUser._id,
                fullName : newUser.fullName,
                email: newUser.email,
                profilepic: newUser.profilePic,
            })

        } else{
            res.status(400).json({message: "Invalid user data"})
        }

    } catch (error) {
        console.log("Error in signup cntroller:", error)
        res.status(400).json({message: "Internal server error"})
    }
}

export const login = async (req, res) => {
    // user is sending the email and pwd that's why using
    const {email, password} = req.body

    if(!email || !password){
        return res.status(400).json({message: "Email and Password are required"})
    }

    try {
        const user = await User.findOne({ email })
        if(!user) return res.status(400).json({message:"Invalid Login Credentials"})
            // never tell the client which one is incorrect: password or email

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid Login Credentials"})

        generateToken(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })
    } catch (error) {
        console.error("Error in login controller:", error)
        res.status(500).json({message: "Internal server error"})
    }
}

export const logout = (_, res) => {
    res.cookie("jwt", "", { maxAge: 0})
    res.status(200).json({ message: "Logged out successfully"})
}

export const updateProfile = async(req,res) => {
    try {
        const { profilePic } = req.body
        if(!profilePic) return res.status(400).json({ message: "Profile pic is required"})
        
            // check for currently authenticated userId
        const userId = req.user._id

        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        // after uploading profilePic updating db
        const updateUser = await User.findByIdAndUpdate(
            userId,
            { profilepic: uploadResponse.secure_url },
            { new: true }
        )

        res.status(200).json(updateUser)
    } catch (error) {
        console.log("Error in update profile:", error)
        res.status(500),json({message: "Internal server error"})
    }
}