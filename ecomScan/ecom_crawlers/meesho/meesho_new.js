// const puppeteer = require('puppeteer');
// const fs = require('fs');

// async function scrapeMeeshoForKeywords(keywords) {
//     const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
//     const page = await browser.newPage();
//     let allProducts = [];

//     for (const keyword of keywords) {
//         const url = `https://www.meesho.com/search?q=${encodeURIComponent(keyword)}`;
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

//         // Scroll for 10 seconds
//         await autoScroll(page);

//         const products = await page.evaluate(() => {
//             let results = [];
//             document.querySelectorAll('.ProductList__GridCol-sc-8lnc8o-0').forEach(product => {
//                 const title = product.querySelector('.NewProductCardstyled__StyledDesktopProductTitle-sc-6y2tys-5')?.innerText.trim() || 'No title';
//                 const price = product.querySelector('.NewProductCardstyled__PriceRow-sc-6y2tys-7 h5')?.innerText.trim() || 'No price';
//                 const imageUrl = product.querySelector('.NewProductCardstyled__ProductImage-sc-6y2tys-18 img')?.src || 'No image URL';
//                 const deliveryCharge = product.querySelector('.NewProductCardstyled__OfferedShippingDesktop-sc-6y2tys-14')?.innerText.trim() || 'No delivery info';
//                 const originalShippingCost = product.querySelector('.NewProductCardstyled__OriginalShippingDesktop-sc-6y2tys-12')?.innerText.trim() || 'No original shipping info';
//                 const rating = product.querySelector('.Rating__StyledPill-sc-12htng8-1')?.innerText.trim() || 'No rating';
//                 const reviews = product.querySelector('.NewProductCardstyled__RatingCount-sc-6y2tys-21')?.innerText.trim() || 'No reviews';
//                 const sourceUrl = 'https://www.meesho.com' + (product.querySelector('a')?.getAttribute('href') || '');
//                 results.push({
//                     title,
//                     price,
//                     imageUrl,
//                     deliveryCharge,
//                     originalShippingCost,
//                     rating,
//                     reviews,
//                     sourceUrl
//                 });
//             });
//             return results;
//         });

//         allProducts = allProducts.concat(products); // Aggregate results from all keywords
//         console.log(`Results for ${keyword}:`, products);
//     }

//     await browser.close();

//     // Write results to a JSON file
//     fs.writeFileSync('meesho_products.json', JSON.stringify(allProducts, null, 2));
// }

// async function autoScroll(page) {
//     let tenSeconds = 10000; // 10 seconds in milliseconds
//     let endTime = Date.now() + tenSeconds;

//     await page.evaluate(async (endTime) => {
//         await new Promise((resolve, reject) => {
//             var interval = setInterval(() => {
//                 window.scrollBy(0, 100);
//                 if (Date.now() > endTime) {
//                     clearInterval(interval);
//                     resolve();
//                 }
//             }, 100);
//         });
//     }, endTime);
// }
const puppeteer = require('puppeteer');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'meesho_productsbb.csv',
    header: [
        { id: 'title', title: 'Title' },
        { id: 'price', title: 'Price' },
        { id: 'imageUrl', title: 'Image URL' },
        { id: 'deliveryCharge', title: 'Delivery Charge' },
        { id: 'originalShippingCost', title: 'Original Shipping Cost' },
        { id: 'rating', title: 'Rating' },
        { id: 'reviews', title: 'Reviews' },
        { id: 'sourceUrl', title: 'Source URL' },
        { id: 'keyword', title: 'Keyword' } // To include the keyword in each entry
    ],
    append: true // This allows data to be appended for each keyword
});

async function scrapeMeeshoForKeywords(keywords) {
    const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();

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

        // Add the keyword to each product's data and write to CSV
        const productsWithKeyword = products.map(product => ({ ...product, keyword }));
        await csvWriter.writeRecords(productsWithKeyword);
        console.log(`Results for ${keyword} saved to CSV.`);
    }

    await browser.close();
}

