/* eslint-disable no-unused-vars */
import React from 'react'
import Header from './components/Header'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TripDetailsPage from './pages/TripDetailsPage'
import EmployeeExpenseReportPage from './pages/EmployeeExpenseReportPage'
import EmployeeDetailPage from './pages/EmployeeDetailPage'

const MainContainer = () => {
  return (
      <div className='relative'>
          <Header />
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/trip/:tripid" element={<TripDetailsPage />} />
              <Route path="/trip/employee-expense-report/:tripId" element={<EmployeeExpenseReportPage />} />
              <Route path="/employee-detail" element={<EmployeeDetailPage/>}/>
          </Routes>
    </div>
  )
}

export default MainContainer