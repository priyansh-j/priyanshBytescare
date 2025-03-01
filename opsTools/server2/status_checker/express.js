const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const cors = require('cors');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const bodyParser = require('body-parser');
const { processTikTokLinks, writeCsv } = require('./tiktok_whitelist');
const { checkAllUrls, writeCsv: writeStatusCsv } = require('./tiktok_status');
const { gatherInfoForDomains, writeToCsv } = require('./osint.js'); // Adjust the path as needed
const { processFacebookWhitelist } = require('./facebook_whitelist');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const port = process.env.PORT || 8080;  //8080
const agent = new https.Agent({  
  rejectUnauthorized: false  // Bypasses SSL certificate verification
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));


let proxies = {
  "http": "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000",
  "https": "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000",
};



const jsonToCSV = (jsonData) => {
  const csvRows = [];
  // Get the headers or column titles
  const headers = Object.keys(jsonData[0]);
  csvRows.push(headers.join(',')); // Create the header row

  // Loop over the rows
  for (const row of jsonData) {
      const values = headers.map(header => {
          const escaped = ('' + row[header]).replace(/"/g, '\\"'); // Handle data that may have commas or double-quotes
          return `"${escaped}"`;
      });
      csvRows.push(values.join(',')); // Add new row to CSV results
  }

  return csvRows.join('\n'); // Create final CSV string
}

// telegram_search channels
//  const FLASK_API_URL = 'http://host.docker.internal:5000/search';
const FLASK_API_URL = 'http://flask_server:5000/search';



// Route to proxy search queries to a Flask server
app.get('/telegram_channels', async (req, res) => {
  if (req.query.query) {
    try {
      const response = await axios.get(`${FLASK_API_URL}?query=${encodeURIComponent(req.query.query)}`, {
        httpsAgent: agent
      });
      res.type('text/csv').send(response.data);
    } catch (error) {
      console.error('Error calling Flask API:', error.message);
      res.status(500).json({ message: "Failed to retrieve data" });
    }
  } else {
    res.sendFile(path.join(__dirname, 'public', 'telegram_channel.html'));
  }
});



// amazon
app.get('/amazon-urls', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'amazon.html'));
});

// Endpoint to check amazon URLs
app.post('/amazon-urls', async (req, res) => {
  const { urls } = req.body;
  if (!urls || urls.length === 0) {
    return res.status(400).json({ message: "No URLs provided" });
  }
  const results = await checkAmazonURLs(urls);
    const csvData = jsonToCSV(results);
    res.header('Content-Type', 'text/csv');
    res.attachment("results.csv"); // Triggers a download
    return res.send(csvData);
  // const results = await checkMultipleURLs(urls);
  // res.json(results);
});


//flipkart
app.get('/flipkart-urls', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'flipkart.html'));
});


// Endpoint to check Flipkart URLs
app.post('/flipkart-urls', async (req, res) => {
  const { urls } = req.body;
  if (!urls || urls.length === 0) {
    return res.status(400).json({ message: "No URLs provided" });
  }
  const results = await checkFlipkartURLs(urls);
  const csvData = jsonToCSV(results);
    res.header('Content-Type', 'text/csv');
    res.attachment("results.csv"); // Triggers a download
    return res.send(csvData);
  // const results = await checkFlipkartURLs(urls);
  // res.json(results);
});



const checkAmazonAvailability = async (url) => {
  try {
    const response = await axios.get(url, {
      httpsAgent: agent,
      proxies: proxies,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Resolves for 2xx and 4xx status codes
      }
    });

    const $ = cheerio.load(response.data);
    const title = $('title').text();

    if (title.includes('Page Not Found')) {
      return { url, status: 'Removed' };
    }

    const outOfStock = $('#outOfStock');
    if (outOfStock.length) {
      return { url, status: 'Unavailable' };
    }

    return { url, status: 'Available' };
  } catch (error) {
    console.error('Error fetching the page:', error);
    return { url, status: 'Error' }; 
  }
};

const checkAmazonURLs = async (urls) => {
  const promises = urls.map(url => checkAmazonAvailability(url));
  return Promise.all(promises);
};




