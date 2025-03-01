import * as cheerio from "cheerio";
import logger from "../../../infra/logging/index.js";

async function fetchAndExtract(page, keyword) {
    const results = [];
    const pageUrl = `https://www.aibh.in/search-products?search=${keyword}`;
    
    logger.info(`Visiting ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: "networkidle2" });

    const html = await page.content();
    const $ = cheerio.load(html);
    const blockText = $('div#infoDiv').text();

    if (blockText.includes("solve the CAPTCHA")) {
        logger.warn(`CAPTCHA detected on ${pageUrl}.`);
        return { state: "CAPTCHA_DETECTED", results: [] };
    }

    const organicResults = $('div.products-list__body > div.products-list__item:has(div.product-card)');
    organicResults.each((index, element) => {
        const rowSelector = cheerio.load($(element).html());

        const item = {
            title: rowSelector('div.product-card__name > a').first().text().trim(),
            source: rowSelector('div.product-card__name > a').first().attr("href"),
            price: rowSelector('span.product-card__new-price').first().text().replace(/[^0-9.]/g, ""),
            mrp: rowSelector('span.product-card__old-price').first().text().replace(/[^0-9.]/g, ""),
            coverImage: rowSelector('img.product-image__img').attr("src"),
            author: rowSelector('span.author-title > a').first().text().trim(),
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

    return results;
}

export async function aibhSearch(page, keyword) {
    try {
        const response = await fetchAndExtract(page, keyword);
        return response;
    } catch (error) {
        logger.error(`Error while processing keyword '${keyword}': ${error}`);
        throw error;
    }
}
