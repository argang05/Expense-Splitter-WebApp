/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import TeamMemberDetail from '../components/TeamMemberDetail';
import BillsShortComponent from '../components/BillsShortComponent';
import { DataContext } from '../contexts/UserContext';
import Loader from '../components/Loader';

const TripDetailsPage = () => {
    const { tripid } = useParams();
    const [tripDetail, setTripDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
         async function getTripDetail() {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/id/${tripid}`);
             if (response.status === 200) {
                console.log(response.data)
                 setTripDetail(response.data);
                 setLoading(false);
             }
        }

        getTripDetail();
    },[])
    return (
    <>
      {loading && <Loader/>}
      <div className='container  w-full flex items-center justify-center'>
          <div className='mt-40 px-5 py-10 flex flex-col align-center gap-5 border-2 border-emerald-700 w-[90%] h-[auto] rounded-lg'>
              <h1 className='text-3xl font-bold text-emerald-300'>{tripDetail?.tripName.toUpperCase()}:</h1>
              <h3 className='text-lg text-emerald-400 font-medium'>Type: {tripDetail?.tripType}</h3>
              <h3 className='text-lg text-emerald-400 font-medium'>Purpose: {tripDetail?.tripPurpose}</h3>
              <h3 className='text-lg text-emerald-400 font-medium'>Country: {tripDetail?.country}</h3>
              <h3 className='text-lg text-emerald-400 font-medium'>Continent: {tripDetail?.continent}</h3>
              <h3 className='text-lg text-emerald-400 font-medium'>Duration: {tripDetail?.numberOfDays} days</h3>
              <h3 className='text-lg text-emerald-400 font-medium'>Number Of Team Members: {tripDetail?.groupStrength}</h3>
              <h3 className='text-xl text-emerald-400 font-semibold'>Team Members:</h3>
              <div className='w-full flex flex-col gap-4 items-center justify-between'>
                  {tripDetail?.groupMembersIds.map((groupMemberId,indx) => (
                      <TeamMemberDetail key={indx} empId={groupMemberId} currencySymbol={tripDetail?.currencySymbol} tripId={tripDetail.id} />
                  ))}
              </div>
              <h3 className='text-xl text-emerald-400 font-semibold'>Bill Records:</h3>
              <div className='w-full h-auto flex justify-center'>
              <button className='scale-out h-auto w-[15%] p-4 cursor-pointer text-lg font-semibold bg-sky-600 rounded-2xl'>Add Bill</button>
              </div>
              {tripDetail?.bills.map((bill) => (
                  <BillsShortComponent key={bill.id} bill={bill} currencySymbol={tripDetail?.currencySymbol} tripId={tripDetail.id} />
              ))}
          </div>
            </div>
    </>
  )
}

export default TripDetailsPage