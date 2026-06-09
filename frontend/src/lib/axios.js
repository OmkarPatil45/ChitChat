import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "production" ? "https://chitchat-dh7g.onrender.com" : "/api",
    withCredentials: true,
})
