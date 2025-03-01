import * as cheerio from "cheerio";
import logger from "../../../infra/logging/index.js";

// Function to extract search results from the page content
function extractResults(body) {
    const $ = cheerio.load(body);
    const organic_results = $("#center_col .g");
    const results = [];

    const block_text = $("div#infoDiv").text();
    if (block_text.includes("solve the CAPTCHA")) {
        return [];
    }

    organic_results.each(function () {
        const row_selector = cheerio.load($(this).html());
        const serp_obj = {
            source: row_selector("div.yuRUbf > div > span > a").first().attr("href"),
            title: row_selector("div.yuRUbf > div > span > a > h3").first().text(),
            description: row_selector("div:nth-child(2) > div > span").text(),
        };

        if (serp_obj.source && serp_obj.source !== "") {
            results.push(serp_obj);
        }
    });
    return results;
}

// Function to get the page content using Puppeteer
async function getPageContent(url, page) {
    await page.goto(url, { waitUntil: "networkidle2" }); // Wait until page load
    const content = await page.content(); // Get the HTML content of the page
    return content;
}

// Function to perform Google search
async function ecomGoogleSearch(page,url) {
    //let url = `https://www.google.com/search?q=${keywords}&num=100`;
    logger.info(`Visiting ${url}`);
    try {
        const pageContent = await getPageContent(url, page); // Pass the `page` object
        const results = extractResults(pageContent);
        return results; // Return results for processing
    } catch (error) {
        console.error("Error during search:", error);
        throw error;
    }
}

export { ecomGoogleSearch };
