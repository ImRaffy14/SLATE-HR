import { ErrorResponse } from "@/types";
import axios, { AxiosError } from "axios"
import { Login } from "@/types";

const urlAPI = import.meta.env.VITE_SERVER_URL

export const login = async (credentials: Login) => {
    try {
        const response = await axios.post(`${urlAPI}/api/v1/auth/login`, credentials, {
            withCredentials: true
        })
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>
        if(axiosError.response){
            throw new Error(axiosError.response?.data.error)
        }
        else if (axiosError.request) {
            throw new Error('Network error - no response from server');
        } 
        else {
            throw new Error('Request failed to be created');
        }
    }
}

export const createAccount = async (userData: FormData)  => {
    try {
        const response = await axios.post(`${urlAPI}/api/v1/auth/register`, userData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>

        if(axiosError.response){
            throw new Error(axiosError.response.data.error)
        }
        else if (axiosError.request) {
            throw new Error('Network error - no response from server');
        } 
        else {
            throw new Error('Request failed to be created');
        }
    }
}

export const getProfile = async () => {
    try {
        const response = await axios.get(`${urlAPI}/api/v1/auth/profile`, {
            withCredentials: true
        })
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>

        if(axiosError.response){
            throw new Error(axiosError.response?.data.error)
        }
        else if (axiosError.request) {
            throw new Error('Network error - no response from server');
        } 
        else {
            throw new Error('Request failed to be created');
        }
    }
}

export const logout = async () => {
    try {
        const response = await axios.post(`${urlAPI}/api/v1/auth/logout`, {}, {
            withCredentials: true
        })

        return response.data
    } catch (error) {
        const axiosError = error as AxiosError
        if (axiosError.request) {
            throw new Error('Network error - no response from server');
        } 
        else {
            throw new Error('Request failed to be created');
        }
    }
}