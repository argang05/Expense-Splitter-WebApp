/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer, Bounce } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ComponentLoader from "./ComponentLoader";
import { DataContext } from "../contexts/UserContext";
import Loader from "./Loader";
import UpdateBillForm from "./UpdateBillForm"; // Import the Update Bill form

const BillsShortComponent = ({ bill, currencySymbol, tripId, trip }) => {
  const { getEmployeeById } = useContext(DataContext);
  const [payerName, setPayerName] = useState(null);
  const [sharesDetails, setSharesDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false); // For Update Modal

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        // Fetch the name of the bill payer
        if (bill?.billPayer) {
          const payer = await getEmployeeById(bill.billPayer, tripId);
          setPayerName(payer?.empName || 'Unknown');
        }

        // Fetch contributors' details if contributerShare exists
        if (bill?.contributerShare) {
          const contributors = await Promise.all(
            Object.entries(bill.contributerShare).map(async ([empId, amount]) => {
              const contributor = await getEmployeeById(empId, tripId);
              return { empName: contributor?.empName || 'Unknown', amount };
            })
          );
          setSharesDetails(contributors);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching bill details:', error);
      }
    };

    fetchBillDetails();
  }, [bill, getEmployeeById, tripId]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

    const handleBillUpdateFormSubmit = async (formData) => {
    try {
      setPageLoading(true);
      // Update bill API call
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/bills/update-bill/billId/${bill?.id}/tripId/${tripId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setPageLoading(false);
        toast.success("Bill Updated Successfully!", {
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
        // Fetch the defaulter list
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/get-defaulter-list/tripId/${tripId}`
        );

        if (res.status === 200 && res.data.length > 0) {
          // Create an array of promises for each toast message
          const toastPromises = res.data.map((defaulter, index) => {
            return new Promise((resolve) => {
              setTimeout(() => {
                toast.warning(
                  `${defaulter.empName} has exceeded the billable limit by ${trip?.currencySymbol} ${(defaulter.excessAmount * trip?.exchangeRate).toFixed(2)}!`,
                  {
                    position: "top-right",
                    autoClose: 7000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                  }
                );
                resolve(); // Resolve the promise after the toast message is shown
              }, index * 1000); // Add a delay of 2 seconds between toasts
            });
          });

          // Wait for all toast messages to be shown before refreshing the page
          await Promise.all(toastPromises);

          // Refresh the page after all toasts are shown
          setTimeout(() => {
            navigate(0);
          }, 7000); // Delay the page refresh to ensure the last toast message is shown
        } else {
          setTimeout(() => {
            navigate(0);
          },3000)
        }
        
      } else {
        setPageLoading(false);
        toast.error("Failed to update bill!", {
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
      setPageLoading(false);
      console.error(
        "Failed to update bill:",
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

  const handleBillDeletion = async () => {
    try {
      setPageLoading(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/bills/delete/billId/${bill?.id}/tripId/${bill?.tripId}`
      );
      if (response.status === 200) {
        setPageLoading(false);
        toast.success("Bill Deleted Successfully!", { position: "top-right", autoClose: 5000, theme: "colored", transition: Bounce });
        navigate(0);
      } else {
        setPageLoading(false);
        toast.error("Bill Deletion Unsuccessful!", { position: "top-right", autoClose: 5000, theme: "colored", transition: Bounce });
      }
    } catch (err) {
      console.error("Bill Deletion Failed", err.response ? err.response.data : err.message);
    }
  };

  return (
    <>
      {loading ? (
        <ComponentLoader />
      ) : (
        <>
          {pageLoading ? (
            <Loader />
          ) : (
            <div className="h-auto w-full py-5 sm:py-3 px-5 bg-[#000249] text-white rounded-lg flex items-center justify-between bxs border-[3px] border-[#03abff]">
              <div className="h-[auto] flex flex-col items-start justify-center gap-4">
                <h2 className="text-sm sm:text-lg font-medium">Bill Type: {bill?.billType || 'N/A'}</h2>
                <h2 className="text-sm sm:text-lg font-medium">
                  Bill Amount: {currencySymbol} {bill?.billAmt || 0}
                </h2>
                {bill?.billDate && (
                  <h2 className="text-sm sm:text-lg font-medium">Bill Date: {formatDate(bill?.billDate)}</h2>
                )}
                <h2 className="text-sm sm:text-lg font-medium">Bill Payer: {payerName || 'N/A'}</h2>
                <h2 className="text-sm sm:text-lg font-semibold">Contribution Record:</h2>
                {sharesDetails.length > 0 ? (
                  sharesDetails.map((share, index) => (
                    <h2 key={index} className="text-sm sm:text-lg font-semibold">
                      {share.empName}: {currencySymbol} {share.amount}
                    </h2>
                  ))
                ) : (
                  <h2 className="text-sm sm:text-lg font-medium">No Contributions</h2>
                )}
              </div>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-2 justify-between w-full">
                        <button onClick={handleBillDeletion} className="scale-out bg-red-500 text-white px-4 py-2 rounded-lg">
                          <i className='bx bxs-trash text-xl' ></i>
                        </button>
                        <button onClick={() => setShowUpdateModal(true)} className="scale-out bg-blue-500 text-white px-4 py-2 rounded-lg">
                          <i className='bx bxs-edit-alt text-xl'></i>
                        </button>
                    </div>
                {bill?.imageUrl ? (
                  <a href={bill?.imageUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      className="w-auto sm:w-52 h-60 border-[3px] border-[#03abff] rounded-lg"
                      src={bill?.imageUrl}
                      alt="food-bill"
                    />
                  </a>
                ) : (
                  <h2 className="text-sm sm:text-lg font-medium text-[#03abff]">No Bill Image</h2>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {showUpdateModal && (
        <UpdateBillForm
          tripDuration={trip?.numberOfDays}
          tripDate={trip?.tripDate}
          tripId={trip?.id}
          bill={bill}
          tripGroupMembersIds={trip?.groupMembersIds}
          onClose={() => setShowUpdateModal(false)} 
          onBillUpdateFormSubmit={handleBillUpdateFormSubmit}
          />
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="mt-28"
        transition={Bounce}
      />
    </>
  );
};

export default BillsShortComponent;
