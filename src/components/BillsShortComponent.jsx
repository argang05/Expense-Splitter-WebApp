/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '../contexts/UserContext';

const BillsShortComponent = ({ bill, currencySymbol,tripId }) => {
  const { getEmployeeById } = useContext(DataContext);
  const [payerName, setPayerName] = useState(null);
  const [sharesDetails, setSharesDetails] = useState([]);

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
        }
      } catch (error) {
        console.error('Error fetching bill details:', error);
      }
    };

    fetchBillDetails();
  }, [bill, getEmployeeById,tripId]);

  return (
    <div className="h-auto w-full py-4 px-5 bg-emerald-500 text-white rounded-lg flex flex-col gap-4 items-start justify-center">
      <h2 className="text-md font-medium">Bill Type: {bill?.billType || 'N/A'}</h2>
      <h2 className="text-md font-medium">
        Bill Amount: {currencySymbol}
        {bill?.billAmt || 0}
      </h2>
      <h2 className="text-md font-medium">Bill Payer: {payerName || 'N/A'}</h2>
      <h2 className="text-md font-semibold">Contribution Record:</h2>
      {sharesDetails.length > 0 ? (
        sharesDetails.map((share, index) => (
          <h2 key={index} className="text-md font-semibold">
            {share.empName}: {currencySymbol} {share.amount}
          </h2>
        ))
      ) : (
        <h2 className="text-md font-medium">No Contributions</h2>
      )}
    </div>
  );
};

export default BillsShortComponent;
