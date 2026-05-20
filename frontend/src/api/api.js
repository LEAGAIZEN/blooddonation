import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const API = axios.create({
  baseURL: import.meta.env.PROD ? "https://blooddonation-8epp.onrender.com" : "", 
});

// --- START MOCK SECTION (Delete/Comment this when backend is ready) ---
const mock = new MockAdapter(API, { delayResponse: 500 });

// Mock Login: Any email/password will work!
mock.onPost("/login").reply(200, {
  access_token: "fake-jwt-token-for-testing",
  user: {
    fullName: "Test User",
    role: "admin" // Change to "donor" to test the donor side
  }
});

// Mock Inventory Data for AdminDashboard
mock.onGet("/admin/inventory").reply(200, [
  { bloodType: "A+", units: 15 },
  { bloodType: "O-", units: 2 },
  { bloodType: "B+", units: 24 },
  { bloodType: "AB-", units: 8 }
]);

// Mock Personnel Data
mock.onGet("/admin/users").reply(200, [
  { fullName: "Julianne Doe", email: "j@test.com", bloodGroup: "O+", role: "Admin", status: "active" }
]);

// Mock Blood Request Submission
mock.onPost("/donations/request").reply(200, { message: "Success" });
// --- END MOCK SECTION ---

// ... (Keep your interceptors and export functions below as they were) ...

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (credentials) => API.post("/login", credentials);
export const submitDonationRequest = (data) => API.post("/donations/request", data);
export const getAdminInventory = () => API.get("/admin/inventory");
export const getAllUsers = () => API.get("/admin/users");

export default API;