import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const http = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const api = {
  // project
  getProject: () => http.get("/project").then((r) => r.data),
  updateProject: (patch) => http.put("/project", patch).then((r) => r.data),

  // categories
  getCategories: () => http.get("/dream-categories").then((r) => r.data),
  createCategory: (data) => http.post("/dream-categories", data).then((r) => r.data),
  deleteCategory: (id) => http.delete(`/dream-categories/${id}`).then((r) => r.data),
  getGoals: () => http.get("/dream-goals").then((r) => r.data),
  createGoal: (data) => http.post("/dream-goals", data).then((r) => r.data),
  deleteGoal: (id) => http.delete(`/dream-goals/${id}`).then((r) => r.data),

  // vendors
  listVendors: () => http.get("/vendors").then((r) => r.data),
  createVendor: (data) => http.post("/vendors", data).then((r) => r.data),
  updateVendor: (id, data) => http.put(`/vendors/${id}`, data).then((r) => r.data),
  deleteVendor: (id) => http.delete(`/vendors/${id}`).then((r) => r.data),
  addService: (vendorId, data) => http.post(`/vendors/${vendorId}/services`, data).then((r) => r.data),
  updateService: (vendorId, serviceId, data) =>
    http.put(`/vendors/${vendorId}/services/${serviceId}`, data).then((r) => r.data),
  deleteService: (vendorId, serviceId) =>
    http.delete(`/vendors/${vendorId}/services/${serviceId}`).then((r) => r.data),

  // selections
  listSelections: () => http.get("/selections").then((r) => r.data),
  createSelection: (data) => http.post("/selections", data).then((r) => r.data),
  updateSelection: (id, data) => http.put(`/selections/${id}`, data).then((r) => r.data),
  deleteSelection: (id) => http.delete(`/selections/${id}`).then((r) => r.data),

  // tasks
  listTasks: () => http.get("/tasks").then((r) => r.data),
  createTask: (data) => http.post("/tasks", data).then((r) => r.data),
  updateTask: (id, data) => http.put(`/tasks/${id}`, data).then((r) => r.data),
  deleteTask: (id) => http.delete(`/tasks/${id}`).then((r) => r.data),

  // dashboard
  getDashboard: () => http.get("/dashboard").then((r) => r.data),

  // seed
  seed: (reset = false) => http.post(`/seed?reset=${reset}`).then((r) => r.data),
};

export const formatEUR = (n) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

export const PRIORITY_LABEL = {
  must_have: "Must have",
  nice_to_have: "Nice to have",
  optional: "Optional",
};

export const STATUS_LABEL = {
  considering: "Considering",
  selected: "Selected",
  booked: "Booked",
};

export const VENDOR_STATUS_LABEL = {
  new: "New",
  contacted: "Contacted",
  shortlisted: "Shortlisted",
  selected: "Selected",
  rejected: "Rejected",
};

export const PRICE_TYPE_LABEL = {
  fixed: "Fixed price",
  per_guest: "Per guest",
  per_hour: "Per hour",
  per_unit: "Per unit",
  custom: "On request",
};
