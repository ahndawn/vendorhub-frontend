import React, { useState, useEffect, useRef } from 'react';
import VendorHome from './../homepage/VendorHome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import './VendorManagement.css';

const VendorManagement = () => {

   // Retrieve and parse user data from local storage
   const userString = localStorage.getItem('user');
   const user = userString ? JSON.parse(userString) : null;
   
  const [vendors, setVendors] = useState([]); // List of all vendors
  const [selectedVendor, setSelectedVendor] = useState(''); // Currently selected vendor
  const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering vendors

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/admin/vendors', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setVendors(data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setVendors([]); // Set vendors to an empty array in case of error
      }
    };

    fetchVendors();
  }, []);

  const handleSelectVendor = (event) => {
    setSelectedVendor(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };


  const filteredVendors = Array.isArray(vendors) ? vendors.filter(vendor =>
    vendor && vendor.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

const showDropdown = searchTerm && filteredVendors.length > 0;

const dropdownRef = useRef(null);

  useEffect(() => {
    // Function to check if clicked outside of dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchTerm(''); // Clear search term to hide dropdown
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Remove event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

return (
    <div className="vendor-management">
      <div className="vendor-selection d-flex">
        <div className="input-group" style={{ width: '300px' }}>
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
                  onClick={() => setSelectedVendor(vendor)}
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
          value={selectedVendor}
          style={{ width: '150px' }}
        >
          <option value="">Select Vendor</option>
          {filteredVendors.map((vendor, index) => (
            <option key={index} value={vendor}>
              {vendor}
            </option>
          ))}
        </select>
      </div>
      {selectedVendor && <VendorHome vendor={selectedVendor} />}
    </div>
  );
};

export default VendorManagement;