// Function to check the status of Flipkart URLs
const checkFlipkartURLStatus = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Cookie': 'K-ACTION=null; SN=VI4777F746E3914011B4C1E4AD541AB032.TOK99D3621E596F4FF0A91429F8637C52BC.1715342717.LO; T=TI171534271726400183165858184780916221300396524652112049980957740416; at=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQ2Yjk5NDViLWZmYTEtNGQ5ZC1iZDQyLTFkN2RmZTU4ZGNmYSJ9.eyJleHAiOjE3MTcwNzA3MTcsImlhdCI6MTcxNTM0MjcxNywiaXNzIjoia2V2bGFyIiwianRpIjoiYzM1NmNiZWUtYWRlNi00MzliLTliMTMtMmQ4ODljOGI3NmZkIiwidHlwZSI6IkFUIiwiZElkIjoiVEkxNzE1MzQyNzE3MjY0MDAxODMxNjU4NTgxODQ3ODA5MTYyMjEzMDAzOTY1MjQ2NTIxMTIwNDk5ODA5NTc3NDA0MTYiLCJrZXZJZCI6IlZJNDc3N0Y3NDZFMzkxNDAxMUI0QzFFNEFENTQxQUIwMzIiLCJ0SWQiOiJtYXBpIiwidnMiOiJMTyIsInoiOiJIWUQiLCJtIjp0cnVlLCJnZW4iOjR9.B2jYyinQy-RtweMM9j3zlXmJS_aVp1EU0mXXWriafpw; rt=null'
      },
      proxies: proxies,
      validateStatus: false
    });
    const $ = cheerio.load(response.data);
    const retryButton = $('#timer_text.disable_btn');
    if (retryButton.length > 0) {
      return { url, status: 'Removed' };
    }

    const soldOutDiv = $('.Z8JjpR').filter(function () {
      return $(this).text().trim() === 'Sold Out';
    });
    if (soldOutDiv.length > 0) {
      return { url, status: 'Sold Out' };
    }

    const unavailableDiv = $('.Z8JjpR').filter(function () {
      return $(this).text().trim() === 'Currently Unavailable';
    });
    if (unavailableDiv.length > 0) {
      return { url, status: 'Unavailable' };
    }

    const priceDiv = $('.hl05eU');
    if (priceDiv.length > 0) {
      return { url, status: 'Available' };
    }

    return { url, status: 'Check Manually' };

  } catch (error) {
    console.error(`Error fetching the page for URL [${url}]:`, error);
    return { url, status: 'Error' };
  }
};

// Function to check multiple Flipkart URLs
const checkFlipkartURLs = async (urls) => {
  const promises = urls.map(url => checkFlipkartURLStatus(url));
  return Promise.all(promises);
};


//youtube id extractor 

app.get('/youtube_id_extractor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'youtube_id.html'));
});

app.post('/youtube_id_extractor', async (req, res) => {
  const urls = req.body.urls;
  const filePath = `status_checker/youtube_result.csv`;

  const csvWriter = createCsvWriter({
      path: filePath,
      header: [
          {id: 'url', title: 'URL'},
          {id: 'canonicalLink', title: 'Canonical Link'}
      ],
      append: false // Change to true if you want to append to the same file
  });

  if (!fs.existsSync(filePath)) {
      await csvWriter.writeRecords([]); // Write the header if the file does not exist
  }

  await processUrls(urls, csvWriter);
  res.json({ message: 'Scraping complete. Data written to CSV.', filePath: `/youtube_result.csv` });
});

async function fetchCanonicalLink(url) {
  try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      const canonicalLink = $('link[rel="canonical"]').attr('href');
      return canonicalLink || 'Canonical URL not found';
  } catch (error) {
      console.error(`Error fetching URL: ${url}, Error: ${error}`);
      return 'Error fetching URL';
  }
}

async function processUrls(urls, csvWriter) {
  const records = [];
  for (const url of urls) {
      const canonicalLink = await fetchCanonicalLink(url);
      records.push({ url, canonicalLink });
      console.log(`Processed URL: ${url}`);
  }
  await csvWriter.writeRecords(records);
  console.log('All URLs have been processed.');
}

// Serve the CSV file
app.get('/youtube_result.csv', (req, res) => {
  res.sendFile(path.join(__dirname, 'youtube_result.csv'));
});


//tiktok whitelist
// Serve the HTML file
app.get('/tiktok_whitelist', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tiktok_whitelist.html'));
});

