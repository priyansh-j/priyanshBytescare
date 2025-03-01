const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


async function writeHeaders(csvFilePath) {
    if (!fs.existsSync(csvFilePath)) {
        const csvWriterForHeaders = createCsvWriter({
            path: csvFilePath,
            header: [
                { id: 'title', title: 'Title' },
                { id: 'ASIN', title: 'ASIN' },
                { id: 'source', title: 'Source' },
                { id: 'cover', title: 'Cover' },
                { id: 'price', title: 'Price' },
                { id: 'mrp', title: 'MRP' },
                { id: 'Format', title: 'Format' },
                { id: 'rating', title: 'Rating' },
                { id: 'original_listing', title: 'Original Listing' }
            ],
            append: false // This will write headers if the file does not exist
        });
        await csvWriterForHeaders.writeRecords([]); // Writing headers
    }
}

async function fetchAndExtract(item, csvWriter, page = 1, retryLimit = 3) {
    let results = [];
    //const keyword = item.Title;
    const keyword = item.Scanning_Type === 'ISBN-10/ISBN-13' ? item['ISBN-10'] : item.Title;
    try {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&page=${page}`,
            headers: {
                'authority': 'www.amazon.in',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'cookie': 'ubid-acbin=262-6513238-1351668; s_nr=1709615209897-New; s_vnum=2141615209898%26vn%3D1; s_dslv=1709615209901; sst-acbin=Sst1|PQHJEAyM5IEMpPxnCz8I88quBs_1vn8S9NMHxKjOqmtfuWJz_z543uw1zzyNMVMVqM8zWwPV7obqXdihcho5B_flRHtb-0q21N3KFcUUxfso6eXxh5zgCl-GcpxXlaWsunLq38osj3O1vYqnooNH9A5NafmUJptYXRUMXcLtg1av64-dBFuCAVSTNYVbg3kLd-1_8Y3XJHzboQ3LvfvJMnbgE51wiYOTI5Ij7_tavgZtqIk; i18n-prefs=INR; x-amz-captcha-1=1716378424810587; x-amz-captcha-2=Vm3dsAMUhRX9d4nwCehOyg==; session-id=258-5427539-4664400; x-acbin="LggJNVgUIHkrz?N1T1kbP9rkUkEAMFVdbysw?aSJWGEu5ypw^@E0MnR?3yPEvvdSi"; at-acbin=Atza|IwEBICGfRMAREkxQ7VUwBPh0hdes6Qyuh_iwRJEIEO3gezBTeJpF_5_LojvLtdi1rueBlc3uTd0Mhefs1eOg-rlyBIj0cxAcsNMrprfc0diboRRmpWAqvKq9ydlngpFfW4cn1Cl_0yYwao5MD4sIHX-qGtmcEQOQ9IbDmggpxd6RIU7hj7qOu_T2meE6EF4VVpUScl8l4nXKb6SY7VaQOUTPYxY7Pe2j2p3uAVNJUA0y7Zq0lA; sess-at-acbin="cR7COYM09tRHdxoujlKNFHUfuA6s/fdm15OvJdkmYSs="; session-id-time=2082787201l; lc-acbin=en_IN; sp-cdn=J4F7; b2b="VFJVRQ=="; session-token=ouFMSXLdkHAFFH2Bgyf2c5xSyRIKldomnejmH3L1siVsDotr6V8DrEAwOSiDImY8KqJOz7Xu5v3fehlm+2PhJt2GoPD7F9rJ3lRxGgrvEeMk/5m1/buNxTYjR0+wlw+ZKSXPnPHsf8OmLEhYjLURAcgi4K7VO0unnA2yzSEDVlsD8OXLwLZQvcVKUWvluhC0XXn113YqHTiWRKgrc9dYO92YvvymCjLoSRsOG1vwrahycwZqnlvkmdSKxEbz9me62TNLk7sPtFndA2fRTohTvJy5t9Cdo0AVFqZSZqZDeCkDegVsYV9x1ShQUzWSbBTn3wroOcMET5TeunXzoO7LZIzzQvoSfIykz454ZKRC+uQGLYrHZHI6/jglo5L2jDGX; csm-hit=tb:s-ZDVYNGTZ58W2SDF6KJ2H|1717479046279&t:1717479049866&adb:adblk_no; i18n-prefs=INR; session-id=257-8886605-2823314; session-id-time=2082787201l; session-token=R+ZoldGPnFf9vmAXfalID8x3hjPMkmeyyFo+zHuuSAVf4c60/1TOZVcxrYxTR6ef8QEbT3sFPYL39+2+zcX6q2L3Wpx6YJPuXnVTSQAMJOLnLbRTq0ToNpEX1rA2qPEJdvqIqy+30fywG32qyMslFAc54hHigZ0m+B7LzzwRSM5ZT2RjHFUJ/D9EHf18p7h1VfZOr8nVot0zn318tCzMP4/SskZAnwa9HHcf32yeKca5yIYucMdP164MUHPVioQfCNZysn4MnHeZ2xG5hXOD04cNFPevw/pNtijMODO26n6yiBVm6zP3FUa6ayQqNC+9qlM796yK0v/LGlBDGKF5J6VFKwnss5qd', 
 //'cookie': 'session-id=260-1265984-6802412; i18n-prefs=INR; ubid-acbin=260-2440372-3989933; lc-acbin=en_IN; s_nr=1701679791695-New; s_vnum=2133679791695%26vn%3D1; s_dslv=1701679791697; x-amz-captcha-1=1707815569616385; x-amz-captcha-2=Vm9+HsLnkmihJ9hD/hu8xg==; session-id-time=2082787201l; session-token=uC1BRiRFgTEdSDo1dsKXG0vm5ULimaSiP/k8l0NqGXchbgYIyURwiOQ+lBJXk7hDtwXOaqGS/QLZVwLxnwGGvEaf58qNhJw4BA4YnMJ0PsPjW2x1r3iTyR9sD8qP1UcqP+OqB1VqiAKp+0NqvOlrht2aDiF5LPTzkb3U5FFnsemLewtTFv++N/yoEo1cGG05fQwxbiEXk5RW7IqGpvN9eh+Qla/kY1aRt2nH3DgEgli2D4MrFQuJFGz8lTLz2VCTPPIcYpD0saciHpOnncLiBSTXJmp98YS0GWNdQ5rsqbaxdeE7FbxABm7WdGavbfnFrYaXVy5lo/Qhrui2bTYnGmILDIWw3Rb5; csm-hit=tb:s-K5PXAPEDKAB55Y6KZXQ8|1716458256004&t:1716458258553&adb:adblk_no; i18n-prefs=INR; session-id=257-6177112-1304819; session-id-time=2082787201l; session-token=oCqgm0d/HJKbd7oXVn/vj6C+FH3ks3YuYDbXxwvHJ+uI2vCLbkzNffO2zd+/NLCKjp9fvjjtle9m0Yo21fLCH6hlPpyBbxbrYpdzuRON7NDXVmobkWzVkTNyU0/ZpPjYDHGN677uzk/Y6sPkH5AQzgwW4zDUXmekRqxnLcLzbUagW46oNhe8fEy1GLr6dXsG/joBQVlyubafuwWmLQT8O7j1m214A7FKhrdvh8uHAZ+mBc4BljEFuvQEJpU3ta3XF6YUVGXOEdbtK1jcsZD/bqj3EHGw9ieaz5JAk1Kw4fIHjSGJDQhmNTrAYj/Dy5HObcnKaiKXXCaVjiDxUWrkSjKixvOsTv5e', 
 'device-memory': '8', 
 'downlink': '10', 
 'dpr': '1.5', 
 'ect': '4g', 
 'priority': 'u=1, i', 
 'referer': 'https://www.amazon.in/Sikshan-Abhiyogyata-Chapter-Previous-Questions/dp/811989619X/ref=sr_1_1?crid=SND6PLYN6LO0&dib=eyJ2IjoiMSJ9.YTXdwfJh77gHujyTV--uwdfwyU7c8KF4ltUHes6MkKfGjHj071QN20LucGBJIEps.jvsQClywZDMTmZqHRrxcoSJMptEXmBcP55RSI8_xh2Q&dib_tag=se&keywords=811989619X&nsdOptOutParam=true&qid=1716458252&s=books&sprefix=811989619x%2Cstripbooks%2C213&sr=1-1', 
 'rtt': '150', 
 'sec-ch-device-memory': '8', 
 'sec-ch-dpr': '1.5', 
 'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"', 
 'sec-ch-ua-mobile': '?0', 
 'sec-ch-ua-platform': '"Windows"', 
 'sec-ch-ua-platform-version': '"15.0.0"', 
 'sec-ch-viewport-width': '682', 
 'sec-fetch-dest': 'empty', 
 'sec-fetch-mode': 'cors', 
 'sec-fetch-site': 'same-origin', 
 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 
 'viewport-width': '682', 
 'x-requested-with': 'XMLHttpRequest'
            },
        };

        const response = await axios.request(config);
        const body = response.data;
        let $ = cheerio.load(body);

        // Check for CAPTCHA
        let block_text = $('div#infoDiv').text();
        if (block_text.includes('solve the CAPTCHA')) {
            console.log('CAPTCHA detected, retrying...');
            if (retryLimit > 0) {
                await fetchAndExtract(item, csvWriter, page, retryLimit - 1);
            }
            return;
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
                row_selector('span.a-size-base-plus.a-color-base.a-text-normal').first().text().trim() || row_selector('a.a-link-normal.s-line-clamp-2.s-link-style.a-text-normal h2 span').first().text().trim();;
            let format = row_selector('a.a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-bold').text().trim();
            let rating = row_selector('i[data-cy="reviews-ratings-slot"] span.a-icon-alt').text().trim();
            rating = rating.split(' ')[0];
           
            let serp_obj = {
                title: title,
                ASIN: asin,  ///item['ISBN-10'] ? (asin === item['ISBN-10'] ? `${asin} (match)` : `${asin} (mismatch)`) : asin,
                source: "https://www.amazon.in" + (row_selector('a.a-link-normal.a-text-normal').first().attr('href') || "").split('?')[0],
                cover: (row_selector('img.s-image').first().attr('src') || ""),
                //price: item.minimum_price ? (price <= item.minimum_price.toString() ? `${price} (true)` : `${price} (false)`) : price,
                price:price,
                mrp: mrp,
                Format: format,
                rating: rating,
                original_listing: item.Online_Listing || item.Amazon_Link || ''
            };

            if (serp_obj.source) {
                results.push(serp_obj);
            }
        });

        // Save results incrementally
        if (results.length > 0) {
            await csvWriter.writeRecords(results);
            return true; // Continue loop
        } else {
            console.log(`No data found for ${keyword} on page ${page}, stopping.`);
            return false; // Stop loop
        }

    } catch (error) {
        console.error(`Error fetching data for keyword '${keyword}' on page ${page}:`, error);
        if (retryLimit > 0) {
            console.log(`Retrying... (${retryLimit} attempts left)`);
            await fetchAndExtract(item, csvWriter, page, retryLimit - 1);
        }
    }
}

async function scrapeItem(item, clientName) {
    const outputDir = path.join('Output_Data', clientName);
    const csvFilePath = path.join(outputDir, 'amazon.csv');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            {id: 'title', title: 'Title'},
            {id: 'ASIN', title: 'ASIN'},
            {id: 'source', title: 'Source'},
            {id: 'cover', title: 'Cover'},
            {id: 'price', title: 'Price'},
            {id: 'mrp', title: 'MRP'},
            {id: 'Format', title: 'Format'},
            {id: 'rating', title: 'Rating'},
            {id: 'original_listing', title: 'Original Listing'}
        ],
        append: true // This will append to the file if it exists
    });

    await writeHeaders(csvFilePath); // Ensure headers are written before scraping

    for (let page = 1; page <= 10; page++) {
        const shouldContinue = await fetchAndExtract(item, csvWriter, page);
        if (!shouldContinue) {
            break;
        }
    }

    console.log('All data has been saved to', csvFilePath);
}

async function processItem(item, clientName) {
    await scrapeItem(item, clientName);
}

module.exports = {
    processItem
};
