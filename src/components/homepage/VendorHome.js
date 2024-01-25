import React, { useState, useEffect, useContext } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import './VendorHome.css';
import { AuthContext } from '../../services/AuthContext';
import { Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faSave, faEdit } from '@fortawesome/free-solid-svg-icons';

const VendorHome = ({ vendor }) => {
  const [vendorLeadsData, setVendorLeadsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
 // Initialize chart data with a proper structure
const [lineChartData, setLineChartData] = useState({
  labels: [],
  datasets: []
});
const [pieChartData, setPieChartData] = useState({
  labels: [],
  datasets: []
});
  const [leadsPerPage] = useState(20); // Number of leads per page

// Retrieve and parse user data from local storage
const userString = localStorage.getItem('user');
const user = userString ? JSON.parse(userString) : null;
const [editRowId, setEditRowId] = useState(null);
const [editableData, setEditableData] = useState({});

// UPDATE handlers for updating information in tables
const handleEditChange = (e, field) => {
  setEditableData({ ...editableData, [field]: e.target.value });
};

const handleEdit = (item) => {
  setEditRowId(item.id);
  setEditableData({ ...item });
};

const handleUpdate = async () => {
  try {
    const response = await fetch(`http://localhost:4000/api/vendors/update-lead/${editRowId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(editableData),
    });

    if (response.ok) {
      const updatedData = vendorLeadsData.map((item) => 
        item.id === editRowId ? { ...item, ...editableData } : item
      );
      setVendorLeadsData(updatedData);
      setEditRowId(null);
    } else {
      console.error("Failed to update lead");
    }
  } catch (error) {
    console.error("Error updating lead: ", error);
  }
};

useEffect(() => {
  const fetchVendorLeads = async () => {
    if (!user || !user.token) {
      console.log('Waiting for user authentication...');
      setIsLoading(false);
      return;
    }

    try {
      const url = `http://localhost:4000/api/vendors/leads?vendorLabel=${encodeURIComponent(vendor)}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setVendorLeadsData(sortedData);
    } catch (error) {
      console.error('Error fetching vendor leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchVendorLeads();
}, [vendor]);

useEffect(() => {
  if (vendorLeadsData.length > 0) {
    prepareChartData(vendorLeadsData);
  }
}, [vendorLeadsData]);

const prepareChartData = (data) => {
  // Get the current date and the past six months
  const currentDate = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    let d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push(d.toLocaleString('default', { month: 'long' }));
  }

  // Initialize counts for each month
  const monthCounts = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

  // Count the number of leads for each month
  data.forEach(lead => {
    const leadDate = new Date(lead.timestamp);
    const leadMonth = leadDate.toLocaleString('default', { month: 'long' });
    if (months.includes(leadMonth)) {
      monthCounts[leadMonth]++;
    }
  });

  // Prepare data for Line chart
  const lineChartData = {
    labels: months,
    datasets: [{
      label: 'Number of Leads',
      data: months.map(month => monthCounts[month]),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      fill: false
    }]
  };

  // Prepare data for Pie chart
  const pieChartData = {
    labels: months,
    datasets: [{
      data: months.map(month => monthCounts[month]),
      backgroundColor: months.map(() => `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.5)`),
      borderColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 1
    }]
  };

  setLineChartData(lineChartData);
  setPieChartData(pieChartData);
};
  

// Get current leads
const indexOfLastLead = currentPage * leadsPerPage;
const indexOfFirstLead = indexOfLastLead - leadsPerPage;
const currentLeads = vendorLeadsData.slice(indexOfFirstLead, indexOfLastLead);

// Calculate total pages
const totalPages = Math.ceil(vendorLeadsData.length / leadsPerPage);

// Change page
const paginate = pageNumber => setCurrentPage(pageNumber);

// Function to render the leads table

  // Render function for Line and Pie charts
  const renderCharts = () => {
    if (isLoading) {
      return <div>Loading chart data...</div>;
    }
  
    if (lineChartData.datasets.length > 0 && pieChartData.datasets.length > 0) {
      return (
        <div className="charts-container">
          <div className="chart-container">
            <Line data={lineChartData} />
          </div>
          <div className="pie-chart-container">
            <Pie data={pieChartData} />
          </div>
        </div>
      );
    }
  
    return null;
  };


const renderTable = (data) => {
  if (isLoading) {
    return <div>Loading Data...</div>;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <div>No data available for this user.</div>;
  }
  

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
    );
  };

// Pagination logic
const maxPagesToShow = 5;
const halfMaxPages = Math.floor(maxPagesToShow / 2);
const startPage = Math.max(1, currentPage - halfMaxPages);
const endPage = Math.min(totalPages, currentPage + halfMaxPages);

const pages = [];
for (let i = startPage; i <= endPage; i++) {
  pages.push(
    <Pagination.Item key={i} active={i === currentPage} onClick={() => paginate(i)}>
      {i}
    </Pagination.Item>
  );
}

return (
  <div className="vendor-dashboard-wrapper">
    <div className="vendor-dashboard">
        <h2>
          {user && user.role === 'vendor'
            ? `${user.username}'s Leads`
            : vendor
            ? `${vendor}'s Leads`
            : "User's Leads"}
        </h2>
      {renderCharts()}
      <div className="tables-container">
        {renderTable(currentLeads)}
      </div>
      <br></br>
      <div className="d-flex justify-content-center">
        <Pagination>
          <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
          {pages}
          <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>
      <br></br>
    </div>
  </div>
);
};


export default VendorHome;