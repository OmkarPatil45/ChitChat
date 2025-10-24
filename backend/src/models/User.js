import mongoose from "mongoose"

//defining schema 
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    profilePic: {
        type: String,
        default: ""
    }
},
    {timestamp: true} // createdAt & updatedAt
)

//Creating model
const User = mongoose.model("User", userSchema)

export default User