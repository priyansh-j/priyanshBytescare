const express = require('express');
const { processFacebookWhitelist } = require('./facebook_whitelist');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

app.post('/facebook_whitelist', async (req, res) => {
    const { submitted_urls, official_urls } = req.body;

    if (!submitted_urls || !official_urls) {
        return res.status(400).send('Missing submitted or official URLs');
    }

    const outputDir = path.join(__dirname, 'public');
    const outputFilePath = path.join(outputDir, 'output.csv');

    try {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        await processFacebookWhitelist(submitted_urls, official_urls, outputFilePath);

        // Read the generated CSV file content
        const fileContent = fs.readFileSync(outputFilePath);

        // Send the file content as a buffer
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="output.csv"');
        res.send(fileContent);
    } catch (error) {
        console.error('Error processing Facebook whitelist:', error);
        res.status(500).send('Server error');
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Puppeteer service listening on port ${PORT}`);
});

