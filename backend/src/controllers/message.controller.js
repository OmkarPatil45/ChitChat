import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import { getReceiverSocketId } from "../lib/socket.js";
import { io } from "../lib/socket.js";

export const getAllContacts = async(req,res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("Error in getAllContacts:", error)
        res.status(500).json({message: "Server error "})
    }
}

export const getMessagesByUserId = async(req, res) => {
    try {
        const myId = req.user._id;
        const { id: userToChatId } = req.params;

        // 2 possibilities while finding msgs whether i am the sender or receiver
        // hence used the $or operator
        const message = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId},
                { senderId: userToChatId, receiverId: myId },
            ],
        })
        // send the msgs back to client 
        res.status(200).json(message)
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const sendMessage = async (req,res) => {
    try {
        const { text, image } = req.body;
        const senderId = req.user._id;
        const { id: receiverId } = req.params;
        
        if(!text && !image){
            return res.status(400).json({ message: "Text or image is requiredd."})
        }
        if (senderId.equals(receiverId)){
            return res.status(400).json({message: "cannot send messages to yourself."})
        }
        const receiverExists = await User.exists({ _id: receiverId})
        if (!receiverExists){
            return res.status(404).json({ message: "Receiver not found."})
        }

        let imageUrl;
        if (image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        await newMessage.save();

        
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message)
        res.status(500).json({message: "Internal Server error "});
    
    }
};

export const getChatPartners = async (req,res) => {
    try {
        const loggedInUserId = req.user._id

        //finding all msgs where the logged-in user is either sender or receiver
        const messages = await Message.find({
            $or: [{ senderId: loggedInUserId },
                { receiverId: loggedInUserId}],
        });

        const chatPartnerIds = [
            ...new Set(
                messages.map((msg) => 
                    msg.senderId.toString() === loggedInUserId.toString()
                        ? msg.receiverId.toString()
                        : msg.senderId.toString()
                )
            )
        ];

        const chatPartners = await User.find({_id: {$in:chatPartnerIds}}).select("-password")

        // will fetch all partners we have
        res.status(200).json(chatPartners)
    } catch (error) {
        console.error("Error in getChatPartners: ", error.message);
        res.status(500).json({ error: "Internal server error"});
    }
}