/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../contexts/UserContext";
import ComponentLoader from "./ComponentLoader";

const TeamMemberDetail = ({ empId, currencySymbol, tripId }) => {
  const { getEmployeeById } = useContext(DataContext);
  const [empData, setEmpData] = useState(null);
  const [duesDetails, setDuesDetails] = useState([]); // To store the dues details
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await getEmployeeById(empId, tripId);
      setEmpData(res);

      // Check if empId matches any outer key in dues
      if (res?.dues && res.dues[empId]) {
        const dues = [];
        const payees = res.dues[empId]; // Get inner object for empId

        for (const [payeeId, amount] of Object.entries(payees)) {
          // Fetch payee details
          const payeeData = await getEmployeeById(payeeId, tripId);
          dues.push({
            payeeName: payeeData?.empName || `Unknown (${payeeId})`,
            amount,
          });
        }

        setDuesDetails(dues);
      } else {
        setDuesDetails([]); // No dues for this employee
      }

      setLoading(false);
    }

    fetchData();
  }, [empId, tripId, getEmployeeById,empData,duesDetails]);

  return (
    <>
      {loading ? (
        <ComponentLoader />
      ) : (
        <div className="h-[auto] w-full py-4 px-5 bg-emerald-500 text-white rounded-lg flex flex-col gap-4 items-start justify-center">
          <h2 className="text-md font-medium">Name: {empData?.empName}</h2>
          <h2 className="text-md font-medium">Employee ID: {empData?.empId}</h2>
          <h2 className="text-md font-medium">Email: {empData?.email}</h2>
          <h2 className="text-md font-medium">Employee Tier: {empData?.empTier}</h2>
          {empData?.totalFoodBill != null ? (
            <h2 className="text-md font-medium">
              Total Food Bill: {currencySymbol} {empData?.totalFoodBill}
            </h2>
          ) : (
            <h2 className="text-md font-medium">Total Food Bill: No Record Found</h2>
          )}
          <h2 className="text-md font-semibold">Dues Record:</h2>
          {duesDetails.length > 0 ? (
            duesDetails.map((due, index) => (
              <h2 key={index} className="text-md font-medium">
                {empData?.empName} owes {due.payeeName}: {currencySymbol} {due.amount}
              </h2>
            ))
          ) : (
            <h2 className="text-md font-medium">No dues found</h2>
          )}
        </div>
      )}
    </>
  );
};

export default TeamMemberDetail;
