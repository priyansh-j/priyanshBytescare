import * as cheerio from "cheerio";
import logger from "../../../infra/logging/index.js";

const PageNumber = 2;

async function fetchAndExtract(page,keyword) {
    const results = [];

    for (let pageNum = 1; pageNum <= PageNumber; pageNum++) {
        const pageUrl = `https://www.flipkart.com/search?q=${keyword}&page=${pageNum}`;
        logger.info(`Visiting ${pageUrl}`);
        await page.goto(pageUrl, { waitUntil: "networkidle2" });
        
        const html = await page.content();
        const $ = cheerio.load(html);
        $("div.slAVV4").each((index, element) => {
            const fullUrl = `https://www.flipkart.com${$(element).find("a").attr("href")}`;
            const parsedUrl = new URL(fullUrl);
            const cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}?pid=${parsedUrl.searchParams.get("pid")}`;

            // Collect all data
            const item = {
                title: $(element).find("a.wjcEIp").attr("title"),
                source: cleanUrl,
                Isbn: parsedUrl.searchParams.get("pid"),
                coverImage:$(element).find("img.DByuf4").attr("src"),
                price: $(element).find(".Nx9bqj").text().trim(),
                mrp: $(element).find(".yRaY8j").text().trim(),
                discount: $(element).find(".UkUFwK span").text().trim(),
                Format: $(element).find(".NqpwHC").text().trim(),
                rating: $(element).find(".XQDdHH").text().trim()
            };

            // Create the description from all other properties except title and source
            const { title, source, ...otherProperties } = item;
            results.push({
                title,
                source,
                description: JSON.stringify(otherProperties)
            });
        });

        if (results.length === 0) {
            logger.info(`No data found for ${keyword} on page ${pageNum}, stopping.`);
            break;
        }
    }

    return results;
}

export async function flipkartSearch(page,keyword) {
    try {
        const results = await fetchAndExtract(page,keyword);
        return results;
    } catch (error) {
        logger.error(`Error while processing keyword '${keyword}': ${error}`);
        throw error;
    }
}