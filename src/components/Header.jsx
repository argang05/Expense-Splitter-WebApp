/* eslint-disable no-unused-vars */
import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { DataContext } from '../contexts/UserContext'

const Header = () => {
    const { user, handleLogout } = useContext(DataContext);
    console.log(user);
  return (
      <div className='w-full h-24 bg-emerald-800 flex items-center justify-between px-5'>
          <h1 className='text-xl font-semibold'>Hello, {user?.empName}!! 👋</h1>
          <div className='w-[20%] max-h-full flex items-center justify-between'>
              <NavLink>Employee Records</NavLink>
              <button onClick={handleLogout} className='px-5 py-5 h-8 bg-red-600 font-bold text-white rounded-xl cursor-pointer flex items-center justify-center'>
                  Logout
              </button>
          </div>
    </div>
  )
}

export default Header