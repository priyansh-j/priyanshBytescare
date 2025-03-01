const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

// Function to scrape Flipkart page
async function scrapeFlipkart(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'Accept': '*/*', 
                'Accept-Language': 'en-US,en;q=0.9', 
                'Connection': 'keep-alive', 
                'Content-Type': 'application/json', 
                'Cookie': 'T=clymz3in921ux1fdvw4bbx9ox-BR1721047252006; dpr=1; _pxvid=791fd957-42a7-11ef-b7a5-b5e7dcaded86; ULSN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjb29raWUiLCJhdWQiOiJmbGlwa2FydCIsImlzcyI6ImF1dGguZmxpcGthcnQuY29tIiwiY2xhaW1zIjp7ImdlbiI6IjEiLCJ1bmlxdWVJZCI6IlVVSTI0MDgxNjEwMDAxMDg2OUQ2NEI0UDgiLCJma0RldiI6bnVsbH0sImV4cCI6MTczOTU2MjYxMCwiaWF0IjoxNzIzNzgyNjEwLCJqdGkiOiJjMmYwOWFhMS02ZGNjLTRmNjYtOGE2Mi0wMGNmYmRiY2RkZDEifQ.NeZFta2yB40t4UGBZr1oQwo44Cmxw8RL2gTeiOhLugc; vh=599; vw=1280; AMCV_17EB401053DAF4840A490D4C%40AdobeOrg=-227196251%7CMCIDTS%7C19992%7CMCMID%7C71466899700205071999064934404008633607%7CMCAAMLH-1727413121%7C12%7CMCAAMB-1727875083%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1727277483s%7CNONE%7CMCAID%7C334A7689455222A5-60001C5D829B9581; ud=3.SP0ce73iy-9UIHfyFoQdCcO3EU7CI6_czdf7l1XSkSEkJvnmevlgKpymjmYnBlM-SMaYZ9QfBiht1npx3rTMIIeAzJlboWUz0mRPIujermyJsqthbfkJbPSGMMBNvG4wwy7kilFPiZptvmUDUC5PH1nuYhnXXae5BWa1f_V18umk_tFKtvDRif4gAj8_GYbmY9GqgSWlH0xemWOo3DMbm-YEW8h06hjpYrv2EgDOJdmVt_1OrU_ztUtpV8tv0JiMzUtAS-404EVYl9vvf0BD3T5Z59UYeynEtUBL4Khs-2cMuOyfKItwWBUxs10CbrGy9auLpPCTGM3lxL4IBPaZf1hVeyhW_vcK9XBuzVK0lVKHWznN9uyapKHHffOWmLAkdQfMWEZeAacl8JYvTHjjjQ; at=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNhNzdlZTgxLTRjNWYtNGU5Ni04ZmRlLWM3YWMyYjVlOTA1NSJ9.eyJleHAiOjE3MjczMjY3MzgsImlhdCI6MTcyNzMyNDkzOCwiaXNzIjoia2V2bGFyIiwianRpIjoiYjY4ZDMxMmQtNTgzNy00NWUwLWI1YjktZWQyMjQzMWI2MDRkIiwidHlwZSI6IkFUIiwiZElkIjoiY2x5bXozaW45MjF1eDFmZHZ3NGJieDlveC1CUjE3MjEwNDcyNTIwMDYiLCJiSWQiOiJFV1U5QUwiLCJrZXZJZCI6IlZJMzg1M0NDMjg5RjU4NDY0RDlBRDZGMEFCNUJENzkyNUEiLCJ0SWQiOiJtYXBpIiwiZWFJZCI6Ink2TGw2WFFScHpOOWI2QXAxeWs0X3dvLVhPS1dVcmJ4ek12VkowV3hTcThTX0Z6bXd0RGdzZz09IiwidnMiOiJMSSIsInoiOiJDSCIsIm0iOnRydWUsImdlbiI6NH0.vQGxw5UxN0YfZj3lK5tWxv9DwhhafCznvLSMJFyC0ns; rt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjhlM2ZhMGE3LTJmZDMtNGNiMi05MWRjLTZlNTMxOGU1YTkxZiJ9.eyJleHAiOjE3NDI5NjMzMzgsImlhdCI6MTcyNzMyNDkzOCwiaXNzIjoia2V2bGFyIiwianRpIjoiZTRkNjZmYmQtN2Y1Yy00YjMwLWEyYTgtZDNkZmRhOTBhNjVlIiwidHlwZSI6IlJUIiwiZElkIjoiY2x5bXozaW45MjF1eDFmZHZ3NGJieDlveC1CUjE3MjEwNDcyNTIwMDYiLCJiSWQiOiJFV1U5QUwiLCJrZXZJZCI6IlZJMzg1M0NDMjg5RjU4NDY0RDlBRDZGMEFCNUJENzkyNUEiLCJ0SWQiOiJtYXBpIiwibSI6eyJ0eXBlIjoibiJ9LCJ2IjoiSDFDRlVGIn0.jcxHePNB3rEBg_WjM3lBKNIa5yjaNn2k_BW1T9NAKP0; vd=VI3853CC289F58464D9AD6F0AB5BD7925A-1723268904929-77.1727324938.1727324938.159283166; Network-Type=4g; s_cc=true; K-ACTION=null; gpv_pn=Product%20Page; gpv_pn_t=FLIPKART%3AProduct%20Page; S=d1t12P2o/Aj8/KmY/VT89XgUrP2x56wnbJon1n6sG1t30x7fP0YdbtPOg0+HuKoHTf+tPTgKWYhH6ufNzewFmfo2O5w==; SN=VI3853CC289F58464D9AD6F0AB5BD7925A.TOK916347C2C65D4441B3B6441D59F2EC4E.1727324990923.LI; s_sq=flipkart-prd%3D%2526pid%253DProduct%252520Page%2526pidt%253D1%2526oid%253Dhttps%25253A%25252F%25252Fwww.flipkart.com%25252Fsellers%25253Fpid%25253D9789359586878%252526otracker%25253Dsearch%252526fetchId%25253D3099dfec-c7b3-4a5c-a786-3%2526ot%253DA; K-ACTION=null; S=d1t12P0kZEwR2Pww/Pz9vP2U/P3RPADAYXdhd+zpHhz2noLxkrVGuGqgaAS7KCPrZgkKU0PnC0N78X/4oYhv0nOPEhw==; SN=VI3853CC289F58464D9AD6F0AB5BD7925A.TOKD0DA9DF734DB4852ACD0DC34BB7207C8.1727325144969.LI; T=clymz3in921ux1fdvw4bbx9ox-BR1721047252006; at=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNhNzdlZTgxLTRjNWYtNGU5Ni04ZmRlLWM3YWMyYjVlOTA1NSJ9.eyJleHAiOjE3MjczMjY3MzgsImlhdCI6MTcyNzMyNDkzOCwiaXNzIjoia2V2bGFyIiwianRpIjoiYjY4ZDMxMmQtNTgzNy00NWUwLWI1YjktZWQyMjQzMWI2MDRkIiwidHlwZSI6IkFUIiwiZElkIjoiY2x5bXozaW45MjF1eDFmZHZ3NGJieDlveC1CUjE3MjEwNDcyNTIwMDYiLCJiSWQiOiJFV1U5QUwiLCJrZXZJZCI6IlZJMzg1M0NDMjg5RjU4NDY0RDlBRDZGMEFCNUJENzkyNUEiLCJ0SWQiOiJtYXBpIiwiZWFJZCI6Ink2TGw2WFFScHpOOWI2QXAxeWs0X3dvLVhPS1dVcmJ4ek12VkowV3hTcThTX0Z6bXd0RGdzZz09IiwidnMiOiJMSSIsInoiOiJDSCIsIm0iOnRydWUsImdlbiI6NH0.vQGxw5UxN0YfZj3lK5tWxv9DwhhafCznvLSMJFyC0ns; rt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjhlM2ZhMGE3LTJmZDMtNGNiMi05MWRjLTZlNTMxOGU1YTkxZiJ9.eyJleHAiOjE3NDI5NjMzMzgsImlhdCI6MTcyNzMyNDkzOCwiaXNzIjoia2V2bGFyIiwianRpIjoiZTRkNjZmYmQtN2Y1Yy00YjMwLWEyYTgtZDNkZmRhOTBhNjVlIiwidHlwZSI6IlJUIiwiZElkIjoiY2x5bXozaW45MjF1eDFmZHZ3NGJieDlveC1CUjE3MjEwNDcyNTIwMDYiLCJiSWQiOiJFV1U5QUwiLCJrZXZJZCI6IlZJMzg1M0NDMjg5RjU4NDY0RDlBRDZGMEFCNUJENzkyNUEiLCJ0SWQiOiJtYXBpIiwibSI6eyJ0eXBlIjoibiJ9LCJ2IjoiSDFDRlVGIn0.jcxHePNB3rEBg_WjM3lBKNIa5yjaNn2k_BW1T9NAKP0; vd=VI3853CC289F58464D9AD6F0AB5BD7925A-1723268904929-77.1727325144.1727324938.159147990',  // Replace with valid cookie
                'Origin': 'https://www.flipkart.com', 
                'Referer': 'https://www.flipkart.com/', 
                'Sec-Fetch-Dest': 'empty', 
                'Sec-Fetch-Mode': 'cors', 
                'Sec-Fetch-Site': 'same-site', 
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36', 
                'X-User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 FKUA/website/42/website/Desktop', 
                'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"', 
                'sec-ch-ua-mobile': '?0', 
                'sec-ch-ua-platform': '"Linux"'
            }
        });
        const $ = cheerio.load(data);

        // Extract data
        const title = $('h1._6EBuvT span.VU-ZEz').text().trim() || '';
        const isbn = new URL(url).searchParams.get('pid') || '';
        const coverImage = $('div._8id3KM img').attr('src')|| '';
        const priceText = $('div.Nx9bqj.CxhGGd').text().trim();
        const price = parseFloat(priceText.replace(/[^0-9.-]+/g, "")) || '';
        const discountText = $('div.UkUFwK.WW8yVX span').text().trim();
        const discountPercentage = parseFloat(discountText.replace(/% off/, "").trim());
        const mrp = Math.round(price / (1 - (discountPercentage / 100)) + 1) || '';
        const rating = $('span.Y1HWO0').text().trim().split(' ')[0] || '';
        const author = $('table._0ZhAN9 tr').filter((i, el) => {
            return $(el).find('td').first().text().trim() === 'Author';
        }).find('td').last().text().trim() || '';
        const binding = $('table._0ZhAN9 tr').filter((i, el) => {
            return $(el).find('td').first().text().trim() === 'Binding';
        }).find('td').last().text().trim()|| '';

        return { title, isbn, coverImage, price, mrp, rating, author, binding, url };
    } catch (error) {
        throw { url, error: error.message };
    }
}

