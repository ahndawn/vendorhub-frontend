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
  const [editRowId, setEditRowId] = useState(null);
  const [editableData, setEditableData] = useState({});
  const { selectedVendor } = useVendor();

  useEffect(() => {
    const fetchDuplicates = async () => {
      if (!user || !user.token) {
        console.log('User not defined, waiting for authentication...');
        return;
      }
      try {
        const url = `${API_URL}/leads/get-duplicates`; // Removed pagination parameters
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setLeads(response.data.leads);
      } catch (error) {
        console.error('Error fetching duplicates:', error);
      }
    };

    fetchDuplicates();
  }, [selectedVendor]);

  const handleEditChange = (e, field) => {
    setEditableData({ ...editableData, [field]: e.target.value });
  };

  const handleEdit = (lead) => {
    setEditRowId(lead.id);
    setEditableData(lead);
  };

  const handleUpdate = async () => {
    console.log('Update logic to be implemented');
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