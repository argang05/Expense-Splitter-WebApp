/* eslint-disable no-unused-vars */
import React, { useContext, useState } from 'react';
import { DataContext } from '../contexts/UserContext';
import axios from 'axios'; // Ensure Axios is installed: npm install axios

const EmployeeDetailPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
    const [formData, setFormData] = useState({
        empName: '',
        email: '',
        password: '',
        empTier: '',
    });
    const { user, setUser } = useContext(DataContext);

    const getPasswordHiddenSymbol = (len) => {
        const symbol = '*';
        return symbol.repeat(len / 2);
    };

    const openModal = () => {
        setFormData({
            empName: user?.empName || '',
            email: user?.email || '',
            password: getPasswordHiddenSymbol(user?.password.length) || '',
            empTier: user?.empTier || '',
        });
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/employee/update-emp-details/${user?.empId}`, {
                empName: formData.empName,
                email: formData.email,
                password: formData.password !== getPasswordHiddenSymbol(user?.password.length) 
                    ? formData.password 
                    : user?.password, // Only update password if changed
                empTier: formData.empTier,
            });

            if (response.status === 201) {
                // Update user state
                setUser({
                    ...user,
                    empName: formData.empName,
                    email: formData.email,
                    password: response.data.password, // Use updated password from response
                    empTier: formData.empTier,
                });
                setIsModalOpen(false); // Close modal
            }
        } catch (error) {
            console.error('Error updating employee details:', error);
        }
    };

    return (
        <div className='w-full flex items-center justify-center'>
            <div className='mt-40 m-5 px-5 py-10 flex flex-col align-center gap-5 border-2 border-emerald-700 w-[80%] sm:w-[50%] h-[auto] rounded-lg'>
                <h1 className='text-3xl font-bold text-emerald-300 text-center'>EMPLOYEE DETAILS:</h1>
                <h3 className="text-lg text-emerald-200 font-medium">Employee ID: {user?.empId}</h3>
                <h3 className="text-lg text-emerald-200 font-medium">Employee Name: {user?.empName}</h3>
                <h3 className="text-lg text-emerald-200 font-medium">Employee Email: {user?.email}</h3>
                <h3 className="text-lg text-emerald-200 font-medium">Employee Tier: {user?.empTier}</h3>
                <h3 className="text-lg text-emerald-200 font-medium">Employee Password: {getPasswordHiddenSymbol(user?.password.length)}</h3>
                <button
                    className='scale-out h-[auto] w-full py-2 sm:py-4 cursor-pointer px-10 text-xl sm:text-2xl font-semibold bg-sky-600 rounded-2xl'
                    onClick={openModal}
                >
                    Update Employee Details
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50'>
                    <div className='bg-white w-[80%] sm:w-[50%] p-8 rounded-lg'>
                        <h2 className='text-2xl text-emerald-500 font-bold text-center mb-4'>Update Employee Details</h2>
                        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                            <div className='flex flex-col gap-2'>
                                <label className='block font-medium text-gray-700'>Employee Name:</label>
                                <input
                                    type='text'
                                    name='empName'
                                    value={formData.empName}
                                    onChange={handleInputChange}
                                    className='w-full p-2 border rounded text-gray-400'
                                    required
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label className='block font-medium text-gray-700'>Email:</label>
                                <input
                                    type='email'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className='w-full p-2 border rounded text-gray-400'
                                    required
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label className='block font-medium text-gray-700'>Password:</label>
                                <input
                                    type='text'
                                    name='password'
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className='w-full p-2 border rounded text-gray-400'
                                    required
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label className='block font-medium text-gray-700'>Tier:</label>
                                <input
                                    type='text'
                                    name='empTier'
                                    value={formData.empTier}
                                    onChange={handleInputChange}
                                    className='w-full p-2 border rounded text-gray-400'
                                    required
                                />
                            </div>
                            <div className='flex justify-between gap-4 mt-4'>
                                <button
                                    type='button'
                                    onClick={() => setIsModalOpen(false)}
                                    className='px-4 py-2 bg-red-500 text-white rounded'
                                >
                                    Cancel
                                </button>
                                <button type='submit' className='px-4 py-2 bg-emerald-500 text-white rounded'>
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDetailPage;