// Function to append data to CSV file
function appendToCSV(filePath, data) {
    const csv = parse([data], { header: false });
    const writeHeader = !fs.existsSync(filePath);
    fs.appendFileSync(filePath, writeHeader ? `${Object.keys(data).join(',')}\n${csv}\n` : `${csv}\n`, 'utf8');
}

// Function to process URLs
async function processUrls(urls) {
    const successFilePath = path.join(__dirname, 'output.csv');
    const errorFilePath = path.join(__dirname, 'error_links.csv');

    for (const url of urls) {
        try {
            const result = await scrapeFlipkart(url);
            appendToCSV(successFilePath, result);
            console.log(`Success: Data for URL saved -> ${url}`);
        } catch (err) {
            appendToCSV(errorFilePath, err);
            console.error(`Error: Failed to process URL -> ${url}`, err.error);
        }
    }
}


const inputString=`
https://www.flipkart.com/hi/adhunik-hindi-vyakaran-aur-rachna/p/itm24a514de24893
https://www.flipkart.com/adhunik-hindi-vyakaran-aur-rachna/p/itmc9a9076a5007a
https://www.flipkart.com/hi/aadhunik-hindi-vyakaran-aur-rachna/p/itm1bf7054a7bdcf
https://www.flipkart.com/hi/aadhunik-hindi-vyakaran-aur-rachna/p/itm4861d0e3fc726
https://www.flipkart.com/aadhunik-hindi-vyakaran-aur-rachna/p/itm19219736e0fa2
https://www.flipkart.com/aadhunik-hindi-vyakaran-aur-rachna-paperback-hindi-dr-vasudevnandan-prasad/p/itmc92a52eb66697
https://www.flipkart.com/basic-science-class-vi-based-cce-methodology-pb/p/itmdyufkft5sjjzb
https://www.flipkart.com/basic-science-class-7-e2/p/itmdyufkhzjbwbaw
https://www.flipkart.com/basic-science-class-8-e1/p/itmdyufkrgugptpn
https://www.flipkart.com/basic-science-class-8/p/itmf7b370684302c
https://www.flipkart.com/basic-science-class-8/p/itmf981ab2e3d552
https://www.flipkart.com/basic-science-class-7/p/itm9a05ceb157bf0
https://www.flipkart.com/basic-science-our-world-then-now-class-8-combo-pack/p/itmff363992e6494
https://www.flipkart.com/basic-scince-social-science-class-6-combo-book/p/itm204284e2463cb
https://www.flipkart.com/class-6th-basic-science-our-world-then-now-combo-pack-2022/p/itm86049271d5bce
https://www.flipkart.com/class-8th-basic-science-r-d-sharma-mathematics-new-editions-2022/p/itmf6dce9d39dc43
https://www.flipkart.com/foundation-science-physics-hc-verma/p/itm93adf464fb7a5
https://www.flipkart.com/foundation-science-physics-class-9-english-paperback-h-c-verma/p/itmeq75gpurvma8w
https://www.flipkart.com/foundation-science-physics-class-10-cbse-h-c-verma-examination-2023-2024-2023/p/itm6ef805024c674
https://www.flipkart.com/foundation-science-physics-class-9/p/itmevdvykxvzpgxt
https://www.flipkart.com/foundation-science-physics-class-10-h-c-verma/p/itm95ecb43976613
https://www.flipkart.com/foundation-science/p/itm431de3cccfda2
https://www.flipkart.com/foundation-science-physics-class-10/p/itme64eae165a474
https://www.flipkart.com/foundation-science-physics-class-10-paperback-h-c-verma/p/itm92fdfe93e889d
https://www.flipkart.com/foundation-science-physics-class-9-h-c-verma-examination-2022-23/p/itmefceb3fb44874
https://www.flipkart.com/foundation-science-physics-class-10/p/itmesd32eszvpggk
https://www.flipkart.com/foundation-science-physics-class-9-hc-verma-latest-2022/p/itm7ac0e8cb89983
https://www.flipkart.com/foundation-science-physics-class-10-pb-english/p/itmd32rakbyjzdqw
https://www.flipkart.com/harish-chandra-verma-foundation-science-physics-class-9-cbse-h-c-examination-2023-2024/p/itm23eed584dea4c
https://www.flipkart.com/foundation-science-physics-class-10th-h-c-varma-english-medium-paperback/p/itm4c39fe2f39f36
https://www.flipkart.com/foundation-science-physics-chemistry-biology-combo-bharti-bhawan/p/itm70f2b60d778ba
https://www.flipkart.com/foundation-science-physics-class-9/p/itm6df116e967d04
https://www.flipkart.com/hindi-reader-0/p/itme1c4364528b01
https://www.flipkart.com/hindi-reader-1/p/itme1bbba7d213c7
https://www.flipkart.com/hindi-reader-2/p/itm227c00b65607c
https://www.flipkart.com/hindi-reader-3/p/itmff8c86f69e7ac
https://www.flipkart.com/hindi-reader-4/p/itm14d475f39dc74
https://www.flipkart.com/hindi-reader-5/p/itmdyufkfqyrm2md
https://www.flipkart.com/junior-maths-2/p/itm3df9c0a852ed2
https://www.flipkart.com/junior-maths-1/p/itm0446259f4621a
https://www.flipkart.com/junior-maths-class-3-old-like-new-book/p/itm48f472e23fd20
https://www.flipkart.com/junior-maths-class-2-old-like-new-book/p/itm01d0c63b20198
https://www.flipkart.com/junior-maths-4/p/itm2a5ea5777ef10
https://www.flipkart.com/junior-maths-4-asit-das-gupta/p/itmfe2bgvuvsrsmk
https://www.flipkart.com/junior-maths-class-1-old-like-new-book/p/itmad30ba3a036c5
https://www.flipkart.com/junior-maths-1/p/itm6ce80a43dc2af
https://www.flipkart.com/junior-maths-class-5/p/itmewcbfse657xk2
https://www.flipkart.com/junior-maths-class-4/p/itmb6828b6535629
https://www.flipkart.com/junior-maths-class-3/p/itm537598692e9ef
https://www.flipkart.com/junior-maths-5/p/itm40a4cd63a8939
https://www.flipkart.com/junior-maths-class-4-old-like-new-book/p/itm49cfca6dd8a8e
https://www.flipkart.com/junior-maths-5/p/itm04ba0e13a94cb
https://www.flipkart.com/junior-maths-2/p/itm071e833422561
https://www.flipkart.com/math-steps-1/p/itmb8387b1fbe840
https://www.flipkart.com/math-steps-step/p/itm059b85d1dda1e
https://www.flipkart.com/bharti-bhawan-math-steps-3-2023-english/p/itm3bfe5dbc6b8a9
https://www.flipkart.com/math-steps-3/p/itm7fec8f9a287c9
https://www.flipkart.com/math-steps-class-4/p/itm39273241f08f6
https://www.flipkart.com/math-steps-5/p/itm9a9305cc6b969
https://www.flipkart.com/math-steps-4/p/itme61a59ae9f884
https://www.flipkart.com/math-steps-class-3-mathematics-boos-iii-junior-book/p/itm76dd5ca7ae22d
https://www.flipkart.com/math-steps-5/p/itmede9c9bf97748
https://www.flipkart.com/math-steps-2/p/itm300235b1e5ca5
https://www.flipkart.com/math-steps-4/p/itmd720999d656e8
https://www.flipkart.com/math-steps-class-2/p/itm1c763c67fd0b8
https://www.flipkart.com/bharti-bhawan-math-steps-4-2023-english/p/itm465c3d0fe6916
https://www.flipkart.com/math-steps-class-2/p/itm00cae3e78cdd2
https://www.flipkart.com/my-grammar-time-class-3-pb/p/itmf79kysy4rfh9b
https://www.flipkart.com/my-grammar-time-class-1/p/itm4b88e9101075e
https://www.flipkart.com/my-grammar-time-book-3/p/itm23be23a3cbbad
https://www.flipkart.com/my-grammar-time-book-5/p/itm2ac6170580824
https://www.flipkart.com/bharati-bhawan-my-grammar-time-class-3/p/itm4e030a1c1ffeb
https://www.flipkart.com/my-grammar-time-class-4-old-book/p/itm56425415d04c5
https://www.flipkart.com/my-grammar-time-class-1/p/itm06d72d85155e2
https://www.flipkart.com/my-grammar-time-class-2/p/itma466d9ff24b9c
https://www.flipkart.com/my-grammar-time-book-4/p/itm6ccade673d977
https://www.flipkart.com/my-grammar-time-class-3/p/itm6b1e56f27bfef
https://www.flipkart.com/sanskrit-bharati-praveshika/p/itm546f46d557b8b
https://www.flipkart.com/sanskrit-bharati-3-e2-02/p/itmdyufkmkxxkkjg
https://www.flipkart.com/sugam-sanskrit-vyakaran-class-7-based-ncert/p/itm8445caf39bd10
https://www.flipkart.com/sanskrit-course-beginners-pt-ii/p/itmd93b4tj5nacau
https://www.flipkart.com/workbook-sanskrit-cbse-class-6/p/itmeqsygmgnppubx
https://www.flipkart.com/secondary-school-mathematics-class-10-cbse-r-s-aggarwal-examination/p/itm6d6a6e8765285
https://www.flipkart.com/secondary-school-mathematics-class-9-cbse-r-s-aggarwal-examination/p/itm3eed5430e4a1b
https://www.flipkart.com/secondary-school-mathematics-class-9/p/itmf2twhzsqsczze
https://www.flipkart.com/secondary-school-mathematics-class-x-2020/p/itmd1dbcd8359c53
https://www.flipkart.com/senior-secondary-school-math-12-english/p/itmdyufkgcvcsuhe
https://www.flipkart.com/senior-secondary-school-mathematics-class-12-r-s-aggarwal-2024-25-examination-paperback/p/itmd74b2a4249b8d
https://www.flipkart.com/magic-carpet-integrated-english-course-book-8/p/itm7a694c9df495f
https://www.flipkart.com/magic-carpet-integrated-english-course-book-2/p/itmac4ef7ebf5671
https://www.flipkart.com/magic-carpet-integrated-english-course-book-5/p/itme0543ae21efcc
https://www.flipkart.com/magic-carpet-class-2-old-like-new-book/p/itm006d227efc483
https://www.flipkart.com/bharati-bhawan-magic-carpet-primer-b/p/itmabc6280cdd5fb
https://www.flipkart.com/magic-carpet-3/p/itme746633b4b74c
https://www.flipkart.com/magic-carpet-b/p/itmcf2daaec77d60
https://www.flipkart.com/magic-carpet-4-integrated-english-coursebook/p/itm997760b73af2c
https://www.flipkart.com/magic-carpet-primer/p/itmbf33d2f726cf4
https://www.flipkart.com/magic-carpet-4/p/itm45eace0c7667d
https://www.flipkart.com/magic-carpet-7-integrated-english-coursebook/p/itmd715a17732112
https://www.flipkart.com/concepts-phyics-v-1-2023/p/itma5238182f0ec1
https://www.flipkart.com/concepts-physics-set-2-volume/p/itmdepgn3pgefp4g
https://www.flipkart.com/concepts-physics-hindi/p/itmf8re5zgypbggd
https://www.flipkart.com/concepts-physics-1/p/itm7359fdfc683d7
https://www.flipkart.com/concept-physics-2/p/itm581a872b2fbee
https://www.flipkart.com/new-concepts-physics-h-c-verma-class-10/p/itm38ee1b97a5fae
https://www.flipkart.com/bhotiki-ki-samajh-concepts-physics-v-1-hindi/p/itmbe9784cf29233
https://www.flipkart.com/concepts-physics-ii-solutions-both-volumes-set-4-books/p/itmffznpz6gzesza
https://www.flipkart.com/concepts-physics-class-11/p/itm76ade1c3e8ce3
https://www.flipkart.com/concepts-physics-1-2-h-c-verma-combo/p/itm7fb0ff06a5b43
https://www.flipkart.com/hi/bhoutiki-ki-samajh/p/itma63a0b0e1c17d
https://www.flipkart.com/hi/bhautiki-ki-samajh-2018-hc-verma/p/itmf7xtrxb4tgtbz
https://www.flipkart.com/bhoutiki-ki-samajh-1/p/itma587e816f9064
https://www.flipkart.com/cocept-physics-part-2-h-c-verma/p/itmbb5a05c34a589
https://www.flipkart.com/cocept-physics-part-2-h-c-verma-hardcopy-paperbook-verma/p/itm53b8269bc1e69
https://www.flipkart.com/reactions-rearrangements-reagents/p/itm4ddfbfa546247
https://www.flipkart.com/reactions-rearrangements-and-reagents/p/itmdyufkdxyt8xmy
https://www.flipkart.com/reaction-rearrangements-reagents/p/itmb7a1238b32203
https://www.flipkart.com/reactions-rearrangements-reagents-old-book/p/itmedc4c08bce22a
https://www.flipkart.com/reactions-rearrangements-reagents/p/itmb2a2ebf9f72e7
https://www.flipkart.com/chemistry-mcq-multiple-choice-question-bank/p/itmfca1d7b2fcf60
https://www.flipkart.com/chemistry-mcq-iit-engineering-iiit-entrance-tests-multiple-choice-question-bank-v-ahluwalla-k-ghosh/p/itm87ad3c7881542
https://www.flipkart.com/hi/chemistry-mcq-multiple-choice-question-bank/p/itmfca1d7b2fcf60
https://www.flipkart.com/problems-plus-iit-mathematics-m-c-q-jee/p/itm2dcbcb11d4ffe
https://www.flipkart.com/mathematics-mcq-iit-engineering-iiit-entrance-tests/p/itm974f6cfd5e456
https://www.flipkart.com/mathematics-mcq-iit-engineering-iiit-entrance-tests/p/itm55478120f0fd1
https://www.flipkart.com/mathematics-mcq-multiple-choice-question-bank-latest-pattern/p/itmez3vc6zdfxuss
https://www.flipkart.com/physics-mcq-multiple-choice-question-bank-mukherji-deb-author-english-bharati-bhawan-publishers-distributors-paperback-english/p/itmdyufkmqzscbq4
https://www.flipkart.com/problems-plus-iit-mathematics/p/itm2354ad78b8294
https://www.flipkart.com/problems-plus-iit-mathematics/p/itmd82992074a2aa
https://www.flipkart.com/problems-plus-iit-mathematics/p/itmffrg7chjp33cj
https://www.flipkart.com/problems-plus-iit-mathematics-das-gupta/p/itm9d9694b5f0601
https://www.flipkart.com/problems-plus-iit-mathematics/p/itm74e5987ca67e8
https://www.flipkart.com/problems-plus-iit-mathematics/p/itmdc4320df605af
https://www.flipkart.com/problems-plus-iit-mathematics/p/itm5b0c228adb058
https://www.flipkart.com/high-school-bhoutiki-2-hindi-class-10th-pb/p/itmf79kygshhxb5f
https://www.flipkart.com/high-school-bhoutiki-1-hindi-class-9th-pb/p/itmf79kykwngaufb
https://www.flipkart.com/high-school-rasayanshastra-1-hindi-class-9th-pb/p/itmf79kyjfv2hbtw
https://www.flipkart.com/high-school-rasayanshastra-2-hindi-class-10th-pb/p/itmf79kxutap69kk

`;

