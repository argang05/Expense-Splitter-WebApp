/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '../contexts/UserContext';
import ComponentLoader from "./ComponentLoader";
import axios from 'axios';
import Loader from './Loader';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const BillsShortComponent = ({ bill, currencySymbol,tripId }) => {
  const { getEmployeeById } = useContext(DataContext);
  const [payerName, setPayerName] = useState(null);
  const [sharesDetails, setSharesDetails] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [pageLoading, setPageLoading] = useState(false);
   const navigate = useNavigate();

  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        // Fetch the name of the bill payer
        if (bill?.billPayer) {
          const payer = await getEmployeeById(bill.billPayer,tripId);
          setPayerName(payer?.empName || 'Unknown');
        }

        // Fetch contributors' details if contributerShare exists
        if (bill?.contributerShare) {
          const contributors = await Promise.all(
            Object.entries(bill.contributerShare).map(async ([empId, amount]) => {
              const contributor = await getEmployeeById(empId,tripId);
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
    const date = new Date(timestamp); // Convert the timestamp to a Date object
    const day = String(date.getDate()).padStart(2, "0"); // Ensure 2 digits
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}-${month}-${year}`; // Return in dd-mm-yyyy format
  };

  const handleBillDeletion = async () => {
    try {
      setPageLoading(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/bills/delete/billId/${bill?.id}/tripId/${bill?.tripId}`
      );
      if (response.status === 200) {
        setPageLoading(false);
        setTimeout(() => {
          toast.success("Bill Deleted Successfully!", {
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
        alert("Bill Deleted Successfully!")
        navigate(0);
      } else if (response.status === 500) {
        setPageLoading(false);
        toast.error("Bill Deletion Unsuccessful!", {
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
      console.error("Bill Deletion Failed", err.response ? err.response.data : err.message);
    }
  }

  return (
  <>
    {loading ?<ComponentLoader/> 
        :
        <>
        {pageLoading ? <Loader/> :<div className="h-auto w-full py-5 sm:py-3 px-5 bg-[#000249] text-white rounded-lg flex items-center justify-between bxs border-[3px] border-[#03abff]">
            <div className="h-[auto] flex flex-col items-start justify-center gap-4">
            <h2 className="text-sm sm:text-lg font-medium">Bill Type: {bill?.billType || 'N/A'}</h2>
            <h2 className="text-sm sm:text-lg font-medium">
              Bill Amount: {currencySymbol} {bill?.billAmt || 0}
            </h2>
            {bill?.billDate && (<h2 className="text-sm sm:text-lg font-medium">Bill Date: {formatDate(bill?.billDate)}</h2>)}
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
            <button onClick={handleBillDeletion} className='bg-red-500 text-white px-4 py-2 rounded-md'>Delete</button>
              {(bill?.imageUrl === "") ? <h2 className='text-sm sm:text-lg font-medium text-[#03abff]'>No Bill Image</h2>  : <a href={bill?.imageUrl} target="_blank" >
                <img className="w-auto sm:w-52 h-60 border-[3px] border-[#03abff] rounded-lg" src={bill?.imageUrl} alt="food-bill"/>
              </a>}
          </div>
          </div>}
        </>}
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
      </>
  );
};

export default BillsShortComponent;
