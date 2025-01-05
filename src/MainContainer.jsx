/* eslint-disable no-unused-vars */
import React from 'react'
import Header from './components/Header'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TripDetailsPage from './pages/TripDetailsPage'

const MainContainer = () => {
  return (
      <div className='relative'>
          <Header />
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/trip/:tripid" element={<TripDetailsPage/>} />
          </Routes>
    </div>
  )
}

export default MainContainer