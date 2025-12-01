import { ErrorResponse } from "@/types";
import { AxiosError } from "axios"
import { Login } from "@/types";
import axiosInstance from "@/lib/axios";

export const login = async (credentials: Login) => {
    try {
        const response = await axiosInstance.post(`/api/v1/auth/login`, credentials)
        // Store token in localStorage
        if (response.data.token) {
            localStorage.setItem('accessToken', response.data.token);
        }
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
        const response = await axiosInstance.post(`/api/v1/auth/register`, userData, {
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
        const response = await axiosInstance.get(`/api/v1/auth/profile`)
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
        const response = await axiosInstance.post(`/api/v1/auth/logout`, {})
        // Clear token from localStorage on logout
        localStorage.removeItem('accessToken');
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError
        // Clear token even if logout request fails
        localStorage.removeItem('accessToken');
        if (axiosError.request) {
            throw new Error('Network error - no response from server');
        } 
        else {
            throw new Error('Request failed to be created');
        }
    }
}