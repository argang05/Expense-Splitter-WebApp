/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { DataContext } from '../contexts/UserContext';

const Header = () => {
    const { user, handleLogout } = useContext(DataContext);

    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        setEmployee(user);
    }, [user]);

    return (
        <header className="header-container w-full h-24 bg-emerald-800 flex items-center justify-between px-4 md:px-6 fixed">
            <NavLink to="/" className="header-title text-lg font-semibold text-white">
                Hello, {employee?.empName}!! 👋
            </NavLink>
            <div className="header-actions flex items-center gap-4">
                <NavLink to="/employee-detail" className="user-icon text-3xl bx bxs-user bx-tada"></NavLink>
                <button
                    onClick={handleLogout}
                    className="logout-button px-3 py-2 bg-red-600 font-bold text-white rounded-lg"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
