/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { DataContext } from '../contexts/UserContext'

const HomePage = () => {

  const { getAllTrips } = useContext(DataContext);

  const [trips, setTrips] = useState([]);
  
  useEffect(() => {
    async function storeAllTripsData() {
      setTrips(await getAllTrips());
    }
    storeAllTripsData();
  },[])



  return (
    <div className='h-screen p-20 w-full flex flex-col gap-4 items-center justify-center'>
      {trips.map((trip) => (
        <div key={trip?.id} className='h-60 w-70 p-5 bg-emerald-500 text-white rounded-lg flex flex-col items-start justify-center'>
          <h1>Name: { trip.tripName}</h1>
          <h2>Purpose: { trip.tripPurpose}</h2>
          <h2>Type: { trip.tripType}</h2>
        </div>
      )
      
      )}
    </div>
  )
}

export default HomePage