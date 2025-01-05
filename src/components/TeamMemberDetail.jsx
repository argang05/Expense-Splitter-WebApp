/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../contexts/UserContext";

const TeamMemberDetail = ({ empId, currencySymbol, tripId }) => {
  const { getEmployeeById } = useContext(DataContext);
  const [empData, setEmpData] = useState(null);
  const [duesDetails, setDuesDetails] = useState([]); // To store the dues details

  // Fetch employee data on component mount
  useEffect(() => {
    async function storeEmpData() {
      const res = await getEmployeeById(empId, tripId);
      setEmpData(res);

      // Fetch details for dues
      if (res?.dues) {
        const dues = [];

        // Iterate over the dues object (debtor ID -> payee ID -> amount)
        for (const [debtorId, payees] of Object.entries(res.dues)) {
          for (const [payeeId, amount] of Object.entries(payees)) {
            // Fetch names for both debtor and payee
            const debtorData = await getEmployeeById(debtorId,tripId);
            const payeeData = await getEmployeeById(payeeId,tripId);

            dues.push({
              debtorName: debtorData?.empName || "Unknown",
              payeeName: payeeData?.empName || "Unknown",
              amount,
            });
          }
        }

        setDuesDetails(dues);
      }
    }
    storeEmpData();
  }, [empData,tripId,empId,getEmployeeById]);

  return (
    <>
    <div className="h-[auto] w-full py-4 px-5 bg-emerald-500 text-white rounded-lg flex flex-col gap-4 items-start justify-center">
      <h2 className="text-md font-medium">Name: {empData?.empName}</h2>
      <h2 className="text-md font-medium">Employee ID: {empData?.empId}</h2>
      <h2 className="text-md font-medium">Email: {empData?.email}</h2>
      <h2 className="text-md font-medium">Employee Tier: {empData?.empTier}</h2>
      {(empData?.totalFoodBill != null) ?
        <h2 className="text-md font-medium">
        Total Food Bill: {currencySymbol} {empData?.totalFoodBill}
        </h2>
        :
        <h2>Total Food Bill: No Food Bill Record Found</h2>
      
      }
      <h2 className="text-md font-semibold">Dues Record:</h2>
      {duesDetails.length > 0 ? (
        duesDetails.map((due, index) => (
          <h2 key={index} className="text-md font-medium">
            {due.debtorName} owes {due.payeeName}: {currencySymbol} {due.amount}
          </h2>
        ))
      ) : (
        <h2 className="text-md font-medium">No dues found</h2>
      )}
      </div>
      </>
  );
};

export default TeamMemberDetail;
