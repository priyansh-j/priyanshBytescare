const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs'); // Required to write the file

// Example ASINs array; you can populate this array dynamically as needed.
let asins = [
    "1509737537",
    "1777592704",
    "1949395324",
    "1032242345",
    "155520144X",
    "1787406024",
    "1949395286",
    "1581315325",
    "1118604911",
    "1119758122",
    "1839963999",
    "3030347915",
    "1912184044",
    "1433008890",
    "126011693X",
    "1939370159",
    "B0BQY7JL94",
    "B0C4YPMXC2",
    "B0CGXGRH4T",
    "B06Y4JFRGW",
    "B0916715TQ",
    "B0D26JDRQK",
    "566074796",
    "9355324340",
    "8126551267",
    "1640551867",
    "B08G1JGNYC",
    "B08V9F9231",
    "B07MMWP18S",
    "1912184001",
    "B0BW799DCN",
    "B07QPNX7TQ"

];

let results = [];
let errorAsins = [];

// Create a promise for each ASIN request
let promises = asins.map(asin => {
    //return axios.get(`https://www.amazon.in/gp/product/ajax/ref=dp_aod_NEW_mbc?asin=${asin}&m=&qid=1716458252&smid=&sourcecustomerorglistid=&sourcecustomerorglistitemid=&sr=1-1&pc=dp&experienceId=aodAjaxMain`, {
    return axios.get(`https://www.amazon.in/gp/aod/ajax/ref=dp_aod_unknown_mbc?asin=${asin}`, {
    headers: { 
            'accept': 'text/html,*/*', 
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8', 
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
          },
        
    })
    .then(response => {
        const $ = cheerio.load(response.data);

        const price = $('#aod-price-0 .a-price-whole').first().text().trim();
        // const mrp = $('#aod-price-0 .a-text-price').first().text().trim().match(/₹\d+.\d+/)[0];
        const mrpText = $('#aod-price-0 .a-text-price').first().text().trim();
        const mrpMatch = mrpText.match(/₹\d+.\d+/);
        const mrp = mrpMatch ? mrpMatch[0] : 'Unavailable';  // Default to 'Unavailable' if no match found

        const discount = $('#aod-price-0 .centralizedApexPriceSavingsOverrides').first().text().trim();

        // Extracting seller information
        const soldBy = $('#aod-offer-soldBy > div > div > div.a-fixed-left-grid-col.a-col-right').first().text().trim().split('(')[0].trim();
        const sellerLink = $('#aod-offer-soldBy a').attr('href');
        const conditionElement = $('#aod-offer-heading h5').first().text().trim().split('(')[0].trim();
        const sellerId = sellerLink ? new URL(sellerLink, 'https://www.amazon.in').searchParams.get('seller') : null;
         
        let serp_obj1 = {
            price: price,
            mrp:  mrp,
            discount: discount,
            condition: conditionElement,
            seller: soldBy+"(drop box)",
            sellerID: sellerId,
            ASIN: asin
        };
        if (serp_obj1.seller) {
            results.push(serp_obj1);
        }
        // console.log({
        //   Price: price,
        //   MRP: mrp,
        //   Discount: discount,
        //   seller: soldBy,
        //   SellerID: sellerId
        // });

        let offerList = $('#aod-offer-list .aod-information-block');
        console.log(offerList.length);

        offerList.each((i, elem) => {
            let row = cheerio.load($(elem).html());

            let priceText = row('div.a-section.a-spacing-none.aok-align-center .a-price').first().text().trim();
            let mrpText = row('div.a-section.a-spacing-small .a-price.a-text-price').first().text().trim();

            let price = priceText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);
            let mrp = mrpText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);

            let serp_obj = {
                price: price ? price[0].replace(/,/g, '') : 'Unavailable',
                mrp: mrp ? mrp[0].replace(/,/g, '') : 'Unavailable',
                discount: row('div.a-section.a-spacing-none.aok-align-center .a-color-price').text().trim(),
                condition: row('div.a-fixed-right-grid-col.a-col-left').first().text().trim(),
                seller: row('a.a-size-small.a-link-normal').text().trim(),
                sellerID: row('a.a-size-small.a-link-normal').attr('href').split("seller=")[1].split("&")[0],
                ASIN: asin
            };

            if (serp_obj.seller) {
                results.push(serp_obj);
            }
        });
    })
    .catch(error => {
        console.log(`Error for ASIN ${asin}:`, error.message);
        errorAsins.push(asin);  // Add ASIN to error list
    });
});

