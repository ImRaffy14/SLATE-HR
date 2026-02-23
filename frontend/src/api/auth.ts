import { ErrorResponse } from "@/types";
import { AxiosError } from "axios"
import { Login } from "@/types";
import axiosInstance from "@/lib/axios";

const getErrorMessage = (axiosError: AxiosError<ErrorResponse>): string => {
    if (axiosError.response) {
        return axiosError.response.data.error || axiosError.response.data.message || "Request failed";
    }
    if (axiosError.request) {
        return "Network error - no response from server";
    }
    return "Request failed to be created";
};

export const login = async (credentials: Login) => {
    try {
        const response = await axiosInstance.post(`/api/v1/auth/login`, credentials)
        // Only persist token after a fully completed login.
        if (response.data.token && !response.data.requiresOtp) {
            localStorage.setItem('accessToken', response.data.token);
        }
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>
        throw new Error(getErrorMessage(axiosError))
    }
}

export const verifyOtp = async (challengeId: string, otpCode: string) => {
    try {
        const response = await axiosInstance.post(`/api/v1/auth/verify-otp`, {
            challengeId,
            otpCode
        })
        if (response.data.token) {
            localStorage.setItem('accessToken', response.data.token);
        }
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>
        throw new Error(getErrorMessage(axiosError))
    }
}

export const resendOtp = async (challengeId: string) => {
    try {
        const response = await axiosInstance.post(`/api/v1/auth/resend-otp`, {
            challengeId
        })
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>
        throw new Error(getErrorMessage(axiosError))
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
        throw new Error(getErrorMessage(axiosError))
    }
}

export const getProfile = async () => {
    try {
        const response = await axiosInstance.get(`/api/v1/auth/profile`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>
        throw new Error(getErrorMessage(axiosError))
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