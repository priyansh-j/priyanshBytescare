const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Define keywords and pages to scrape
const keywords = [
    
    "Advanced Bank Management",
    "Bank Financial Management",
    "Indian Economy &Indian Financial System",
    "Principles &Practices of Banking",
    "Accounting &Financial Management for Bankers",
    "Retail Banking &Wealth Management",
    "Banking Regulations &Business Laws",
    "Advanced Business & Financial Management",
    "macmillan caiib",
    "macmillan jaiib",
    "caiib books",
    "jaiib books",
    "Caiib resources",
    "jaiib resources",
    "caiib new syallabus",
    "jaiib new syallabus"


    //pearson daily 

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

    //pearson_weekly
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

 


    // "Oswaal Books",
    //     "Oswaal Objective", "Oswaal CDS",
    //     "Oswaal SSLC", "Oswaal NEET", "Oswaal NDA", "Oswaal UPSC", "Oswaal CLAT",
    //     "Oswaal Lil Legends Set", "Oswaal BPSC", "Oswaal General", "Oswaal CTET",
    //     "oswal sample paper class 10 2024",
    //     "Oswaal One for All"

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

]; // Add your keywords here



let pages = [1,2,3,4]
// Function to fetch and extract data
async function fetchAndExtract(keyword, page) {
    console.log(`data extracted for ${keyword} for ${page}`);
    // let proxies = {
    //     "http": "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000",
    //     "https": "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000"
    // };

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        //url: `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&ref=sr_pg_${page}`,
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
          },
        //proxies: proxies,
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
    // Split the text and take the first occurrence
            mrp = mrp.split('₹')[1] ? '₹' + mrp.split('₹')[1] : '';
            price = price.split('₹')[1] ? '₹' + price.split('₹')[1] : '';   
            let title = row_selector('span.a-size-medium.a-color-base.a-text-normal').first().text().trim() ||
            row_selector('span.a-size-base-plus.a-color-base.a-text-normal').first().text().trim();
            // Construct result object
            let serp_obj = {
                //title: row_selector('span.a-size-medium.a-color-base.a-text-normal').first().text(),
                //title: row_selector('span.a-size-base-plus.a-color-base.a-text-normal').text().trim(),
                title:title,
                //ASIN: (row_selector('a.a-link-normal.a-text-normal').first().attr('href') || "").split(/(\\|\/)/ig).pop().split('?')[0],
                source: "https://www.amazon.in" + (row_selector('a.a-link-normal.a-text-normal').first().attr('href') || "").split('?')[0],
                ASIN:asin,
                mrp: mrp,
                price: price,
                cover: (row_selector('img.s-image').first().attr('src') || ""),
                author: author
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
    const fileName = 'results.json';
    let allResults = [];

    for (let keyword of keywords) {
        for (let page of pages) {
            let results = await fetchAndExtract(keyword, page);
            allResults = allResults.concat(results); // Use concat instead of push to flatten the array
        }
    }

    // Write all results to a JSON file
    fs.writeFileSync(fileName, JSON.stringify(allResults, null, 2));
    console.log('All results have been saved.');
}

scrapeAndSaveResults();





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