// VendorTable.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faEdit } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import './Table.css';

const VendorTable = ({ data, onEdit, onSave, editRowId, editableData, handleEditChange, handleBookedStatusChange }) => {
  return (
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Name</th>
          <th>Phone</th>
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
        {data.map((item, index) => (
          <tr key={index}>
              <td>{item.timestamp}</td>
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
              <td className={`${item.isDuplicate ? 'duplicate-lead' : ''} ${item.invalid ? 'invalid-lead' : ''}`}>
                {editRowId === item.id ? (
                  <input
                    type="text"
                    value={editableData.phone1}
                    onChange={(e) => handleEditChange(e, 'phone1')}
                    className='input'
                  />
                ) : (
                  item.phone1
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
                    onChange={(e) => handleBookedStatusChange(item.id, e.target.checked)}
                    className='input'
                    />
                ) : (
                  item.isBooked ? 'Booked' : ''
                )}
              </td>
              <td>
                {editRowId === item.id ? (
                    <FontAwesomeIcon icon={faSave} onClick={() => onSave(item)} className='icon'/>
                ) : (
                    <FontAwesomeIcon icon={faEdit} onClick={() => onEdit(item)} className='icon'/>
                )}
                </td>
            </tr>
          ))}
        </tbody>
    </table>
  );
};

VendorTable.propTypes = {
    data: PropTypes.array.isRequired,
    onEdit: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    editRowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    editableData: PropTypes.object.isRequired,
    handleEditChange: PropTypes.func.isRequired,
    handleBookedStatusChange: PropTypes.func.isRequired
  };

export default VendorTable;