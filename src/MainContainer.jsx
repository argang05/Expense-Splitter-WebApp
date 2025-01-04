/* eslint-disable no-unused-vars */
import React from 'react'
import Header from './components/Header'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'

const MainContainer = () => {
  return (
      <>
          <Header />
          <Routes>
              <Route path="/" element={ <HomePage/>} />
          </Routes>
    </>
  )
}

export default MainContainer