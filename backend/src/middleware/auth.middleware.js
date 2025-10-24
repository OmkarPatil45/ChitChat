import jwt from "jsonwebtoken"
import User from "../models/user.js"
import { ENV } from "../lib/env.js"
// ** might throw an error
// import dotenv from 'dotenv'
// dotenv.config()


export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if(!token) return res.status(401).json({message: "Unauthorized - No token provided"})

        // if user has token then decode it first
        const decoded = jwt.verify(token, ENV.JWT_SECRET)
        if(!decoded) return res.status(401).json({message: "Unauthorized - Invalid token"})
        
        //if the token is valid then check for the user 
        // and select everything from user credentials except password
        const user = await User.findById(decoded.userId).select("-password")
        if(!user) return res.status(404).json({message: "User not found"})
        
        req.user = user
        next()

        
    } catch (error) {
        console.log("Error in protectRoute middleware", error)
        res.status(500).json({message: "Internal server error"})
    }
}