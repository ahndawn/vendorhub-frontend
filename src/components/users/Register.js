import React, { useState } from 'react';
import userService from '../../services/userService';
import './Register.css'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'vendor', // default role, can be changed as needed
  });
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await userService.register(formData);
      setMessage('User successfully registered.');
      setIsError(false);
      // Redirect to login or dashboard after successful registration
    } catch (error) {
      // The error message is now coming from the catch block in the register function
      setMessage(error.message || 'An error occurred during registration.');
      setIsError(true);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center mt-5 mb-4">Safe Ship Hub Registration</h1>
          <div className="register-container p-4">
            {message && (
              <div className={`alert ${isError ? 'alert-danger' : 'alert-success'}`} role="alert">
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="form-group">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
                className="form-control mb-3"
              />
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
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="form-control mb-3"
              >
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="btn btn-primary w-100">Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;