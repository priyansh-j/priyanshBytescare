const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { scrapeData } = require('./amazon_seller'); // Ensure the correct path
const { scrapeFlipkartData } = require('./flipkart_seller'); // Ensure the correct path
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Amazon Seller Route Handlers
app.get('/amazon_seller', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'amazon_seller.html'));
});

app.post('/amazon_seller', async (req, res) => {
    let asins = req.body.asins;
    let results = [];

    const csvWriter = createCsvWriter({
        path: 'results.csv',
        header: [
            { id: 'price', title: 'Price' },
            { id: 'mrp', title: 'MRP' },
            { id: 'discount', title: 'Discount' },
            { id: 'condition', title: 'Condition' },
            { id: 'seller', title: 'Seller' },
            { id: 'sellerID', title: 'SellerID' },
            { id: 'ASIN', title: 'ASIN' },
            { id: 'SellerListingLink', title: 'SellerListingLink' }
        ]
    });

    for (let asin of asins) {
        const data = await scrapeData(asin);
        console.log('Scraped data for ASIN:', asin, data);
        results.push(...data);
    }

    await csvWriter.writeRecords(results)
        .then(() => {
            console.log('Data written to CSV file successfully');
        });

    const csvData = fs.readFileSync('results.csv', 'utf8');
    res.json({ results, csvData });
});

app.get('/download-csv', (req, res) => {
    const filePath = path.join(__dirname, 'results.csv');
    res.download(filePath, 'results.csv', (err) => {
        if (err) {
            console.error('Error downloading the file:', err);
            res.status(500).send('Error downloading the file');
        }
    });
});

// Flipkart Seller Route Handlers
app.get('/flipkart_seller', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'flipkart_seller.html'));
});

app.post('/flipkart_seller', async (req, res) => {
    let pids = req.body.pids;
    let results = [];

    const csvWriter = createCsvWriter({
        path: 'flipkart_results.csv',
        header: [
            { id: 'price', title: 'Price' },
            { id: 'mrp', title: 'MRP' },
            { id: 'discount', title: 'Discount' },
            { id: 'seller', title: 'Seller' },
            { id: 'ISBN', title: 'ISBN' },
           
        ]
    });

    for (let pid of pids) {
        try {
            const data = await scrapeFlipkartData(pid);
            console.log('Scraped data for PID:', pid, data);
            results.push(...data);
        } catch (error) {
            console.error(`Error scraping data for PID ${pid}: ${error}. Retrying...`);
            // Restart the browser and retry
            try {
                const data = await scrapeFlipkartData(pid);
                console.log('Scraped data for PID:', pid, data);
                results.push(...data);
            } catch (retryError) {
                console.error(`Retry failed for PID ${pid}: ${retryError}`);
            }
        }
    }

    await csvWriter.writeRecords(results)
        .then(() => {
            console.log('Data written to CSV file successfully');
        });

    const csvData = fs.readFileSync('flipkart_results.csv', 'utf8');
    res.json({ results, csvData });
});

app.get('/download-flipkart-csv', (req, res) => {
    const filePath = path.join(__dirname, 'flipkart_results.csv');
    res.download(filePath, 'flipkart_results.csv', (err) => {
        if (err) {
            console.error('Error downloading the file:', err);
            res.status(500).send('Error downloading the file');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});






















// const express = require('express');
// const bodyParser = require('body-parser');
// const path = require('path');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// const { scrapeData } = require('./amazon_seller');
// const fs = require('fs');

// const app = express();
// const port = 3000;

// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

// app.post('/scrape', async (req, res) => {
//     let asins = req.body.asins;
//     let results = [];

//     const csvWriter = createCsvWriter({
//         path: 'results.csv',
//         header: [
//             { id: 'price', title: 'Price' },
//             { id: 'mrp', title: 'MRP' },
//             { id: 'discount', title: 'Discount' },
//             { id: 'condition', title: 'Condition' },
//             { id: 'seller', title: 'Seller' },
//             { id: 'sellerID', title: 'SellerID' },
//             { id: 'ASIN', title: 'ASIN' },
//             { id: 'SellerListingLink', title: 'SellerListingLink' }
//         ]
//     });

//     for (let asin of asins) {
//         const data = await scrapeData(asin);
//         console.log('Scraped data for ASIN:', asin, data); // Log the scraped data
//         results.push(...data);
//     }

//     await csvWriter.writeRecords(results)
//         .then(() => {
//             console.log('Data written to CSV file successfully');
//         });

//     const csvData = fs.readFileSync('amazon_results.csv', 'utf8');
//     res.json({ results, csvData });
// });

// app.get('/download-csv', (req, res) => {
//     const filePath = path.join(__dirname, 'results.csv');
//     res.download(filePath, 'results.csv', (err) => {
//         if (err) {
//             console.error('Error downloading the file:', err);
//             res.status(500).send('Error downloading the file');
//         }
//     });
// });

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });
