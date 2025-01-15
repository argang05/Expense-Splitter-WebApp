/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ComponentLoader from './ComponentLoader';

const EmployeeExpenseReportComponent = ({ empExpenceReport , exchangeRate }) => {
  const [payeeNames, setPayeeNames] = useState({});
  const [loading, setLoading] = useState(true);

  const getEmployeeNameById = async (empId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/employee/empId/${empId}`);
      if (response.status === 200) {
        return response.data?.empName;
      }
    } catch (error) {
      console.error(`Error fetching employee name for ID ${empId}:`, error);
      return `Unknown (${empId})`;
    }
  };

  // useEffect(() => {
  //   console.log(empExpenceReport);
  // },[])

  useEffect(() => {
    
    // Fetch payee names if dues exist
    const fetchPayeeNames = async () => {
      if (empExpenceReport?.dues && Object.keys(empExpenceReport.dues).length > 0) {
        const payeeNamesMap = {};

        // Iterate over all debtor IDs (outer keys)
        for (const debtorEmpId of Object.keys(empExpenceReport.dues)) {
          const payees = empExpenceReport.dues[debtorEmpId];

          // Iterate over all payee IDs (inner keys)
          for (const payeeEmpId of Object.keys(payees)) {
            if (!payeeNamesMap[payeeEmpId]) {
              // Fetch payee name only if not already fetched
              const name = await getEmployeeNameById(payeeEmpId);
              payeeNamesMap[payeeEmpId] = name;
            }
          }
        }

        // Update state with the payee names map
        setPayeeNames(payeeNamesMap);
      }
      setLoading(false);
    };

    fetchPayeeNames();
  }, [empExpenceReport,payeeNames]);


  const renderDues = (dues) => {
    if (!dues || Object.keys(dues).length === 0) {
      return <h3 className="text-lg text-[#000249]  font-medium">No dues</h3>;
    }

    const duesEntries = Object.entries(dues);
    const renderedDues = [];

    for (const [payerEmpId, payees] of duesEntries) {
      if (payerEmpId === empExpenceReport.empId) {
        // If the logged-in employee owes other employees
        // console.log(payeeNames);
        for (const [payeeEmpId, amount] of Object.entries(payees)) {
          renderedDues.push(
            <h3 key={`${payerEmpId}-${payeeEmpId}`} className="text-lg text-[#000249] font-medium">
              {empExpenceReport.empName} owes {amount} {empExpenceReport.currencySymbol} to Employee: {payeeNames[payeeEmpId] || `Loading (${payeeEmpId})`}
            </h3>
          );
        }
      }
    }

    if (renderedDues.length === 0) {
      return <h3 className="text-lg text-[#000249] font-medium">No dues</h3>;
    }

    return renderedDues;
  };


  return (
    <>
      {loading ? (
        <ComponentLoader />
      ) : (
        <div className="m-5 px-5 py-10 flex flex-col align-center gap-5 border-2 border-[#000249] w-[90%] h-[auto] rounded-lg">
          <h3 className="text-lg text-[#000249] font-medium">
            Employee ID: {empExpenceReport?.empId}
          </h3>
          <h3 className="text-lg text-[#000249] font-medium">
            Employee Name: {empExpenceReport?.empName}
          </h3>
          <h3 className="text-lg text-[#000249] font-medium">
            Employee Email: {empExpenceReport?.email}
          </h3>
          <h3 className="text-lg text-[#000249] font-medium">
            Employee Tier: {empExpenceReport?.empTier}
          </h3>
          <h3 className="text-lg text-[#000249] font-medium">
            Total Food Bill: USD{' '}
            {(empExpenceReport?.totalFoodBill / exchangeRate).toFixed(2)}
          </h3>
          <h3 className="text-lg text-[#000249] font-medium">
            Total Non Food Bill: USD{' '}
            {(empExpenceReport?.totalNonFoodBill / exchangeRate).toFixed(2)}
          </h3>
          <h3 className="text-lg text-[#000249] font-medium">
            Total Billable Limit: USD{' '}
            {empExpenceReport?.billableLimitTotal}
          </h3>
            {(empExpenceReport?.remainingBalanceTotal < 0) ?
              <h3 className="text-lg text-[#000249] font-medium">
            Total Remaining Balance: USD{' '}
            0 ; Excess : USD {Math.abs(empExpenceReport?.remainingBalanceTotal)}
          </h3>
              :
              <h3 className="text-lg text-[#000249] font-medium">
            Total Remaining Balance: USD{' '}
            {empExpenceReport?.remainingBalanceTotal}
          </h3>}
          <div>
            <h3 className="text-lg text-[#000249] font-semibold">Dues Record:</h3>
            {renderDues(empExpenceReport?.dues)}
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeExpenseReportComponent;
