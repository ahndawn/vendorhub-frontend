import React, { useState, useEffect } from 'react';
import { Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import VendorSearchBar from './../vendor-search-bar/VendorSearchBar';
import { useVendor } from '../../services/VendorContext'
import AdminTable from '../leads-tables/AdminTable';
import VendorTable from '../leads-tables/VendorTable';
import './BookedLeads.css'

const API_URL = process.env.API_URL;

const BookedLeads = () => {
  // Retrieve and parse user data from local storage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(10);
  const [editRowId, setEditRowId] = useState(null);
  const [editableData, setEditableData] = useState({});

  const { selectedVendor } = useVendor(); // Access the selected vendor from context

  const fetchBookedLeads = async () => {
      if (!user || !user.token) {
          console.log('Waiting for user authentication...');
          return;
      }
      
      let apiUrl = API_URL
    // Adjust URL based on user role and selectedVendor
    if (user.role === 'vendor') {
        // For vendors, use their specific booked leads route
        apiUrl += `/vendors/booked-leads/${encodeURIComponent(user.username)}`;
    } else if (user.role === 'admin') {
        if (selectedVendor) {
            // For admin, when a vendor is selected, use the vendor-specific booked leads route
            apiUrl += `/vendors/booked-leads/${encodeURIComponent(selectedVendor)}`;
        } else {
            // For admin, when no vendor is selected, use the admin route to get all booked leads
            apiUrl += '/admin/booked-leads/';
        }
    }

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch booked leads');
      }
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEditChange = (e, field) => {
    setEditableData({ ...editableData, [field]: e.target.value });
  };

  useEffect(() => {
    fetchBookedLeads();
  }, [selectedVendor]);

  const handleBookedStatusChange = (id, isChecked) => {
    setEditableData(prevData => ({
      ...prevData,
      isBookedEditable: isChecked
    }));
  };
  
  const handleEdit = (lead) => {
    setEditRowId(lead.id);
    setEditableData({ ...lead, isBookedEditable: lead.isBooked });
  };

  const handleUpdate = async () => {
    try {
      const updatedData = { ...editableData, isBooked: editableData.isBookedEditable };
      delete updatedData.isBookedEditable;
  
      const response = await fetch(`${API_URL}/update/update-lead/${editRowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedData),
      });
  
      if (response.ok) {
        // Fetch the updated list of leads to reflect changes
        fetchBookedLeads();
        // Exit editing mode
        setEditRowId(null);
        // reset the form fields
        setEditableData({});
      } else {
        console.error("Failed to update lead");
      }
    } catch (error) {
      console.error("Error updating lead: ", error);
    }
  };

  // Pagination logic
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(leads.length / leadsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="booked-leads-container">
      {user.role === 'admin' && <VendorSearchBar />}
      <h2>
        {user.role === 'vendor' ? `${user.username}'s Booked Leads` : `${selectedVendor ? `${selectedVendor}'s Booked Leads` : "Booked Leads"}`}
      </h2>
      <div className="tables-container">
        {leads.length > 0 ? (
          user.role === 'admin' ? (
            <AdminTable
              data={leads}
              onEdit={handleEdit}
              onSave={handleUpdate}
              editRowId={editRowId}
              editableData={editableData}
              handleEditChange={handleEditChange}
              handleBookedStatusChange={handleBookedStatusChange}
            />
          ) : (
            <VendorTable
              data={leads}
              onEdit={handleEdit}
              onSave={handleUpdate}
              editRowId={editRowId}
              editableData={editableData}
              handleEditChange={handleEditChange}
              handleBookedStatusChange={handleBookedStatusChange}
            />
          )
        ) : (
          <div style={{ textAlign: 'center' }}>
            No Booked Leads Found.
          </div>
        )}
      </div>
    </div>
  );
};

export default BookedLeads;