Promise.all(promises).then(() => {
    if (results.length > 0) {
        fs.writeFile('mac_sellerresults3.json', JSON.stringify(results, null, 2), err => {
            if (err) {
                console.log('Error writing results file:', err);
            } else {
                console.log('Successfully written results data to file');
            }
        });
    }

    if (errorAsins.length > 0) {
        fs.writeFile('error_asins.json', JSON.stringify(errorAsins, null, 2), err => {
            if (err) {
                console.log('Error writing error ASINs file:', err);
            } else {
                console.log('Successfully written error ASINs data to file');
            }
        });
    }
});








//     .catch(error => {
//         console.log(error);
//     });
// });

// // Once all promises are resolved, write the results to a JSON file
// Promise.all(promises).then(() => {
//     fs.writeFile('mac_sellerresults.json', JSON.stringify(results, null, 2), err => {
//         if (err) {
//             console.log('Error writing file:', err);
//         } else {
//             console.log('Successfully written data to file');
//         }
//     });
// });













// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs'); // Required to write the file

// // Example ASINs array; you can populate this array dynamically as needed.
// let asins = [
//     "8119896025"
// ];

// let results = [];

// // Create a promise for each ASIN request
// let promises = asins.map(asin => {
//     return axios.get(`https://www.amazon.in/gp/product/ajax/ref=dp_aod_NEW_mbc?asin=${asin}&m=&qid=1716357316&smid=&sourcecustomerorglistid=&sourcecustomerorglistitemid=&sr=8-1&pc=dp&experienceId=aodAjaxMain`, {
//         headers: { 
//             'accept': 'text/html,*/*', 
//             'accept-language': 'en-US,en;q=0.9', 
//             'cookie': 'session-id=259-4826326-7701710; ubid-acbin=262-6513238-1351668; s_nr=1709615209897-New; s_vnum=2141615209898%26vn%3D1; s_dslv=1709615209901; x-amz-captcha-1=1714468514038939; x-amz-captcha-2=P7oXfccrabeB/cePeJo7IA==; sst-acbin=Sst1|PQHJEAyM5IEMpPxnCz8I88quBs_1vn8S9NMHxKjOqmtfuWJz_z543uw1zzyNMVMVqM8zWwPV7obqXdihcho5B_flRHtb-0q21N3KFcUUxfso6eXxh5zgCl-GcpxXlaWsunLq38osj3O1vYqnooNH9A5NafmUJptYXRUMXcLtg1av64-dBFuCAVSTNYVbg3kLd-1_8Y3XJHzboQ3LvfvJMnbgE51wiYOTI5Ij7_tavgZtqIk; session-id-time=2082787201l; i18n-prefs=INR; session-token=08xEZckIb9sW6VpoDM59QKGe7HAFj91qKE7oh5NIoJ2Qaiz56UyW+LfF4wLZNFEiC4i69qKch7th7vaFe36ckcC7pqVE5PAiShhxGjseUWaBOjn3PGe8d3ef2ISMVhqUhykxxCPnfLCQ7QhJ/53SKuS4JhH9lcJgRJqrzvAgU465EMLi7/svYs9bKHlV/QliSZr6TmI6nvVx9I9rMOLFTDDJ6SKS1IP+NDlwQsYPVUnxB3GsOJ36uLb7eYt0SpQrKkm7hg/WFrLcgwxwa0Nsa3pvSXd5Cp+f81Ma1cwrEkr6nRRUEqfmbJE4ZMT4JuxfG650NWuX5QqBK1Fe5MNNOw05HJQujmpK; csm-hit=tb:s-HZJQMV45GJ1PKVMP56P5|1716359723323&t:1716359724199&adb:adblk_no; i18n-prefs=INR; session-id=260-4663876-0916322; session-id-time=2082787201l; session-token=oCqgm0d/HJKbd7oXVn/vj6C+FH3ks3YuYDbXxwvHJ+uI2vCLbkzNffO2zd+/NLCKjp9fvjjtle9m0Yo21fLCH6hlPpyBbxbrYpdzuRON7NDXVmobkWzVkTNyU0/ZpPjYDHGN677uzk/Y6sPkH5AQzgwW4zDUXmekRqxnLcLzbUagW46oNhe8fEy1GLr6dXsG/joBQVlyubafuwWmLQT8O7j1m214A7FKhrdvh8uHAZ+mBc4BljEFuvQEJpU3ta3XF6YUVGXOEdbtK1jcsZD/bqj3EHGw9ieaz5JAk1Kw4fIHjSGJDQhmNTrAYj/Dy5HObcnKaiKXXCaVjiDxUWrkSjKixvOsTv5e', 
//             'device-memory': '8', 
//             'downlink': '10', 
//             'dpr': '1.5', 
//             'ect': '4g', 
//             'priority': 'u=1, i', 
//             'referer': 'https://www.amazon.in/JAIIB-Syllabus-Macmillan-Accounting-Financial/dp/B0BSLQ5TR4/ref=sr_1_1?crid=3BEYDUMIGTTSQ&dib=eyJ2IjoiMSJ9.JwC6ponBBTTUHF1PUculgQ.fVfu-K1e_LoxD2BbeMs_YfB3nzfFwkuL47JIuH6JQ-M&dib_tag=se&keywords=B0BSLQ5TR4&nsdOptOutParam=true&qid=1716357316&sprefix=b0bslq5tr4%2Caps%2C486&sr=8-1', 
//             'rtt': '200', 
//             'sec-ch-device-memory': '8', 
//             'sec-ch-dpr': '1.5', 
//             'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"', 
//             'sec-ch-ua-mobile': '?0', 
//             'sec-ch-ua-platform': '"Windows"', 
//             'sec-ch-ua-platform-version': '"15.0.0"', 
//             'sec-ch-viewport-width': '632', 
//             'sec-fetch-dest': 'empty', 
//             'sec-fetch-mode': 'cors', 
//             'sec-fetch-site': 'same-origin', 
//             'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 
//             'viewport-width': '632', 
//             'x-requested-with': 'XMLHttpRequest'
//           }
//     })
//     .then(response => {
//         const $ = cheerio.load(response.data);
//         let offerList = $('#aod-offer-list .aod-information-block');

