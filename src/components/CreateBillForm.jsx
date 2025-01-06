/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateBillForm = ({ tripGroupMembersIds, onClose, onBillFormSubmit , tripId}) => {
  const [billData, setBillData] = useState({
    billType: "",
    billAmt: "",
    splitBill: false,
    billPayer: "",
    contributorsIds: [],
  });

  const [employeeList, setEmployeeList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [image, setImage] = useState(null);
  const [isSplitBill, setIsSplitBill] = useState(false);
 const [isSplitBillText, setIsSplitBillText] = useState(false);

  useEffect(() => {
    // Fetch employees based on the group member IDs of the trip
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/group-members/${tripId}`
        );
        if (response.status === 200) {
            setEmployeeList(response.data);
            console.log("Employee List: ",employeeList)
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err.response ? err.response.data : err.message);
      }
    };

    fetchEmployees();
  }, [tripGroupMembersIds]);

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
    setBillData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddContributor = (employeeId) => {
    if (!billData.contributorsIds.includes(employeeId)) {
      setBillData((prevData) => ({
        ...prevData,
        contributorsIds: [...prevData.contributorsIds, employeeId],
      }));
    }
    setSearchQuery(""); // Clear search field
    setFilteredEmployees([]); // Clear filtered list
    setShowDropdown(false); // Close the dropdown
  };

  const handleRemoveContributor = (employeeId) => {
    setBillData((prevData) => ({
      ...prevData,
      contributorsIds: prevData.contributorsIds.filter((id) => id !== employeeId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      
    if (isSplitBillText === "Yes") {
        setBillData(billData.splitBill = true)
    }

    // Prepare FormData for multipart form
    const formData = new FormData();
    formData.append("bill", JSON.stringify(billData));

    if (image) {
      formData.append("image", image);
      }
      
    formData.forEach((value, key) => {
        console.log(`${key}:`, value);
    });
      
    onBillFormSubmit(formData)
    onClose();  
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white p-8 rounded-lg w-[120%] md:w-[70%] lg:w-[50%] overflow-y-auto">
        <h2 className="text-2xl font-bold text-emerald-500 mb-5">Create Bill</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Bill Type */}
          <input
            type="text"
            name="billType"
            placeholder="Bill Type"
            value={billData.billType}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black"
            required
          />

          {/* Bill Amount */}
          <input
            type="number"
            name="billAmt"
            placeholder="Bill Amount"
            value={billData.billAmt}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black"
            required
          />

          {/* Split Bill */}
          <div className="flex items-center gap-4">
            <label className="text-gray-400">Split Bill: </label>
            <input
              type="radio"
              name="splitBill"
              value="Yes"
              checked={isSplitBillText === "Yes"}
              onChange={(e) => setIsSplitBillText(e.target.value)}
            />
            <label className="text-gray-400" htmlFor="">Yes</label>
            <input
              type="radio"
              name="splitBill"
              value="No"
              checked={isSplitBillText === "No"}
              onChange={(e) => setIsSplitBillText(e.target.value)}
            />
            <label className="text-gray-400" htmlFor="">No</label>
          </div>

          {/* Bill Payer */}
          {(isSplitBillText === "Yes" ) && (
            <div className="flex items-center gap-2">
              <label className="text-gray-400">Bill Payer:</label>
              <select
                name="billPayer"
                value={billData.billPayer}
                onChange={handleInputChange}
                className="p-2 border rounded-md text-black"
                required
              >
                <option value="">Select Payer</option>
                {employeeList.map((employee) => (
                  <option key={employee.empId} value={employee.empId}>
                    {employee.empName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Contributors */}
          {(isSplitBillText === "Yes" ) && (
            <div className="relative">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search Contributors"
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
                      onClick={() => handleAddContributor(employee.empId)}
                    >
                      {employee.empName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Selected Contributors */}
          {(isSplitBillText === "Yes" ) && (
            <div className="flex flex-wrap gap-2">
              {billData?.contributorsIds.map((id) => (
                <div key={id} className="flex items-center gap-2 bg-emerald-500 px-2 py-1 rounded-md">
                  <span>{employeeList.find((emp) => emp.empId === id)?.empName || id}</span>
                  <button
                    type="button"
                    className="text-red-500 font-bold"
                    onClick={() => handleRemoveContributor(id)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="text-gray-400">Upload Bill Image:</label>
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="p-2 border rounded-md text-gray-400"
            />
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

export default CreateBillForm;
