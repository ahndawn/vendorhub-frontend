import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import VendorSearchBar from './../vendor-search-bar/VendorSearchBar';
import { useVendor } from '../../services/VendorContext';

const API_URL = process.env.API_URL;

const DuplicateLeads = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [duplicates, setDuplicates] = useState([]);
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
        const url = `${API_URL}/dup-leads/marked-duplicates`; // Removed pagination parameters
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setDuplicates(response.data.duplicates);
      } catch (error) {
        console.error('Error fetching duplicates:', error);
      }
    };

    fetchDuplicates();
  }, [selectedVendor]); // Dependency array now only includes selectedVendor

  const handleEditChange = (e, field) => {
    setEditableData({ ...editableData, [field]: e.target.value });
  };

  const handleEdit = (duplicate) => {
    setEditRowId(duplicate.id);
    setEditableData(duplicate);
  };

  const handleUpdate = async () => {
    console.log('Update logic to be implemented');
  };


  return (
    <div className="duplicate-leads-container">
      {user.role === 'admin' && <VendorSearchBar />}
      <h2>Duplicate Leads</h2>
      <div className="tables-container">
        {duplicates.length > 0 ? (
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
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {duplicates.map((duplicate, index) => (
              <tr key={index}>
                <td>{duplicate.timestamp}</td>
                {user.role === 'admin' && !selectedVendor && <td>{duplicate.label}</td>}
                <td>
                  {editRowId === duplicate.id ? (
                    <input
                      type="text"
                      value={editableData.firstname}
                      onChange={(e) => handleEditChange(e, 'firstname')}
                      className='input'
                    />
                  ) : (
                    duplicate.firstname
                  )}
                </td>
                <td>
                  {editRowId === duplicate.id ? (
                    <input
                      type="text"
                      value={editableData.ozip || editableData.ocity || editableData.ostate}
                      onChange={(e) => handleEditChange(e, 'origin')}
                      className='input'
                    />
                  ) : (
                    duplicate.ozip || duplicate.ocity || duplicate.ostate
                  )}
                </td>
                <td>
                  {editRowId === duplicate.id ? (
                    <input
                      type="text"
                      value={editableData.dzip || editableData.dcity + ', ' + editableData.dstate}
                      onChange={(e) => handleEditChange(e, 'destination')}
                      className='input'
                    />
                  ) : (
                    duplicate.dzip || duplicate.dcity + ', ' + duplicate.dstate
                  )}
                </td>
                <td>
                  {editRowId === duplicate.id ? (
                    <input
                      type="text"
                      value={editableData.movesize}
                      onChange={(e) => handleEditChange(e, 'movesize')}
                      className='input'
                    />
                  ) : (
                    duplicate.movesize
                  )}
                </td>
                <td>
                  {editRowId === duplicate.id ? (
                    <input
                      type="text"
                      value={editableData.movedte}
                      onChange={(e) => handleEditChange(e, 'movedte')}
                      className='input'
                    />
                  ) : (
                    duplicate.movedte
                  )}
                </td>
                <td>
                  {editRowId === duplicate.id ? (
                    <input
                      type="text"
                      value={editableData.notes}
                      onChange={(e) => handleEditChange(e, 'notes')}
                      className='input'
                    />
                  ) : (
                    duplicate.notes
                  )}
                </td>
                <td>{duplicate.phone1}</td>
                <td style={duplicate.isBooked ? { backgroundColor: '#a8cc98', fontWeight: '600', textAlign: 'center', fontFamily: 'Montserrat, sans-serif' } : {}}>
                  {editRowId === duplicate.id ? (
                    <input
                      type="checkbox"
                      checked={editableData.isBookedEditable}
                      onChange={(e) => setEditableData({ ...editableData, isBookedEditable: e.target.checked })}
                    />
                  ) : (
                    duplicate.isBooked ? 'Booked' : ''
                  )}
                </td>
                <td>
                  {editRowId === duplicate.id ? (
                    <FontAwesomeIcon icon={faSave} onClick={handleUpdate} className='icon'/>
                  ) : (
                    <FontAwesomeIcon icon={faEdit} onClick={() => handleEdit(duplicate)} className='icon'/>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center' }}>
            No Duplicate Leads Found.
            <button className="btn btn-primary mt-3" onClick={() => console.log('Check for duplicates logic to be implemented')}>
              Check for Duplicates
            </button>
        </div>
        )}
      </div>
    </div>
  );
};

export default DuplicateLeads