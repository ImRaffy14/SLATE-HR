import axios, { AxiosError } from "axios"
import {  ErrorResponse } from "../types"

const urlAPI = import.meta.env.VITE_SERVER_URL

export const getUsers = async () => {
    try {
        const result = await axios.get(`${urlAPI}/api/v1/users/list`)
        return result.data.user
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>
        if (axiosError.request) {
            throw new Error('Network error - no response from server');
        } 
        else {
            throw new Error('Request failed to be created');
        }
    }
}

export const editUserCredential = async (data: FormData, id: string) => {
    try {
        const result = await axios.put(`${urlAPI}/api/v1/users/edit/${id}`, data)
        return result.data
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

export const editUserPassword = async (data: { password: string }, id: string) => {
    try {
        console.log('Sending request with:', { data, id }); 
        const result = await axios.put(`${urlAPI}/api/v1/users/changePassword/${id}`, data)
        return result.data
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

export const deleteUser = async (id: string) => {
    try {
        const result = await axios.delete(`${urlAPI}/api/v1/users/delete/${id}`)
        return result.data
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