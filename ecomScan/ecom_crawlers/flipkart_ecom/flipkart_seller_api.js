const axios = require('axios');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const inputString = `
https://www.flipkart.com/blackbook-english-vocabulary/p/itmd55c729c8ca1b?pid=9788195645787
https://www.flipkart.com/blackbook-english-vocabulary-topper-s-choice-ssc-railways-defence-other-competitive-exams-blackbook-vocabulary-2-disc/p/itmb09196e2a0b20?pid=9788195645718
https://www.flipkart.com/blackbook-english-vocabulary/p/itm8f38a0acac830?pid=9788194476443
https://www.flipkart.com/blackbook-english-vocabulary-january-2022-nikhil-gupta/p/itm6f74839a7f21e?pid=RBKGAU4Y3GUHVJM5
https://www.flipkart.com/blackbook-english-vocabulary-ssc-vocabulary-new-hardcopy-nov-2019-general-knowledge-2020/p/itm791e08228bd31?pid=RBKFN8HPZKDERYZA
https://www.flipkart.com/blackbook-english-vocabulary/p/itmbfc3da6117857?pid=RBKH3HHQHWHNFZZ8
https://www.flipkart.com/blackbook-english-vocabulary/p/itm6af0d3196ce3a?pid=9789358703344
https://www.flipkart.com/blackbook-english-vocabulary/p/itmecd55ad704452?pid=RBKGWF8ZYZFFK4AH
https://www.flipkart.com/blackbook-english-vocabulary/p/itmfff3754da32af?pid=9788194476429
https://www.flipkart.com/kiran-ssc-maths-english-language-reasoning-black-book-general-awareness-nikhil-gupta-word-power-made-easy-complete-handbook-superior-vocabulary-all-bok-medium/p/itm0e506f0b79ecd?pid=RBKGBHM6FR9JEBV3
https://www.flipkart.com/blackbook-english-vocabulary-march-2023-nikhil-gupta/p/itm1a8b6546da8e1?pid=RBKGS5FW4HFV6GDH
https://www.flipkart.com/blackbook-english-vocabulary/p/itm72255c0ec279e?pid=RBKH2F6DF4YAJEW2
https://www.flipkart.com/blackbook-english-vocabulary/p/itmeffddd4c864f5?pid=9789386675750
https://www.flipkart.com/blackbook-english-vocabulary/p/itm6af0d3196ce3a?pid=9781570937378
https://www.flipkart.com/blackbook-english-vocabulary-may-2024-edition-nikhil-gupta/p/itm67e375ec1d35e?pid=9786644110084
https://www.flipkart.com/blackbook-english-vocabulary-may-2024-nikhil-gupta/p/itme6a36f921ff1b?pid=9787559672346
https://www.flipkart.com/blackbook-english-vocabulary-2024-history-modern-india-combo-2/p/itma66746544e9b4?pid=9788466373005
https://www.flipkart.com/blackbook-english-vocabulary-2024-history-medieval-india-combo-2/p/itmcbde26ed64dd4?pid=9783864155062
https://www.flipkart.com/blackbook-english-vocabulary-march-2023-topper-s-choice-ssc-railways-defence-other-competitive-exams-blackbook-vocabulary/p/itm6056926210661?pid=RBKGRVRYHP4VGJXE
https://www.flipkart.com/blackbook-english-vocabulary-may-2024-edition-nikhil-gupta/p/itm67e375ec1d35e?pid=9783336655281
https://www.flipkart.com/blackbook-english-vocabulary-ssc-vocabulary/p/itm2ec20c463abfb?pid=9788194476405
https://www.flipkart.com/blackbook-english-vocabulary-march-2023/p/itm258fe8c13461c?pid=RBKGRXYDZZVZJ5WR
https://www.flipkart.com/ssc-railways-defence-other-competitive-exams-blackbook-english-vocabulary/p/itm8c9a63007d27d?pid=RBKGRW5SHUFMDSFZ
https://www.flipkart.com/blackbook-english-vocabulary-nikhil-gupta-march-2023/p/itmdef556e54d457?pid=RBKGSSV3HXVCH5PP
https://www.flipkart.com/blackbook-english-vocabulary-nikhil-sharma/p/itm803c9a08527b3?pid=RBKGPNHHDFZZTUBC
https://www.flipkart.com/blackbook-english-vocabulary-paperback-nikhil-gupta-2023/p/itm695e7d9309dcd?pid=RBKGPA2AWHC28YUH
https://www.flipkart.com/blackbook-english-vocabulary-2022/p/itmba7696134e670?pid=RBKGJ6FGU9HHRBQJ
https://www.flipkart.com/blackbook-english-vocabulary-2023-nikhil-gupta/p/itmd88399a23cec3?pid=RBKGVJHZGXV4EVZP
https://www.flipkart.com/blackbook-english-vocabulary-march-2023-15000-words-english-hindi-nikhil-gupta/p/itm18b935c918549?pid=RBKGVTGYHBV9K5ZR
https://www.flipkart.com/blackbook-english-vocabulary-january-2022-nikhil-gupta/p/itmb50fefb29051c?pid=RBKGE7KXBZB7MWHR
https://www.flipkart.com/blackbook-english-vocabulary-nikhil-gupta-march-2023/p/itm00a93287039d5?pid=RBKGZWZFETHH9H9C
https://www.flipkart.com/black-book-english-vocabulary-topper-s-choice-ssc-railways-defence-other-competitive-exams-english-pepearbeck/p/itm0daa71eab3686?pid=RBKGUJUNZVBV2CPE
https://www.flipkart.com/black-book-english-vocabulary-nikhil-gupta-vocab/p/itmf1f933ea54f96?pid=RBKGQ5Y4DY5PSJRH
https://www.flipkart.com/black-book-english-vocabulary-june-2024/p/itm2edca18a1700a?pid=9781671579170
https://www.flipkart.com/black-book-english-vocabulary-march-2023-nikhil-gupta-pepearbeck-gupta/p/itm1119135f86122?pid=RBKGS8FAYEHCU3AD
https://www.flipkart.com/black-book-english-vocabulary-15000-words-2023-nikhil-gupta-edutech/p/itmf2c04cbebb0cb?pid=RBKGNAP5TVFU6KCR
https://www.flipkart.com/latest-2024-lucent-general-knowledge-black-book-english-vocabulary-100-original/p/itmb391d081c5199?pid=RBKH58RHUWHKYFFY
https://www.flipkart.com/black-book-english-vocabulary-march-2023/p/itmbfccdf5c82e26?pid=RBKGRMG9CUD9ZZP4
https://www.flipkart.com/black-book-english-vocabulary-march-2023/p/itm5108eb8975894?pid=9789389800814
https://www.flipkart.com/latest-2024-lucent-general-knowledge-black-book-english-vocabulary/p/itmc306a2052b449?pid=9789383020447
https://www.flipkart.com/black-book-english-vocabulary-march-2023-arihant-everyday/p/itm8e06d5e83e74c?pid=RBKGRWHZSB9K3EEQ
https://www.flipkart.com/black-book-english-vocabulary/p/itm9d0efbf9f6527?pid=RBKGPKE9TGG5EXVJ
https://www.flipkart.com/black-book-english-vocabulary-june-2024/p/itm99c84a6a050bd?pid=RBKH5FGDAZQE2JTE
https://www.flipkart.com/black-book-english-vocabulary-2024-paperback-gupta-nikhil-word-power-made-easy/p/itm7190db6911d4f?pid=RBKH3Q8GXG7BBRQA
https://www.flipkart.com/black-book-vocabulary-nikhil-gupta/p/itm981712716d289?pid=9789353796594
https://www.flipkart.com/vocabulary-book/p/itm617739494d3bf?pid=9780394483887
https://www.flipkart.com/black-book-english-vacablulary/p/itm3ce8164b24cdf?pid=RBKGHBD2WDJZQZPD
https://www.flipkart.com/black-book-vocabulary-nikhil-gupta/p/itm981712716d289?pid=9789353796570
https://www.flipkart.com/black-book-english-vocabulary-english-hindi/p/itm22fd53663d61b?pid=RBKGKY9QXKPVDNMV
https://www.flipkart.com/nikhil-gupta-black-book-vocabulary-like-new/p/itm6a4cba722e3e8?pid=9789389779639
https://www.flipkart.com/piyush-varansay-reasoning-black-book-vocabulary/p/itma563bf4dc801a?pid=RBKH7AFHZBQZFYBU
https://www.flipkart.com/blackbook-english-vocabulary-may-2024-edition-nikhil-gupta/p/itm0179821396129?pid=RBKH9HY6TMBGYUKX
https://www.flipkart.com/combo-pack-black-book-english-vocabulary-updated-till-february-2021-11-000-words-english-hindi-arihant-everyday/p/itm4c387f81d1d54?pid=RBKGH36HQYG6U9T9
https://www.flipkart.com/black-book-english-vocabulary/p/itm9d0efbf9f6527?pid=RBKH8UTR994GUSG8
https://www.flipkart.com/blackbook-samanya-jagrukta-general-awareness-30000-magazines/p/itm1c5bfee675c4f?pid=MAZHF6TABJGKAAFE
https://www.flipkart.com/blackbook-general-awareness-march-2024-nikhil-gupta/p/itm130ef5cbf4c2f?pid=RBKGZ24KM7JHN993
https://www.flipkart.com/blackbook-samanya-jagrukta-general-awareness/p/itm5dfa3f5b7f24c?pid=RBKGDF6CMDUNXZVG
https://www.flipkart.com/blackbook-general-awareness-march-2024-edition/p/itm18982b7f3a3ba?pid=9786107229308
https://www.flipkart.com/blackbook-general-awareness-february-2020/p/itm807b05faac6bb?pid=9788194476412
https://www.flipkart.com/blackbook-general-awareness-january-2023-nikhil-gupta/p/itmbeeef077b515d?pid=9788195645701
https://www.flipkart.com/blackbook-samanya-jagrukta-general-awareness-hindi-march-2022/p/itmf3a67531c23dc?pid=RBKGJ6FSVHTATUXB
https://www.flipkart.com/blackbook-general-awareness-october-2021/p/itm7f7a1c6c6f287?pid=9788194476467
https://www.flipkart.com/blackbook-samanya-jagrukta-general-awareness-hindi-march-2023-nikhil-gupta/p/itm244b5fae33d32?pid=RBKGPZNZD5HEHVUT
https://www.flipkart.com/blackbook-general-awareness-april-2021-nikhil-gupta-paperback-gupta/p/itme3be276381189?pid=RBKG323YA5XDDRTN
https://www.flipkart.com/blackbook-general-awareness-updated-till-february-2020/p/itm086d4841cfd77?pid=RBKFPDVQYZKF6H7A
https://www.flipkart.com/blackbook-general-awareness-january-2023-nikhil-gupta/p/itmbeeef077b515d?pid=9785808521452
https://www.flipkart.com/blackbook-samanya-jagrukta-general-awareness-hindi-march-2022-nikhil-gupta/p/itm2a285f9299acd?pid=RBKGDFYJE6M4GYWJ
https://www.flipkart.com/blackbook-general-awareness/p/itmf9806f33d1686?pid=RBKH7DCEVXPKXGAS
https://www.flipkart.com/blackbook-general-awareness-30000-one-liner-english-medium-march-2024-edition/p/itmcb59b2df1aa11?pid=RBKH92BC2ZGGF7AW
https://www.flipkart.com/black-book-general-awareness-2024/p/itmed346bbafbc9a?pid=9788751246908
https://www.flipkart.com/black-book-general-awareness-target-knowledge-newspaper-useful-all-competition-exams/p/itm0b617f9444e89?pid=RBKGP3QCDGEXZRHC
https://www.flipkart.com/blackbook-general-awareness/p/itm502c2068c89b0?pid=9788194476450
https://www.flipkart.com/blackbook-samanya-jagrukta-general-awareness/p/itm5dfa3f5b7f24c?pid=RBKGPA2AMVDYV5M3
https://www.flipkart.com/blackbook-general-awareness-january-2023-paperback-nikhil-gupta/p/itm4eb0fe728a63d?pid=RBKGHZ95VAUWMFSX
https://www.flipkart.com/blackbook-general-awareness-25000-one-liners-english-medium-nikhil-gupta/p/itm9e6fabafd114e?pid=RBKGZZVZ44Z4UBZ7
https://www.flipkart.com/blackbook-general-awareness-january-2023-including-latest-400-set-recent-ssc-exam-nikhil-gupta/p/itm0a75a74415232?pid=RBKGHAT7B6W5XHMP
https://www.flipkart.com/blackbook-general-awareness/p/itmf9806f33d1686?pid=RBKFYFSA2GFXCWAT
https://www.flipkart.com/blackbook-general-awareness-updated-till-february-2020-paperback-nikhil-gupta/p/itm79b1ea55d9f7c?pid=RBKGG7DAP8UBZWHD
https://www.flipkart.com/blackbook-general-awareness-april-2021/p/itme223c4671dcdf?pid=RBKG9Y2WXPB7J9TT
https://www.flipkart.com/blackbook-samanya-jagrukta-general-awareness-hindi-march-2023-nikhil-gupta/p/itm54ddd469c1a76?pid=RBKGSEHTM64VSJZH
https://www.flipkart.com/blackbook-general-awareness-updated/p/itm8e877931f0664?pid=RBKGA3C6MGYAVMTQ
https://www.flipkart.com/blackbook-samanya-jagrukta-general-awareness-hindi-march-2023-nikhil-gupta/p/itm54ddd469c1a76?pid=RBKGSA2BZRAYYRTE
https://www.flipkart.com/blackbook-general-awareness-april-2021-nikhil-gupta/p/itm755a40e65b0f8?pid=RBKGBFSQWZGXQ2HS
https://www.flipkart.com/latest-blackbook-samanya-jagrukta-general-awareness-hindi-march-2023-nikhil-gupta-paperback-hindi-gupta/p/itmdad16449236c4?pid=RBKGTUCZ3YBWSVC2
https://www.flipkart.com/blackbook-general-awareness-may-2024-edition-nikhil-gupta-paperback-gupta/p/itmfeed5e1b5e5ab?pid=RBKH2FX99WBTW7MQ
https://www.flipkart.com/black-book-general-awareness-2024/p/itmed346bbafbc9a?pid=9786688441120
https://www.flipkart.com/blackbook-samanya-jagrukta-general-awareness-hindi-march-2023-nikhil-gupta/p/itm244b5fae33d32?pid=RBKGQBXMK9BHAMZQ
https://www.flipkart.com/blackbook-general-awareness-march-2023-topper-s-choice-ssc-railways-defence-other-competitive-exams/p/itm812636fb1d135?pid=RBKGQYHV84RFTDCK
https://www.flipkart.com/nikhil-gupta-blackbook-samanya-jagrukta-march-2024/p/itmf6fa14403ec30?pid=9785852241238
https://www.flipkart.com/gupta-black-book-samanya-jagrugta/p/itme923632275028?pid=RBKGJTADGGGZTHEA

`;



