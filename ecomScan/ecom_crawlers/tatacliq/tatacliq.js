const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeTataCliq(keywords) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let allProducts = [];

    for (let keyword of keywords) {
        // Replace spaces with URL-encoded spaces (%20) for the search term
        const searchURL = `https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(keyword)}`;
        
        // Navigate to the search page
        await page.goto(searchURL, { waitUntil: 'networkidle2' });

        // Extract the HTML content of the page
        const content = await page.content();

        // Load the HTML into Cheerio
        const $ = cheerio.load(content);

        // Extract product information
        const products = [];

        $('.Grid__element').each((index, element) => {
            const product = {};

            // Extract product title
            product.title = $(element).find('.ProductDescription__boldText').first().text();

            // Extract product description
            product.description = $(element).find('.ProductDescription__description').text();

            // Extract product price
            product.price = $(element).find('.ProductDescription__boldText').last().text();

            // Extract discount percentage
            product.discount = $(element).find('.ProductDescription__newDiscountPercent').text();

            // Extract product link
            product.link = 'https://www.tatacliq.com' + $(element).find('a.ProductModule__aTag').attr('href');

            // Extract product image URL
            product.image = 'https:' + $(element).find('img.Image__actual').attr('src');

            // Push product to the array
            products.push(product);
        });

        allProducts = allProducts.concat(products);
    }

    // Save the scraped data to a JSON file
    fs.writeFileSync('scraped_products.json', JSON.stringify(allProducts, null, 2));

    console.log(`Scraping completed. Data saved to scraped_products.json`);

    await browser.close();
}

// Example of multiple keywords
const keywords = [ 

//     "ckc chains and jewellery",
//     "ckc jewellery and product",
//     "C.krishniah chetty jewelleries",
//     "ckc chains and jewellery",

// "C.krishniah chetty & sons",
// "C.krishniah chetty Jewellers",
// "C.krishniah chetty & sons Manufactures",
// "C.krishniah chetty & sons",
// "C.krishniah chetty charitable Trust",
// "C.krishniah chetty Foundation",
// "CKC JEWELLER",
// "ckcjeweller",
// "ckc sons",
// "c.krishnah chetty",
// "c.k.c. groups",
// "jewel by CKC",
// "ckc jwellery",
// "ckc gold",
// "ckc ornaments"


"C. Krishniah Chetty & Sons",
"C. Krishniah Chetty Group Of Jewellers",
"C.krishniah chetty & sons",
"C.krishniah chetty Jewellers",
"C.krishniah chetty & sons Manufactures",
"C.krishniah chetty charitable Trust",
"C.krishniah chetty Foundation",
"ckc sons",
"c.krishnah chetty",
"c.k.c. groups",
"jewel by CKC",
"ckc jwellery",
"ckc gold",
"ckc ornaments",
"ckc",
"ckc jewellers",
"c krishniah chetty and sons",
"krishniah chetty",
"krishnaiah shetty",
"c krishniah chetty & sons",
"c krishniah chetty",
"krishna shetty jewellers",
"c krishniah chetty group of jewellers",
"krishniah chetty jewellers",
"krishnaiah shetty jewellers",
"ckc jayanagar",
"ckc jewellery designs",
"ckc malleswaram",
"sri krishnaiah chetty and sons",
"krishniah chetty jayanagar",
"ckcjewellers",
"ckc jewellers bangalore",

"csk jewellers",
"ckc fragrances",
"jewellers in jayanagar",
"c krishniah chetty jewellers",
"c krishniah chetty malleswaram",
"c k c",
"krishniah chetty bangalore",
"ckc jewellers malleswaram",
"krishniah chetty and sons jayanagar",
"krishnaiah chetty & sons",
"ckc jewellers jayanagar",
"c krishniah chetty and sons jayanagar",
"krishniah chetty & sons",
"CKCJEWELLER"


];

scrapeTataCliq(keywords).catch(console.error);
