/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { DataContext } from "../contexts/UserContext";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { isAdmin } from "../config/adminConfig";
import { continentCountryMap } from "../utils/ContinentCountryMap";

const CreateTripForm = ({ onClose, onSubmit }) => {

  const { user } = useContext(DataContext);

  const [tripData, setTripData] = useState({
    tripName: "",
    tripType: "",
    tripPurpose: "",
    isInternational: true,
    continent: "",
    country: "",
    groupMembersIds: [],
    tripDate:""
  });

  const [tripDateLocal, setTripDateLocal] = useState({
        fromDate: "",
        toDate: "",
  })

  const [isInternationalText, setIsInternationalText] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    // Fetch all employees when the form loads
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/employee/all`);
        if (response.status === 200) {
          setEmployeeList(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err.response ? err.response.data : err.message);
      }
    };
    fetchEmployees();
  }, []);

  // Handle search in real-time
  useEffect(() => {
    if (searchQuery?.trim() !== "") {
      const filtered = employeeList.filter((employee) =>
        employee.empName.toLowerCase().includes(searchQuery?.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees([]);
    }
  }, [searchQuery, employeeList]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTripData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

   // Handle continent selection
  const handleContinentChange = (e) => {
    const selectedContinent = e.target.value;
    setTripData((prevData) => ({
      ...prevData,
      continent: selectedContinent,
      country: "", // Reset country when continent changes
    }));
  };

  // Handle country selection
  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setTripData((prevData) => ({
      ...prevData,
      country: selectedCountry,
    }));
  };

  const calculateNumberOfDays = () => {
    const fromDate = new Date(tripDateLocal.fromDate);
    const toDate = new Date(tripDateLocal.toDate);
    if (fromDate && toDate && toDate >= fromDate) {
      return Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const handleAddGroupMember = (employeeId) => {
    if (!tripData.groupMembersIds.includes(employeeId)) {
      setTripData((prevData) => ({
        ...prevData,
        groupMembersIds: [...prevData.groupMembersIds, employeeId],
      }));
    }
    setSearchQuery(""); // Clear search field
    setFilteredEmployees([]); // Clear filtered list
    setShowDropdown(false); // Close the dropdown
  };

  const handleRemoveGroupMember = (employeeId) => {
    setTripData((prevData) => ({
      ...prevData,
      groupMembersIds: prevData.groupMembersIds.filter((id) => id !== employeeId),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBtnLoading(true)
     // Validate required fields
  const requiredFields = ["tripName", "country"];
  for (const field of requiredFields) {
    if (!tripData[field]?.trim()) {
      setBtnLoading(false)
      toast.error(`${field.replace(/([A-Z])/g, " $1")} is required.`, {
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

      return;
    }
  }

  // Validate trip dates
    if (!tripDateLocal.fromDate || !tripDateLocal.toDate) {
    setBtnLoading(false)
    toast.error("Both From Date and To Date are required.", {
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
    return;
  }

  const fromDate = new Date(tripDateLocal.fromDate);
  const toDate = new Date(tripDateLocal.toDate);

    if (toDate < fromDate) {
    setBtnLoading(false)
    toast.error("To Date cannot be earlier than From Date.", {
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
    return;
  }

    let numberOfDays = calculateNumberOfDays();
    numberOfDays = numberOfDays + 1;
    if (numberOfDays <= 0) {
    setBtnLoading(false)
    toast.error("Please select a valid date range.", {
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
    return;
    }
    if (
    (!tripData.groupMembersIds.includes(user?.empId)) &&
    (!isAdmin(user?.empId))
    ) {
      setBtnLoading(false)
    toast.error("You cannot add a trip where you are not included!", {
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
    return;
  }

    // Add tripDate directly into finalData
    const finalData = {
      ...tripData,
      tripDate: tripDateLocal.fromDate,
      numberOfDays,
    };
    setBtnLoading(false)
    console.log("FinalData: ",finalData)
    onSubmit(finalData);
    onClose(); // Close the form after submission
    // Provide success feedback
    toast.success("Trip successfully added!", {
      
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
  };

    // Format the continent name by adding a space between uppercase words
  const formatContinentName = (name) => {
    return name.replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="mt-32 bg-white p-8 rounded-lg w-[90%] sm:w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#000249] mb-5">Add New Trip</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Trip Name */}
          <input
            type="text"
            name="tripName"
            placeholder="Trip Name"
            value={tripData.tripName}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black"
            required
          />

          {/* Trip Type */}
          <div className="flex items-center gap-2">
            <label htmlFor="tripType" className="text-gray-400">Trip Type</label>
            <select
              name="tripType"
              value={tripData.tripType}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-gray-400"
            >
              <option value="">Select Trip Type</option>
              <option value="Expo">Expo</option>
              <option value="Customer">Customer</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Trip Purpose */}
          <div className="flex items-center gap-2">
            <label htmlFor="tripPurpose" className="text-gray-400">Trip Purpose</label>
            <select
              name="tripPurpose"
              value={tripData.tripPurpose}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-gray-400"
            >
              <option value="">Select Trip Purpose</option>
              <option value="Sales">Sales</option>
              <option value="Pre-Sales">Pre-Sales</option>
              <option value="Implementation">Implementation</option>
              <option value="Marketing">Marketing</option>
              <option value="Recovery">Recovery</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Continent Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="tripPurpose" className="text-gray-400">Trip Continent:</label>
          <select
            name="continent"
            value={tripData.continent}
            onChange={handleContinentChange}
            className="p-2 border rounded-md text-black"
            required
          >
            <option value="">Select Continent</option>
            {Object.keys(continentCountryMap).map((continent) => (
              <option key={continent} value={continent}>
                {formatContinentName(continent)}
              </option>
            ))}
          </select>

          </div>

          {/* Country Dropdown */}
          <div className="flex items-center gap-2">
          <label htmlFor="tripPurpose" className="text-gray-400">Trip Continent:</label>
          <select
            name="country"
            value={tripData.country}
            onChange={handleCountryChange}
            className="p-2 border rounded-md text-black"
            required
            disabled={!tripData.continent} // Disable if no continent selected
          >
            <option value="">Select Country</option>
            {tripData.continent &&
              continentCountryMap[tripData.continent].map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
          </select>
          </div>

          {/* From Date */}
          <div className="flex items-center gap-2">
          <label className="text-gray-400">From Date:</label>
          <input
            type="date"
            name="fromDate"
            value={tripDateLocal.fromDate}
            onChange={(e) => setTripDateLocal({ ...tripDateLocal, fromDate: e.target.value })}
            className="p-2 border rounded-md text-gray-400"
            required
          />

          </div>

          {/* To Date */}
          <div className="flex items-center gap-2">
          <label className="text-gray-400">To Date:</label>
          <input
            type="date"
            name="toDate"
            value={tripDateLocal.toDate}
            onChange={(e) => setTripDateLocal({ ...tripDateLocal, toDate: e.target.value })}
            className="p-2 border rounded-md text-gray-400"
            required
          />

          </div>

          {/* Real-Time Group Member Search */}
          <div className="relative">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search Group Members"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 border rounded-md w-full text-black"
              />
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className="ml-2 text-gray-500"
              >
                ▼
              </button>
            </div>
            {(filteredEmployees.length > 0 || showDropdown) && (
              <ul className="absolute top-12 left-0 right-0 bg-white border rounded-md max-h-40 overflow-y-auto z-10">
                {(filteredEmployees.length > 0 ? filteredEmployees : employeeList).map((employee) => (
                  <li
                    key={employee.empId}
                    className="p-2 cursor-pointer hover:bg-emerald-100 text-black"
                    onClick={() => handleAddGroupMember(employee.empId)}
                  >
                    {employee.empName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Selected Group Members */}
          <div className="flex flex-wrap gap-2">
            {tripData.groupMembersIds.map((id) => (
              <div key={id} className="flex items-center gap-2 bg-emerald-500 px-2 py-1 rounded-md">
                <span>{employeeList.find((emp) => emp.empId === id)?.empName || id}</span>
                <button
                  type="button"
                  className="text-red-500 font-bold"
                  onClick={() => handleRemoveGroupMember(id)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button type="button" onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-md">
              Cancel
            </button>
            <button type="submit" className="bg-emerald-500 text-white px-4 py-2 rounded-md">
              {btnLoading ? "Loading..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
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
        transition={Bounce}
        className="mt-48 sm:mt-28"
          />
    </div>
  );
};

export default CreateTripForm;
