import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTP from "./pages/OTP";
import ForgotPassword from "./pages/ForgotPassword";
import Donation from "./pages/Donation";
import Request from "./pages/Request";
import DonorDashboard from "./pages/DonorDashboard";
import DonorProfile from "./pages/DonorProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import Chatbot from "./components/ChatBot"; // Fixed: matched actual filename casing

// Admin Page Imports
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserRecords from "./pages/AdminUserRecords";
import AdminCamp from "./pages/AdminCamp";
import AdminStock from "./pages/AdminStock";
import AdminProfile from "./pages/AdminProfile";
import AdminLayout from "./components/AdminLayout";

export default function App() {
  return (
    // 1. ADD THIS FRAGMENT TO WRAP EVERYTHING
    <> 
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* PROTECTED DONOR ROUTES */}
        <Route path="/donation" element={<ProtectedRoute><Donation /></ProtectedRoute>} />
        <Route path="/donate" element={<ProtectedRoute><Donation /></ProtectedRoute>} />
        <Route path="/request" element={<ProtectedRoute><Request /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DonorDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><DonorProfile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><DonorProfile /></ProtectedRoute>} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="user" element={<AdminUserRecords />} />
          <Route path="camp" element={<AdminCamp />} />
          <Route path="stock" element={<AdminStock />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
      
      {/* 2. RENDER THE CHATBOT HERE */}
      <Chatbot /> 
      
    </> // 3. CLOSE THE FRAGMENT
  );
}