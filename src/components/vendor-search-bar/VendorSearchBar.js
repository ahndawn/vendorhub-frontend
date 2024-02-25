import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import './VendorSearchBar.css';
import { useVendor } from '../../services/VendorContext';

const API_URL = process.env.API_URL;

const VendorSearchBar = () => {
  // Retrieve and parse user data from local storage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const { setSelectedVendor: setGlobalSelectedVendor } = useVendor(); 

  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/vendors`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setVendors(data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setVendors([]);
      }
    };

    fetchVendors();
  }, []);

  const handleSelectVendor = (event) => {
    setGlobalSelectedVendor(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredVendors = Array.isArray(vendors) ? vendors.filter(vendor =>
    vendor != null && vendor.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const showDropdown = searchTerm && filteredVendors.length > 0;
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="vendor-management">
      <div className="vendor-selection">
        <div className="input-group">
          <span className="input-group-text">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search Vendor"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {showDropdown && (
            <div className="search-dropdown" ref={dropdownRef}>
              {filteredVendors.map((vendor, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                  onClick={() => setGlobalSelectedVendor(vendor)} // Update the global context
                >
                  {vendor}
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="input-group-text">
          <FontAwesomeIcon icon={faCaretDown} />
        </span>
        <select
          className="form-control"
          onChange={handleSelectVendor}
          style={{ width: '150px' }}
        >
          <option value="">Select Vendor</option>
          {vendors.map((vendor, index) => (
            <option key={index} value={vendor}>
              {vendor}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default VendorSearchBar;