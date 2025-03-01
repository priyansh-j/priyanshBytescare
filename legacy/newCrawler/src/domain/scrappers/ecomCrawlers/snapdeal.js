import * as cheerio from "cheerio";
import logger from "../../../infra/logging/index.js";

async function fetchAndExtract(page, keyword) {
    const results = [];
    const pageUrl = `https://www.snapdeal.com/search?keyword=${keyword}&sort=rlvncy`;
    
    logger.info(`Visiting ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: "networkidle2" });

    const html = await page.content();
    const $ = cheerio.load(html);
    const blockText = $('div#infoDiv').text();

    if (blockText.includes("solve the CAPTCHA")) {
        logger.warn(`CAPTCHA detected on ${pageUrl}.`);
        return { state: "CAPTCHA_DETECTED", results: [] };
    }

    const organicResults = $('div.col-xs-6.favDp.product-tuple-listing.js-tuple');
    organicResults.each((index, element) => {
        const rowSelector = cheerio.load($(element).html());

        const item = {
            title: rowSelector('div.product-tuple-description > div.product-desc-rating > a > p').attr('title') || '',
            source: rowSelector('div.product-tuple-image > a').attr('href') || '',
            price: rowSelector('span.lfloat.product-price').text().replace('Rs.', '').trim() || '',
            mrp: rowSelector('span.lfloat.product-desc-price.strike').text().replace('Rs.', '').trim() || '',
            author: rowSelector('p.product-author-name').attr('title') || '',
            discount: rowSelector('div.product-discount').text().trim() || '',
            coverImage: rowSelector('div.product-tuple-image > a > picture > img').attr('src') || '',
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

export async function snapdealSearch(page, keyword) {
    try {
        const response = await fetchAndExtract(page, keyword);
        return response;
    } catch (error) {
        logger.error(`Error while processing keyword '${keyword}': ${error}`);
        throw error;
    }
}
