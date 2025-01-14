/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from 'axios'
import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Loader from './Loader'

const TripShortComponent = ({ trip }) => {
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(false);
  const handleTripDeletion = async () => {
    try {
      setPageLoading(true)
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/delete-trip/${trip?.id}`);
      if (response.status === 200) {
        alert("Trip Deleted Successfully!")
        setPageLoading(false);
        navigate(0);
      }
    } catch (err) {
      console.error("Error Deleting Trip", err.response ? err.response.data : err.message);
    }
  }
  return (
  <>
      {pageLoading ? <Loader/> :<div
          className='h-[auto] w-full py-4 px-5 bg-[#000249] border-[3px] border-[#03abff] text-white rounded-lg flex flex-col gap-4 items-start justify-center bxs'>
          <h1 className='text-2xl sm:text-3xl font-bold'>{trip.tripName}</h1>
          <h2 className='text:lg sm:text-xl font-semibold'>Purpose: {trip.tripPurpose}</h2>
          <h2 className='text:lg sm:text-xl font-semibold'>Type: {trip.tripType}</h2>
          <h2 className='text:lg sm:text-xl font-semibold'>Country: {trip.country}</h2>
      <h2 className='text:lg sm:text-xl font-semibold'>Duration: {trip.numberOfDays} days</h2>
      <div className='flex items-center justify-start w-full gap-4'>
      <NavLink to={`/trip/${trip?.id}`} className='scale-out bg-emerald-500 text-white px-4 py-2 rounded-md'>View More...</NavLink>
      <button onClick={handleTripDeletion} className='scale-out bg-red-500 text-white px-4 py-2 rounded-md'>Delete Trip</button>
      </div>
      </div>}
      </>
  )
}

export default TripShortComponent