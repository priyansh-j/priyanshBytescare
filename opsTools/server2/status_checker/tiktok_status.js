const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const proxyAgent = new HttpsProxyAgent("http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000");

// Function to extract username from URL
function extractUsername(url) {
    const match = url.match(/\/@([^/]+)/);
    return match ? match[1] : null;
}

// Function to check the status of a single URL
async function checkUrlStatus(url) {
    const username = extractUsername(url);
    if (!username) {
        return { url, status: 'invalid URL' };
    }

    try {
        const response = await axios.get(url, { httpsAgent: proxyAgent });
        const responseData = response.data;

        if (responseData.includes(`"uniqueId":"${username}"`)) {
            return { url, status: 'Active' };
        } else if (responseData.includes('Video currently unavailable')) {
            return { url, status: 'Inactive' };
        } else if (responseData.includes('This account is private')) {
            return { url, status: 'Account Private' };
        } else {
            return { url, status: 'Unknown' };
        }
    } catch (error) {
        console.error(`Error fetching URL: ${url}`);
        return { url, status: 'error' };
    }
}

// Function to check the status of all URLs
async function checkAllUrls(urls) {
    const results = [];
    for (const url of urls) {
        const result = await checkUrlStatus(url);
        results.push(result);
    }
    return results;
}

// Function to write results to a CSV file
async function writeCsv(results, filePath) {
    const csvWriter = createCsvWriter({
        path: filePath,
        header: [
            { id: 'url', title: 'URL' },
            { id: 'status', title: 'Status' }
        ],
        append: false
    });
    await csvWriter.writeRecords(results);
}

module.exports = {
    checkAllUrls,
    writeCsv
};