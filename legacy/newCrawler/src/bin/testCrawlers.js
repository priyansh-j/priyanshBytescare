import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import scrape from "../domain/scrappers/index.js";

puppeteer.use(StealthPlugin());

let RES_PROXY_HOST = process.env.RES_PROXY_HOST;
let RES_PROXY_PORT = process.env.RES_PROXY_PORT;
let RES_PROXY_USERNAME = process.env.RES_PROXY_USERNAME;
let RES_PROXY_PASSWORD = process.env.RES_PROXY_PASSWORD;

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [`--proxy-server=${RES_PROXY_HOST}:${RES_PROXY_PORT}`, "--no-sandbox", "--disable-setuid-sandbox"],
    });

    // const page = await browser.newPage();
    const pages = await browser.pages();
    const page = pages[0];
    await page.setViewport({ width: 1361, height: 926 });

    await page.authenticate({
        username: RES_PROXY_USERNAME,
        password: RES_PROXY_PASSWORD,
    });

    let results = await scrape(page, "indian polity", "yandex");
    console.log(results[0]);
    console.log(`Got ${results.length} results.`);

    await browser.close();
})();
