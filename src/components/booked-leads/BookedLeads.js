import React, { useState, useEffect } from 'react';
import { Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import VendorSearchBar from './../vendor-search-bar/VendorSearchBar';
import { useVendor } from '../../services/VendorContext'
import './BookedLeads.css'

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

      let url = 'http://localhost:4000/api/';

    // Adjust URL based on user role and selectedVendor
    if (user.role === 'vendor') {
        // For vendors, use their specific booked leads route
        url += `vendors/booked-leads/${encodeURIComponent(user.username)}`;
    } else if (user.role === 'admin') {
        if (selectedVendor) {
            // For admin, when a vendor is selected, use the vendor-specific booked leads route
            url += `vendors/booked-leads/${encodeURIComponent(selectedVendor)}`;
        } else {
            // For admin, when no vendor is selected, use the admin route to get all booked leads
            url += 'admin/booked-leads/';
        }
    }

    try {
      const response = await fetch(url, {
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

  useEffect(() => {
    fetchBookedLeads();
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
  
      const response = await fetch(`http://localhost:4000/api/admin/update-lead/${editRowId}`, {
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
                <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Timestamp</th>
              {user.role === 'admin' && !selectedVendor && <th>Vendor</th>}
              <th>Name</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Move Size</th>
              <th>Move Date</th>
              <th>ICID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLeads.map((item, index) => (
              <tr key={index}>
                <td>{item.timestamp}</td>
                {user.role === 'admin' && !selectedVendor && <td>{item.label}</td>}
                <td>
                  {editRowId === item.id ? (
                    <input
                      type="text"
                      value={editableData.firstname}
                      onChange={(e) => handleEditChange(e, 'firstname')}
                      className='input'
                    />
                  ) : (
                    item.firstname
                  )}
                </td>
                <td>
                  {editRowId === item.id ? (
                    <input
                      type="text"
                      value={editableData.ozip || editableData.ocity || editableData.ostate}
                      onChange={(e) => handleEditChange(e, 'origin')}
                      className='input'
                    />
                  ) : (
                    item.ozip || item.ocity || item.ostate
                  )}
                </td>
                <td>
                  {editRowId === item.id ? (
                    <input
                      type="text"
                      value={editableData.dzip || editableData.dcity + ', ' + editableData.dstate}
                      onChange={(e) => handleEditChange(e, 'destination')}
                      className='input'
                    />
                  ) : (
                    item.dzip || item.dcity + ', ' + item.dstate
                  )}
                </td>
                <td>
                  {editRowId === item.id ? (
                    <input
                      type="text"
                      value={editableData.movesize}
                      onChange={(e) => handleEditChange(e, 'movesize')}
                      className='input'
                    />
                  ) : (
                    item.movesize
                  )}
                </td>
                <td>
                  {editRowId === item.id ? (
                    <input
                      type="text"
                      value={editableData.movedte}
                      onChange={(e) => handleEditChange(e, 'movedte')}
                      className='input'
                    />
                  ) : (
                    item.movedte
                  )}
                </td>
                <td>
                  {editRowId === item.id ? (
                    <input
                      type="text"
                      value={editableData.notes}
                      onChange={(e) => handleEditChange(e, 'notes')}
                      className='input'
                    />
                  ) : (
                    item.notes
                  )}
                </td>
                <td style={item.isBooked ? { backgroundColor: '#a8cc98', fontWeight: '600', textAlign: 'center', fontFamily: 'Montserrat, sans-serif' } : {}}>
                  {editRowId === item.id ? (
                    <input
                      type="checkbox"
                      checked={editableData.isBookedEditable}
                      onChange={(e) => setEditableData({ ...editableData, isBookedEditable: e.target.checked })}
                    />
                  ) : (
                    item.isBooked ? 'Booked' : ''
                  )}
                </td>
                <td>
                  {editRowId === item.id ? (
                    <FontAwesomeIcon icon={faSave} onClick={handleUpdate} className='icon'/>
                  ) : (
                    <FontAwesomeIcon icon={faEdit} onClick={() => handleEdit(item)} className='icon'/>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        ) : (
          <div style={{textAlign:'center'}}>No Booked Leads for this Vendor.</div>
          )}
      </div>
    </div>
  );
};

export default BookedLeads;