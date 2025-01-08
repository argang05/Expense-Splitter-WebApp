/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateTripForm = ({ onClose, onSubmit }) => {
  const [tripData, setTripData] = useState({
    tripName: "",
    tripType: "",
    tripPurpose: "",
    isInternational: true,
    continent: "",
    country: "",
    groupMembersIds: [],
  });

  const [tripDate, setTripDate] = useState({
        fromDate: "",
        toDate: "",
  })

  const [isInternationalText, setIsInternationalText] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

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

  const calculateNumberOfDays = () => {
    const fromDate = new Date(tripDate.fromDate);
    const toDate = new Date(tripDate.toDate);
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
    if (isInternationalText === "No") {
      setTripData((prevData) => ({ ...prevData, isInternational: false }));
    }
    const numberOfDays = calculateNumberOfDays();
    if (numberOfDays <= 0) {
      alert("Please select a valid date range.");
      return;
    }
    const finalData = { ...tripData, numberOfDays };
    onSubmit(finalData);
    onClose(); // Close the form after submission
  };

  return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="mt-32 bg-white p-8 rounded-lg w-[90%] sm:w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-emerald-500 mb-5">Add New Trip</h2>
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
          <input
            type="text"
            name="tripType"
            placeholder="Trip Type"
            value={tripData.tripType}
            onChange={handleInputChange}
            className="p-2 border rounded-md  text-black"
            required
          />

          {/* Trip Purpose */}
          <input
            type="text"
            name="tripPurpose"
            placeholder="Trip Purpose"
            value={tripData.tripPurpose}
            onChange={handleInputChange}
            className="p-2 border rounded-md  text-black"
            required
          />

          {/* Is International */}
          <div className="flex items-start gap-2">
            <label className="text-gray-400">Is International?: </label>
            <label className="text-gray-400">
              <input
                type="radio"
                name="isInternationalYes"
                value="Yes"
                checked={isInternationalText === "Yes"}
                onChange={(e) => setIsInternationalText(e.target.value)}
                className="p-2 border rounded-md"
              />
              Yes
            </label>
            <label className="text-gray-400">
              <input
                type="radio"
                name="isInternationalNo"
                value="No"
                checked={isInternationalText === "No"}
                onChange={(e) => setIsInternationalText(e.target.value)}
                className="p-2 border rounded-md"
              />
              No
            </label>
          </div>

          {/* Country */}
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={tripData.country}
            onChange={handleInputChange}
            className="p-2 border rounded-md  text-black"
            required
          />

          {/* Continent */}
          <input
            type="text"
            name="continent"
            placeholder="Continent"
            value={tripData.continent}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black"
            required
          />

          {/* From Date */}
          <input
            type="date"
            name="fromDate"
            value={tripDate.fromDate}
            onChange={(e) => setTripDate({ ...tripDate, fromDate: e.target.value })}
            className="p-2 border rounded-md text-gray-400"
            required
          />

          {/* To Date */}
          <input
            type="date"
            name="toDate"
            value={tripDate.toDate}
            onChange={(e) => setTripDate({ ...tripDate, toDate: e.target.value })}
            className="p-2 border rounded-md text-gray-400"
            required
          />

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
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTripForm;
