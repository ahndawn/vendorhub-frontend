// src/services/userService.js
import axios from 'axios';

const API_URL = 'https://vendor.safeshiphub.com/api/users/';

// Register user
const register = async (userData) => {
  try {
    const response = await axios.post(API_URL + 'register', userData);
    return response.data;
  } catch (error) {
    // If the error has a response with a data property, throw it to be handled by the caller
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      // If the error does not have a response, throw a generic error message
      throw new Error('An error occurred during registration.');
    }
  }
};

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Get user profile
const getProfile = async (token) => {
  const response = await axios.get(API_URL + 'profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export default {
  register,
  login,
  getProfile,
};