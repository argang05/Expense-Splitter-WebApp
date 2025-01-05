/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { DataContext } from '../contexts/UserContext'
import TripShortComponent from '../components/TripShortComponent';
import Loader from '../components/Loader';

const HomePage = () => {

  const { getAllTrips } = useContext(DataContext);

  const [trips, setTrips] = useState([]);
  const [loading , setLoading] = useState(true)
  
  useEffect(() => {
    async function storeAllTripsData() {
      setTrips(await getAllTrips());
      setLoading(false);
    }
    storeAllTripsData();
  },[])



  return (
    <>
      {loading && <Loader/>}
    <div className='h-[auto] py-10 px-20 w-full flex flex-col gap-6 items-center justify-center'>
      <h1 className='text-6xl font-bold'>ALL TRIPS</h1>
      <button className='scale-out h-[auto] w-full py-8 cursor-pointer px-20 text-4xl font-semibold bg-sky-600 rounded-2xl'>Add Trip</button>
      {trips.map((trip) => (
        <TripShortComponent key={trip.id} trip={trip} />
      )
      )}
      </div>
    </>
  )
}

export default HomePage