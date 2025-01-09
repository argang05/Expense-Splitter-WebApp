/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast, Bounce } from 'react-toastify';

const CreateBillForm = ({ tripGroupMembersIds, onClose, onBillFormSubmit, tripId }) => {
  const [billData, setBillData] = useState({
    billType: "",
    billAmt: "",
    splitBill: false,
    splitEqually: true,
    billPayer: "",
    contributorsIds: [],
  });

  const [employeeList, setEmployeeList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [image, setImage] = useState(null);
  const [customContributions, setCustomContributions] = useState({});
  const [showContributionInputs, setShowContributionInputs] = useState(false);
  const [splitEquallyText, setSplitEquallyText] = useState("Yes");
  const [billSplitText, setBillSplitText] = useState("No");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/trip/group-members/${tripId}`
        );
        if (response.status === 200) {
          setEmployeeList(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err.response ? err.response.data : err.message);
      }
    };

    fetchEmployees();
  }, [tripGroupMembersIds, tripId]);

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
    setSearchQuery("");
    setFilteredEmployees([]);
    setShowDropdown(false);
  };

  const handleRemoveContributor = (employeeId) => {
    setBillData((prevData) => ({
      ...prevData,
      contributorsIds: prevData.contributorsIds.filter((id) => id !== employeeId),
    }));
    setCustomContributions((prev) => {
      const newContributions = { ...prev };
      delete newContributions[employeeId];
      return newContributions;
    });
  };

  const handleContributionChange = (employeeId, amount) => {
    setCustomContributions((prev) => ({
      ...prev,
      [employeeId]: parseFloat(amount),
    }));
  };

  const validateContributions = () => {
    const totalContributions = Object.values(customContributions).reduce((acc, curr) => acc + curr, 0);
    return totalContributions === parseFloat(billData.billAmt);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    if (billSplitText === "Yes") {
      setBillData(billData.splitBill = true)
    } else {
      setBillData(billData.splitBill = false)
    }

    if (splitEquallyText === "No") {
      setBillData(billData.splitEqually = false);
    } else {
      setBillData(billData.splitEqually = true);
    }

    if (!billData.splitEqually) {
      if (!validateContributions()) {
        // alert("The sum of contributions must equal the bill amount.");
        toast.error("The sum of contributions must equal the bill amount.", {
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
      billData.contributerShare = customContributions;
    }

    

    formData.append("bill", JSON.stringify(billData));

    if (image) {
      formData.append("image", image);
    }

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    onBillFormSubmit(formData);
    onClose();
  };

  return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="mt-24 bg-white p-8 rounded-lg w-[90%] md:w-[70%] lg:w-[50%] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-emerald-500 mb-5">Create Bill</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="billType"
            placeholder="Bill Type"
            value={billData.billType}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black"
            required
          />

          <input
            type="number"
            name="billAmt"
            placeholder="Bill Amount"
            value={billData.billAmt}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black"
            required
          />

          <div className="flex items-center gap-4">
            <label className="text-gray-400">Split Bill:</label>
            <input
              type="radio"
              name="splitBill"
              value={"Yes"}
              checked={billSplitText === "Yes"}
              onChange={(e) => setBillSplitText(e.target.value)}
            />

            <label className="text-gray-400">Yes</label>
            <input
              type="radio"
              name="splitBill"
              value={"No"}
              checked={billSplitText === "No"}
              onChange={(e) => setBillSplitText(e.target.value)}
            />
            <label className="text-gray-400">No</label>
          </div>

          {billSplitText === "Yes" && (
            <div className="flex items-center gap-4">
              <label className="text-gray-400">Split Equally:</label>
              <input
                type="radio"
                name="splitEqually"
                value={"Yes"}
                checked={splitEquallyText === "Yes"}
                onChange={(e) => setSplitEquallyText(e.target.value)}
              />
              <label className="text-gray-400">Yes</label>
              <input
                type="radio"
                name="splitEqually"
                value={"No"}
                checked={splitEquallyText === "No"}
                onChange={
                  function (e) {
                    setSplitEquallyText(e.target.value);
                    setShowContributionInputs(false)
                  }}
              />
              <label className="text-gray-400">No</label>
            </div>
          )}

          {(billSplitText === "Yes" && splitEquallyText === "No") ? (
            <>
              <div>
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

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Contributors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-2 border rounded-md w-[70%] text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="ml-2 text-gray-500"
                >
                  ▼
                </button>
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

              <div className="flex flex-wrap gap-2">
                {billData.contributorsIds.map((id) => (
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

              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                onClick={() => setShowContributionInputs(true)}>
                Specify Contributions
              </button>
              {showContributionInputs && (
            <div>
              {billData.contributorsIds.map((id) => (
                <div key={id} className="flex items-center gap-4 mb-2">
                  <label className="text-gray-400">{employeeList.find((emp) => emp.empId === id)?.empName}:</label>
                  <input
                    type="number"
                    value={customContributions[id] || ""}
                    onChange={(e) => handleContributionChange(id, e.target.value)}
                    className="p-2 border rounded-md text-black"
                    required
                  />
                </div>
              ))}
            </div>
          )}
            </>
          
          ) :(billSplitText === "Yes" && splitEquallyText === "Yes") && (
              <>
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
              </>
          ) }

          

          <div>
            <label className="text-gray-400">Upload Bill Image:</label>
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="p-2 border rounded-md text-gray-400"
              required
            />
          </div>

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
          />
    </div>
  );
};

export default CreateBillForm;
