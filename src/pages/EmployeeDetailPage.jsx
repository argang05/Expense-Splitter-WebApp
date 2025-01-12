/* eslint-disable no-unused-vars */
import React, { useContext, useState } from 'react';
import { DataContext } from '../contexts/UserContext';
import axios from 'axios'; // Ensure Axios is installed: npm install axios
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { NavLink } from 'react-router-dom';

const EmployeeDetailPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
    const [formData, setFormData] = useState({
        empName: '',
        email: '',
        password: 'admin123', // Default initial password
        empTier: '',
    });

    const [btnLoading, setBtnLoading] = useState(false);
    const { user, setUser } = useContext(DataContext);

    // Ensure the correct password is displayed initially
    const openModal = () => {
        setFormData({
            empName: user?.empName || '',
            email: user?.email || '',
            password: user?.password || 'admin123', // Use "admin123" initially
            empTier: user?.empTier || '',
        });
        setIsModalOpen(true);
    };

    // Handle form field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Submit form data to the server
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setBtnLoading(true);

            // Ensure we only send the unhashed password
            const passwordToSend =
                formData.password !== 'admin123' ? formData.password : user?.password;

            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/api/employee/update-emp-details/${user?.empId}`,
                {
                    empName: formData.empName,
                    email: formData.email,
                    password: passwordToSend, // Send either new or existing unhashed password
                    empTier: formData.empTier,
                }
            );

            if (response.status === 201) {
                // Update user state with new details, including the updated unhashed password
                // console.log(response.data)
                setUser({
                    ...user,
                    empName: formData.empName,
                    email: formData.email,
                    password: response.data.password, // Use unhashed password from API response
                    empTier: formData.empTier,
                });

                setFormData((prevData) => ({
                    ...prevData,
                    password: response.data.password // Update the password in form state
                }));

                // console.log(user)

                setBtnLoading(false);
                toast.success('User Details Updated Successfully!', {
                    position: 'top-right',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'colored',
                    transition: Bounce,
                });
                setIsModalOpen(false); // Close the modal
            }
        } catch (error) {
            toast.error('Error Updating User Details!', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'colored',
                transition: Bounce,
            });
            console.error('Error updating employee details:', error);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center">
            <div className="mt-28 w-[80%] sm:w-[95%] mb-2 gap-1 flex items-center justify-start">
                <span className="text-sm font-semibold text-[#000249] text-start">
                    <NavLink className="sm:text-md" to="/">
                        <i className="bx bxs-home bx-flashing" />
                    </NavLink>
                </span>
                <span className="text-sm font-semibold text-[#000249] text-start">
                    <i className="sm:text-lg bx bx-right-arrow-alt"></i>
                </span>
                <span className="text-sm font-semibold text-[#000249] text-start">
                    Employee Detail
                </span>
            </div>
            <div className="m-5 px-5 py-10 flex flex-col align-center gap-5 border-2 border-[#000249] w-[80%] sm:w-[50%] h-[auto] rounded-lg">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#000249] text-center">EMPLOYEE DETAILS:</h1>
                <h3 className="text-md sm:text-lg text-[#000249] font-medium">Employee ID: {user?.empId}</h3>
                <h3 className="text-md sm:text-lg text-[#000249] font-medium">Employee Name: {user?.empName}</h3>
                <h3 className="text-md sm:text-lg text-[#000249] font-medium">Employee Email: {user?.email}</h3>
                <h3 className="text-md sm:text-lg text-[#000249] font-medium">Employee Tier: {user?.empTier}</h3>
                <h3 className="text-md sm:text-lg text-[#000249] font-medium">
                    Employee Password: {user?.password ? (user.password.length > 15 ? user.password.substring(0, 15)+'...' : user.password) : 'admin123'}
                </h3>
                <button
                    className="orange-btn scale-out h-[auto] w-full py-3 sm:py-4 cursor-pointer px-8 sm:px-10 text-lg sm:text-2xl font-semibold bg-[#F6490D] rounded-2xl"
                    onClick={openModal}
                >
                    Update Employee Details
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                    <div className="bg-white mt-28 max-h-[90vh] overflow-y-auto w-[80%] sm:w-[50%] p-8 rounded-lg">
                        <h2 className="text-2xl text-[#000249] font-bold text-center mb-4">
                            Update Employee Details
                        </h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="block font-medium text-gray-700">Employee Name:</label>
                                <input
                                    type="text"
                                    name="empName"
                                    value={formData.empName}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-gray-400"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="block font-medium text-gray-700">Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-gray-400"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="block font-medium text-gray-700">Password:</label>
                                <input
                                    type="text"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-gray-400"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="block font-medium text-gray-700">Tier:</label>
                                <input
                                    type="text"
                                    name="empTier"
                                    value={formData.empTier}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-gray-400"
                                    required
                                />
                            </div>
                            <div className="flex justify-between gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false);  setBtnLoading(false)}}
                                    className="px-4 py-2 bg-red-500 text-white rounded"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded">
                                    {btnLoading ? 'Loading...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                transition={Bounce}
            />
        </div>
    );
};

export default EmployeeDetailPage;
