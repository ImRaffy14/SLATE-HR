import React from 'react';
import { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { login } from '@/api/auth';
import toast from 'react-hot-toast';
import { AxiosError } from "axios"
import { useNavigate } from 'react-router-dom';
import LOGO from '@/assets/slate-logo.png';


export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        setIsLoading(true)

        try {
            const result = await login({ email, password })
            toast.success(result.message)
            navigate('/')
        } catch (error) {
            const axiosError = error as AxiosError
            setError(axiosError.message)
        } finally { 
            setIsLoading(false)
        }
    };
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-slate-900 to-gray-800 p-4 md:p-8">
            {/* Left side panel */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 w-1/2 text-center h-[510px] hidden md:flex items-center justify-center rounded-l-lg shadow-2xl">
                <div className="">
                    <h1 className="text-4xl font-bold text-gray-100">FREIGHT MANAGEMENT SYSTEM</h1>
                </div>
            </div>

            {/* Right side (Login form) */}
            <div className="w-full max-w-md rounded-lg bg-gray-900 p-6 shadow-lg md:p-8">
                {/* Header */}
                <div className="flex flex-col items-center justify-center space-y-2 mb-6">
                <div className="rounded-full bg-gray-800 p-1">
                    <img src={LOGO} alt="Logo" className="h-15 w-15 rounded-full" />
                </div>
                <h1 className="text-2xl font-bold text-gray-100">Login Admin</h1>
                <div className="flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                    <p className="text-sm font-medium text-gray-400">Restricted Access</p>
                </div>
                </div>

                {/* Error box */}
                {error && (
                <div className="mb-4 rounded-md bg-red-900/50 p-3 text-sm text-red-300 border border-red-700">
                    {error}
                </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-gray-300">
                    Admin Email
                    </label>
                    <input
                    id="username"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    placeholder="admin_username"
                    required
                    />
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Admin Password
                    </label>
                    <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                        ) : (
                        <Eye className="h-5 w-5" />
                        )}
                    </button>
                    </div>
                </div>

                {/* Remember */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                    <input
                        id="remember"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-gray-300 focus:ring-gray-400"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                        Remember device
                    </label>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-md bg-gray-700 py-2 text-sm font-medium text-gray-100 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-75"
                >
                    {isLoading ? "Authenticating..." : "Access Admin Panel"}
                </button>
                </form>

                {/* Footer note */}
                <div className="mt-6">
                <p className="text-center text-sm text-gray-500">
                    <span className="block sm:inline">Unauthorized access is prohibited.</span>
                    <span className="block sm:inline mt-1 sm:mt-0 sm:ml-1">
                    Contact{" "}
                    <a href="#" className="font-medium text-gray-300 hover:text-gray-100">
                        IT Security
                    </a>{" "}
                    for access.
                    </span>
                </p>
                </div>
            </div>
        </div>
    );
}