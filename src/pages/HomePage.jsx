/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataContext } from "../contexts/UserContext";
import Loader from "../components/Loader";
import TripShortComponent from "../components/TripShortComponent";
import CreateTripForm from "../components/CreateTripForm";

const HomePage = () => {
  const { user } = useContext(DataContext);

  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [filter, setFilter] = useState("all"); // Default filter: "all"

  useEffect(() => {
    setEmployee(user);
  }, [user]);

  useEffect(() => {
    if (!employee?.empId) return;

    async function storeAllTripsData() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/all/empId/${employee?.empId}`
        );
        if (response.status === 200) {
          setTrips(response.data);
          setFilteredTrips(response.data); // Initialize filtered trips
          setLoading(false);
        }
      } catch (error) {
        
        setTimeout(() => {
          toast.warning("You Are Not Enrolled In Any Trip!", {
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
        },[500]) 
        console.error("Error fetching trips:", error.message);
        setTrips([]);
        setFilteredTrips([]); // Initialize filtered trips
        setLoading(false);
      }
    }

    storeAllTripsData();
  }, [employee?.empId]);

  const createTrip = async (tripData) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/create-trip`,
        tripData
      );

      if (response.status === 201) {
        const newTrip = response.data; // Get the newly created trip data from the response

        setTimeout(() => {
          toast.success("Trip Added Successfully", {
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
        }, 300);

        setTrips((prevTrips) => [...prevTrips, newTrip]); // Use newTrip instead of tripData
        setFilteredTrips((prevTrips) => [...prevTrips, newTrip]); // Use newTrip instead of tripData
        setLoading(false);
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
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
    }
  };


  const handleFormSubmit = (tripData) => {
    createTrip(tripData);
  };

  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setFilter(selectedFilter);

    const currentDate = new Date().getTime();

    let filteredTrips = [];
    if (selectedFilter === "all") {
      filteredTrips = trips;
    } else if (selectedFilter === "past3") {
      filteredTrips = trips.filter(
        (trip) =>
          currentDate - trip.tripDate <= 3 * 30 * 24 * 60 * 60 * 1000 &&
          currentDate > trip.tripDate
      );
    } else if (selectedFilter === "past6") {
      filteredTrips = trips.filter(
        (trip) =>
          currentDate - trip.tripDate <= 6 * 30 * 24 * 60 * 60 * 1000 &&
          currentDate > trip.tripDate
      );
    } else if (selectedFilter === "past12") {
      filteredTrips = trips.filter(
        (trip) =>
          currentDate - trip.tripDate <= 12 * 30 * 24 * 60 * 60 * 1000 &&
          currentDate > trip.tripDate
      );
    } else if (selectedFilter === "future3") {
      filteredTrips = trips.filter(
        (trip) =>
          trip.tripDate - currentDate <= 3 * 30 * 24 * 60 * 60 * 1000 &&
          trip.tripDate > currentDate
      );
    } else if (selectedFilter === "future6") {
      filteredTrips = trips.filter(
        (trip) =>
          trip.tripDate - currentDate <= 6 * 30 * 24 * 60 * 60 * 1000 &&
          trip.tripDate > currentDate
      );
    } else if (selectedFilter === "future12") {
      filteredTrips = trips.filter(
        (trip) =>
          trip.tripDate - currentDate <= 12 * 30 * 24 * 60 * 60 * 1000 &&
          trip.tripDate > currentDate
      );
    }

    setFilteredTrips(filteredTrips);
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="h-auto py-10 px-10 md:px-12 mt-20 w-min-full flex flex-col gap-6 items-center justify-center">
            <div className="flex flex-row justify-between items-center w-full gap-2 sm:gap-0">
              <h1 className="text-3xl md:text-5xl text-[#000249] font-bold text-center">
                ALL TRIPS
              </h1>
              <select
                value={filter}
                onChange={handleFilterChange}
                className="p-1 sm:p-2 text-lg rounded-md border border-[#000249] bg-[#000249] shadow-md"
              >
                <option className="bg-[#000249]" value="all">All Trips</option>
                <optgroup className="bg-[#000249]" label="Past">
                  <option className="bg-[#000249]" value="past3">Past 3 Months</option>
                  <option className="bg-[#000249]" value="past6">Past 6 Months</option>
                  <option className="bg-[#000249]" value="past12">Past 1 Year</option>
                </optgroup>
                <optgroup className="bg-[#000249]" label="Future">
                  <option className="bg-[#000249]" value="future3">Next 3 Months</option>
                  <option className="bg-[#000249]" value="future6">Next 6 Months</option>
                  <option className="bg-[#000249]" value="future12">Next 1 Year</option>
                </optgroup>
              </select>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="orange-btn scale-out h-auto w-full py-4 md:py-8 cursor-pointer px-5 md:px-20 text-xl md:text-4xl font-semibold bg-[#F6490D] rounded-2xl"
            >
              Add Trip
            </button>

              {(filteredTrips.length > 0) ? 
                filteredTrips.map((trip) => (
              <TripShortComponent key={trip.id} trip={trip} />
                )) : 
                <h1 className="text-2xl text-[#000249] md:text-4xl font-bold text-center">
                No Trips To Show!
                </h1>
              }

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
      )}
    </>
  );
};

export default HomePage;
