/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import EmployeeExpenseReportComponent from '../components/EmployeeExpenseReportComponent';

const EmployeeExpenseReportPage = () => {
    const { tripId } = useParams();
    const [empExpenceReportList, setEmpExpenceReportList] = useState(null);
    useEffect(() => {
        const getAllEmployeeExpenseReport = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/get-expense-report/tripId/${tripId}`);
                if (response.status === 200) {
                    setEmpExpenceReportList(response.data);
                }
            } catch (err) {
                console.error("Login Failed:", err.response ? err.response.data : err.message);
            }
        }
        getAllEmployeeExpenseReport();
    },[tripId,empExpenceReportList])
  return (
      <div className='w-full flex flex-col items-center justify-center'>
          <div className='mt-28 w-[90%] gap-1 mb-4 flex items-center justify-items-start'>
              <span className='text-sm font-semibold text-emerald-300 text-start'>
                  <NavLink className="sm:text-md" to="/"><i className='bx bxs-home bx-flashing' ></i></NavLink>
               </span>
              <span className='text-sm font-semibold text-emerald-300 text-start'>
                  <i className='sm:text-lg bx bx-right-arrow-alt'></i>
              </span>
              <span className='text-sm font-semibold text-emerald-300 text-start'>
                  <NavLink to={`/trip/${tripId}`}>Trip Details</NavLink>
              </span>
              <span className='text-sm font-semibold text-emerald-300 text-start'>
                  <i className='sm:text-lg bx bx-right-arrow-alt'></i>
              </span>
              <span className='text-sm font-semibold text-emerald-300 text-start'> Employee Expense Report</span>
          </div>
          <div className='flex flex-col items-center justify-center w-full'>
              {empExpenceReportList?.map((empExpenceReport) => (
                  <EmployeeExpenseReportComponent key={empExpenceReport.empId} empExpenceReport={empExpenceReport}/>
              ))}
          </div>
      </div>
  )
}

export default EmployeeExpenseReportPage