import axios from "axios"
import useAuth from "./useAuth"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})


export default function useSecureAxiox() {
    const { logout } = useAuth
    const navigate = useNavigate();
    useEffect(() => {
        axiosSecure.interceptors.response.use(res => {
            return res
        }, async error => {
            console.log(error.response)
            if (error.res.status === 401 || error.res.status === 403) {
                // logout 
                logout();
                navigate('/login');

            }
        })
    }, [logout, navigate])
    return axiosSecure;
}
