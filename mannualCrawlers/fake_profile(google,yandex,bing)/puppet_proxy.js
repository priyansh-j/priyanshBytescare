// import puppeteer from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");


puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [`--proxy-server=rotating.proxyempire.io:9000`],
    });

    const page = await browser.newPage();
    await page.setViewport({width: 1280, height: 720})

    await page.authenticate({
        username: "YcxXUKUSyPIO5MRn",
        password: "wifi;;;;",
    });

    await page.goto("https://whatismyipaddress.com/", { headless:false,waitUntil: "load", timeout: 1000 * 20 });
    await page.screenshot({ path: "example.png" });
    await browser.close();
})();