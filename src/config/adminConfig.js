// src/config/adminConfig.js

const adminEmpIds = import.meta.env.VITE_ADMIN_EMPIDS.split(",").map((id) => id.trim());

export const isAdmin = (empId) => adminEmpIds.includes(empId);

export default adminEmpIds;
