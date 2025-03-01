const axios = require('axios');
const cheerio = require('cheerio');



let proxies = {
  "http": "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000",
  "https": "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000",
     };

const urls = [
  'https://www.flipkart.com/advanced-bank-management-old-book/p/itmb94a9ed6b6656?pid=RBKGP7ZYZWGUWTDD',
  'https://www.flipkart.com/jaiib-principles-practices-banking-2ndreprint/p/itmc750d4bf84a07?pid=9780230636118',
  'https://www.flipkart.com/caiib-examination-retail-banking-advanced-bank-managemnt-financial-management/p/itmaa3d7fa4bdee4?pid=RBKG9R5VPHYM5UMG',
  'https://www.flipkart.com/jaiib-combo-principles-practices-banking-accounting-financial-management-bankers-retail-indian-economy-system-set-4-books/p/itm15bf90f9ffde7?pid=RBKGHYYWMJYHZF7Q'
];



async function checkPageStatus(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Cookie': 'K-ACTION=null; SN=VI4777F746E3914011B4C1E4AD541AB032.TOK99D3621E596F4FF0A91429F8637C52BC.1715342717.LO; T=TI171534271726400183165858184780916221300396524652112049980957740416; at=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQ2Yjk5NDViLWZmYTEtNGQ5ZC1iZDQyLTFkN2RmZTU4ZGNmYSJ9.eyJleHAiOjE3MTcwNzA3MTcsImlhdCI6MTcxNTM0MjcxNywiaXNzIjoia2V2bGFyIiwianRpIjoiYzM1NmNiZWUtYWRlNi00MzliLTliMTMtMmQ4ODljOGI3NmZkIiwidHlwZSI6IkFUIiwiZElkIjoiVEkxNzE1MzQyNzE3MjY0MDAxODMxNjU4NTgxODQ3ODA5MTYyMjEzMDAzOTY1MjQ2NTIxMTIwNDk5ODA5NTc3NDA0MTYiLCJrZXZJZCI6IlZJNDc3N0Y3NDZFMzkxNDAxMUI0QzFFNEFENTQxQUIwMzIiLCJ0SWQiOiJtYXBpIiwidnMiOiJMTyIsInoiOiJIWUQiLCJtIjp0cnVlLCJnZW4iOjR9.B2jYyinQy-RtweMM9j3zlXmJS_aVp1EU0mXXWriafpw; rt=null'
      },
      proxies: proxies,
      validateStatus: false
    });
    const $ = cheerio.load(response.data);
    const retryButton = $('#timer_text.disable_btn');
    if (retryButton.length > 0) {
      return { url, status: 'Removed' };
    }

    const soldOutDiv = $('.Z8JjpR').filter(function () {
      return $(this).text().trim() === 'Sold Out';
    });
    if (soldOutDiv.length > 0) {
      return { url, status: 'Sold Out' };
    }

    const unavailableDiv = $('.Z8JjpR').filter(function () {
      return $(this).text().trim() === 'Currently Unavailable';
    });
    if (unavailableDiv.length > 0) {
      return { url, status: 'Unavailable' };
    }

    const priceDiv = $('.hl05eU');
    if (priceDiv.length > 0) {
      return { url, status: 'Available' };
    }

    return { url, status: 'Check Manually' };
  } catch (error) {
    console.error(`Error fetching the page for URL [${url}]:`, error);
    return { url, status: 'Error' };
  }
}

async function checkAllUrls() {
  let results = [];
  for (const url of urls) {
    const result = await checkPageStatus(url);
    results.push(result);
  }
  console.log(JSON.stringify(results, null, 2));
}

checkAllUrls();











// const axios = require('axios');
// const cheerio = require('cheerio');

// const urls = [
//   'https://www.flipkart.com/advanced-bank-management-old-book/p/itmb94a9ed6b6656?pid=RBKGP7ZYZWGUWTDD',
//   'https://www.flipkart.com/jaiib-principles-practices-banking-2ndreprint/p/itmc750d4bf84a07?pid=9780230636118',
//   'https://www.flipkart.com/caiib-examination-retail-banking-advanced-bank-managemnt-financial-management/p/itmaa3d7fa4bdee4?pid=RBKG9R5VPHYM5UMG',
//   'https://www.flipkart.com/jaiib-combo-principles-practices-banking-accounting-financial-management-bankers-retail-indian-economy-system-set-4-books/p/itm15bf90f9ffde7?pid=RBKGHYYWMJYHZF7Q'
//   // Add more URLs here
// ];

// async function checkPageStatus(url) {
//   try {
//     const response = await axios.get(url,{      headers: {
//       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
//       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//       'Accept-Language': 'en-US,en;q=0.5',
//       'Connection': 'keep-alive',
//       'Cookie': 'K-ACTION=null; SN=VI4777F746E3914011B4C1E4AD541AB032.TOK99D3621E596F4FF0A91429F8637C52BC.1715342717.LO; T=TI171534271726400183165858184780916221300396524652112049980957740416; at=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQ2Yjk5NDViLWZmYTEtNGQ5ZC1iZDQyLTFkN2RmZTU4ZGNmYSJ9.eyJleHAiOjE3MTcwNzA3MTcsImlhdCI6MTcxNTM0MjcxNywiaXNzIjoia2V2bGFyIiwianRpIjoiYzM1NmNiZWUtYWRlNi00MzliLTliMTMtMmQ4ODljOGI3NmZkIiwidHlwZSI6IkFUIiwiZElkIjoiVEkxNzE1MzQyNzE3MjY0MDAxODMxNjU4NTgxODQ3ODA5MTYyMjEzMDAzOTY1MjQ2NTIxMTIwNDk5ODA5NTc3NDA0MTYiLCJrZXZJZCI6IlZJNDc3N0Y3NDZFMzkxNDAxMUI0QzFFNEFENTQxQUIwMzIiLCJ0SWQiOiJtYXBpIiwidnMiOiJMTyIsInoiOiJIWUQiLCJtIjp0cnVlLCJnZW4iOjR9.B2jYyinQy-RtweMM9j3zlXmJS_aVp1EU0mXXWriafpw; rt=null'
//     },
//     validateStatus: false  // This will ensure all responses are returned without throwing an error
//   });
//   const $ = cheerio.load(response.data);
//     const retryButton = $('#timer_text.disable_btn');
//     if (retryButton.length > 0) {
//       return { url, status: 'Removed' };
//     }

//     const soldOutDiv = $('.Z8JjpR').filter(function () {
//       return $(this).text().trim() === 'Sold Out';
//     });
//     if (soldOutDiv.length > 0) {
//       return { url, status: 'Sold Out' };
//     }

//     const unavailableDiv = $('.Z8JjpR').filter(function () {
//       return $(this).text().trim() === 'Currently Unavailable';
//     });
//     if (unavailableDiv.length > 0) {
//       return { url, status: 'Currently Unavailable' };
//     }

//     const priceDiv = $('.hl05eU');
//     if (priceDiv.length > 0) {
//       return { url, status: 'Available' };
//     }

//     return { url, status: 'Check Manually' };
//   } catch (error) {
//     console.error(`Error fetching the page for URL [${url}]:`, error);
//     return { url, status: 'Error' };
//   }
// }

// async function checkAllUrls() {
//   let results = [];
//   for (const url of urls) {
//     const result = await checkPageStatus(url);
//     results.push(result);
//   }
//   console.log(JSON.stringify(results, null, 2));
// }

// checkAllUrls();