//         offerList.each((i, elem) => {
//             let row = cheerio.load($(elem).html());

//             let priceText = row('div.a-section.a-spacing-none.aok-align-center .a-price').first().text().trim();
//             let mrpText = row('div.a-section.a-spacing-small .a-price.a-text-price').first().text().trim();
//             let price = priceText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);
//             let mrp = mrpText.match(/\₹\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);

//             // Extracting detailed seller information
//             let sellerName = row('#aod-offer-soldBy .a-link-normal').text().trim();
//             let sellerUrl = row('#aod-offer-soldBy .a-link-normal').attr('href');
//             let sellerRating = row('#aod-offer-seller-rating').text().trim();

//             let serp_obj = {
//                 price: price ? price[0].replace(/,/g, '') : 'Unavailable',
//                 mrp: mrp ? mrp[0].replace(/,/g, '') : 'Unavailable',
//                 discount: row('div.a-section.a-spacing-none.aok-align-center .a-color-price').text().trim(),
//                 condition: row('div.a-fixed-right-grid-col.a-col-left').first().text().trim(),
//                 seller: sellerName,
//                 sellerURL: `https://www.amazon.in${sellerUrl}`,
//                 sellerRating: sellerRating,
//                 ASIN: asin
//             };

//             if (serp_obj.seller) {
//                 results.push(serp_obj);
//             }
//         });
//     })
//     .catch(error => {
//         console.log(error);
//     });
// });

// // Once all promises are resolved, write the results to a JSON file
// Promise.all(promises).then(() => {
//     fs.writeFile('results.json', JSON.stringify(results, null, 2), err => {
//         if (err) {
//             console.log('Error writing file:', err);
//         } else {
//             console.log('Successfully written data to file');
//         }
//     });
// });


