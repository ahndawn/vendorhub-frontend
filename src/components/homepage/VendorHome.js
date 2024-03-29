import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import './VendorHome.css';
import VendorTable from '../leads-tables/VendorTable';
import { Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faSave, faEdit, faSearch } from '@fortawesome/free-solid-svg-icons';
import VendorSearchBar from './../vendor-search-bar/VendorSearchBar';
import { useVendor } from '../../services/VendorContext';


const API_URL = process.env.API_URL;


const VendorHome = () => {
  const [vendorLeadsData, setVendorLeadsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(20);
  const [editRowId, setEditRowId] = useState(null);
  const [editableData, setEditableData] = useState({});
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
  const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] });
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedInterval, setSelectedInterval] = useState('monthly');

  const { selectedVendor } = useVendor(); // Access the selected vendor from context

  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');


  // Update start and end month
const handleMonthChange = (field, value) => {
  if (field === 'startMonth') {
    setStartMonth(value);
  } else {
    setEndMonth(value);
  }
};


  const handleFilter = () => {
    // Trigger the data fetching based on the selected filters
    fetchVendorLeads();
  };

  // Update date range
const handleDateChange = (field, value) => {
  setDateRange({ ...dateRange, [field]: value });
};

// Update interval
const handleIntervalChange = (value) => {
  setSelectedInterval(value);
};
// Retrieve and parse user data from local storage
const userString = localStorage.getItem('user');
const user = userString ? JSON.parse(userString) : null;


  // UPDATE INFORMATION ON TABLE
  const handleEditChange = (e, field) => {
    setEditableData({ ...editableData, [field]: e.target.value });
  };

  const handleEdit = (item) => {
    setEditRowId(item.id);
    setEditableData({ ...item, isBookedEditable: item.isBooked });
  };

  const handleBookedStatusChange = (id, isChecked) => {
    setEditableData(prevData => {
      const updatedData = { ...prevData, isBookedEditable: isChecked };
      console.log("Updated Editable Data:", updatedData);
      return updatedData;
    });
  };

  const handleUpdate = async () => {
    const updatedData = {
      ...editableData,
      isBooked: editableData.isBookedEditable
    };
    console.log("Sending Update:", updatedData);
  
    try {
      // Adjust the API call to use the admin route
      const response = await fetch(`${API_URL}/update/update-lead/${editRowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedData),
      });
  
      if (response.ok) {
        // Optimistically update the UI immediately after sending the update
        const updatedLeads = vendorLeadsData.map(lead => {
          if (lead.id === editRowId) {
            return { ...lead, ...updatedData, isBooked: updatedData.isBooked };
          }
          return lead;
        });
        setVendorLeadsData(updatedLeads);
        setEditRowId(null);
        setEditableData({});
      } else {
        console.error("Failed to update lead");
      }
    } catch (error) {
      console.error("Error updating lead: ", error);
    }
  };

const fetchVendorLeads = async () => {
  if (!user || !user.token) {
    console.log('Waiting for user authentication...');
    setIsLoading(false);
    return;
  }

  let url = `${API_URL}/vendors/leads`;

  // Adjust URL based on user role and selectedVendor from context
  if (user.role === 'vendor') {
    url += `?vendorLabel=${encodeURIComponent(user.username)}`;
  } else if (user.role === 'admin' && selectedVendor) {
    // Use selectedVendor from context
    url += `?vendorLabel=${encodeURIComponent(selectedVendor)}`;
  }

  // Include date range and interval in the query for both admin and vendor
  const dateQuery = `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&interval=${selectedInterval}`;
  url += dateQuery;

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vendor leads');
    }
    const data = await response.json();
    setVendorLeadsData(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  } catch (error) {
    console.error('Error fetching vendor leads:', error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  // Update the default start and end months in the state
  const defaultStartMonth = new Date();
  defaultStartMonth.setMonth(defaultStartMonth.getMonth() - 6);

  const defaultEndMonth = new Date();

  // Set default values for start and end months
  setStartMonth(defaultStartMonth.toLocaleString('default', { month: 'long' }));
  setEndMonth(defaultEndMonth.toLocaleString('default', { month: 'long' }));
}, []);

useEffect(() => {
  fetchVendorLeads();
}, [selectedVendor]);

useEffect(() => {
  if (vendorLeadsData.length > 0) {
    prepareChartData(vendorLeadsData);
  }
}, [vendorLeadsData, dateRange, selectedInterval])

const prepareChartData = (data) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  // Check if the interval is daily or monthly
  const isDaily = selectedInterval === 'daily';

  // Get the current date and the past six months
  const currentDate = new Date();
  const start = isDaily ? new Date(dateRange.startDate) : new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);

  // Initialize labels and counts based on the selected interval
  const labels = [];
  const counts = {};

  // Initialize labels and counts based on the selected interval
  if (isDaily) {
    const end = new Date(dateRange.endDate);
    let currentDate = new Date(start);

    while (currentDate <= end) {
      labels.push(currentDate.toLocaleDateString('en-US'));
      counts[currentDate.toLocaleDateString('en-US')] = 0;

      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    // If no date range is selected, use the past 6 months from today
    const end = new Date();

    // Use selected start and end months if available
    const selectedStartMonth = startMonth || start.toLocaleString('default', { month: 'long' });
    const selectedEndMonth = endMonth || end.toLocaleString('default', { month: 'long' });

    for (let i = start.getFullYear(); i <= end.getFullYear(); i++) {
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const currentMonth = months[monthIndex];
        const currentYear = i;

        // If the current date is in the past and before the start month, or in the future and after the end month, skip
        if (
          (currentYear === start.getFullYear() && monthIndex < months.indexOf(selectedStartMonth) && currentMonth !== selectedStartMonth) ||
          (currentYear === end.getFullYear() && monthIndex > months.indexOf(selectedEndMonth) && currentMonth !== selectedEndMonth) ||
          (currentYear > end.getFullYear() && monthIndex <= months.indexOf(selectedEndMonth) && currentMonth === selectedEndMonth && currentDate.getFullYear() < end.getFullYear())
        ) {
          continue;
        }

        labels.push(`${currentMonth} ${currentYear}`);
        counts[`${currentMonth} ${currentYear}`] = 0;
      }
    }
  }

  // Count the number of leads for each interval
  data.forEach(lead => {
    const leadDate = new Date(lead.timestamp);

    if (isDaily) {
      const leadDateString = leadDate.toLocaleDateString('en-US');
      if (labels.includes(leadDateString)) {
        counts[leadDateString]++;
      }
    } else {
      const leadMonth = leadDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (labels.includes(leadMonth)) {
        counts[leadMonth]++;
      }
    }
  });

  // Remove labels with zero data
  const nonZeroLabels = labels.filter(label => counts[label] !== 0);

  // Prepare data for Line chart
  const lineChartData = {
    labels: nonZeroLabels,
    datasets: [{
      label: 'Number of Leads',
      data: nonZeroLabels.map(label => counts[label]),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      fill: false
    }]
  };

  // Prepare data for Pie chart
  const pieChartData = {
    labels: nonZeroLabels,
    datasets: [{
      data: nonZeroLabels.map(label => counts[label]),
      backgroundColor: nonZeroLabels.map(() => `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`),
      borderColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 1
    }]
  };

  setLineChartData(lineChartData);
  setPieChartData(pieChartData);
};

const options = {
  aspectRatio: 2, // Adjust the aspect ratio according to your preference
  maintainAspectRatio: false, // Set to false to allow the chart to fill its container
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
   // Check if data is loading
   if (isLoading) {
    // Display "Loading data..." for vendors or when admin has selected a vendor
    if (user.role === 'vendor' || (user.role === 'admin' && selectedVendor)) {
      return <div className="chart-message">Loading data...</div>;
    }
  }

  // For admin without a selected vendor, prompt to select a vendor
  if (user.role === 'admin' && !selectedVendor) {
    return <div className="chart-message">Please Select a Vendor</div>;
  }

  // If there's no data to display
  if (vendorLeadsData.length === 0) {
    return <div className="chart-message">Loading Data...</div>;
  }

  // If there's data, render the charts
  if (lineChartData.datasets.length > 0) {
    const pieChartOptions = {
      plugins: {
        legend: {
          display: false, // Hide the legend for the Pie chart
        },
      },
    };
  
      return (
        <div className="charts-container">
          <div className="filters-container">
          <label className='filter-label'>
            {selectedInterval === 'monthly' ? 'Start Month ' : 'Start Date '}:
            {selectedInterval === 'monthly' ? (
              <select value={startMonth} onChange={(e) => handleMonthChange('startMonth', e.target.value)} className='filter-input'>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            ) : (
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className='filter-input'
              />
            )}
          </label>
          <label className='filter-label'>
            {selectedInterval === 'monthly' ? 'End Month' :  'End Date '}: 
            {selectedInterval === 'monthly' ? (
              <select value={endMonth} onChange={(e) => handleMonthChange('endMonth', e.target.value)} className='filter-input'>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            ) : (
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className='filter-input'
              />
            )}
          </label>
          <label className='filter-label'>
            Interval: 
            <select value={selectedInterval} onChange={(e) => handleIntervalChange(e.target.value)} className='filter-input'>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          {selectedInterval === 'monthly' && (
            <button onClick={handleFilter} className='filter-icon-button'>
            <FontAwesomeIcon icon={faSearch} /> Search
          </button>
          )}
        </div>
          <div className={`chart-container ${selectedInterval === 'daily' ? 'full-width' : ''}`}>
          <Line data={lineChartData} options={options} />
          </div>
          {selectedInterval !== 'daily' && (
            <div className="pie-chart-container">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          )};
        </div>
      );
    }
  
    return null;
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
      {user.role === 'admin' && <VendorSearchBar />}
      <h2>
          {user.role === 'vendor' ? `${user.username}'s Leads` : `${selectedVendor ? `${selectedVendor}'s Leads` : ""}`}
      </h2>
      {renderCharts()}
      {vendorLeadsData.length > 0 && (
        <div className="tables-container">
          <VendorTable
            data={currentLeads}
            onEdit={handleEdit}
            onSave={handleUpdate}
            editRowId={editRowId}
            editableData={editableData}
            handleEditChange={handleEditChange}
            handleBookedStatusChange={handleBookedStatusChange}
          />
        </div>
      )}
      <br></br>
      {vendorLeadsData.length > 0 && (
      <div className="d-flex justify-content-center">
        <Pagination>
          <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
          {pages}
          <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>
      )}
      <br></br>
    </div>
  </div>
);
};


export default VendorHome;