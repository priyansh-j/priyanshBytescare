const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


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



// Define keywords and pages to scrape
//const keywords = [
//     "C.krishniah chetty & sons ",
//     "C.krishniah chetty Jewellers",
//     "C.krishniah chetty & sons Manufactures",
//     "C.krishniah chetty & sons",
//     "C.krishniah chetty charitable Trust",
//     "C.krishniah chetty Foundation",
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

// // '8119896025',
// // '811989619X',
// // '8177586467',
// // '9357051481',
// // '8119847830',
// // '811984713X',
// // '9353439450',
// // '9356065764',
// // '8119847091',
// // '9356065810',
// // '9353949602',
// // '8119847962',
// // '933255854X',
// // '9332568715',
// // '9356063575',
// // '9354498299',
// // '9356062668',
// // '9357051465',
// // '9332549443',
// // '8119847148'

// "Applied Mathematics (Code-241), Class-XII",
// "Applied Mathematics, Class-XI",
// "Understanding ICSE Computer Applications with Blue J Class- X",
// "Understanding ICSE Mathematics Class- X",
// "ICSE Understanding Computer Applications with Blue J Class- IX",
// "Understanding ICSE Mathematics Class- IX",
// "Accountancy (Part-A) Vol-I, Class- XII + Volume 2",
// "Accountancy (Part-B) Vol-II, Class- XII",
// "Analysis of Financial Statements Class XII, Part-B (Including Project Work)",
// "New I.S.C. Accountancy (Volume I Partnership Accounts & Volume II Company Accounts & Analysis of Financial Statements) Class- XII",
// "New I.S.C. Accountancy Class- XI (Vol. I & II)",
// "Accountancy Class- XI"


// "Adhunik Hindi Vyakaran Aur Rachna",
// "Basic Science for Class 6",
// "Basic Science for Class 7",
// "Basic Science for Class 8",
// "Foundation Science: Physics for Class 9",
// "Foundation Science: Physics for Class 10",
// "Ganit Parichay 1",
// "Ganit Parichay 2",
// "Ganit Parichay 3",
// "Ganit Parichay 4",
// "Ganit Parichay 5",
// "Hindi Reader 0",
// "Hindi Reader 1",
// "Hindi Reader 2",
// "Hindi Reader 3",
// "Hindi Reader 4",
// "Hindi Reader 5",
// "Junior Maths 1",
// "Junior Maths 2",
// "Junior Maths 3",
// "Junior Maths 4",
// "Junior Maths 5",
// "Math Steps 1",
// "Math Steps 2",
// "Math Steps 3",
// "Math Steps 4",
// "Math Steps 5",
// "Mathematics for Class 6",
// "Mathematics for Class 7",
// "Mathematics for Class 8",
// "Mathematics for Olympiads and Talent Search Competitions for Class 6",
// "Mathematics for Olympiads and Talent Search Competitions for Class 7",
// "Mathematics for Olympiads and Talent Search Competitions for Class 8",
// "My Grammar Time 1",
// "My Grammar Time 2",
// "My Grammar Time 3",
// "My Grammar Time 4",
// "My Grammar Time 5",
// "Our World: Then and Now 1",
// "Our World: Then and Now 2",
// "Our World: Then and Now 3",
// "Sanskrit Bharati 1",
// "Sanskrit Bharati 2",
// "Sanskrit Bharati 3",
// "Sanskrit Bharati 4",
// "Saral Hindi Vyakaran Aur Rachna",
// "Secondary School Mathematics for Class 9",
// "Secondary School Mathematics for Class 10",
// "Senior Secondary School Mathematics for Class 11",
// "Senior Secondary School Mathematics for Class 12",
// "Sugam Sanskrit Vyakaran 1",
// "Sugam Sanskrit Vyakaran 2",
// "The Magic Carpet 1",
// "The Magic Carpet 2",
// "The Magic Carpet 3",
// "The Magic Carpet 4",
// "The Magic Carpet 5",
// "The Magic Carpet 6",
// "The Magic Carpet 7",
// "The Magic Carpet 8",
// "Concepts of Physics 1",
// "Concepts of Physics 2",
// "Modern Approach to Chemical Calculations",
// "Bhoutiki ki Samajh 1",
// "Reactions, Rearrangements and Reagents",
// "Physics MCQ",
// "Chemistry MCQ",
// "Mathematics MCQ",
// "Problems Plus in IIT Mathematics",
// "Organic Chemistry Volume 1: Chemistry of Organic Compounds",
// "High School Bhoutiki 1",
// "High School Bhoutiki 2",
// "High School Rasayanshastra 1",
// "High School Rasayanshastra 2",
// "High School Jeevvigyan 1",
// "High School Jeevvigyan 2",
// "High School Prathmik Ganit 1",
// "High School Prathmik Ganit 2",
// "Sugam Ganit 1",
// "Sugam Ganit 2",
// "Sugam Ganit 3",
// "Sugam Vigyan 1",
// "Sugam Vigyan 2",
// "Sugam Vigyan 3"
"https://www.amazon.in/Hindi-Reader-5-Rati-Rani/dp/8177090275"


 //]; // Add your keywords here