// Split the input string to create an array of product IDs
const urls = inputString.split('\n').map(id => id.trim()).filter(id => id);



// Start processing
processUrls(urls);



















// const axios = require('axios');
// const cheerio = require('cheerio');

// // Function to scrape the Flipkart page
// async function scrapeFlipkart(url) {
//     try {
//         // Fetch the HTML content with a User-Agent header
//         const { data } = await axios.get(url, {
//             headers: {
        //         'Accept': '*/*', 
        // 'Accept-Language': 'en-US,en;q=0.9', 
        // 'Connection': 'keep-alive', 
        // 'Content-Type': 'application/json', 
        // 'Cookie': 'T=clymz3in921ux1fdvw4bbx9ox-BR1721047252006; dpr=1; _pxvid=791fd957-42a7-11ef-b7a5-b5e7dcaded86; ULSN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjb29raWUiLCJhdWQiOiJmbGlwa2FydCIsImlzcyI6ImF1dGguZmxpcGthcnQuY29tIiwiY2xhaW1zIjp7ImdlbiI6IjEiLCJ1bmlxdWVJZCI6IlVVSTI0MDgxNjEwMDAxMDg2OUQ2NEI0UDgiLCJma0RldiI6bnVsbH0sImV4cCI6MTczOTU2MjYxMCwiaWF0IjoxNzIzNzgyNjEwLCJqdGkiOiJjMmYwOWFhMS02ZGNjLTRmNjYtOGE2Mi0wMGNmYmRiY2RkZDEifQ.NeZFta2yB40t4UGBZr1oQwo44Cmxw8RL2gTeiOhLugc; vh=599; vw=1280; AMCV_17EB401053DAF4840A490D4C%40AdobeOrg=-227196251%7CMCIDTS%7C19992%7CMCMID%7C71466899700205071999064934404008633607%7CMCAAMLH-1727413121%7C12%7CMCAAMB-1727875083%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1727277483s%7CNONE%7CMCAID%7C334A7689455222A5-60001C5D829B9581; ud=3.SP0ce73iy-9UIHfyFoQdCcO3EU7CI6_czdf7l1XSkSEkJvnmevlgKpymjmYnBlM-SMaYZ9QfBiht1npx3rTMIIeAzJlboWUz0mRPIujermyJsqthbfkJbPSGMMBNvG4wwy7kilFPiZptvmUDUC5PH1nuYhnXXae5BWa1f_V18umk_tFKtvDRif4gAj8_GYbmY9GqgSWlH0xemWOo3DMbm-YEW8h06hjpYrv2EgDOJdmVt_1OrU_ztUtpV8tv0JiMzUtAS-404EVYl9vvf0BD3T5Z59UYeynEtUBL4Khs-2cMuOyfKItwWBUxs10CbrGy9auLpPCTGM3lxL4IBPaZf1hVeyhW_vcK9XBuzVK0lVKHWznN9uyapKHHffOWmLAkdQfMWEZeAacl8JYvTHjjjQ; at=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNhNzdlZTgxLTRjNWYtNGU5Ni04ZmRlLWM3YWMyYjVlOTA1NSJ9.eyJleHAiOjE3MjczMjY3MzgsImlhdCI6MTcyNzMyNDkzOCwiaXNzIjoia2V2bGFyIiwianRpIjoiYjY4ZDMxMmQtNTgzNy00NWUwLWI1YjktZWQyMjQzMWI2MDRkIiwidHlwZSI6IkFUIiwiZElkIjoiY2x5bXozaW45MjF1eDFmZHZ3NGJieDlveC1CUjE3MjEwNDcyNTIwMDYiLCJiSWQiOiJFV1U5QUwiLCJrZXZJZCI6IlZJMzg1M0NDMjg5RjU4NDY0RDlBRDZGMEFCNUJENzkyNUEiLCJ0SWQiOiJtYXBpIiwiZWFJZCI6Ink2TGw2WFFScHpOOWI2QXAxeWs0X3dvLVhPS1dVcmJ4ek12VkowV3hTcThTX0Z6bXd0RGdzZz09IiwidnMiOiJMSSIsInoiOiJDSCIsIm0iOnRydWUsImdlbiI6NH0.vQGxw5UxN0YfZj3lK5tWxv9DwhhafCznvLSMJFyC0ns; rt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjhlM2ZhMGE3LTJmZDMtNGNiMi05MWRjLTZlNTMxOGU1YTkxZiJ9.eyJleHAiOjE3NDI5NjMzMzgsImlhdCI6MTcyNzMyNDkzOCwiaXNzIjoia2V2bGFyIiwianRpIjoiZTRkNjZmYmQtN2Y1Yy00YjMwLWEyYTgtZDNkZmRhOTBhNjVlIiwidHlwZSI6IlJUIiwiZElkIjoiY2x5bXozaW45MjF1eDFmZHZ3NGJieDlveC1CUjE3MjEwNDcyNTIwMDYiLCJiSWQiOiJFV1U5QUwiLCJrZXZJZCI6IlZJMzg1M0NDMjg5RjU4NDY0RDlBRDZGMEFCNUJENzkyNUEiLCJ0SWQiOiJtYXBpIiwibSI6eyJ0eXBlIjoibiJ9LCJ2IjoiSDFDRlVGIn0.jcxHePNB3rEBg_WjM3lBKNIa5yjaNn2k_BW1T9NAKP0; vd=VI3853CC289F58464D9AD6F0AB5BD7925A-1723268904929-77.1727324938.1727324938.159283166; Network-Type=4g; s_cc=true; K-ACTION=null; gpv_pn=Product%20Page; gpv_pn_t=FLIPKART%3AProduct%20Page; S=d1t12P2o/Aj8/KmY/VT89XgUrP2x56wnbJon1n6sG1t30x7fP0YdbtPOg0+HuKoHTf+tPTgKWYhH6ufNzewFmfo2O5w==; SN=VI3853CC289F58464D9AD6F0AB5BD7925A.TOK916347C2C65D4441B3B6441D59F2EC4E.1727324990923.LI; s_sq=flipkart-prd%3D%2526pid%253DProduct%252520Page%2526pidt%253D1%2526oid%253Dhttps%25253A%25252F%25252Fwww.flipkart.com%25252Fsellers%25253Fpid%25253D9789359586878%252526otracker%25253Dsearch%252526fetchId%25253D3099dfec-c7b3-4a5c-a786-3%2526ot%253DA; K-ACTION=null; S=d1t12P0kZEwR2Pww/Pz9vP2U/P3RPADAYXdhd+zpHhz2noLxkrVGuGqgaAS7KCPrZgkKU0PnC0N78X/4oYhv0nOPEhw==; SN=VI3853CC289F58464D9AD6F0AB5BD7925A.TOKD0DA9DF734DB4852ACD0DC34BB7207C8.1727325144969.LI; T=clymz3in921ux1fdvw4bbx9ox-BR1721047252006; at=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNhNzdlZTgxLTRjNWYtNGU5Ni04ZmRlLWM3YWMyYjVlOTA1NSJ9.eyJleHAiOjE3MjczMjY3MzgsImlhdCI6MTcyNzMyNDkzOCwiaXNzIjoia2V2bGFyIiwianRpIjoiYjY4ZDMxMmQtNTgzNy00NWUwLWI1YjktZWQyMjQzMWI2MDRkIiwidHlwZSI6IkFUIiwiZElkIjoiY2x5bXozaW45MjF1eDFmZHZ3NGJieDlveC1CUjE3MjEwNDcyNTIwMDYiLCJiSWQiOiJFV1U5QUwiLCJrZXZJZCI6IlZJMzg1M0NDMjg5RjU4NDY0RDlBRDZGMEFCNUJENzkyNUEiLCJ0SWQiOiJtYXBpIiwiZWFJZCI6Ink2TGw2WFFScHpOOWI2QXAxeWs0X3dvLVhPS1dVcmJ4ek12VkowV3hTcThTX0Z6bXd0RGdzZz09IiwidnMiOiJMSSIsInoiOiJDSCIsIm0iOnRydWUsImdlbiI6NH0.vQGxw5UxN0YfZj3lK5tWxv9DwhhafCznvLSMJFyC0ns; rt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjhlM2ZhMGE3LTJmZDMtNGNiMi05MWRjLTZlNTMxOGU1YTkxZiJ9.eyJleHAiOjE3NDI5NjMzMzgsImlhdCI6MTcyNzMyNDkzOCwiaXNzIjoia2V2bGFyIiwianRpIjoiZTRkNjZmYmQtN2Y1Yy00YjMwLWEyYTgtZDNkZmRhOTBhNjVlIiwidHlwZSI6IlJUIiwiZElkIjoiY2x5bXozaW45MjF1eDFmZHZ3NGJieDlveC1CUjE3MjEwNDcyNTIwMDYiLCJiSWQiOiJFV1U5QUwiLCJrZXZJZCI6IlZJMzg1M0NDMjg5RjU4NDY0RDlBRDZGMEFCNUJENzkyNUEiLCJ0SWQiOiJtYXBpIiwibSI6eyJ0eXBlIjoibiJ9LCJ2IjoiSDFDRlVGIn0.jcxHePNB3rEBg_WjM3lBKNIa5yjaNn2k_BW1T9NAKP0; vd=VI3853CC289F58464D9AD6F0AB5BD7925A-1723268904929-77.1727325144.1727324938.159147990',  // Replace with valid cookie
        // 'Origin': 'https://www.flipkart.com', 
        // 'Referer': 'https://www.flipkart.com/', 
        // 'Sec-Fetch-Dest': 'empty', 
        // 'Sec-Fetch-Mode': 'cors', 
        // 'Sec-Fetch-Site': 'same-site', 
        // 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36', 
        // 'X-User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 FKUA/website/42/website/Desktop', 
        // 'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"', 
        // 'sec-ch-ua-mobile': '?0', 
        // 'sec-ch-ua-platform': '"Linux"'
