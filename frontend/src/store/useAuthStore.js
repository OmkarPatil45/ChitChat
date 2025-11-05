import { create } from "zustand"
import {axiosInstance} from '../lib/axios'
import toast from "react-hot-toast";

export const useAuthStore = create ((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,

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
            const message = error?.response?.data?.message || "Signup failed";
            toast.error(message);
        } finally{
            set({isSigningUp: false})
        }

    }
}));
// ...existing code...