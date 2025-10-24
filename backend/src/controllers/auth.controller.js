import { generateToken } from "../lib/utils.js"
import User from "../models/user.js"
import bcrypt from "bcryptjs"

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