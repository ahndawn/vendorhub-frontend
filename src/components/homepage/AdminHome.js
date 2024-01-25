import React, { useState, useEffect } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2'; 
import Chart from 'chart.js/auto';
import './AdminHome.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'; 
import { Pagination } from 'react-bootstrap';

const AdminHome = () => {

  const [currentChart, setCurrentChart] = useState('exclusive');
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(20); 
  const [totalPages, setTotalPages] = useState(0);
  
  // Function to get today's date in a readable format
  const todaysDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Declare state and setter functions for all your data
  const [todaysExclusiveLeadsData, setTodaysExclusiveLeadsData] = useState([]);
  const [todaysSharedLeadsData, setTodaysSharedLeadsData] = useState([]);
  const [exclusiveLabelsData, setExclusiveLabelsData] = useState([]);
  const [sharedLabelsData, setSharedLabelsData] = useState([]);
  const [exclusiveGronatData, setExclusiveGronatData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [sharedGronatData, setSharedGronatData] = useState({ labels: [], datasets: [{ data: [] }] });;
  const [combinedLeadsData, setCombinedLeadsData] = useState([]);
  const [currentLeadsData, setCurrentLeadsData] = useState([]); 
  const [isExclusive, setIsExclusive] = useState(true);
  



   // Retrieve and parse user data from local storage
   const userString = localStorage.getItem('user');
   const user = userString ? JSON.parse(userString) : null;

    // Function to aggregate data for the charts
const aggregateDataByLabel = (data) => {
  const labelCounts = data.reduce((acc, lead) => {
    acc[lead.label] = (acc[lead.label] || 0) + 1;
    return acc;
  }, {});
  return labelCounts;
};

// Function to prepare data for the pie chart
const preparePieChartData = (aggregatedData) => {
  return {
    labels: Object.keys(aggregatedData),
    datasets: [{
      data: Object.values(aggregatedData),
      backgroundColor: Object.keys(aggregatedData).map(() => generateRandomColor()),
      borderColor: 'transparent',
      borderWidth: 1
    }]
  };
};

// Function to prepare data for the line chart
const prepareLineChartData = (aggregatedData, label) => {
  return {
    labels: Object.keys(aggregatedData),
    datasets: [{
      label: label,
      data: Object.values(aggregatedData),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      fill: false
    }]
  };
};

   
 
   useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.token) {
        console.log('Waiting for user authentication...');
        return;
      }
  
      try {
        const headers = {
          'Authorization': `Bearer ${user.token}`
        };
  
        // Fetch data based on currentChart
        const response = await fetch(`http://localhost:4000/api/admin/${currentChart}-leads`, { headers });
        const data = await response.json();
        setCurrentLeadsData(data);
        setTotalPages(Math.ceil(data.length / leadsPerPage));
  
        const aggregatedData = aggregateDataByLabel(data);
      const pieChartData = preparePieChartData(aggregatedData);
      const lineChartData = prepareLineChartData(aggregatedData, `${currentChart.charAt(0).toUpperCase() + currentChart.slice(1)} Leads`);

      if (currentChart === 'exclusive') {
        setExclusiveGronatData(pieChartData);
        setExclusiveLabelsData(lineChartData);
      } else {
        setSharedGronatData(pieChartData);
        setSharedLabelsData(lineChartData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, [currentChart, leadsPerPage]);

 // Determine which chart data to use based on currentChart
 const pieChartData = currentChart === 'exclusive' ? exclusiveGronatData : sharedGronatData;
 const lineChartData = currentChart === 'exclusive' ? exclusiveLabelsData : sharedLabelsData;



  // Pagination logic
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = currentLeadsData.slice(indexOfFirstLead, indexOfLastLead);

  const paginate = pageNumber => setCurrentPage(pageNumber);
 

  // Function to generate paler random colors
  const generateRandomColor = () => {
    const mix = [255, 255, 255]; // Color to mix (white)
    let red = Math.floor(Math.random() * 256);
    let green = Math.floor(Math.random() * 256);
    let blue = Math.floor(Math.random() * 256);

    // Mix the color
    red = Math.floor((red + mix[0]) / 2);
    green = Math.floor((green + mix[1]) / 2);
    blue = Math.floor((blue + mix[2]) / 2);

    const rgb = `rgb(${red}, ${green}, ${blue})`;
    return rgb;
  }


  const renderTable = (data) => {
    if (!Array.isArray(data)) {
      console.error('Expected an array for table data, received:', data);
      return <div>No data available.</div>;
    }

    return (
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
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.timestamp}</td>
              <td>{item.label}</td>
              <td>{item.firstname}</td>
              <td>{item.ozip || item.ocity || item.ostate}</td>
              <td>{item.dzip || item.dcity + ', ' + item.dstate}</td>
              <td>{item.movesize}</td>
              <td>{item.movedte}</td>
              <td>{item.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
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

  
    const handleNext = () => {
      const newChart = currentChart === 'exclusive' ? 'shared' : 'exclusive';
      setCurrentChart(newChart);
      setCurrentLeadsData(newChart === 'exclusive' ? todaysExclusiveLeadsData : todaysSharedLeadsData);
  };

  const handlePrev = () => {
    const newChart = currentChart === 'exclusive' ? 'shared' : 'exclusive';
    setCurrentChart(newChart);
    setCurrentLeadsData(newChart === 'exclusive' ? todaysExclusiveLeadsData : todaysSharedLeadsData);
};

const toggleLeadsData = () => {
  setIsExclusive(!isExclusive); // Toggle between exclusive and shared leads
  setCurrentChart(isExclusive ? 'shared' : 'exclusive');
  setCurrentLeadsData(isExclusive ? todaysSharedLeadsData : todaysExclusiveLeadsData);
};

  const exclusiveLeadsLineChartData = prepareLineChartData(todaysExclusiveLeadsData, 'Exclusive Leads', 'rgba(54, 162, 235, 0.5)');
  const sharedLeadsLineChartData = prepareLineChartData(todaysSharedLeadsData, 'Shared Leads', 'rgba(255, 99, 132, 0.5)');
  const exclusiveLeadsPieChartData = preparePieChartData(todaysExclusiveLeadsData);
  const sharedLeadsPieChartData = preparePieChartData(todaysSharedLeadsData);

      // Chart options for displaying labels inside the chart
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                // Ensure that label and value are correctly referenced
                const label = context.label || '';
                const value = context.raw; // Use 'raw' to get the actual value
                return `${label}: ${value}`;
              }
            }
          }
        }
      };
      console.log('Pie Chart Data:', pieChartData);
      console.log('Line Chart Data:', lineChartData);

      return (
        <div className="admin-dashboard-wrapper">
          <div className="admin-dashboard">
          <h2>{isExclusive ? "Exclusive" : "Shared"} Leads for {todaysDate()}</h2>
    
          <div className="charts-carousel">
          {isExclusive && (
            <button onClick={toggleLeadsData} className="carousel-control right">
              <FaArrowRight />
              <span className="button-label">Shared</span>
            </button>
          )}
          {!isExclusive && (
            <button onClick={toggleLeadsData} className="carousel-control left">
              <FaArrowLeft />
              <span className="button-label">Exclusive</span>
            </button>
          )}
    
              <div className="charts-container">
              {currentChart === 'exclusive' ? (
            <>
              <div className="chart-container">
              {lineChartData && lineChartData.datasets && lineChartData.datasets.length > 0 && (
                <Line data={lineChartData} options={chartOptions} />
              )}
              </div>
              <div className="pie-chart-container">
              {pieChartData && pieChartData.datasets && pieChartData.datasets.length > 0 && (
                <Pie data={pieChartData} options={chartOptions} />
              )}
              </div>
            </>
          ) : (
            <>
              <div className="chart-container">
              {lineChartData && lineChartData.datasets && lineChartData.datasets.length > 0 && (
                <Line data={lineChartData} options={chartOptions} />
              )}
              </div>
              <div className="pie-chart-container">
              {pieChartData && pieChartData.datasets && pieChartData.datasets.length > 0 && (
                <Pie data={pieChartData} options={chartOptions} />
              )}
              </div>
            </>
          )}
              </div>
            </div>

            <div className="tables-container">
          {renderTable(currentLeads)}
        </div>
        <br></br>
        <div className="d-flex justify-content-center">
          {renderPagination()}
        </div>
        <br></br>
          </div>
        </div>
      );
    };

export default AdminHome;