/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import EmployeeExpenseReportComponent from '../components/EmployeeExpenseReportComponent';
import ComponentLoader from '../components/ComponentLoader'; // Assuming this is the loader component

const EmployeeExpenseReportPage = () => {
    const { tripId } = useParams();
    const [empExpenceReportList, setEmpExpenceReportList] = useState(null);
    const [showOverlay, setShowOverlay] = useState(false);
    const [finalDuesReport, setFinalDuesReport] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getAllEmployeeExpenseReport = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/get-expense-report/tripId/${tripId}`);
                if (response.status === 200) {
                    setEmpExpenceReportList(response.data);
                }
            } catch (err) {
                console.error("Fetching Expense Report Failed:", err.response ? err.response.data : err.message);
            }
        }
        getAllEmployeeExpenseReport();
    }, [tripId]);

    const handleGetFinalDuesReport = async () => {
        setShowOverlay(true);
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/get-final-debt-report/${tripId}`);
            if (response.status === 200) {
                setFinalDuesReport(response.data);
            } else {
                setFinalDuesReport(["Failed to fetch the final dues report."]);
            }
        } catch (err) {
            console.error("Fetching Final Dues Report Failed:", err.response ? err.response.data : err.message);
            setFinalDuesReport(["An error occurred while fetching the final dues report."]);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseOverlay = () => {
        setShowOverlay(false);
        setFinalDuesReport(null);
    };

    return (
        <div className='w-full flex flex-col items-center justify-center'>
            <div className='mt-28 w-[90%] gap-1 mb-4 flex items-center justify-items-start'>
                <span className='text-sm font-semibold text-[#000249] text-start'>
                    <NavLink className="sm:text-md" to="/"><i className='bx bxs-home bx-flashing' ></i></NavLink>
                </span>
                <span className='text-sm font-semibold text-[#000249] text-start'>
                    <i className='sm:text-lg bx bx-right-arrow-alt'></i>
                </span>
                <span className='text-sm font-semibold text-[#000249] text-start'>
                    <NavLink to={`/trip/${tripId}`}>Trip Details</NavLink>
                </span>
                <span className='text-sm font-semibold text-[#000249] text-start'>
                    <i className='sm:text-lg bx bx-right-arrow-alt'></i>
                </span>
                <span className='text-sm font-semibold text-[#000249] text-start'> Employee Expense Report</span>
            </div>
            <div className='flex flex-col items-center justify-center w-full mb-8'>
                {empExpenceReportList?.employeeFinalExpenseReportDTOList?.map((empExpenceReport) => (
                    <EmployeeExpenseReportComponent key={empExpenceReport.empId} empExpenceReport={empExpenceReport} exchangeRate={empExpenceReportList.exchangeRate} />
                ))}
                <button
                    onClick={handleGetFinalDuesReport}
                    className="border-[2px] bxs border-[#000249] orange-btn scale-out h-auto w-[80%] sm:w-[70%] lg:w-[40%] text-center p-4 cursor-pointer text-md sm:text-lg font-semibold bg-[#F6490D] rounded-2xl"
                >
                    Get Final Simplified Dues Report
                </button>
            </div>
            {showOverlay && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-[90%] sm:w-[70%] md:w-[70%] lg:w-[55%] text-center">
                        {loading ? (
                            <ComponentLoader />
                        ) : (
                            <>
                                <h2 className="text-xl text-[#000249] font-semibold mb-4">Final Simplified Dues Report</h2>
                                <ul className="list-disc list-inside text-left">
                                    {finalDuesReport?.map((report, index) => (
                                        <li key={index} className="mb-2 text-[#000249]">{report}</li>
                                    ))}
                                </ul>
                                <button
                                    onClick={handleCloseOverlay}
                                    className="mt-4 px-6 py-2 scale-out orange-btn bg-[#F6490D] border-[2px] bxs border-[#000249] text-white rounded-lg font-semibold"
                                >
                                    Ok
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeExpenseReportPage;
