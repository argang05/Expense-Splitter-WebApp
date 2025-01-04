/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from 'react';

export const DataContext = createContext();

const UserContext = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true); // New loading state

    const getAllTrips = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/all`);
            if (response.status === 200) {
                return response.data;
            }
        }catch (err) {
            console.error("Trip Fetch Failed:", err.response ? err.response.data : err.message);
        }
    }

    const storeUserDetails = async (empId) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/employee/empId/${empId}`);
            setUser(response.data)
            
        } catch (err) {
            console.error("User Fetch Failed:", err.response ? err.response.data : err.message);
        }
    } 

    // Function to validate JWT
        const validateToken = () => {
            const token = localStorage.getItem("jwtToken");
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000; // Get current time in seconds
                    if (decodedToken.exp > currentTime) {
                        setLoggedIn(true);
                        storeUserDetails(decodedToken.sub); // Set user info from the decoded token
                    } else {
                        handleLogout(); // Token expired
                    }
                } catch (err) {
                    console.error("Invalid token:", err);
                    handleLogout(); // Clear invalid token
                }
            }
            setLoading(false); // Validation complete
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        setLoggedIn(false);
        setUser(null);
    };

    const handleLogin = async (userData) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/employee/signin`, userData);
            if (response.status === 200) {
                localStorage.setItem("jwtToken", response.data);
                validateToken(); // Validate and set user info after login
                return "User LoggedIn";
            }
        } catch (err) {
            console.error("Login Failed:", err.response ? err.response.data : err.message);
        }
    };

    // Validate token on initial render
    useEffect(() => {
        validateToken();
    }, []);

    return (
        <DataContext.Provider value={{ handleLogin, handleLogout, user, loggedIn , loading, getAllTrips }}>
            {children}
        </DataContext.Provider>
    );
};

export default UserContext;
