import { create } from "zustand"
import {axiosInstance} from '../lib/axios'
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create ((set,get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    socket: null,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            // If backend returns 401 -> not authenticated (expected on fresh session)
            if (error?.response?.status === 401) {
                set({ authUser: null });
            } else {
                console.log("Error in authCheck:", error);
                set({ authUser: null });
            }
        } finally{
            set({ isCheckingAuth: false });
        }
    },

    signUp : async(data) => {
        set({isSigningUp: true})
        try {
           const res = await axiosInstance.post("/auth/signup", data);
           set({authUser: res.data});
           
           toast.success("Account created successfully!");

           get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isSigningUp: false})
        }

    },

    login : async(data) => {
        set({isLoggingIn: true})
        try {
           const res = await axiosInstance.post("/auth/login", data);
           set({authUser: res.data});
           
           toast.success("Logged in successfully");

           get().connectSocket();
        } catch (error) {
            
            toast.error(error.response.data.message);
        } finally{
            set({isLoggingIn: false})
        }

    },

    logout : async(data) => {
        try {
           await axiosInstance.post("/auth/logout");
           set({authUser: null});   
           toast.success("Logged out successfully"); 
           
           get().disconnectSocket();
        } catch (error) {
            toast.error("Logout failed. Please try again.");
            console.log("Logout failed:", error);
        }
    },

    updateProfile: async(data) => {
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({authUser: res.data});
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in updating profile:", error);
        }
    },

    connectSocket: () => {
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return

        const socket = io(BASE_URL, {
            withCredentials: true //this ensures cookies are sent with the connection
        })

        socket.connect();

        set({socket});

        //listen for online users event
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds});
        })
    },

    disconnectSocket: () => {
        if(get().socket?.connected) get().socket.disconnect();
    }
}));
