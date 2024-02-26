import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import VendorSearchBar from './../vendor-search-bar/VendorSearchBar';
import { useVendor } from '../../services/VendorContext';
import AdminTable from '../leads-tables/AdminTable';
import VendorTable from '../leads-tables/VendorTable';

const API_URL = process.env.API_URL;

const DuplicateLeads = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editableData, setEditableData] = useState({});
  const { selectedVendor } = useVendor();

  useEffect(() => {
    const fetchDuplicates = async () => {
      setIsLoading(true);
      if (!user || !user.token) {
        console.log('User not defined, waiting for authentication...');
        return;
      }

      let url = API_URL + '/leads/bad-leads'; // Adjusted for clarity

      // Adjust URL based on user role and selectedVendor
      if (user.role === 'vendor') {
        // For vendors, fetch their specific bad leads
        url += `?vendor=${encodeURIComponent(user.username)}`;
      } else if (user.role === 'admin' && selectedVendor) {
        // For admin with a selected vendor, fetch bad leads for that vendor
        url += `?vendor=${encodeURIComponent(selectedVendor)}`;
      }
      // No additional parameters needed for admin without a selected vendor

      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setLeads(response.data.leads);
      } catch (error) {
        console.error('Error fetching duplicates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDuplicates();
  }, [selectedVendor]);

  const handleEditChange = (e, field) => {
    setEditableData({ ...editableData, [field]: e.target.value });
  };

  const handleEdit = (lead) => {
    setEditRowId(lead.id);
    setEditableData({ ...lead, isBookedEditable: lead.isBooked });
  };

  const handleUpdate = async () => {
    try {
      const updatedData = { ...editableData, isBooked: editableData.isBookedEditable };
      delete updatedData.isBookedEditable; // Prepare data for update
  
      const response = await fetch(`${API_URL}/update/update-lead/${editRowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedData),
      });
  
      if (response.ok) {
        // Refresh local state to reflect the update
        const updatedLeads = leads.map(lead => lead.id === editRowId ? { ...lead, ...updatedData } : lead);
        setLeads(updatedLeads);
        setEditRowId(null); // Reset edit state
      } else {
        console.error("Failed to update lead");
      }
    } catch (error) {
      console.error("Error updating lead: ", error);
    }
  };

  const markDuplicates = async () => {
    try {
      await axios.post(`${API_URL}/leads/manually-mark-duplicates`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchDuplicates(); // Re-fetch duplicates after marking
    } catch (error) {
      console.error('Error marking duplicates:', error);
    }
  };

  const handleBookedStatusChange = (id, isChecked) => {
    setEditableData(prevData => ({
      ...prevData,
      isBookedEditable: isChecked
    }));
  };


  return (
    <div className="duplicate-leads-container">
      {user.role === 'admin' && <VendorSearchBar />}
      <h2>
        {user.role === 'vendor' ? `${user.username}'s Bad Leads` : `${selectedVendor ? `${selectedVendor}'s Bad Leads` : "Bad Leads"}`}
      </h2>
      <div className="tables-container">
        {isLoading ? (
          <div style={{ textAlign: 'center' }}>Loading Data...</div>
        ) : leads.length > 0 ? (
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
            No Bad Leads found.
          <button className="btn btn-primary mt-3" onClick={markDuplicates}>
            Check for Duplicates
          </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuplicateLeads