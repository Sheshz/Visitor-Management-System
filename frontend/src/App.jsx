import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/Register";
import HostDashboard from "./components/HostDashboard";
import CreateHostProfile from "./components/hosts/CreateHostProfile";
import UserDashboard from "./components/UserDashboard";
import HostLogin from "./components/hosts/HostLogin";
import HostProfile from "./pages/HostProfile";
import ExpertsPage from "./pages/ExpertsPage";
import AboutUsPage from "./pages/AboutUsPage";
import ApplyHostPage from "./components/hosts/ApplyHostPage";


function App() {
  return (
    <Router>
      <Routes>
        {/* Define all the routes in the application */}
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/host-dashboard" element={<HostDashboard />} />
        <Route path="/create-host" element={<CreateHostProfile />} /> {/* This is where the form will be */}
        <Route path="/host-login" element={<HostLogin/>}/>
        <Route path="/host-dashboard" element={<CreateHostProfile />}/>
        <Route path="/experts" element={<ExpertsPage/>}/>
        <Route path="/about" element={<AboutUsPage/>}/>
        <Route path="/apply-host" element={<ApplyHostPage/>}/>

        <Route path="/host-profile" element ={<HostProfile/>}/>
      </Routes>
    </Router>
  );
}

export default App;
