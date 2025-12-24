import React, { useState } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContextDefinition';
import { MessageSquare, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

// Define your backend base URL
const API_BASE_URL = 'http://localhost:3000/api';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext)
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(''); // Clear error on input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, formData);
            console.log(response);
            // const { token, user } = response.data;
            login(response.data)
            navigate('/');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            console.error('Login Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white p-4">
            
            {/* Form Container: Dark background, glowing border, subtle shadow */}
            <div className="w-full max-w-sm p-8 space-y-8 bg-gray-900 border border-indigo-700/50 rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.3)] transform transition duration-500 hover:shadow-[0_0_60px_rgba(79,70,229,0.5)]">
                
                {/* Header/Logo */}
                <div className="flex flex-col items-center space-y-2">
                    <MessageSquare className="w-10 h-10 text-indigo-400" />
                    <h2 className="text-3xl font-extrabold text-center text-white tracking-wider">
                        Welcome Back
                    </h2>
                    <p className="text-gray-400 text-sm">Sign in to your multi-lingual chat hub</p>
                </div>
                
                {error && (
                    <div className="p-3 text-sm text-red-300 bg-red-900/40 border border-red-700 rounded-lg" role="alert">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* Email Field with Icon */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-12 block w-full px-3 py-3 border border-gray-700 rounded-lg shadow-inner bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                        />
                    </div>

                    {/* Password Field with Icon */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-12 block w-full px-3 py-3 border border-gray-700 rounded-lg shadow-inner bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 rounded-lg shadow-lg text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Authenticating...' : 'Sign In to TranslaChat'}
                    </button>
                </form>
                
                {/* Registration Link */}
                <p className="text-center text-sm text-gray-500">
                    Need an account? 
                    <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 ml-1 transition duration-200">
                        Create one here.
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;