async function autoScroll(page) {
    let tenSeconds = 10000; // 10 seconds in milliseconds
    let endTime = Date.now() + tenSeconds;

    await page.evaluate(async (endTime) => {
        await new Promise((resolve) => {
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
const inputString = `


Adhunik Hindi Vyakaran Aur Rachna
Basic Science for Class 6
Basic Science for Class 7
Basic Science for Class 8
Foundation Science: Physics for Class 9
Foundation Science: Physics for Class 10
Ganit Parichay 1
Ganit Parichay 2
Ganit Parichay 3
Ganit Parichay 4
Ganit Parichay 5
Hindi Reader 0
Hindi Reader 1
Hindi Reader 2
Hindi Reader 3
Hindi Reader 4
Hindi Reader 5
Junior Maths 1
Junior Maths 2
Junior Maths 3
Junior Maths 4
Math Steps 1
Math Steps 2
Math Steps 3
Math Steps 4
Math Steps 5
Mathematics for Class 6
Mathematics for Class 7
Mathematics for Class 8
Mathematics for Olympiads and Talent Search Competitions for Class 6
Mathematics for Olympiads and Talent Search Competitions for Class 7
Mathematics for Olympiads and Talent Search Competitions for Class 8
My Grammar Time 1
My Grammar Time 2
My Grammar Time 3
My Grammar Time 4
My Grammar Time 5
Our World: Then and Now 1
Our World: Then and Now 2
Our World: Then and Now 3
Sanskrit Bharati 1
Sanskrit Bharati 2
Sanskrit Bharati 3
Sanskrit Bharati 4
Saral Hindi Vyakaran Aur Rachna
Secondary School Mathematics for Class 9
Secondary School Mathematics for Class 10
Senior Secondary School Mathematics for Class 11
Senior Secondary School Mathematics for Class 12
Sugam Sanskrit Vyakaran 1
Sugam Sanskrit Vyakaran 2
The Magic Carpet 1
The Magic Carpet 2
The Magic Carpet 3
The Magic Carpet 4
The Magic Carpet 5
The Magic Carpet 6
The Magic Carpet 7
The Magic Carpet 8
Concepts of Physics 1
Concepts of Physics 2
Modern Approach to Chemical Calculations
Bhoutiki ki Samajh 1
Reactions, Rearrangements and Reagents
Physics MCQ
Chemistry MCQ
Mathematics MCQ
Problems Plus in IIT Mathematics
Organic Chemistry Volume 1: Chemistry of Organic Compounds
High School Bhoutiki 1
High School Bhoutiki 2
High School Rasayanshastra 1
High School Rasayanshastra 2
High School Jeevvigyan 1
High School Jeevvigyan 2
High School Prathmik Ganit 1
High School Prathmik Ganit 2
Sugam Ganit 1
Sugam Ganit 2
Sugam Ganit 3
Sugam Vigyan 1
Sugam Vigyan 2
Sugam Vigyan 3
h c verma
r s aggarwal
Mathematics rs aggarwal
concept of physics

`;
// Split the input string to create an array of product IDs
const keywords = inputString.split('\n').map(id => id.trim()).filter(id => id);


// C. Krishniah Chetty Group Of Jewellers
// C.krishniah chetty & sons
// C.krishniah chetty Jewellers
// C.krishniah chetty & sons Manufactures
// c.krishnah chetty
// c.k.c. groups
// jewel by CKC
// ckc jwellery
// ckc gold
// ckc ornaments
// ckc
// ckc jewellers
// krishniah chetty jewellery
// c krishniah chetty jewellers jayanagar
// krishna shetty jewellers
// c krishniah chetty group of jewellers
// krishniah chetty jewellers
// krishnaiah shetty jewellers
// ckc jayanagar
// ckc jewellery designs
// krishniah chetty jewellers
// krishnaiah shetty jewellers
// ckc jayanagar
// ckc jewellery designs
// krishniah chetty jayanagar
// ckcjewellers
// ckc jewellers bangalore
// krishniah chetty jewellers 
// c krishniah chetty jewellers jayanagar
// krishniah chetty jewellers malleswaram
// CKCJEWELLER
// ckc jewellers website
// ck jewellery
// bangle size in inches
// csk jewellers
// ckc jewellers jayanagar
// jewellers in jayanagar
// c krishniah chetty jewellers
// c krishniah chetty malleswaram
// c k c
// krishniah chetty bangalore
// ckc jewellers malleswaram
scrapeMeeshoForKeywords(keywords);
