/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '../contexts/UserContext';
import ComponentLoader from "./ComponentLoader";

const BillsShortComponent = ({ bill, currencySymbol,tripId }) => {
  const { getEmployeeById } = useContext(DataContext);
  const [payerName, setPayerName] = useState(null);
  const [sharesDetails, setSharesDetails] = useState([]);
  const [loading, setLoading] = useState(true); 

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

  return (
  <>
    {loading ?<ComponentLoader/> 
        :
        <div className="h-auto w-full py-5 sm:py-3 px-5 bg-[#000249] text-white rounded-lg flex items-center justify-between bxs border-[3px] border-[#03abff]">
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
            <div className="sm:h-64 h-72">
              {(bill?.imageUrl === "") ? <h2 className='text-sm sm:text-lg font-medium text-[#03abff]'>No Bill Image</h2>  : <a href={bill?.imageUrl} target="_blank" >
                <img className="w-auto sm:w-52 h-full border-[3px] border-[#03abff] rounded-lg" src={bill?.imageUrl} alt="food-bill"/>
              </a>}
            </div>
        </div>}
      </>
  );
};

export default BillsShortComponent;
