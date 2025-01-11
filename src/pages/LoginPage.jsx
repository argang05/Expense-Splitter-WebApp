/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { DataContext } from '../contexts/UserContext';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import Loader from '../components/Loader';
import { ToastContainer, toast, Bounce } from 'react-toastify';

const LoginPage = () => {

  const navigate = useNavigate();

  const { handleLogin, loggedIn, user } = useContext(DataContext);
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState({
    empId: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();
    const response = await handleLogin(userData);
    if (response === "User LoggedIn") {
      setLoading(false)
      toast.success(response, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
      setTimeout(() => {
        navigate("/")
      },700)
    } else {
      setLoading(false)
      toast.error("Incorrect Username Or Password!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,  // Spread previous state
      [name]:value // Dynamically update the changed field
    }))
  }


  return (
    <>
      {loading && <Loader/>}
        <div className='main-container bg-[#111111] h-screen w-100 flex items-center justify-center'>
          <form
        className='flex flex-col align-center bg-[#000249] gap-5 border-2 border-[#03abff] w-[80%] sm:w-[40%] h-[auto] p-5 rounded-lg'
        onSubmit={(e) => { handleSubmit(e) }}
          >
              <h2 className='text-2xl font-bold self-center'>Sign In</h2>
              <label className='text-lg font-bold'>Employee ID:</label>
              <input
                  className='bg-[#F3F3F3] text-[#000249] border-2 border-[#03abff] rounded-xl p-2' type='text' name='empId' placeholder='Enter Employee ID...' required 
                  value={userData.empId}
                  onChange={(e) => {handleChange(e)}}
                  />
              <label className='text-lg font-bold'>Password:</label>
              <input
                  className='bg-[#F3F3F3] text-[#000249] border-2 border-[#03abff] rounded-xl p-2' type='password' name='password' placeholder='Enter Password...' required
                  value={userData.password}
                  onChange={(e) => {handleChange(e)}}          
                  />
          <button className='bg-[#F6490D] text-white font-bold rounded-lg p-2' type="submit">Login</button>
          <span className='text-white text-center font-semibold text-md'>Don&#39;t have an Account ? <NavLink to="/register" className="text-[#F6490D]">Register!</NavLink></span>
        </form>
      </div>
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
      </>
  )
}

export default LoginPage;