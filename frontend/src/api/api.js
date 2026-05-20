import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const API = axios.create({
  baseURL: import.meta.env.PROD ? "https://blooddonation-8epp.onrender.com" : "",
});

// --- REAL API SECTION ---
// The mock adapter is removed for production use. The frontend will now call the actual backend.
// If you need to re‑enable mocks for local testing, uncomment the block below.
/*
const mock = new MockAdapter(API, { delayResponse: 500 });

// Mock Login (dev only)
mock.onPost("/login").reply(200, {
  access_token: "fake-jwt-token-for-testing",
  user: {
    fullName: "Test User",
    role: "admin"
  }
});

// Mock Inventory Data
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
*/

// Exported functions remain unchanged, with an additional verifyOtp helper.
export const loginUser = (credentials) => API.post("/login", credentials);
export const verifyOtp = (payload) => API.post("/verify-otp", payload);
export const submitDonationRequest = (data) => API.post("/donations/request", data);
export const getAdminInventory = () => API.get("/admin/inventory");
export const getAllUsers = () => API.get("/admin/users");

export default API;