const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeMeeshoForKeywords(keywords) {
    const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();
    let allProducts = [];

    for (const keyword of keywords) {
        const url = `https://www.meesho.com/search?q=${encodeURIComponent(keyword)}`;
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Scroll for 10 seconds
        await autoScroll(page);

        const products = await page.evaluate(() => {
            let results = [];
            document.querySelectorAll('.ProductList__GridCol-sc-8lnc8o-0').forEach(product => {
                const title = product.querySelector('.NewProductCardstyled__StyledDesktopProductTitle-sc-6y2tys-5')?.innerText.trim() || 'No title';
                const price = product.querySelector('.NewProductCardstyled__PriceRow-sc-6y2tys-7 h5')?.innerText.trim() || 'No price';
                const imageUrl = product.querySelector('.NewProductCardstyled__ProductImage-sc-6y2tys-18 img')?.src || 'No image URL';
                const deliveryCharge = product.querySelector('.NewProductCardstyled__OfferedShippingDesktop-sc-6y2tys-14')?.innerText.trim() || 'No delivery info';
                const originalShippingCost = product.querySelector('.NewProductCardstyled__OriginalShippingDesktop-sc-6y2tys-12')?.innerText.trim() || 'No original shipping info';
                const rating = product.querySelector('.Rating__StyledPill-sc-12htng8-1')?.innerText.trim() || 'No rating';
                const reviews = product.querySelector('.NewProductCardstyled__RatingCount-sc-6y2tys-21')?.innerText.trim() || 'No reviews';
                const sourceUrl = 'https://www.meesho.com' + (product.querySelector('a')?.getAttribute('href') || '');
                results.push({
                    title,
                    price,
                    imageUrl,
                    deliveryCharge,
                    originalShippingCost,
                    rating,
                    reviews,
                    sourceUrl
                });
            });
            return results;
        });

        allProducts = allProducts.concat(products); // Aggregate results from all keywords
        console.log(`Results for ${keyword}:`, products);
    }

    await browser.close();

    // Write results to a JSON file
    fs.writeFileSync('meesho_products.json', JSON.stringify(allProducts, null, 2));
}

async function autoScroll(page) {
    let tenSeconds = 10000; // 10 seconds in milliseconds
    let endTime = Date.now() + tenSeconds;

    await page.evaluate(async (endTime) => {
        await new Promise((resolve, reject) => {
            var interval = setInterval(() => {
                window.scrollBy(0, 100);
                if (Date.now() > endTime) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }, endTime);
}

const keywords = ['ikigai', 'mindfulness', 'self help']; // Add more keywords as needed
scrapeMeeshoForKeywords(keywords);
