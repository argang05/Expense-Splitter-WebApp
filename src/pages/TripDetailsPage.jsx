/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate, NavLink, useNavigate, useParams } from 'react-router-dom';
import TeamMemberDetail from '../components/TeamMemberDetail';
import BillsShortComponent from '../components/BillsShortComponent';
import { DataContext } from '../contexts/UserContext';
import Loader from '../components/Loader';
import CreateBillForm from '../components/CreateBillForm';
import { ToastContainer, toast, Bounce } from 'react-toastify';

const TripDetailsPage = () => {
  const { tripid } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(DataContext);
  const [employee, setEmployee] = useState(null);
  const [tripDetail, setTripDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exchFormLoading, setExchFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [exchangeRateFormVisible, setExchangeRateFormVisible] = useState(false);
  const [newExchangeRate, setNewExchangeRate] = useState("");

  useEffect(() => {
    setEmployee(user);
    async function getTripDetail() {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/id/${tripid}`
      );
      if (response.status === 200) {
        setTripDetail(response.data);
        setLoading(false);
      }
    }
    getTripDetail();
  }, [tripid, user, tripDetail, tripDetail?.exchangeRate]);

  //   async function fetchData() {
  //     const response = await axios.get(
  //       `${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/id/${tripid}`
  //     );
  //     if (response.status === 200) {
  //       setTripDetail(response.data);
  //       setLoading(false);
  //     }
  //   }
  //   fetchData();
  // }, [tripid, tripDetail?.bills]);

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/bills/create-bill/tripId/${tripid}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setLoading(false);
        
        
        navigate(0);
        
        toast.success("Bill Created Successfully!", {
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
        setLoading(false);
        setTimeout(() => {
          toast.error("Failed to create bill!", {
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
        }, 500);
      }
    } catch (err) {
      setLoading(false);
      console.error(
        "Failed to create bill:",
        err.response ? err.response.data : err.message
      );
      toast.error("An error occurred while creating the bill!", {
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


  const formatDate = (timestamp) => {
    const date = new Date(timestamp); // Convert the timestamp to a Date object
    const day = String(date.getDate()).padStart(2, "0"); // Ensure 2 digits
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}-${month}-${year}`; // Return in dd-mm-yyyy format
  };

  const handleExchangeRateSubmit = async (e) => {
    e.preventDefault();
    // console.log("New Exchange Rate:", newExchangeRate);
    try {
      setExchFormLoading(true)
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/update-exchange-rate/empId/${employee?.empId}/tripId/${tripDetail?.id}`,{exchangeRate : newExchangeRate})
      if (response.status === 201) {
        setExchFormLoading(false);
        setExchangeRateFormVisible(false); // Close the form
        toast.success("Exchange Rate Updated Successfully!", {
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
        setTripDetail({...tripDetail , exchangeRate : response.data?.exchangeRate})
      }
    } catch (err) {
      toast.error("Failed to update exchange rate!", {
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
      console.error(
        "Failed to update exchange rate:",
        err.response ? err.response.data : err.message
      );
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="container w-full flex flex-col items-center justify-center">
        <div className='mt-28 w-[90%] mb-4 gap-1 flex items-center justify-start'>
          <span className='text-sm font-semibold text-[#000249] text-start'>
            <NavLink className="sm:text-md" to="/">
              <i className='bx bxs-home bx-flashing' />
            </NavLink>
          </span>
          <span className='text-sm font-semibold text-[#000249] text-start'><i className='sm:text-lg bx bx-right-arrow-alt'></i></span>
          <span className='text-sm font-semibold text-[#000249] text-start'>  
            Trip Details
          </span>
        </div>
        <div className="mb-8 px-5 py-10 flex flex-col align-center gap-5 border-2 border-[#000249] w-[90%] h-[auto] rounded-lg">
          <div className='flex items-center justify-between w-full'>
            <h1 className="text-3xl font-bold text-[#000249]">
              {tripDetail?.tripName.toUpperCase()}:
            </h1>
            <button onClick={()=>{navigate(0)}} className="scale-out rounded-[50%] h-[40px] w-[55px] sm:h-[50px] sm:w-[50px] cursor-pointer text-center font-semibold bg-[#000249]"><i className='bx text-xl sm:text-3xl bx-refresh bx-tada text-center' ></i></button>
          </div>
          <h3 className="text-lg text-[#000249] font-medium">
            Type: {tripDetail?.tripType}
          </h3>
          <h3 className="text-lg text-[#000249] font-medium">
            Purpose: {tripDetail?.tripPurpose}
          </h3>
          <h3 className="text-lg text-[#000249] font-medium">
            Country: {tripDetail?.country}
          </h3>
          <h3 className="text-lg text-[#000249] font-medium">
            Continent: {tripDetail?.continent}
          </h3>
          <h3 className="text-lg text-[#000249] font-medium">
            Trip Date: {tripDetail?.tripDate && formatDate(tripDetail.tripDate)}
          </h3>
          <h3 className="text-lg text-[#000249] font-medium">
            Duration: {tripDetail?.numberOfDays} days
          </h3>
          <h3 className="text-lg text-[#000249] font-medium">
            Number Of Team Members: {tripDetail?.groupStrength}
          </h3>
          {employee?.empId === import.meta.env.VITE_ADMIN_EMPID && (
            <div className="flex items-center justify-items-start gap-1">
              <h3 className="text-lg text-[#000249] font-medium">
                Exchange Rate: {tripDetail?.exchangeRate}
              </h3>
              <button
                className="edit-button"
                onClick={() => setExchangeRateFormVisible(true)}
              >
                <i className="bx bxs-edit-alt bx-tada text-[#F6490D]"></i>
              </button>
            </div>
          )}
          <h3 className="text-xl text-[#000249] font-semibold">
            Team Members:
          </h3>
          <div className="w-full flex flex-col gap-4 items-center justify-between">
            {tripDetail?.groupMembersIds.map((groupMemberId, indx) => (
              <TeamMemberDetail
                key={indx}
                empId={groupMemberId}
                currencySymbol={tripDetail?.currencySymbol}
                tripId={tripDetail.id}
              />
            ))}
          </div>
          <h3 className="text-xl text-[#000249] font-semibold">
            Bill Records:
          </h3>
          <div className="w-full h-auto flex justify-center">
            <button
              className="scale-out h-auto w-[50%] sm:w-[15%] p-4 cursor-pointer text-lg font-semibold bg-[#000249] rounded-2xl"
              onClick={() => setShowForm(true)}
            >
              Add Bill
            </button>
          </div>
          {tripDetail?.bills.length <= 0 ? (
            <div className="h-20 w-full py-6 px-5 bg-[#F6490D] text-white rounded-lg flex items-center justify-between">
              <h1 className="text-2xl font-bold">No Bill Records Found!</h1>
            </div>
          ) : (
            tripDetail?.bills.map((bill) => (
              <BillsShortComponent
                key={bill.id}
                bill={bill}
                currencySymbol={tripDetail?.currencySymbol}
                tripId={tripDetail.id}
              />
            ))
          )}
          <div className="w-full h-auto flex justify-center">
            <NavLink
              to={`/trip/employee-expense-report/${tripDetail?.id}`}
              className="scale-out h-auto w-[80%] sm:w-[40%] text-center p-4 cursor-pointer text-md sm:text-lg font-semibold bg-[#000249] rounded-2xl"
            >
              Calculate Employee Expense Records
            </NavLink>
          </div>
        </div>
        {showForm && (
          <CreateBillForm
            onClose={() => setShowForm(false)}
            tripId={tripDetail?.id}
            tripGroupMembersIds={tripDetail?.groupMembersIds}
            onBillFormSubmit={handleFormSubmit}
          />
        )}
        {exchangeRateFormVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[50%]">
              <h2 className="text-lg font-semibold mb-4">
                Update Exchange Rate
              </h2>
              <form onSubmit={handleExchangeRateSubmit}>
                <label className="block mb-2 font-medium text-gray-700">
                  New Exchange Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newExchangeRate}
                  onChange={(e) => setNewExchangeRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg mb-4 text-gray-800"
                  required
                />
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setExchangeRateFormVisible(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
                  >
                    {exchFormLoading ? "Loading..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
        className="mt-28"
        transition={Bounce}
      />
      </div>
    </>
  );
};

export default TripDetailsPage;
