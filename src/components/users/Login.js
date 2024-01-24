import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import { AuthContext } from '../../services/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const { updateAuth } = useContext(AuthContext); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await userService.login(formData);
      setMessage('Login successful.');
      setIsError(false);
      console.log(data);

      // Update global authentication state
      updateAuth(true);

      // Store user data in localStorage or manage it as needed
      localStorage.setItem('user', JSON.stringify(data));

      // Redirect to the homepage or dashboard after successful login
      navigate('/');
    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'An unexpected error occurred.';
  
      setMessage(errorMessage);
      setIsError(true);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center mt-5 mb-4">Safe Ship Hub</h1>
          <div className="login-container p-4">
            {message && (
              <div className={`alert ${isError ? 'alert-danger' : 'alert-success'}`} role="alert">
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="form-control mb-3"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="form-control mb-3"
              />
              <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;