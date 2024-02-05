import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/sidebar/Sidebar';
import Register from './components/users/Register';
import { AuthProvider } from './services/AuthContext';
import Login from './components/users/Login';
import Profile from './components/users/Profile';
import VendorManagement from './components/vendor-management/VendorManagement';
import AdminHome from './components/homepage/AdminHome';
import VendorHome from './components/homepage/VendorHome';
import useUserAuth from './services/userAuth';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="container-fluid">
          <div className="row">
            <Sidebar />
            <MainContent />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

const MainContent = () => {
  const isAuthenticated = useUserAuth();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          setUserRole(user ? user.role : null);
        } catch (error) {
          console.error("Error parsing user data from localStorage", error);
        }
      }
    }
  }, [isAuthenticated]);

  const renderHomePage = () => {
    switch (userRole) {
      case 'admin':
        return <AdminHome />;
      case 'vendor':
        return <VendorHome />;
      default:
        return <h1>Safe Ship Moving Services</h1>;
    }
  };

  return (
    <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4 main-content">
      <Routes>
        <Route path="/" element={isAuthenticated ? renderHomePage() : <Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/vendors" element={<VendorManagement />} />
      </Routes>
    </main>
  );
};

export default App;