// Split the input string to create an array of product IDs
const urls = inputString.split('\n').map(id => id.trim()).filter(id => id);

// List of URLs
// let urls = [
//   "https://www.flipkart.com/blackbook-general-awareness-march-2024-nikhil-gupta/p/itm130ef5cbf4c2f?pid=RBKGZ24KM7JHN993",
//   "https://www.flipkart.com/some-other-product/p/itm1234567890?pid=ABC123"
// ];

// CSV Writers
const csvWriter = createCsvWriter({
  path: 'sellersData.csv',
  header: [
    { id: 'url', title: 'URL' },
    { id: 'pid', title: 'Product ID' },
    { id: 'listingId', title: 'Listing ID' },
    { id: 'sellerName', title: 'Seller Name' },
    { id: 'sellerId', title: 'Seller ID' },
    { id: 'sellerRating', title: 'Seller Rating' },
    { id: 'price', title: 'Price' },
    { id: 'mrp', title: 'MRP' },
    { id: 'sellerListingUrl', title: 'Seller Listing URL' }
  ],
  append: false // Append mode to add to the file
});

const errorCsvWriter = createCsvWriter({
  path: 'error_urls.csv',
  header: [
    { id: 'url', title: 'URL' },
    { id: 'error', title: 'Error Message' }
  ],
  append: true // Append mode to add to the file
});

