const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

let asins = [
    "155520144X",
    "1509737537",
    "1581315325",
    "1118604911",
    "126011693X",
    "1839963999",
    "1912184044",
    "1032242345",
    "1787406024",
    "1949395286",
    "1433008890",
    "1119758122",
    "1777592704",
    "1939370159",
    "B087394GTT",
    "8193762487",
    "9386394839",
    "B0C4YB56T2",
    "B08933JQDG",
    "938187381X",
    "B0C4YBMW9R",
    "B0BVVRTN1D",
    "B00NSMNNM4",
    "B0CYX5XYXG",
    "B07HD7WDS8",
    "8185787247",
    "935666028X",
    "9355012322",
    "9381873844",
    "B0CZDZHCGK",
    "B07CRKVJWF",
    "B00FQRWQMW",
    "9351478955",
    "9387000656",
    "B0D47459WY",
    "B0BQY7JL94",
    "B00RXAJHT0",
    "B0BX46NGYN",
    "9352864867",
    "B0CYX9GWCC",
    "B079BZH8RJ",
    "B07BFMGJ2Q",
    "9387687244",
    "9360349771",
    "B0929BX1BG",
    "1326728350",
    "B0BW7G77ZG",
    "1848081464",
    "B0D427175V",
    "9352718798",
    "B0C4YBDT1G",
    "B0BTDLJY72",
    "8186141847",
    "9355869991",
    "8186141685",
    "B0BRKTP7TQ",
    "B0BSG2J649",
    "9355321880",
    "B0BSLQ5TR4",
    "012374251X",
    "B09NYF3RXM",
    "8184004982",
    "8195088767",
    "B0D26JDRQK",
    "B0CGXGRH4T",
    "B0BYPJ43MC",
    "9332706247",
    "B0BX3Y98M4",
    "9356660344",
    "B0916715TQ",
    "9350598477",
    "9354403700",
    "8193762460",
    "9351611744",
    "8120335333",
    "71239367",
    "B0CXY2PF87",
    "B0BRQLPV2W",
    "9355324340",
    "9389867223",
    "B0979NNMF8",
    "9354498272",
    "9354497888",
    "9356660328",
    "163873934X",
    "B07MMWP18S",
    "B00IG24QVI",
    "1016474334",
    "9360343463",
    "B07QPNX7TQ",
    "067009045X",
    "B09P47KLV5",
    "B09MMJ1FXG",
    "B0CTQXCPPH",
    "B08LMTRZMZ",
    "1021514691",
    "8177083570",
    "1314135031",
    "B0CYX6JTLF",
    "B06XK5TF8J",
    "B086PJVSBW",
    "B08N6ZDWLS",
    "B06Y4JFRGW",
    "548768269",
    "1947586068",
    "110403820X",
    "B0CBM8QLFS",
    "B0C4YPMXC2",
    "70499527",
    "9351611817",
    "B0CJQGMB9N",
    "8126551267",
    "B0C5B8KT6B",
    "B09MWBDMFB",
    "1640551867",
    "1022430491",
    "1949395324",
    "933255949X",
    "818707017X",
    "B01MUNOYM9",
    "B09V7R6BZZ",
    "9360345881",
    "8119263553",
    "1912184001",
    "B000SEOIEM",
    "3030347915",
    "9041128565",
    "B08V9F9231",
    "B08G1JGNYC",
    "9041136908",
    "938318650X",
    "B0CYX67GC8",
    "B0C53LMQ4B",
    "B0CZJT1447",
    "1904501362",
    "819722434X",
    "1035501252",
    "B0B1QP5N7X",
    "B01N1YAFWT",
    "9362076977",
    "130688835",
    "521860717",
    "6202556846",
    "566074796",
    "8119153987",
    "8121926629",
    "B0BW799DCN",
    "8126578068",
    "B0BC1QTQ1R",
    "9387000648",
    "B086Z3RQVF",
    "9357786511",
    "9386691205",
    "B081LX6Z4J"

];

let results = [];

async function scrapeData(asin) {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();

    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage && currentPage <= 1) {
        await page.goto(`https://www.amazon.in/gp/aod/ajax/ref=dp_aod_unknown_mbc?asin=${asin}&pageno=${currentPage}`, {
            waitUntil: 'networkidle2'
        });

        const content = await page.content();
        const $ = cheerio.load(content);

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
            //seller: soldBy+"(drop box)",
            seller: soldBy + (currentPage === 1 ? " (drop box)" : ""),
            sellerID: sellerId,
            ASIN: asin
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
            let sellerID = href ? href.split("seller=")[1].split("&")[0] : null;

            let serp_obj = {
                price: price ? price[0].replace(/,/g, '') : 'Unavailable',
                mrp: mrp ? mrp[0].replace(/,/g, '') : 'Unavailable',
                discount: row('div.a-section.a-spacing-none.aok-align-center .a-color-price').text().trim(),
                condition: row('div.a-fixed-right-grid-col.a-col-left').first().text().trim(),
                seller: row('a.a-size-small.a-link-normal').text().trim(),
                sellerID: sellerID,
                ASIN: asin
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
    }

    await browser.close();
}

async function runScraping() {
    for (let asin of asins) {
        await scrapeData(asin);
    }

    fs.writeFile('asin_results.json', JSON.stringify(results, null, 2), err => {
        if (err) console.log('Error writing file:', err);
        else console.log('Successfully written data to file');
    });
}

runScraping().catch(console.error);