// Handle the POST request for processing TikTok links
app.post('/tiktok_whitelist', async (req, res) => {
  const { submittedLinks, officialLinks } = req.body;

  try {
    const { Whitelist_Links, Non_Whitelist_Links, check_manual } = processTikTokLinks(submittedLinks, officialLinks);

    const filePath = path.join(__dirname, 'public', 'tiktok_whitelist_links.csv');

    await writeCsv(Whitelist_Links, Non_Whitelist_Links, check_manual, filePath);

    res.json({ success: true, Whitelist_Links, Non_Whitelist_Links, check_manual });
  } catch (error) {
    console.error('Error processing links:', error);
    res.status(500).json({ success: false, error: 'Error processing links.' });
  }
});

// Serve the CSV file for download
app.get('/tiktok_whitelist_links.csv', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'tiktok_whitelist_links.csv');
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'tiktok_links.csv', (err) => {
      if (err) {
        console.error('Error downloading CSV file:', err);
        res.status(500).json({ success: false, error: 'Error downloading CSV file.' });
      }
    });
  } else {
    res.status(404).send('File not found');
  }
});

//tiktok status checker 

app.get('/tiktok_status_checker', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tiktok_status.html'));
});

app.post('/tiktok_status_checker', async (req, res) => {
  const { urls } = req.body;
  try {
      const results = await checkAllUrls(urls);
      const filePath = path.join(__dirname, 'public', 'tiktok_status.csv');
      await writeStatusCsv(results, filePath);
      res.json({ success: true, results });
  } catch (err) {
      console.error('Error checking URL statuses:', err);
      res.status(500).json({ success: false, error: err });
  }
});

// Serve the CSV file for download
app.get('/tiktok_status.csv', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'tiktok_status.csv');
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'tiktok_status.csv', (err) => {
      if (err) {
        console.error('Error downloading CSV file:', err);
        res.status(500).json({ success: false, error: 'Error downloading CSV file.' });
      }
    });
  } else {
    res.status(404).send('File not found');
  }
});


//Osint scan
app.get('/Osint_domains', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'osint.html'));
});
app.post('/Osint_domains', async (req, res) => {
const domains = req.body.domains;

try {
  const results = await gatherInfoForDomains(domains);
  const filePath = path.join(__dirname, 'public', 'domain_info.csv');  
  await writeToCsv(results);

  res.json({ filePath: '/osint_csv_download' }); // Adjust the response to the download endpoint
} catch (error) {
  console.error('Error gathering info:', error);
  res.status(500).send('Server Error');
}
});

app.get('/osint_csv_download', (req, res) => {
const filePath = path.join(__dirname, 'public', 'domain_info.csv'); 
res.download(filePath, 'domain_info.csv', (err) => {
  if (err) {
    console.error('Error downloading the file:', err);
    res.status(500).send('Server Error');
  }
});
});
const puppeteerServiceUrl = process.env.PUPPETEER_SERVICE_URL || 'http://puppeteer_service:3000';
// const puppeteerServiceUrl = 'http://127.0.0.1:3000';

//facebook whitelist
app.get('/facebook_whitelist', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'facebook_whitelist.html'));
});


app.post('/facebook_whitelist', async (req, res) => {
  const { submittedUrls, officialUrls } = req.body;
  if (!submittedUrls || !officialUrls) {
      return res.status(400).send('Missing URL input');
  }
    const submitted_urls = submittedUrls.split(/\s+/).map(url => url.trim()).filter(url => url);
    const official_urls = officialUrls.split(/\s+/).map(url => url.trim()).filter(url => url);
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  try {
    console.log("URL PUPPYGER",puppeteerServiceUrl)
      // Request the file from Puppeteer
      const response = await axios.post(`${puppeteerServiceUrl}/facebook_whitelist`, {
          submitted_urls,
          official_urls,
      }, { responseType: 'arraybuffer' }); // Receive file content as a buffer
      console.log("RESPONSE",response)
      const fileName = `facebook_whitelist_${timestamp}.csv`;
      // const fileName = `output.csv`;
      const filePath = path.join(__dirname, 'public', fileName);

      // Save the file temporarily to the Express server's public folder
      fs.writeFileSync(filePath, response.data);

      // Respond with the file name for frontend download
      res.json({ fileName });


  } catch (error) {
      console.error('Error processing URLs:', error);
      res.status(500).send('Server error');
  }
});

// Endpoint to download the generated CSV file
app.get('/download/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'public', fileName);

  if (fs.existsSync(filePath)) {
      res.download(filePath, err => {
          if (err) {
              console.error('Error downloading file:', err);
              res.status(500).send('Error downloading file');
          }

          // Optionally delete the file after download
          fs.unlinkSync(filePath);
      });
  } else {
      res.status(404).send('File not found');
  }
});


app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});




