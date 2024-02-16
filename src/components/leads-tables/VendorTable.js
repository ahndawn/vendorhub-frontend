// VendorTable.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faEdit } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const VendorTable = ({ data, onEdit, onSave, editRowId, editableData, handleEditChange, handleBookedStatusChange }) => {
  return (
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Name</th>
          <th>Origin</th>
          <th>Destination</th>
          <th>Move Size</th>
          <th>Move Date</th>
          <th>ICID</th>
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