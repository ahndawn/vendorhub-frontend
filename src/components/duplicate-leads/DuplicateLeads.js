import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import VendorSearchBar from './../vendor-search-bar/VendorSearchBar';
import { useVendor } from '../../services/VendorContext';
import AdminTable from '../leads-tables/AdminTable';
import VendorTable from '../leads-tables/VendorTable';
import { Pagination } from 'react-bootstrap';

const API_URL = process.env.API_URL;

const DuplicateLeads = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editableData, setEditableData] = useState({});
  const { selectedVendor } = useVendor();
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchDuplicates = async () => {
      setIsLoading(true);
      if (!user || !user.token) {
        console.log('User not defined, waiting for authentication...');
        setIsLoading(false);
        return;
      }

      let url = `${API_URL}/leads/bad-leads`;

      if (user.role === 'vendor') {
        url += `?vendor=${encodeURIComponent(user.username)}`;
      } else if (user.role === 'admin' && selectedVendor) {
        url += `?vendor=${encodeURIComponent(selectedVendor)}`;
      }

      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setLeads(response.data.leads);
        setTotalPages(Math.ceil(response.data.leads.length / leadsPerPage));
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
      delete updatedData.isBookedEditable;
  
      const response = await axios.put(`${API_URL}/update/update-lead/${editRowId}`, updatedData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });
  
      if (response.status === 200) {
        const updatedLeads = leads.map(lead => lead.id === editRowId ? { ...lead, ...updatedData } : lead);
        setLeads(updatedLeads);
        setEditRowId(null);
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
      fetchDuplicates();
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

  // Determine the range of pages to display
  const maxPagesToShow = 5;
  const halfMaxPages = Math.floor(maxPagesToShow / 2);
  const startPage = Math.max(1, currentPage - halfMaxPages);
  const endPage = Math.min(totalPages, currentPage + halfMaxPages);

  const renderPagination = () => {
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item key={i} active={i === currentPage} onClick={() => paginate(i)}>
          {i}
        </Pagination.Item>
      );
    }

    return (
      <Pagination>
        <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
        {pages}
        <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>
    );
  };

  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);

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
              data={currentLeads}
              onEdit={handleEdit}
              onSave={handleUpdate}
              editRowId={editRowId}
              editableData={editableData}
              handleEditChange={handleEditChange}
              handleBookedStatusChange={handleBookedStatusChange}
            />
          ) : (
            <VendorTable
              data={currentLeads}
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
      <br></br>
        <div className="d-flex justify-content-center">
          {renderPagination()}
        </div>
    </div>
  );
};

export default DuplicateLeads;