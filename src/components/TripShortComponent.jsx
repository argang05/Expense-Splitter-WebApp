/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react'
import { NavLink } from 'react-router-dom'

const TripShortComponent = ({trip}) => {
  return (
      <NavLink to={`/trip/${trip?.id}`}
          className='scale-out h-[auto] w-full py-4 px-5 bg-[#F6490D] border-2 border-[#000249] text-white rounded-lg flex flex-col gap-4 items-start justify-center'>
          <h1 className='text-2xl sm:text-3xl font-bold'>{trip.tripName}</h1>
          <h2 className='text:lg sm:text-xl font-semibold'>Purpose: {trip.tripPurpose}</h2>
          <h2 className='text:lg sm:text-xl font-semibold'>Type: {trip.tripType}</h2>
          <h2 className='text:lg sm:text-xl font-semibold'>Country: {trip.country}</h2>
          <h2 className='text:lg sm:text-xl font-semibold'>Duration: {trip.numberOfDays} days</h2>
      </NavLink>
  )
}

export default TripShortComponent