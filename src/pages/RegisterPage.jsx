/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { ToastContainer, toast, Bounce } from "react-toastify";
import axios from "axios";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState({
    empId: "",
    password: "",
    empName: "",
    email: "",
    empTier: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
      try {
        setLoading(true);
      
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/employee/signup`, userData);
      if (response.status === 201) {
          setLoading(false);
          toast.success("Registration Successful", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
          });
          setTimeout(() => {
              navigate("/login")
          },700)
          
      } else {
          setLoading(false);
          toast.error("Error While Registering User!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
        });
      }
      } catch (err) {
          console.error("Trip Fetch Failed:", err.response ? err.response.data : err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      {loading && <Loader />}
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6 py-3">
        <form
          className="flex text-white flex-col gap-5 border-2 border-emerald-500 w-[80%] sm:w-[80%] p-6 rounded-lg shadow-md"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold text-center ">Register</h2>
          <label className="text-lg font-semibold ">Employee ID:</label>
          <input
            className="bg-transparent h-10 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            type="text"
            name="empId"
            placeholder="Enter Employee ID..."
            required
            value={userData.empId}
            onChange={handleChange}
          />
          <label className="text-lg font-semibold">Password:</label>
          <input
            className="bg-transparent h-10 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            type="password"
            name="password"
            placeholder="Enter Password..."
            required
            value={userData.password}
            onChange={handleChange}
          />
          <label className="text-lg font-semibold">Employee Name:</label>
          <input
            className="bg-transparent h-10 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            type="text"
            name="empName"
            placeholder="Enter Employee Name..."
            required
            value={userData.empName}
            onChange={handleChange}
          />
          <label className="text-lg font-semibold">Employee Email:</label>
          <input
            className="bg-transparent h-10 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            type="email"
            name="email"
            placeholder="Enter Employee Email..."
            required
            value={userData.email}
            onChange={handleChange}
          />
          <label className="text-lg font-semibold">Employee Tier:</label>
          <input
            className="bg-transparent h-10 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            type="text"
            name="empTier"
            placeholder="Enter Employee Tier..."
            required
            value={userData.empTier}
            onChange={handleChange}
          />
          <button
            className="bg-emerald-500 text-white font-bold h-10 rounded-lg hover:bg-emerald-600 transition-all"
            type="submit"
          >
            Register
          </button>
        </form>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </>
  );
};

export default RegisterPage;
