import * as cheerio from "cheerio";
import logger from "../../../infra/logging/index.js";

async function fetchAndExtract(page, keyword) {
    const results = [];
    const pageUrl = `https://www.sapnaonline.com/search?keyword=${query}`;
    
    logger.info(`Visiting ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: "networkidle2" });

    const html = await page.content();
    const $ = cheerio.load(html);
    const blockText = $('div#infoDiv').text();

    if (blockText.includes("solve the CAPTCHA")) {
        logger.warn(`CAPTCHA detected on ${pageUrl}.`);
        return { state: "CAPTCHA_DETECTED", results: [] };
    }

    const organicResults = $('div.sc-AxirZ.CategoryTabInner__ProductBox-qaa80s-0.jZjvfA');
    organicResults.each((index, element) => {
        const rowSelector = cheerio.load($(element).html());
        const priceInfo = rowSelector('div.sc-AxhCb.jSpsgy');

        const item = {
            title: rowSelector('.ProductCard__AboutText-sc-10n3822-2').text().trim(),
            source: "https://www.sapnaonline.com" + rowSelector('.ProductCard__AboutText-sc-10n3822-2').parent().attr('href'),
            price: priceInfo.find('.ProductCard__PrcieText-sc-10n3822-7').text().trim().replace("₹", '').trim(),
            mrp: priceInfo.find('.ProductCard__OldPrcieText-sc-10n3822-8').text().trim().replace("₹", '').trim(),
            discount: priceInfo.find('.ProductCard__DiscountPrcieText-sc-10n3822-9').text().trim(),
            author: rowSelector('h3.ProductCard__AuthorText-sc-10n3822-4').text().replace(/^by /, '').trim(),
            coverImage: rowSelector('img.bookImage').attr('src'),
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

export async function sapnaOnlineSearch(page, keyword) {
    try {
        const response = await fetchAndExtract(page, keyword);
        return response;
    } catch (error) {
        logger.error(`Error while processing keyword '${keyword}': ${error}`);
        throw error;
    }
}
