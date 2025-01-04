/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import { DataContext } from "../contexts/UserContext";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
    const { loggedIn, loading } = useContext(DataContext);

    // Show a loading indicator while validation is in progress
    if (loading) {
        return <div>Loading...</div>;
    }

    return loggedIn ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