// Function to extract the pid from the URL
function extractPidFromUrl(inputUrl) {
  const parsedUrl = new URL(inputUrl);
  const pid = parsedUrl.searchParams.get('pid');
  return pid;
}

// Function to fetch data for a single pid
async function fetchFlipkartData(pid, inputUrl) {
  let data = JSON.stringify({
    "requestContext": {
      "productId": pid
    },
    "locationContext": {
      "pincode": 302001
    }
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://1.rome.api.flipkart.com/api/3/page/dynamic/product-sellers',
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
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    const responseData = response.data;
    //console.log(responseData);

    const sellers = responseData.RESPONSE?.data?.product_seller_detail_1?.data || [];

    if (sellers.length === 0) {
      console.log(`No sellers found for PID: ${pid}`);
      return;
    }

    const sellersData = [];

    sellers.forEach(seller => {
      const sellerInfo = seller.value?.sellerInfo?.value || {};
      const pricing = seller.value?.pricing?.value || {};  
      const tracking = seller.tracking?.sProduct;

      let extractedPid = null;
      if (tracking) {
        const trackingData = tracking.split('|');
        extractedPid = trackingData[0]?.split(';')[1] || null;
      }

      let price = null, mrp = null;
      if (pricing.prices && Array.isArray(pricing.prices)) {
        pricing.prices.forEach(priceObj => {
          if (priceObj.name === 'Maximum Retail Price') {
            mrp = priceObj.value;
          }
        });
      }

      // Extract final price
      if (pricing.finalPrice && pricing.finalPrice.value) {
        price = pricing.finalPrice.value;
      }
      console.log(price);



      const listingId = seller.value?.listingId || "Unknown Listing ID";
      const sellerName = sellerInfo.name || "Unknown Seller";
      const sellerId = sellerInfo.id || seller.action?.params?.sellerId || "Unknown Seller ID";
      const sellerRating = sellerInfo.rating?.average || "No Rating";

      const trimmedUrl = inputUrl.split('&')[0];
      console.log("trimmedurl:",trimmedUrl);
      const sellerListingUrl = `${trimmedUrl}&lid=${listingId}`;
      console.log("sellerlistingurl",sellerListingUrl)
     // const sellerListingUrl = inputUrl + '&lid=' + listingId;

      const sellerDetails = {
        url: inputUrl,
        pid: extractedPid || pid,
        listingId,
        sellerName,
        sellerId,
        sellerRating,
        price,
        mrp,
        sellerListingUrl
      };

      sellersData.push(sellerDetails);
    });

    // Write data to the CSV file
    await csvWriter.writeRecords(sellersData);
    console.log(`Data successfully saved for PID: ${pid}`);
  } catch (error) {
    console.error(`Error fetching data for PID: ${pid}`, error.message);

    // Write the error to the error CSV file
    await errorCsvWriter.writeRecords([{ url: inputUrl, error: error.message }]);
  }
}

// Iterate over each URL, extract the pid, and fetch data
async function runForAllUrls() {
  for (const inputUrl of urls) {
    const pid = extractPidFromUrl(inputUrl);
    if (pid) {
      console.log(`Fetching data for PID: ${pid} from URL: ${inputUrl}`);
      await fetchFlipkartData(pid, inputUrl); // Pass the URL to the fetch function
    } else {
      console.log(`Could not extract PID from URL: ${inputUrl}`);
      await errorCsvWriter.writeRecords([{ url: inputUrl, error: 'PID not found' }]);
    }
  }
}

// Run the script
runForAllUrls();


