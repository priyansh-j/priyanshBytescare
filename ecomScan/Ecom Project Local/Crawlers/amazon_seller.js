const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

let results = [];

const headers = {
    'accept': 'text/html,*/*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    //'cookie': 'ubid-acbin=262-6513238-1351668; s_nr=1709615209897-New; s_vnum=2141615209898%26vn%3D1; s_dslv=1709615209901; sst-acbin=Sst1|PQHJEAyM5IEMpPxnCz8I88quBs_1vn8S9NMHxKjOqmtfuWJz_z543uw1zzyNMVMVqM8zWwPV7obqXdihcho5B_flRHtb-0q21N3KFcUUxfso6eXxh5zgCl-GcpxXlaWsunLq38osj3O1vYqnooNH9A5NafmUJptYXRUMXcLtg1av64-dBFuCAVSTNYVbg3kLd-1_8Y3XJHzboQ3LvfvJMnbgE51wiYOTI5Ij7_tavgZtqIk; i18n-prefs=INR; x-amz-captcha-1=1716378424810587; x-amz-captcha-2=Vm3dsAMUhRX9d4nwCehOyg==; session-id=258-5427539-4664400; x-acbin="LggJNVgUIHkrz?N1T1kbP9rkUkEAMFVdbysw?aSJWGEu5ypw^@E0MnR?3yPEvvdSi"; at-acbin=Atza|IwEBICGfRMAREkxQ7VUwBPh0hdes6Qyuh_iwRJEIEO3gezBTeJpF_5_LojvLtdi1rueBlc3uTd0Mhefs1eOg-rlyBIj0cxAcsNMrprfc0diboRRmpWAqvKq9ydlngpFfW4cn1Cl_0yYwao5MD4sIHX-qGtmcEQOQ9IbDmggpxd6RIU7hj7qOu_T2meE6EF4VVpUScl8l4nXKb6SY7VaQOUTPYxY7Pe2j2p3uAVNJUA0y7Zq0lA; sess-at-acbin="cR7COYM09tRHdxoujlKNFHUfuA6s/fdm15OvJdkmYSs="; session-id-time=2082787201l; lc-acbin=en_IN; sp-cdn=J4F7; b2b="VFJVRQ=="; session-token=ouFMSXLdkHAFFH2Bgyf2c5xSyRIKldomnejmH3L1siVsDotr6V8DrEAwOSiDImY8KqJOz7Xu5v3fehlm+2PhJt2GoPD7F9rJ3lRxGgrvEeMk/5m1/buNxTYjR0+wlw+ZKSXPnPHsf8OmLEhYjLURAcgi4K7VO0unnA2yzSEDVlsD8OXLwLZQvcVKUWvluhC0XXn113YqHTiWRKgrc9dYO92YvvymCjLoSRsOG1vwrahycwZqnlvkmdSKxEbz9me62TNLk7sPtFndA2fRTohTvJy5t9Cdo0AVFqZSZqZDeCkDegVsYV9x1ShQUzWSbBTn3wroOcMET5TeunXzoO7LZIzzQvoSfIykz454ZKRC+uQGLYrHZHI6/jglo5L2jDGX; csm-hit=tb:s-ZDVYNGTZ58W2SDF6KJ2H|1717479046279&t:1717479049866&adb:adblk_no; i18n-prefs=INR; session-id=257-8886605-2823314; session-id-time=2082787201l; session-token=R+ZoldGPnFf9vmAXfalID8x3hjPMkmeyyFo+zHuuSAVf4c60/1TOZVcxrYxTR6ef8QEbT3sFPYL39+2+zcX6q2L3Wpx6YJPuXnVTSQAMJOLnLbRTq0ToNpEX1rA2qPEJdvqIqy+30fywG32qyMslFAc54hHigZ0m+B7LzzwRSM5ZT2RjHFUJ/D9EHf18p7h1VfZOr8nVot0zn318tCzMP4/SskZAnwa9HHcf32yeKca5yIYucMdP164MUHPVioQfCNZysn4MnHeZ2xG5hXOD04cNFPevw/pNtijMODO26n6yiBVm6zP3FUa6ayQqNC+9qlM796yK0v/LGlBDGKF5J6VFKwnss5qd', 
            'cookie': 'session-id=260-1265984-6802412; i18n-prefs=INR; ubid-acbin=260-2440372-3989933; lc-acbin=en_IN; s_nr=1701679791695-New; s_vnum=2133679791695%26vn%3D1; s_dslv=1701679791697; x-amz-captcha-1=1707815569616385; x-amz-captcha-2=Vm9+HsLnkmihJ9hD/hu8xg==; session-id-time=2082787201l; session-token=uC1BRiRFgTEdSDo1dsKXG0vm5ULimaSiP/k8l0NqGXchbgYIyURwiOQ+lBJXk7hDtwXOaqGS/QLZVwLxnwGGvEaf58qNhJw4BA4YnMJ0PsPjW2x1r3iTyR9sD8qP1UcqP+OqB1VqiAKp+0NqvOlrht2aDiF5LPTzkb3U5FFnsemLewtTFv++N/yoEo1cGG05fQwxbiEXk5RW7IqGpvN9eh+Qla/kY1aRt2nH3DgEgli2D4MrFQuJFGz8lTLz2VCTPPIcYpD0saciHpOnncLiBSTXJmp98YS0GWNdQ5rsqbaxdeE7FbxABm7WdGavbfnFrYaXVy5lo/Qhrui2bTYnGmILDIWw3Rb5; csm-hit=tb:s-K5PXAPEDKAB55Y6KZXQ8|1716458256004&t:1716458258553&adb:adblk_no; i18n-prefs=INR; session-id=257-6177112-1304819; session-id-time=2082787201l; session-token=oCqgm0d/HJKbd7oXVn/vj6C+FH3ks3YuYDbXxwvHJ+uI2vCLbkzNffO2zd+/NLCKjp9fvjjtle9m0Yo21fLCH6hlPpyBbxbrYpdzuRON7NDXVmobkWzVkTNyU0/ZpPjYDHGN677uzk/Y6sPkH5AQzgwW4zDUXmekRqxnLcLzbUagW46oNhe8fEy1GLr6dXsG/joBQVlyubafuwWmLQT8O7j1m214A7FKhrdvh8uHAZ+mBc4BljEFuvQEJpU3ta3XF6YUVGXOEdbtK1jcsZD/bqj3EHGw9ieaz5JAk1Kw4fIHjSGJDQhmNTrAYj/Dy5HObcnKaiKXXCaVjiDxUWrkSjKixvOsTv5e', 
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
};

