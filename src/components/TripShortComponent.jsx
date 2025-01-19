/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Loader from './Loader'
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UpdateTripForm from './UpdateTripForm';

const TripShortComponent = ({ trip }) => {
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isBillPresent, setIsBillPresent] = useState(false);

  useEffect(() => {
    if (trip?.bills?.length > 0) {
      setIsBillPresent(true);
    } else {
      setIsBillPresent(false); // Ensure it's explicitly set to `false` when no bills are present
    }
    // console.log("isBillPresent value:", isBillPresent); // Log the updated value
  }, [trip, trip?.bills?.length, isBillPresent]); // Include isBillPresent in the dependency array


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
  const onTripUpdateFormSubmit = async (updatedTripData) => {
    try {
      setPageLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/update-trip/${trip.id}`,
        updatedTripData
      );
      if (response.status === 201) {
        setPageLoading(false);
        toast.success("Trip Updated Successfully!", {
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
        alert("Trip Updated Successfully!")
        navigate(0);
      }
    }
    catch (err) {
      setPageLoading(false);
      console.error(
        "Failed to update trip:",
        err.response ? err.response.data : err.message
      );
      toast.error("An error occurred while updating trip!", {
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
  }
  return (
  <>
      {pageLoading ? <Loader /> :
        <div
          className='h-[auto] w-full py-4 px-5 bg-[#000249] border-[3px] border-[#03abff] text-white rounded-lg flex flex-col gap-4 items-start justify-center bxs'>
          <h1 className='text-2xl sm:text-3xl font-bold'>{trip.tripName}</h1>
          <h2 className='text:lg sm:text-xl font-semibold'>Purpose: {trip.tripPurpose}</h2>
          <h2 className='text:lg sm:text-xl font-semibold'>Type: {trip.tripType}</h2>
          <h2 className='text:lg sm:text-xl font-semibold'>Country: {trip.country}</h2>
      <h2 className='text:lg sm:text-xl font-semibold'>Duration: {trip.numberOfDays} days</h2>
      <div className='flex items-center justify-start w-full gap-4'>
          <NavLink to={`/trip/${trip?.id}`} className='scale-out bg-emerald-500 text-white px-4 py-2 rounded-md'>View More...</NavLink>
            <button onClick={handleTripDeletion} className='scale-out bg-red-500 text-white px-4 py-2 rounded-md'>
              <i className='bx bxs-trash text-xl'></i>
            </button>
            {!isBillPresent && <button onClick={() => setShowUpdateModal(true)} className='scale-out bg-sky-500 text-white px-4 py-2 rounded-md'>
              <i className='bx bxs-edit-alt bx-tada text-xl' ></i>
            </button>}
      </div>
      </div>}
      {showUpdateModal && (
        <UpdateTripForm
          trip={trip}
          onClose={() => setShowUpdateModal(false)} 
          onTripUpdateFormSubmit={onTripUpdateFormSubmit}
          />
      )}
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

export default TripShortComponent