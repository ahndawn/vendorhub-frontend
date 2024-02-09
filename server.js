const express = require('express');
const path = require('path');
const cors = require('cors'); // Import the cors middleware
const app = express();
const port = process.env.PORT || 3000; // Use the provided port in Cloud Run

// Use the cors middleware to allow all origins
app.use(cors());

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'dist'))); // Updated path

// Handles any requests that don't match the above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname, 'dist/index.html')); // Updated path
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
