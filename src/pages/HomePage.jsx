/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { DataContext } from '../contexts/UserContext'
import TripShortComponent from '../components/TripShortComponent';
import Loader from '../components/Loader';
import CreateTripForm from '../components/CreateTripForm';
import axios from 'axios';

const HomePage = () => {

  const { getAllTrips } = useContext(DataContext);

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    async function storeAllTripsData() {
      setTrips(await getAllTrips());
      setLoading(false);
    }
    storeAllTripsData();
  }, [getAllTrips,trips]);

  const createTrip = async (tripData) => {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/create-trip`, tripData);
    try {
      if (response.status === 201) {
        return {success:true ,  message: "Trip Entity Created Successfully!"};
      } else {
        return {success:false ,  message: "Error Creating Trip!"}
      }
      
    } catch (err) {
      console.error("Login Failed:", err.response ? err.response.data : err.message);
    }
  }



  const handleFormSubmit = (tripData) => {
    console.log("Submitted Trip Data:", tripData);
    // Add your API call to submit the trip data here
    const res = createTrip(tripData);
    if (res.success) {
      alert(res.message)
    } else {
      alert(res.message)
    }
  };



  return (
    <>
      {loading && <Loader/>}
    <div className='h-[auto] py-10 px-20 w-full flex flex-col gap-6 items-center justify-center'>
      <h1 className='text-6xl font-bold'>ALL TRIPS</h1>
      <button onClick={() => setShowForm(true)} className='scale-out h-[auto] w-full py-8 cursor-pointer px-20 text-4xl font-semibold bg-sky-600 rounded-2xl'>Add Trip</button>
      {trips.map((trip) => (
        <TripShortComponent key={trip.id} trip={trip} />
      )
        )}
        {showForm && (
        <CreateTripForm
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
      </div>
    </>
  )
}

export default HomePage