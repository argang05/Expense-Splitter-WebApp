/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { DataContext } from '../contexts/UserContext'
import TripShortComponent from '../components/TripShortComponent';
import Loader from '../components/Loader';
import CreateTripForm from '../components/CreateTripForm';
import axios from 'axios';
import { ToastContainer, toast, Bounce } from 'react-toastify';

const HomePage = () => {

  const { user , getAllTrips } = useContext(DataContext);

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false);
  const [employee, setEmployee] = useState(null);
  useEffect(() => {
    setEmployee(user)
    async function storeAllTripsData() {
      setTrips(await getAllTrips(employee?.empId));
      setLoading(false);
    }
    storeAllTripsData();
  }, [getAllTrips,employee?.empId,user]);

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
      toast.success("Trip Added SuccessFully", {
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
    } else {
      toast.error("Error Adding Trip", {
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
  };



  return (
    <>
      {loading && <Loader/>}
        <div className='h-auto py-10 px-10 md:px-12 mt-20 w-min-full flex flex-col gap-6 items-center justify-center'>
          <h1 className='text-3xl md:text-6xl font-bold text-center'>ALL TRIPS</h1>
          <button
            onClick={() => setShowForm(true)}
            className='scale-out h-auto w-full py-4 md:py-8 cursor-pointer px-5 md:px-20 text-xl md:text-4xl font-semibold bg-sky-600 rounded-2xl'
          >
            Add Trip
          </button>
          {trips?.map((trip) => (
            <TripShortComponent key={trip.id} trip={trip} />
          ))}
          {showForm && (
            <CreateTripForm
              onClose={() => setShowForm(false)}
              onSubmit={handleFormSubmit}
            />
          )}
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

export default HomePage