async function scrapeData(asin, attempt = 1) {
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage && currentPage <= 3) {
        const url = `https://www.amazon.in/gp/aod/ajax/ref=dp_aod_unknown_mbc?asin=${asin}&pageno=${currentPage}`;

        try {
            const response = await axios.get(url, { headers });
            const content = response.data;
            const $ = cheerio.load(content);

            const price = $('#aod-price-0 .a-price-whole').first().text().trim();
            const mrpText = $('#aod-price-0 .a-text-price').first().text().trim();
            const mrpMatch = mrpText.match(/₹\d+.\d+/);
            const mrp = mrpMatch ? mrpMatch[0] : 'Unavailable';
            const discount = $('#aod-price-0 .centralizedApexPriceSavingsOverrides').first().text().trim();
            const soldBy = $('#aod-offer-soldBy > div > div > div.a-fixed-left-grid-col.a-col-right').first().text().trim().split('(')[0].trim();
            const sellerLink = $('#aod-offer-soldBy a').attr('href');
            const conditionElement = $('#aod-offer-heading h5').first().text().trim().split('(')[0].trim();
            const sellerId = sellerLink ? new URL(sellerLink, 'https://www.amazon.in').searchParams.get('seller') : null;

            let serp_obj1 = {
                price: price,
                mrp: mrp,
                discount: discount,
                condition: conditionElement,
                seller: soldBy + (currentPage === 1 ? " (drop box)" : ""),
                sellerID: sellerId,
                ASIN: asin,
            };
            if (serp_obj1.seller) {
                results.push(serp_obj1);
            }

            let offerList = $('#aod-offer-list .aod-information-block');
            console.log(`Page ${currentPage}: ${offerList.length} offers found`);

            offerList.each((i, elem) => {
                let row = cheerio.load($(elem).html());

                let priceText = row('div.a-section.a-spacing-none.aok-align-center .a-price').first().text().trim();
                let mrpText = row('div.a-section.a-spacing-small .a-price.a-text-price').first().text().trim();

                let price = priceText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);
                let mrp = mrpText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);

                let href = row('a.a-size-small.a-link-normal').attr('href');
                let sellerID = href ? (href.split("seller=")[1] ? href.split("seller=")[1].split("&")[0] : null) : null;

                let serp_obj = {
                    price: price ? price[0].replace(/,/g, '') : 'Unavailable',
                    mrp: mrp ? mrp[0].replace(/,/g, '') : 'Unavailable',
                    discount: row('div.a-section.a-spacing-none.aok-align-center .a-color-price').text().trim(),
                    condition: row('div.a-fixed-right-grid-col.a-col-left').first().text().trim(),
                    seller: row('a.a-size-small.a-link-normal').text().trim(),
                    sellerID: sellerID,
                    ASIN: asin,
                    SellerListingLink: `https://www.amazon.in/gp/product/${asin}?smid=${sellerID}&psc=1`
                };

                if (serp_obj.seller) {
                    results.push(serp_obj);
                }
            });

            if (offerList.length >= 10) {
                currentPage++;
            } else {
                hasNextPage = false;
            }
        } catch (error) {
            console.error(`Error fetching page ${currentPage} for asin ${asin}:`, error.response.status);
            if (attempt < 3) {
                console.log(`Retrying asin ${asin} (Attempt ${attempt + 1})`);
                await scrapeData(asin, attempt + 1);
            } else {
                console.error(`Failed to fetch data for asin ${asin} after 3 attempts`);
                hasNextPage = false;
            }
        }
    }
}

async function processItem(item, clientName) {
    let asin = item["ISBN-10"]; // Assuming the JSON data contains an asin field
    await scrapeData(asin);
    const outputDir = path.join('Output_Data', clientName);
    const csvFilePath = path.join(outputDir, 'amazon_seller.csv');

    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'price', title: 'Price' },
            { id: 'mrp', title: 'MRP' },
            { id: 'discount', title: 'Discount' },
            { id: 'condition', title: 'Condition' },
            { id: 'seller', title: 'Seller' },
            { id: 'sellerID', title: 'Seller ID' },
            { id: 'ASIN', title: 'ASIN' },
            { id: 'SellerListingLink', title: 'Seller Listing Link' }
        ]
    });

    csvWriter.writeRecords(results)
        .then(() => {
            console.log('Successfully written data to CSV file');
        })
        .catch(err => {
            console.error('Error writing CSV file:', err);
        });
}

module.exports = {
    processItem
};
