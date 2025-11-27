import { create } from "zustand"
import {axiosInstance} from '../lib/axios'
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";

export const useAuthStore = create ((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
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
           
           toast.success("Account created successfully!")
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
           
           toast.success("Logged in successfully")
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
        } catch (error) {
            toast.error("Logout failed. Please try again.");
            console.log("Logout failed:", error);
        }
    }
}));
