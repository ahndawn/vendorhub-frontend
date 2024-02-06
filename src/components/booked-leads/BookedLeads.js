import React, { useState, useEffect } from 'react';
import { Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import BookedLeadsSearch from './BookedLeadsSearch';
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

  const fetchBookedLeads = async () => {
      if (!user || !user.token) {
          console.log('Waiting for user authentication...');
          return;
      }

      let url = `http://localhost:4000/api/vendors/booked-leads/`;
      // If the user is a vendor, append their username to the URL
      if (user.role === 'vendor') {
          url += encodeURIComponent(user.username);
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
  }, []);

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
            {user.role === 'admin' && <BookedLeadsSearch />}
            <div className="tables-container">
            {leads.length > 0 ? (
                <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Vendor</th>
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
                <td>{item.label}</td>
                <td>
                  {editRowId === item.id ? (
                    <input
                      type="text"
                      value={editableData.firstname}
                      onChange={(e) => handleEditChange(e, 'firstname')}
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
                      onChange={(e) => handleEditChange(e, 'origin')} // Adjust the field name as needed
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
                      onChange={(e) => handleEditChange(e, 'destination')} // Adjust the field name as needed
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