/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
      <div className='w-full flex items-center justify-center'>
          <div className='mt-40 flex flex-col items-center justify-center w-full'>
              {empExpenceReportList?.map((empExpenceReport) => (
                  <EmployeeExpenseReportComponent key={empExpenceReport.empId} empExpenceReport={empExpenceReport}/>
              ))}
          </div>
      </div>
  )
}

export default EmployeeExpenseReportPage