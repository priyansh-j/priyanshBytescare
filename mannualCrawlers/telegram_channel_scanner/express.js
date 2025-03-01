const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse incoming JSON requests

const FLASK_API_URL = 'http://127.0.0.1:5000/search';


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Optionally, explicitly define a route for the root to serve the index.html
app.get('/telegram_channels', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
    }

    try {
        const response = await axios.get(`${FLASK_API_URL}?query=${encodeURIComponent(query)}`);
        res.type('text/csv').send(response.data);
    } catch (error) {
        console.error('Error calling Flask API:', error.message);
        res.status(500).json({ message: "Failed to retrieve data" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
