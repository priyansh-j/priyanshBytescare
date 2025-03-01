const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeFlipkartData(pid) {
    let browser;
    let results = [];

    try {
        browser = await puppeteer.launch();
        results = await fetchAndExtract(browser, pid);
    } catch (error) {
        console.error(`Error processing PID ${pid}: ${error}`);
        logError(pid, error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    return results;
}

async function fetchAndExtract(browser, pid) {
    let page;
    try {
        page = await browser.newPage();
        const pageUrl = `https://www.flipkart.com/sellers?pid=${pid}`;
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });
        const body = await page.content();
        return extractData(body, pid);
    } catch (error) {
        console.error(`Error fetching and extracting PID ${pid}: ${error}`);
        throw error;
    } finally {
        if (page) {
            await page.close();
        }
    }
}

function extractData(body, pid) {
    let $ = cheerio.load(body);
    let results = [];
    let organic_results = $('div.UQFoop');

    organic_results.each((i, elem) => {
        let row = cheerio.load($(elem).html());
        let serp_obj = {
            price: row('div.Nx9bqj').text().trim(),
            mrp: row('div.yRaY8j').text().trim(),
            discount: row('div.UkUFwK span').text().trim(),
            seller: row('div.EElWwG span').text().trim(),
            ISBN: pid,
            
        };

        if (serp_obj.seller) {
            results.push(serp_obj);
        }
    });

    console.log(`Found ${results.length} results for PID: ${pid}`);
    return results;
}

function logError(pid, error) {
    let existingErrors = [];
    if (fs.existsSync('error_pid.json')) {
        existingErrors = JSON.parse(fs.readFileSync('error_pid.json'));
    }
    existingErrors.push({ pid: pid, error: error.message });
    fs.writeFileSync('error_pid.json', JSON.stringify(existingErrors, null, 2));
    console.log(`Error for PID: ${pid} logged to file.`);
}

module.exports = {
    scrapeFlipkartData
};
