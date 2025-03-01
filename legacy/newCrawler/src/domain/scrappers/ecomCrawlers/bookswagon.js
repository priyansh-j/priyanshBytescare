import * as cheerio from "cheerio";
import logger from "../../../infra/logging/index.js";

async function fetchAndExtract(page, keyword) {
    const results = [];
    const pageUrl = `https://www.bookswagon.com/search-books/${keyword}`;
    
    logger.info(`Visiting ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: "networkidle2" });

    const html = await page.content();
    const $ = cheerio.load(html);
    const blockText = $('div#infoDiv').text();

    if (blockText.includes("solve the CAPTCHA")) {
        logger.warn(`CAPTCHA detected on ${pageUrl}.`);
        return { state: "CAPTCHA_DETECTED", results: [] };
    }

    const organicResults = $('div.list-view-books');
    organicResults.each((index, element) => {
        const rowSelector = cheerio.load($(element).html());
        const priceInfo = rowSelector('div.price-attrib');

        const item = {
            title: rowSelector('.title a').text(),
            isbn13: rowSelector('.title a').attr('data-isbn13') || '', // Assuming ISBN-13 is extracted from an attribute
            source: rowSelector('.title a').attr('href'),
            price: priceInfo.find('.price .sell').text().trim(),
            mrp: priceInfo.find('.price .list').text().trim(),
            binding: priceInfo.find('div.attributes-title').first().text().trim(),
            releaseDate: priceInfo.find('div.attributes-title').eq(1).text().trim(),
            publisher: rowSelector('div.author-publisher a').first().text().trim(),
            coverImage: rowSelector('div.cover img').attr('src'),
            author: rowSelector('div.author-publisher')
                .eq(1)
                .find('a')
                .map((i, el) => $(el).text())
                .get()
                .join(', '),
        };

        const { title, source, ...otherProperties } = item;

        if (source && source !== "" && source !== "NA- Out of Stock") {
            results.push({
                title,
                source,
                description: JSON.stringify(otherProperties),
            });
        }
    });

    if (results.length === 0) {
        logger.info(`No data found for keyword '${keyword}'.`);
    }

    return results ;
}

export async function bookswagonSearch(page, keyword) {
    try {
        const response = await fetchAndExtract(page, keyword);
        return response;
    } catch (error) {
        logger.error(`Error while processing keyword '${keyword}': ${error}`);
        throw error;
    }
}