//             }
//         });
//         const $ = cheerio.load(data);

//         // Extracting the required information
//         const title = $('h1._6EBuvT span.VU-ZEz').text().trim();
//         const isbn = new URL(url).searchParams.get('pid'); // Extracting PID from the URL
//         const coverImage = $('div._8id3KM img').attr('src'); 
//         //const price = $('div.Nx9bqj.CxhGGd').text().trim();
//         // const mrp = $('div.UOCQB1.yRaY8j.A6+E6v').first().text().trim();
//         const priceText = $('div.Nx9bqj.CxhGGd').text().trim();
//         const price = parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
//         const discountText = $('div.UkUFwK.WW8yVX span').text().trim();
//         const discountPercentage = parseFloat(discountText.replace(/% off/, "").trim()); // Extract discount percentage

//         // Log the extracted discount percentage
//         console.log(`Extracted Discount Percentage: ${discountPercentage}%`);

//         // Calculate MRP
//         const mrp = Math.round(price / (1 - (discountPercentage / 100))+1); // Calculate and round MRP
//         const rating = $('span.Y1HWO0').text().trim().split(' ')[0]; // Extracting only the rating value
//         const discount = $('div.UkUFwK.WW8yVX span').text().trim();
//         const source = url;

//         // Extracting author and binding from the table
//         const author = $('table._0ZhAN9 tr').filter((i, el) => {
//             return $(el).find('td').first().text().trim() === 'Author';
//         }).find('td').last().text().trim();

//         const binding = $('table._0ZhAN9 tr').filter((i, el) => {
//             return $(el).find('td').first().text().trim() === 'Binding';
//         }).find('td').last().text().trim();

//         // Print the extracted information
//         console.log(`Title: ${title}`);
//         console.log(`ISBN (PID): ${isbn}`);
//         console.log(`Cover Image: ${coverImage}`);
//         console.log(`Price: ${price}`);
//         console.log(`MRP: ${mrp}`);
//         console.log(`Discount: ${discount}`);
//         console.log(`Rating: ${rating}`);
//         console.log(`Source: ${source}`);
//         console.log(`Author: ${author}`);
//         console.log(`Binding: ${binding}`);
//     } catch (error) {
//         console.error('Error fetching the page:', error);
//     }
// }

// // URL to scrape
// const url = 'https://www.flipkart.com/aadhunik-hindi-vyakaran-aur-rachna-paperback-hindi-dr-vasudevnandan-prasad/p/itmc92a52eb66697?pid=RBKGGP3H3HYPKZAJ';

// // Call the scrape function
// scrapeFlipkart(url);