import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

async function scrapeGoogleSearch(keyword) {
    const browser = await puppeteer.launch({
        headless: false, 
        args: [
            `--proxy-server=rotating.proxyempire.io:9000`,
            "--disable-blink-features=AutomationControlled",
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-infobars",
            "--start-maximized"
        ]
    });

    const page = await browser.newPage();

    // Clear cookies and cache before searching
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');

    await page.setViewport({ width: 1280, height: 720 });

    // Rotate User-Agent
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
    ];
    await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);

    // Anti-bot detection fixes
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    });

    // Add headers to prevent detection
    await page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
        "Upgrade-Insecure-Requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    });

    await page.authenticate({
        username: "afe5dee445;any",
        password: "7c9c8e2be1",
    });

    const searchURL = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=100`;

    console.log("Navigating to Google Search...");
    await page.goto(searchURL, { waitUntil: "domcontentloaded", timeout: 1000 * 20 });

    // Random delay before scraping
    await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 5000));

    // Check for CAPTCHA
    const body = await page.content();
    if (body.includes("Our systems have detected unusual traffic")) {
        console.log("CAPTCHA detected! Stopping execution.");
        await browser.close();
        return { state: "CAPTCHA_DETECTED", results: [] };
    }

    // Extract search results
    let results = { state: "SUCCESS", results: [] };
    const elements = await page.$$(".g");
    
    for (let element of elements) {
        let title = await element.$eval(".tF2Cxc > div > a > h3", node => node.innerText).catch(() => "");
        let source = await element.$eval(".tF2Cxc > div > a", node => node.href).catch(() => "");
        let description = await element.$eval(".VwiC3b", node => node.innerText).catch(() => "");

        if (source) {
            results.results.push({ title, source, description });
        }
    }

    await browser.close();
    return results;
}

// Example usage
(async () => {
    let keyword = "books";
    let searchResults = await scrapeGoogleSearch(keyword);
    console.log(searchResults);
})();