// Function to fetch and extract data
//const page =10;
async function fetchAndExtract(keyword,page) {
    console.log(`Data extracted for ${keyword} for page ${page}`);

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&page=${page}`,
        headers: { 
            'authority': 'www.amazon.in', 
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8', 
            'cache-control': 'max-age=0', 
'cookie': 'session-id=260-1265984-6802412; session-id-time=2082787201l; i18n-prefs=INR; ubid-acbin=260-2440372-3989933; csm-hit=tb:EETK7F3YXN4HYHDTK32J+s-19WG9B8JXCD0P1NQ1R59|1701677668176&t:1701677668176&adb:adblk_no; session-token=WCowmYOdSVKRrjwoE74gPZePNIY/uBovVXuo5aUu2wcMcQ+sm367nxmbgonE4bY0rwLkMhlR3nX+RL+0Bx3eh1WeHd7QaqtG7jhGUA86uRjMXXwu7QzA+K0Ux23efgEaY0Pms9wqSAQRIHn9E64Ao2sgX+PONYLfCqgXbRQNNRj23shjZANKxTszNjPfCwIeY1dSd8u16bmGGTZcromLXfEl/eqw/N11etL7DJvLvBIqqqys4BS3OTOUqvBg0b6cV29lkQy98O7DyY83SNRWknAqfBWPhPrN02l2Kb2oByfXiZymyD/5sTNBU7Y/ejDrY2m8Bcm2FnjXbQrs5mP+yQ/Eb4GTPlVo; i18n-prefs=INR; session-id=258-2804273-3616667; session-id-time=2082787201l; session-token=LCK/w6J0ZWnT+f9pLoq/NEkP//N4iC6cG9FxCTE9n7n4qt/kqiPBOMLhfonB+9y6QVDsndkbSRUHuV5uOH/T5Q7nLwhe3ZZN1I94cQtevTAkfMgmiyrpbqmVP+cuyZR7LhvivESxuFmVc1VED6gI6CuWbicBUz+kqaeKrCT5PHRl7PEoTC1u3b0fkwbM4VxoNLsYjk5l4p3OUV7MXrwWJfeewxIVy7zOASOz7L0ihTPBKG2M3m4NW6Ljs4f0Q8BsCyrvb8Stn7Q9yrHnDqEw6fgOVhz9UH5n4GRagDci1vrtY/y/VjrSi5y1hKHdOPfLaXt9hQJ3KSvOWEW86Poriy8/26o0Zj1z; ubid-acbin=257-3827892-8923301', 
'device-memory': '8', 
'downlink': '9.5', 
'dpr': '1.5', 
'ect': '4g', 
'referer': 'https://www.amazon.in/?&ext_vrnc=hi&tag=googhydrabk1-21&ref=pd_sl_7hz2t19t5c_e&adgrpid=58355126069&hvpone=&hvptwo=&hvadid=610644601173&hvpos=&hvnetw=g&hvrand=3628238165574622919&hvqmt=e&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9062008&hvtargid=kwd-10573980&hydadcr=14453_2316415&gclid=Cj0KCQiA67CrBhC1ARIsACKAa8QJ-X8MxF9kAvILdYAfsvZqKqOM3xjX036-Mbx6X6kVttDWJSh3yF8aAnfREALw_wcB', 
'rtt': '100', 
'sec-ch-device-memory': '8', 
'sec-ch-dpr': '1.5', 
'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"', 
'sec-ch-ua-mobile': '?0', 
'sec-ch-ua-platform': '"Windows"', 
'sec-ch-ua-platform-version': '"15.0.0"', 
'sec-ch-viewport-width': '652', 
'sec-fetch-dest': 'document', 
'sec-fetch-mode': 'navigate', 
'sec-fetch-site': 'same-origin', 
'sec-fetch-user': '?1', 
'upgrade-insecure-requests': '1', 
'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36', 
'viewport-width': '652'
            
        }
    };
    try {
        const response = await axios.request(config);
        const body = response.data;
        let $ = cheerio.load(body);
        let results = [];

        // Check for CAPTCHA
        let block_text = $('div#infoDiv').text();
        if (block_text.includes('solve the CAPTCHA')) {
            results.state = 'CAPTCHA_DETECTED';
            return results;
        }

        // Check for no results
        let no_results = $('.card-section > div > b');
        if (no_results.length > 0) {
            results.state = 'NO_RESULTS';
            return results;
        }

        // Process organic results
        let organic_results = $('div.s-main-slot.s-result-list > div[data-component-type="s-search-result"]:not([class*="AdHolder"])');
        organic_results.each((i, elem) => {
            let row_selector = cheerio.load($(elem).html());
            let author = row_selector('div.a-section > div.a-row.a-size-base.a-color-secondary:contains("by "):contains("|")').first().text();
            author = author.includes("by ") ? author.split("by ")[1].split("|")[0].trim().replace(/[\s\t\n]{2,64}/igs, " ") : "";
            let mrp = row_selector('span.a-price.a-text-price[data-a-size="b"][data-a-strike="true"]').first().text().trim();
            let price = row_selector('span.a-price[data-a-size="xl"]').first().text().trim();
            let href = row_selector('a.a-link-normal.a-text-normal').first().attr('href') || "";
            let asin = href.split('/dp/')[1] ? href.split('/dp/')[1].split('/')[0] : '';
            mrp = mrp.split('₹')[1] ? '₹' + mrp.split('₹')[1] : '';
            price = price.split('₹')[1] ? '₹' + price.split('₹')[1] : '';
            let title = row_selector('span.a-size-medium.a-color-base.a-text-normal').first().text().trim() ||
                row_selector('span.a-size-base-plus.a-color-base.a-text-normal').first().text().trim() || row_selector('a.a-link-normal.s-line-clamp-2.s-link-style.a-text-normal h2 span').first().text().trim();
            let format = row_selector('a.a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-bold').text().trim();
            let rating = row_selector('i[data-cy="reviews-ratings-slot"] span.a-icon-alt').text().trim();
            rating = rating.split(' ')[0];
            let discount = row_selector('.a-letter-space').text() || ' ';

            // Construct result object
            let serp_obj = {
                title: title,
                source: "https://www.amazon.in" + (row_selector('a.a-link-normal.a-text-normal').first().attr('href') || "").split('?')[0],
                ASIN: asin,
                mrp: mrp,
                price: price,
                cover: (row_selector('img.s-image').first().attr('src') || ""),
                author: author,
                format: format,
                rating: rating,
                discount: discount
            };

            if (serp_obj.source) {
                results.push(serp_obj);
            }
        });

        return results;

    } catch (error) {
        console.error('Error:', error);
        return { state: 'ERROR', results: [] };
    }
}

// Function to iterate over keywords and pages, then save results incrementally
async function scrapeAndSaveResults() {
    const fileName = 'amazon_results.csv';
    
    // Initialize CSV writer
    const csvWriter = createCsvWriter({
        path: fileName,
        header: [
            { id: 'title', title: 'Title' },
            { id: 'source', title: 'Source' },
            { id: 'ASIN', title: 'ASIN' },
            { id: 'mrp', title: 'MRP' },
            { id: 'price', title: 'Price' },
            { id: 'cover', title: 'Cover' },
            { id: 'author', title: 'Author' },
            { id: 'format', title: 'Format' },
            { id: 'rating', title: 'Rating' },
            { id: 'discount', title: 'Discount' }
        ],
        append: false // Ensure data is appended if the file exists
    });

    // Write headers only if the file does not exist
    if (!fs.existsSync(fileName)) {
        await csvWriter.writeRecords([]); // This will create the file with headers
    }

    for (let keyword of keywords) {
        for (let page = 1; page <= 9; page++) {
            let results = await fetchAndExtract(keyword, page);
            if (results.length > 0) {
                await csvWriter.writeRecords(results); // Write each batch of results to the CSV file
            } else {
                console.log(`No results for ${keyword} on page ${page}, stopping further requests for this keyword.`);
                break; // Break the inner loop if no results are found
            }
        }
    }

    console.log('All results have been saved to CSV.');
}

scrapeAndSaveResults();
















// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// // Define keywords and pages to scrape
// const keywords = [
//     "8119896025",
//     "811989619X",
//     "8177586467",
//     "9357051481",
//     "8119847830",
//     "811984713X",
//     "9353439450",
//     "9356065764",
//     "8119847091",
//     "9356065810",
//     "9353949602",
//     "8119847962",
//     "933255854X",
//     "9332568715",
//     "9356063575",
//     "9354498299",
//     "9356062668",
//     "9357051465",
//     "9332549443",
//     "8119847148"
  

    
// ]; // Add your keywords here

// // let pages = [1,2];

// // Function to fetch and extract data
// async function fetchAndExtract(keyword, page) {
//     console.log(`Data extracted for ${keyword} for page ${page}`);

//     let config = {
//         method: 'get',
//         maxBodyLength: Infinity,
//         url: `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&page=${page}`,
//         headers: { 
//             'authority': 'www.amazon.in', 
//             'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
//             'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8', 
//         }
//         //proxies: proxies,
//     };
//     try {
//         const response = await axios.request(config);
//         const body = response.data;
//         let $ = cheerio.load(body);
//         let results = [];

//         // Check for CAPTCHA
//         let block_text = $('div#infoDiv').text();
//         if (block_text.includes('solve the CAPTCHA')) {
//             results.state = 'CAPTCHA_DETECTED';
//             return results;
//         }

//         // Check for no results
//         let no_results = $('.card-section > div > b');
//         if (no_results.length > 0) {
//             results.state = 'NO_RESULTS';
//             return results;
//         }

//         // Process organic results
//         let organic_results = $('div.s-main-slot.s-result-list > div[data-component-type="s-search-result"]:not([class*="AdHolder"])');
//         organic_results.each((i, elem) => {
//             let row_selector = cheerio.load($(elem).html());
//             let author = row_selector('div.a-section > div.a-row.a-size-base.a-color-secondary:contains("by "):contains("|")').first().text();
//             author = author.includes("by ") ? author.split("by ")[1].split("|")[0].trim().replace(/[\s\t\n]{2,64}/igs, " ") : "";
//             let mrp = row_selector('span.a-price.a-text-price[data-a-size="b"][data-a-strike="true"]').first().text().trim();
//             let price = row_selector('span.a-price[data-a-size="xl"]').first().text().trim();
//             let href = row_selector('a.a-link-normal.a-text-normal').first().attr('href') || "";
//             let asin = href.split('/dp/')[1] ? href.split('/dp/')[1].split('/')[0] : '';
//             mrp = mrp.split('₹')[1] ? '₹' + mrp.split('₹')[1] : '';
//             price = price.split('₹')[1] ? '₹' + price.split('₹')[1] : '';
//             let title = row_selector('span.a-size-medium.a-color-base.a-text-normal').first().text().trim() ||
//                 row_selector('span.a-size-base-plus.a-color-base.a-text-normal').first().text().trim();
//                 let format = row_selector('a.a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-bold').text().trim();
//                 let rating = row_selector('i[data-cy="reviews-ratings-slot"] span.a-icon-alt').text().trim();
//                 rating = rating.split(' ')[0];
//             let discount = row_selector('.a-letter-space').text()|| ' ';

//             // Construct result object
//             let serp_obj = {
//                 title: title,
//                 source: "https://www.amazon.in" + (row_selector('a.a-link-normal.a-text-normal').first().attr('href') || "").split('?')[0],
//                 ASIN: asin,
//                 mrp: mrp,
//                 price: price,
//                 cover: (row_selector('img.s-image').first().attr('src') || ""),
//                 author: author,
//                 format:format,
//                 rating:rating,
//                 discount:discount
//             };

//             if (serp_obj.source) {
//                 results.push(serp_obj);
//             }
//         });

//         return results;

//     } catch (error) {
//         console.error('Error:', error);
//         return { state: 'ERROR', results: [] };
//     }
// }

// // Function to iterate over keywords and pages, then save results incrementally
// async function scrapeAndSaveResults() {
//     const fileName = 'amazon_results.csv';
    
//     // Initialize CSV writer
//     const csvWriter = createCsvWriter({
//         path: fileName,
//         header: [
//             { id: 'title', title: 'Title' },
//             { id: 'source', title: 'Source' },
//             { id: 'ASIN', title: 'ASIN' },
//             { id: 'mrp', title: 'MRP' },
//             { id: 'price', title: 'Price' },
//             { id: 'cover', title: 'Cover' },
//             { id: 'author', title: 'Author' },
//             { id: 'format', title: 'Format' },
//             { id: 'rating', title: 'Rating' },
//             { id: 'discount', title: 'Discount' }
//         ],
//         append: false// Ensure data is appended if the file exists
//     });

//     // Write headers only if the file does not exist
//     if (!fs.existsSync(fileName)) {
//         await csvWriter.writeRecords([]); // This will create the file with headers
//     }

//     for (let keyword of keywords) {
//         for (let page=1;page<=1;page++) {
//             let results = await fetchAndExtract(keyword, page);
//             if (results.length > 0) {
//                 await csvWriter.writeRecords(results); // Write each batch of results to the CSV file
//             }
//         }
//     }

//     console.log('All results have been saved to CSV.');
// }

// scrapeAndSaveResults();










// 'cache-control': 'max-age=0', 
// 'cookie': 'session-id=260-1265984-6802412; session-id-time=2082787201l; i18n-prefs=INR; ubid-acbin=260-2440372-3989933; csm-hit=tb:EETK7F3YXN4HYHDTK32J+s-19WG9B8JXCD0P1NQ1R59|1701677668176&t:1701677668176&adb:adblk_no; session-token=WCowmYOdSVKRrjwoE74gPZePNIY/uBovVXuo5aUu2wcMcQ+sm367nxmbgonE4bY0rwLkMhlR3nX+RL+0Bx3eh1WeHd7QaqtG7jhGUA86uRjMXXwu7QzA+K0Ux23efgEaY0Pms9wqSAQRIHn9E64Ao2sgX+PONYLfCqgXbRQNNRj23shjZANKxTszNjPfCwIeY1dSd8u16bmGGTZcromLXfEl/eqw/N11etL7DJvLvBIqqqys4BS3OTOUqvBg0b6cV29lkQy98O7DyY83SNRWknAqfBWPhPrN02l2Kb2oByfXiZymyD/5sTNBU7Y/ejDrY2m8Bcm2FnjXbQrs5mP+yQ/Eb4GTPlVo; i18n-prefs=INR; session-id=258-2804273-3616667; session-id-time=2082787201l; session-token=LCK/w6J0ZWnT+f9pLoq/NEkP//N4iC6cG9FxCTE9n7n4qt/kqiPBOMLhfonB+9y6QVDsndkbSRUHuV5uOH/T5Q7nLwhe3ZZN1I94cQtevTAkfMgmiyrpbqmVP+cuyZR7LhvivESxuFmVc1VED6gI6CuWbicBUz+kqaeKrCT5PHRl7PEoTC1u3b0fkwbM4VxoNLsYjk5l4p3OUV7MXrwWJfeewxIVy7zOASOz7L0ihTPBKG2M3m4NW6Ljs4f0Q8BsCyrvb8Stn7Q9yrHnDqEw6fgOVhz9UH5n4GRagDci1vrtY/y/VjrSi5y1hKHdOPfLaXt9hQJ3KSvOWEW86Poriy8/26o0Zj1z; ubid-acbin=257-3827892-8923301', 
// 'device-memory': '8', 
// 'downlink': '9.5', 
// 'dpr': '1.5', 
// 'ect': '4g', 
// 'referer': 'https://www.amazon.in/?&ext_vrnc=hi&tag=googhydrabk1-21&ref=pd_sl_7hz2t19t5c_e&adgrpid=58355126069&hvpone=&hvptwo=&hvadid=610644601173&hvpos=&hvnetw=g&hvrand=3628238165574622919&hvqmt=e&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9062008&hvtargid=kwd-10573980&hydadcr=14453_2316415&gclid=Cj0KCQiA67CrBhC1ARIsACKAa8QJ-X8MxF9kAvILdYAfsvZqKqOM3xjX036-Mbx6X6kVttDWJSh3yF8aAnfREALw_wcB', 
// 'rtt': '100', 
// 'sec-ch-device-memory': '8', 
// 'sec-ch-dpr': '1.5', 
// 'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"', 
// 'sec-ch-ua-mobile': '?0', 
// 'sec-ch-ua-platform': '"Windows"', 
// 'sec-ch-ua-platform-version': '"15.0.0"', 
// 'sec-ch-viewport-width': '652', 
// 'sec-fetch-dest': 'document', 
// 'sec-fetch-mode': 'navigate', 
// 'sec-fetch-site': 'same-origin', 
// 'sec-fetch-user': '?1', 
// 'upgrade-insecure-requests': '1', 
// 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36', 
// 'viewport-width': '652'
// },







// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');

// // Define keywords and pages to scrape
// const keywords = [
    
//     // "Advanced Bank Management",
//     // "Bank Financial Management",
//     // "Indian Economy &Indian Financial System",
//     // "Principles &Practices of Banking",
//     // "Accounting &Financial Management for Bankers",
//     // "Retail Banking &Wealth Management",
//     // "Banking Regulations &Business Laws",
//     // "Advanced Business & Financial Management",
//     // "macmillan caiib",
//     // "macmillan jaiib",
//     // "caiib books",
//     // "jaiib books",
//     // "Caiib resources",
//     // "jaiib resources",
//     // "caiib new syallabus",
//     // "jaiib new syallabus"



// //     //pearson daily 

    // "8119896025",
    // "811989619X",
    // "8177586467",
    // "9357051481",
    // "8119847830",
    // "811984713X",
    // "9353439450",
    // "9356065764",
    // "8119847091",
    // "9356065810",
    // "9353949602",
    // "8119847962",
    // "933255854X",
    // "9332568715",
    // "9356063575",
    // "9354498299",
    // "9356062668",
    // "9357051465",
    // "9332549443",
    // "8119847148"

// //   // pearson_weekly
//     "8119847121",
//   "9356060762",
//   "8119847628",
//   "8119847547",
//   "8119847040",
//   "8119896696",
//   "8131727351",
//   "8131720764",
//   "8119896602",
//   "8119847555",
//   "9357053050",
//   "8119847407",
//   "8119847466",
//   "9357051473",
//   "811984761X",
//   "9357054219",
//   "9332518114",
//   "B0BY4QHFPQ",
//   "939297096X",
//   "8131793559",
//   "8119847598",
//   "8119847245",
//   "9357053042",
//   "9332568839",
//   "9353062012",
//   "9357052542",
//   "9332568723",
//   "9357054170",
//   "933258611X",
//   "9361594028"

 


    //    "Oswaal Books"
    //     "Oswaal Objective", "Oswaal CDS",
    //     "Oswaal SSLC", "Oswaal NEET", "Oswaal NDA", "Oswaal UPSC", "Oswaal CLAT",
    //     "Oswaal Lil Legends Set", "Oswaal BPSC", "Oswaal General", "Oswaal CTET",
    //     "oswal sample paper class 10 2024",
    //     "Oswaal One for All",

    // "Oswaal CUET",
    // "Oswaal NCERT",
    // "Oswaal JEE",
    // "Oswaal NTSE",
    // "Oswaal CBSE",
    // "Oswaal ICSE",
    // "Oswaal ISC",
    // "Oswaal NTA",
    // "Oswaal CAT",
    // "Oswaal RRB",
    // "Oswaal Handbook",
    // "Oswaal RMT",
    // "Oswaal UGC",
    // "Oswaal GATE"

//     // "Applied Mathematics (Code-241), Class-XII",
//     // "Applied Mathematics, Class-XI",
//     // "Understanding ICSE Computer Applications with Blue J Class- X",
//     // "Understanding ICSE Mathematics Class- X",
//     // "ICSE Understanding Computer Applications with Blue J Class- IX",
//     // "Understanding ICSE Mathematics Class- IX",
//     // "Accountancy (Part-A) Vol-I, Class- XII + Volume 2",
//     // "Analysis of Financial Statements Class XII, Part-B (Including Project Work)",
//     // "New I.S.C. Accountancy (Volume I Partnership Accounts & Volume II Company Accounts & Analysis of Financial Statements) Class- XII",
//     // "New I.S.C. Accountancy Class- XI (Vol. I & II)",
//     // "Accountancy Class- XI"

// //     "BlackBook of General Awareness ",
// // "Blackbook Of English Vocabulary (2023-2024)",
// // "BlackBook of Samanya Jagrukta (General Awareness) "

// // "Adhunik Hindi Vyakaran Aur Rachna",
// // "Basic Science for Class 6",
// // "Basic Science for Class 7",
// // "Basic Science for Class 8",
// // "Foundation Science: Physics for Class 9",
// // "Foundation Science: Physics for Class 10",
// // "Ganit Parichay 1",
// // "Ganit Parichay 2",
// // "Ganit Parichay 3",
// // "Ganit Parichay 4",
// // "Ganit Parichay 5",
// // "Hindi Reader 0",
// // "Hindi Reader 1",
// // "Hindi Reader 2",
// // "Hindi Reader 3",
// // "Hindi Reader 4",
// // "Hindi Reader 5",
// // "Junior Maths 1",
// // "Junior Maths 2",
// // "Junior Maths 3",
// // "Junior Maths 4",
// // "Junior Maths 5",
// // "Math Steps 1",
// // "Math Steps 2",
// // "Math Steps 3",
// // "Math Steps 4",
// // "Math Steps 5",
// // "Mathematics for Class 6",
// // "Mathematics for Class 7",
// // "Mathematics for Class 8",
// // "Mathematics for Olympiads and Talent Search Competitions for Class 6",
// // "Mathematics for Olympiads and Talent Search Competitions for Class 7",
// // "Mathematics for Olympiads and Talent Search Competitions for Class 8",
// // "My Grammar Time 1",
// // "My Grammar Time 2",
// // "My Grammar Time 3",
// // "My Grammar Time 4",
// // "My Grammar Time 5",
// // "Our World: Then and Now 1",
// // "Our World: Then and Now 2",
// // "Our World: Then and Now 3",
// // "Sanskrit Bharati 1",
// // "Sanskrit Bharati 2",
// // "Sanskrit Bharati 3",
// // "Sanskrit Bharati 4",
// // "Saral Hindi Vyakaran Aur Rachna",
// // "Secondary School Mathematics for Class 9",
// // "Secondary School Mathematics for Class 10",
// // "Senior Secondary School Mathematics for Class 11",
// // "Senior Secondary School Mathematics for Class 12",
// // "Sugam Sanskrit Vyakaran 1",
// // "Sugam Sanskrit Vyakaran 2",
// // "The Magic Carpet 1",
// // "The Magic Carpet 2",
// // "The Magic Carpet 3",
// // "The Magic Carpet 4",
// // "The Magic Carpet 5",
// // "The Magic Carpet 6",
// // "The Magic Carpet 7",
// // "The Magic Carpet 8",
// // "Concepts of Physics 1",
// // "Concepts of Physics 2",
// // "Modern Approach to Chemical Calculations",
// // "Bhoutiki ki Samajh 1",
// // "Reactions, Rearrangements and Reagents",
// // "Physics MCQ",
// // "Chemistry MCQ",
// // "Mathematics MCQ",
// // "Problems Plus in IIT Mathematics",
// // "Organic Chemistry Volume 1: Chemistry of Organic Compounds",
// // "High School Bhoutiki 1",
// // "High School Bhoutiki 2",
// // "High School Rasayanshastra 1",
// // "High School Rasayanshastra 2",
// // "High School Jeevvigyan 1",
// // "High School Jeevvigyan 2",
// // "High School Prathmik Ganit 1",
// // "High School Prathmik Ganit 2",
// // "Sugam Ganit 1",
// // "Sugam Ganit 2",
// // "Sugam Ganit 3",
// // "Sugam Vigyan 1",
// // "Sugam Vigyan 2",
// // "Sugam Vigyan 3"

// // "9789389335408",
// // "9789395736480",
// // "9789393553263",
// // "9789390612734",
// // "9789390612864",
// // "9789390612475",
// // "9789389335996",
// // "9789393553447",
// // "9789390612536",
// // "9789389859737",
// // "9789393553430",
// // "9789395736404",
// // "9789393553287",
// // "9789389859409",
// // "9789389859379",
// // "9789393553379",
// // "9789389859362",
// // "9789389702651",
// // "9789389859812",
// // "9789393553362",
// // "9789390612581",
// // "9788119666768",
// // "9789395736527",
// // "9789393553454",
// // "9789389335309",
// // "9789389859034",
// // "9789390612857",
// // "9789389859621",
// // "9789390612956",
// // "9789387963818",
// // "9789388696159",
// // "9789389859751",
// // "9788194864547",
// // "9789389859188",
// // "9789393553294",
// // "9789389859768",
// // "9789395736503",
// // "9789395736473",
// // "9789351297222",
// // "9789389859638",
// // "9789389859539",
// // "9788194864530",
// // "9789395736459",
// // "9789395736510",
// // "9789395736497",
// // "9789389859928",
// // "9789393553188",
// // "9789393553270",
// // "9789351296591",
// // "9789390612185",
// // "9789388313384",
// // "9789390612451",
// // "9789393553591",
// // "9789389859782",
// // "9788119461158",
// // "9788197042591",
// // "9789389335866",
// // "9789389859577",
// // "9789395736367",
// // "9789395736572",
// // "9788119461981",
// // "9789395736800",
// // "9788119461134",
// // "9789390612109",
// // "9789393553355",
// // "9789393553300",
// // "9789389859423",
// // "9788119877775",
// // "9788119666720",
// // "9789395736435",
// // "9789395736411",
// // "9789351296829",
// // "9789390612925",
// // "9789395736374",
// // "9789386691095",
// // "9789395736442",
// // "9789395736558",
// // "9789393553225",
// // "9789388696432",
// // "9789390612970",
// // "9788184733235",
// // "9789395736398",
// // "9789395736565",
// // "9789351292494",
// // "9789395736534",
// // "9789395736541",
// // "9789395736381",
// // "9788197042584",
// // "9789390612024",
// // "9788119666799",
// // "9789393553751",
// // "9789351291305",
// // "9789387506640",
// // "9789387506657",
// // "9789351293804",
// // "9789393553492",
// // "9789390612659",
// // "9789389859911",
// // "9789395736206"

// ]; // Add your keywords here



// let pages = [1,2] 
// // Function to fetch and extract data
// async function fetchAndExtract(keyword, page) {
//     console.log(`data extracted for ${keyword} for ${page}`);
//     // let proxies = {
//     //     "http": "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000",
//     //     "https": "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000"
//     // };

//     let config = {
//         method: 'get',
//         maxBodyLength: Infinity,
//         //url: `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&ref=sr_pg_${page}`,
//         url: `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&page=${page}`,
    //     headers: { 
    //         'authority': 'www.amazon.in', 
    //         'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
    //         'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8', 
    //         'cache-control': 'max-age=0', 
    //         'cookie': 'session-id=260-1265984-6802412; session-id-time=2082787201l; i18n-prefs=INR; ubid-acbin=260-2440372-3989933; csm-hit=tb:EETK7F3YXN4HYHDTK32J+s-19WG9B8JXCD0P1NQ1R59|1701677668176&t:1701677668176&adb:adblk_no; session-token=WCowmYOdSVKRrjwoE74gPZePNIY/uBovVXuo5aUu2wcMcQ+sm367nxmbgonE4bY0rwLkMhlR3nX+RL+0Bx3eh1WeHd7QaqtG7jhGUA86uRjMXXwu7QzA+K0Ux23efgEaY0Pms9wqSAQRIHn9E64Ao2sgX+PONYLfCqgXbRQNNRj23shjZANKxTszNjPfCwIeY1dSd8u16bmGGTZcromLXfEl/eqw/N11etL7DJvLvBIqqqys4BS3OTOUqvBg0b6cV29lkQy98O7DyY83SNRWknAqfBWPhPrN02l2Kb2oByfXiZymyD/5sTNBU7Y/ejDrY2m8Bcm2FnjXbQrs5mP+yQ/Eb4GTPlVo; i18n-prefs=INR; session-id=258-2804273-3616667; session-id-time=2082787201l; session-token=LCK/w6J0ZWnT+f9pLoq/NEkP//N4iC6cG9FxCTE9n7n4qt/kqiPBOMLhfonB+9y6QVDsndkbSRUHuV5uOH/T5Q7nLwhe3ZZN1I94cQtevTAkfMgmiyrpbqmVP+cuyZR7LhvivESxuFmVc1VED6gI6CuWbicBUz+kqaeKrCT5PHRl7PEoTC1u3b0fkwbM4VxoNLsYjk5l4p3OUV7MXrwWJfeewxIVy7zOASOz7L0ihTPBKG2M3m4NW6Ljs4f0Q8BsCyrvb8Stn7Q9yrHnDqEw6fgOVhz9UH5n4GRagDci1vrtY/y/VjrSi5y1hKHdOPfLaXt9hQJ3KSvOWEW86Poriy8/26o0Zj1z; ubid-acbin=257-3827892-8923301', 
    //         'device-memory': '8', 
    //         'downlink': '9.5', 
    //         'dpr': '1.5', 
    //         'ect': '4g', 
    //         'referer': 'https://www.amazon.in/?&ext_vrnc=hi&tag=googhydrabk1-21&ref=pd_sl_7hz2t19t5c_e&adgrpid=58355126069&hvpone=&hvptwo=&hvadid=610644601173&hvpos=&hvnetw=g&hvrand=3628238165574622919&hvqmt=e&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9062008&hvtargid=kwd-10573980&hydadcr=14453_2316415&gclid=Cj0KCQiA67CrBhC1ARIsACKAa8QJ-X8MxF9kAvILdYAfsvZqKqOM3xjX036-Mbx6X6kVttDWJSh3yF8aAnfREALw_wcB', 
    //         'rtt': '100', 
    //         'sec-ch-device-memory': '8', 
    //         'sec-ch-dpr': '1.5', 
    //         'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"', 
    //         'sec-ch-ua-mobile': '?0', 
    //         'sec-ch-ua-platform': '"Windows"', 
    //         'sec-ch-ua-platform-version': '"15.0.0"', 
    //         'sec-ch-viewport-width': '652', 
    //         'sec-fetch-dest': 'document', 
    //         'sec-fetch-mode': 'navigate', 
    //         'sec-fetch-site': 'same-origin', 
    //         'sec-fetch-user': '?1', 
    //         'upgrade-insecure-requests': '1', 
    //         'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36', 
    //         'viewport-width': '652'
    //       },
    //     //proxies: proxies,
    // };

//     try {
//         const response = await axios.request(config);
//         const body = response.data;
//         let $ = cheerio.load(body);
//         let results = [];

//         // Check for CAPTCHA
//         let block_text = $('div#infoDiv').text();
//         if (block_text.includes('solve the CAPTCHA')) {
//             results.state = 'CAPTCHA_DETECTED';
//             return results;
//         }

//         // Check for no results
//         let no_results = $('.card-section > div > b');
//         if (no_results.length > 0) {
//             results.state = 'NO_RESULTS';
//             return results;
//         }

//         // Process organic results
//         let organic_results = $('div.s-main-slot.s-result-list > div[data-component-type="s-search-result"]:not([class*="AdHolder"])');
//         organic_results.each((i, elem) => {
//             let row_selector = cheerio.load($(elem).html());
//             let author = row_selector('div.a-section > div.a-row.a-size-base.a-color-secondary:contains("by "):contains("|")').first().text();
//             author = author.includes("by ") ? author.split("by ")[1].split("|")[0].trim().replace(/[\s\t\n]{2,64}/igs, " ") : "";
//             let mrp = row_selector('span.a-price.a-text-price[data-a-size="b"][data-a-strike="true"]').first().text().trim();
//             let price = row_selector('span.a-price[data-a-size="xl"]').first().text().trim();
//             let href = row_selector('a.a-link-normal.a-text-normal').first().attr('href') || "";
//             let asin = href.split('/dp/')[1] ? href.split('/dp/')[1].split('/')[0] : '';
//     // Split the text and take the first occurrence
//             mrp = mrp.split('₹')[1] ? '₹' + mrp.split('₹')[1] : '';
//             price = price.split('₹')[1] ? '₹' + price.split('₹')[1] : '';   
//             let title = row_selector('span.a-size-medium.a-color-base.a-text-normal').first().text().trim() ||
//             row_selector('span.a-size-base-plus.a-color-base.a-text-normal').first().text().trim();
//             // Construct result object
//             let serp_obj = {
//                 //title: row_selector('span.a-size-medium.a-color-base.a-text-normal').first().text(),
//                 //title: row_selector('span.a-size-base-plus.a-color-base.a-text-normal').text().trim(),
//                 title:title,
//                 //ASIN: (row_selector('a.a-link-normal.a-text-normal').first().attr('href') || "").split(/(\\|\/)/ig).pop().split('?')[0],
//                 source: "https://www.amazon.in" + (row_selector('a.a-link-normal.a-text-normal').first().attr('href') || "").split('?')[0],
//                 ASIN:asin,
//                 mrp: mrp,
//                 price: price,
//                 cover: (row_selector('img.s-image').first().attr('src') || ""),
//                 author: author
//             };

//             if (serp_obj.source) {
//                 results.push(serp_obj);
//             }
//         });

        
//         return results;

       
//     } catch (error) {
//         console.error('Error:', error);
//         return { state: 'ERROR', results: [] };
//     }
// }

// // Function to iterate over keywords and pages, then save results incrementally
// async function scrapeAndSaveResults() {
//     const fileName = 'results.json';
//     let allResults = [];

//     for (let keyword of keywords) {
//         for (let page of pages) {
//             let results = await fetchAndExtract(keyword, page);
//             allResults = allResults.concat(results); // Use concat instead of push to flatten the array
//         }
//     }

//     // Write all results to a JSON file
//     fs.writeFileSync(fileName, JSON.stringify(allResults, null, 2));
//     console.log('All results have been saved.');
// }

// scrapeAndSaveResults();





// "Advanced Bank Management",
// "Bank Financial Management",
// "Indian Economy &Indian Financial System",
// "Principles &Practices of Banking",
// "Accounting &Financial Management for Bankers",
// "Retail Banking &Wealth Management",
// "Banking Regulations &Business Laws",
// "Advanced Business & Financial Management",
// "macmillan caiib",
// "macmillan jaiib",
// "caiib books",
// "jaiib books",
// "Caiib resources",
// "jaiib resources",
// "caiib new syallabus",
// "jaiib new syallabus"




//pearson titles
// "8119896025",
// "811989619X",
// "8177586467",
// "9357051481",
// "8119847830",
// "811984713X",
// "9353439450",
// "9356065764",
// "8119847091",
// "9356065810",
// "9353949602",
// "8119847962",
// "933255854X",
// "9332568715",
// "9356063575",
// "9354498299",
// "9356062668",
// "9357051465"




// "Oswaal Books",
//         "Oswaal Objective", "Oswaal CDS",
//         "Oswaal SSLC", "Oswaal NEET", "Oswaal NDA", "Oswaal UPSC", "Oswaal CLAT",
//         "Oswaal Lil Legends Set", "Oswaal BPSC", "Oswaal General", "Oswaal CTET",
//         "oswal sample paper class 10 2024",
//         "Oswaal One for All"
        // "Oswaal CUET",
        // "Oswaal NCERT",
        // "Oswaal JEE",
        // "Oswaal NTSE",
        // "Oswaal CBSE",
        // "Oswaal ICSE",
        // "Oswaal ISC",
        // "Oswaal NTA",
        // "Oswaal CAT",
        // "Oswaal RRB",
        // "Oswaal Handbook",
        // "Oswaal RMT",
        // "Oswaal UGC",
        // "Oswaal GATE"