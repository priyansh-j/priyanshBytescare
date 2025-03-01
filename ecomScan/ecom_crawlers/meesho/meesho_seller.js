const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;




// Replace with your input URLs
const inputString = `
https://www.meesho.com/secondary-school-mathematics-for-class-10-cbse-by-rs-aggarwal-2024-25-examination/p/6oefij


`; // Use your full input string of URLs


const urls = inputString.split('\n').map(id => id.trim()).filter(id => id);

// CSV Writers setup
const csvWriter = createCsvWriter({
  path: 'bb_seller.csv',
  header: [
    { id: 'Url', title: 'URL' },
    { id: 'seller', title: 'Seller' },
    { id: 'sellerRating', title: 'Seller Rating' },
    { id: 'Title', title: 'Title' },
    { id: 'price', title: 'Price' },
    { id: 'isbn', title: 'ISBN' },
    { id: 'coverImageUrl', title: 'Cover Image URL' },
    { id: 'pid', title: 'pid' },
    { id: 'mrp', title: 'MRP' }
  ]
});

const errorCsvWriter = createCsvWriter({
  path: 'error_links.csv',
  header: [
    { id: 'Url', title: 'URL' },
    { id: 'Error', title: 'Error' }
  ]
});

const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const shopSelector = 'div.ShopCardstyled__ShopInfoSection-sc-du9pku-2.gKAgje';
    const detailedSelector = 'div.sc-ftTHYK.hqYVzH.ShippingInfo__DetailCard-sc-frp12n-0.dKuTbW';
    const descriptionSelector = 'div.sc-ftTHYK.jfdUoi.ProductDescription__DetailsCardStyled-sc-1l1jg0i-0.eFKyvM';
    const imageSelector = 'div.ProductDesktopImage__ImageWrapperDesktop-sc-8sgxcr-0.iEMJCd img';
    const mrpSelector = 'p.sc-eDvSVe.gQDOBc.sc-jSUZER.eSuFsQ.ShippingInfo__ParagraphBody2StrikeThroughStyled-sc-frp12n-3.dMCitE';

    const productDetails = [];
    let hasTitle = false;

    $(shopSelector).each((i, shopElement) => {
      const seller = $(shopElement).find('span.ShopCardstyled__ShopName-sc-du9pku-6.bdcHGu').text();
      const sellerRating = $(shopElement).find('span.jkpPSq').text();

      $(detailedSelector).each((j, detailElement) => {
        const Title = $(detailElement).find('span.sc-eDvSVe.fhfLdV').text();
        if (Title) hasTitle = true;

        const price = $(detailElement).find('h4.sc-eDvSVe.biMVPh').text();
        const mrp = $(mrpSelector).text() || " ";

        $(descriptionSelector).each((k, descElement) => {
          const isbnText = $(descElement).find('p:contains("ISBN")').text();
          const isbn = isbnText.split(':')[1]?.trim() || 'N/A';

          const coverImageUrl = $(imageSelector).attr('src');
          const imageNumberMatch = coverImageUrl?.match(/\/products\/(\d+)\//);
          const pid = imageNumberMatch ? imageNumberMatch[1] : 'N/A';

          const productInfo = {
            Url: url,
            seller,
            sellerRating,
            Title,
            price,
            isbn,
            coverImageUrl,
            pid,
            mrp
          };

          productDetails.push(productInfo);
        });
      });
    });

    return hasTitle ? productDetails : null;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
};

const extractData = async () => {
  const results = await Promise.all(urls.map(async (url) => {
    const result = await fetchData(url);
    console.log(`Processed URL: ${url}`);
    return result ? result : { Url: url, Error: 'Missing Title or Fetch Error' };
  }));

  const flatResults = results.flat().filter(item => !item.Error);
  const errorLinks = results.flat().filter(item => item.Error);

  // Write valid data to CSV
  await csvWriter.writeRecords(flatResults);
  console.log('CSV file has been saved.');

  // Write error links to CSV
  await errorCsvWriter.writeRecords(errorLinks);
  console.log('Error links file has been saved.');
};

extractData();














// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// // Replace with your input URLs
// const inputString = `
// https://www.meesho.com/s/p/7jdzv6

// `; // Use your full input string of URLs

// const urls = inputString.split('\n').map(id => id.trim()).filter(id => id);

// // CSV Writer setup
// const csvWriter = createCsvWriter({
//   path: 'gupta_seller.csv',
//   header: [
//     { id: 'Url', title: 'URL' },
//     { id: 'seller', title: 'Seller' },
//     { id: 'sellerRating', title: 'Seller Rating' },
//     { id: 'Title', title: 'Title' },
//     { id: 'price', title: 'Price' },
//     { id: 'isbn', title: 'ISBN' },
//     { id: 'coverImageUrl', title: 'Cover Image URL' },
//     { id: 'pid', title: 'pid' },
//     { id: 'mrp', title: 'MRP' }
//   ]
// });

// const fetchData = async (url) => {
//   try {
//     const response = await axios.get(url);
//     const html = response.data;
//     const $ = cheerio.load(html);
//     const shopSelector = 'div.ShopCardstyled__ShopInfoSection-sc-du9pku-2.gKAgje';
//     const detailedSelector = 'div.sc-ftTHYK.hqYVzH.ShippingInfo__DetailCard-sc-frp12n-0.dKuTbW';
//     const descriptionSelector = 'div.sc-ftTHYK.jfdUoi.ProductDescription__DetailsCardStyled-sc-1l1jg0i-0.eFKyvM';
//     const imageSelector = 'div.ProductDesktopImage__ImageWrapperDesktop-sc-8sgxcr-0.iEMJCd img';
//     const mrpSelector = 'p.sc-eDvSVe.gQDOBc.sc-jSUZER.eSuFsQ.ShippingInfo__ParagraphBody2StrikeThroughStyled-sc-frp12n-3.dMCitE';

//     const productDetails = [];

//     $(shopSelector).each((i, shopElement) => {
//       const seller = $(shopElement).find('span.ShopCardstyled__ShopName-sc-du9pku-6.bdcHGu').text();
//       const sellerRating = $(shopElement).find('span.jkpPSq').text();

//       $(detailedSelector).each((j, detailElement) => {
//         const Title = $(detailElement).find('span.sc-eDvSVe.fhfLdV').text();
//         const price = $(detailElement).find('h4.sc-eDvSVe.biMVPh').text();
//         const mrp = $(mrpSelector).text()|| " "; // Extract MRP

//         $(descriptionSelector).each((k, descElement) => {
//           const isbnText = $(descElement).find('p:contains("ISBN")').text();
//           const isbn = isbnText.split(':')[1]?.trim() || 'N/A'; // Extract ISBN value

//           const coverImageUrl = $(imageSelector).attr('src'); // Extract cover image URL
//           const imageNumberMatch = coverImageUrl.match(/\/products\/(\d+)\//); // Extract image number using regex
//           const pid = imageNumberMatch ? imageNumberMatch[1] : 'N/A'; // Extract the matched image number or default to 'N/A'

//           const productInfo = {
//             Url: url,
//             seller,
//             sellerRating,
//             Title,
//             price,
//             isbn,
//             coverImageUrl,
//             pid,
//             mrp // Include MRP in product info
//           };

//           productDetails.push(productInfo);
//         });
//       });
//     });

//     return productDetails;
//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     return null;
//   }
// };

// const extractData = async () => {
//   const flatResults = [];

//   for (let i = 0; i < urls.length; i++) {
//     const url = urls[i];
//     const result = await fetchData(url);
//     console.log(`Processed URL: ${url}`);
//     if (result) {
//       flatResults.push(...result); // Spread the results into flatResults
//     }
//   }

//   // Write data to CSV
//   csvWriter
//     .writeRecords(flatResults)
//     .then(() => console.log('CSV file has been saved.'));
// };

// extractData();














// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const inputString = `
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024/p/79d9z5
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta-paperback/p/77vf8y
// https://www.meesho.com/nikhil-guptas-blackbook-of-english-vocabulary-may-2024-edition-20000-words-englishhindi-gupta-edutech/p/72uwd6
// https://www.meesho.com/blackbook-of-english-vocabulary/p/776ori
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta/p/71d3a4
// https://www.meesho.com/blackbook-of-english-vocabulary/p/6u1aj0
// https://www.meesho.com/blackbook-of-english-vocabulary/p/7alt00
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta/p/72aayb
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta/p/6w5cw2
// https://www.meesho.com/nikhil-guptas-blackbook-of-english-vocabulary-may-2024-edition-20000-words-englishhindi-gupta-edutech/p/71d2oa
// https://www.meesho.com/blackbook-of-general-awareness-2024/p/6lh8bm
// https://www.meesho.com/blackbook-of-english-vocabulary-march-2023-by-nikhil-gupta-paperback/p/7c0u0h
// https://www.meesho.com/blackbook-of-english-vocabulary-toppers-choice-for-ssc-railways-defence-and-other-competitive-exams-blackbook-of-english-vocabulary/p/778pll
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024/p/72v96j
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta/p/77sjz6
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta-paperback-1-may-2024/p/70w9mk
// https://www.meesho.com/blackbook-of-english-vocabulary/p/6fk5p7
// https://www.meesho.com/blackbook-of-english-vocabulary-march-2023-by-nikhil-gupta/p/5saunf
// https://www.meesho.com/blackbook-of-english-vocabulary-by-nikhil-gupta/p/6fk7e2
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-edition-by-nikhil-gupta-paperback-nikhil-gupta/p/79aqs0
// https://www.meesho.com/blackbook-of-english-vocabulary-march-2023-by-nikhil-gupta/p/5ruoyn
// https://www.meesho.com/black-book-of-english-vocabulary/p/77w7uw
// https://www.meesho.com/blackbook-of-english-vocabulary/p/77s6az
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta-paperback-1-may-2024/p/75sncj
// https://www.meesho.com/black-book-of-english-vocabulary-update-till-january-20221200-word-englishhindi-paperback-nikhil-gupta/p/3cvuiv
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta-book/p/70bw3c
// https://www.meesho.com/black-book-of-english-vocabulary/p/75riqr
// https://www.meesho.com/blackbook-of-english-vocabulary-2024/p/6u16mp
// https://www.meesho.com/blackbook-of-english-vocabulary/p/7635or
// https://www.meesho.com/blackbook-of-english-vocabulary/p/77nvv3
// https://www.meesho.com/blackbook-of-english-vocabulary-english-paperback-book/p/72g7no
// https://www.meesho.com/blackbook-of-english-vocabulary-2021-by-nikhil-gupta/p/4lhodg
// https://www.meesho.com/blackbook-of-english-vocabulary-2021-by-nikhil-gupta/p/4lht1d
// https://www.meesho.com/blackbook/p/55jado
// https://www.meesho.com/english-paperback-new-age-spirituality-religious-books/p/6kx5eh
// https://www.meesho.com/blackbook-of-railway-general-knowledge-general-science-august-2024-by-nikhil-gupta/p/7ahjk2
// https://www.meesho.com/blackbook-of-general-awareness-march-2024-edition-30000-one-liners-book-hindi-medium-by-nikhil-gupta/p/78af3w
// https://www.meesho.com/blackbook-of-general-awareness-march-2024-edition/p/727qua
// https://www.meesho.com/blackbook-of-english-vocabulary-2023-2024-paperback-1-january-2023/p/6pgyzt
// https://www.meesho.com/neetu-singh-english-book-in-hindi-latest-edition-2022-ssc-exams-best-book-for-english-free-gk-book/p/3rlxt5
// https://www.meesho.com/black-book-english-vocabulary-may-2024-edition/p/6t2qgg
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta/p/77ittn
// https://www.meesho.com/blackbook-of-english-vocabulary-march-2023-edition-paperback-nikhil-gupta/p/6y5e71
// https://www.meesho.com/blackbook-of-english-vocabulary-janurary-2022-ssc-exams-best-book-for-vocabulory-free-gk-book/p/3rlxt2
// https://www.meesho.com/black-book-off-english-vocabulary/p/7ce34w
// https://www.meesho.com/blackbook-of-english-vocabulary-2021-by-nikhil-gupta-new/p/4lhwy1
// https://www.meesho.com/black-book-vocabulary-nikhil-gupta-20000words-englishhindi-may-2024-edition/p/7bkrnu
// https://www.meesho.com/blackbook-of-english-vocabulary-janurary-2022-ssc-exams/p/3rlxwe
// https://www.meesho.com/black-book-nikhil-gupta/p/6zzn47
// https://www.meesho.com/black-book-english/p/6ih2qn
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta/p/7b4jao
// https://www.meesho.com/blackbook-of-english-vocabulary-january-2022/p/3rapk2
// https://www.meesho.com/blackbook-of-english-vocabulary-march-2023-by-nikhil-gupta-paperback-22-february-2023/p/4afet8
// https://www.meesho.com/blackbook-of-english-vocabulary-janurary-2022-ssc-exams-best-book-for-vocabulory-free-gk-book/p/3rapjy
// https://www.meesho.com/blackbook-of-english-vocabulary-janurary-2022-ssc-exams-best-book-for-vocabulory/p/3rlxtp
// https://www.meesho.com/blackbook-of-english-vocabulary-english-paperback-book-by-nikhil-k-gupta-latest-edition/p/7b5bz3
// https://www.meesho.com/blackbook-of-english-vocabulary-may-2024-by-nikhil-gupta/p/6wgfv7
// https://www.meesho.com/black-book-nikhil-gupta/p/6zzee0

// `;
// // Split the input string to create an array of product IDs
// const urls = inputString.split('\n').map(id => id.trim()).filter(id => id);

// const fetchData = async (url) => {
//   try {
//     const response = await axios.get(url);
//     const html = response.data;
//     const $ = cheerio.load(html);
//     const shopSelector = 'div.ShopCardstyled__ShopInfoSection-sc-du9pku-2.gKAgje';
//     const detailedSelector = 'div.sc-ftTHYK.hqYVzH.ShippingInfo__DetailCard-sc-frp12n-0.dKuTbW';
//     const descriptionSelector = 'div.sc-ftTHYK.jfdUoi.ProductDescription__DetailsCardStyled-sc-1l1jg0i-0.eFKyvM';
//     const imageSelector = 'div.ProductDesktopImage__ImageWrapperDesktop-sc-8sgxcr-0.iEMJCd img';
//     const mrpSelector = 'p.sc-eDvSVe.gQDOBc.sc-jSUZER.eSuFsQ.ShippingInfo__ParagraphBody2StrikeThroughStyled-sc-frp12n-3.dMCitE';


//     const productDetails = [];

//     $(shopSelector).each((i, shopElement) => {
//       const seller = $(shopElement).find('span.ShopCardstyled__ShopName-sc-du9pku-6.bdcHGu').text();
//       const sellerRating = $(shopElement).find('span.jkpPSq').text();

//       $(detailedSelector).each((j, detailElement) => {
//         const Title = $(detailElement).find('span.sc-eDvSVe.fhfLdV').text();
//         const price = $(detailElement).find('h4.sc-eDvSVe.biMVPh').text();

//         $(descriptionSelector).each((k, descElement) => {
//           const isbnText = $(descElement).find('p:contains("ISBN")').text();
//           const isbn = isbnText.split(':')[1]?.trim() || 'N/A'; // Extract ISBN value

//           const coverImageUrl = $(imageSelector).attr('src'); // Extract cover image URL
//           const imageNumberMatch = coverImageUrl.match(/\/products\/(\d+)\//); // Extract image number using regex
//           const imageNumber = imageNumberMatch ? imageNumberMatch[1] : 'N/A'; // Extract the matched image number or default to 'N/A'

//           const productInfo = {
//             Url: url,
//             seller,
//             sellerRating,
//             Title,
//             price,
//             isbn,
//             coverImageUrl,
//             imageNumber
//           };

//           productDetails.push(productInfo);
//         });
//       });
//     });

//     return productDetails;
//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     return null;
//   }
// };

// const extractData = async () => {
//   // const promises = urls.map(url => fetchData(url));
//   // const results = await Promise.all(promises);
//   // const flatResults = results.flat(); // Flatten the results into a single list
//   const flatResults = [];

//   for (let i = 0; i < urls.length; i++) {
//     const url = urls[i];
//     const result = await fetchData(url);
//     console.log(`processed url ${url}`);
//     if (result) {
//       flatResults.push(...result); // Spread the results into flatResults
//     }
//   }
//   fs.writeFile('output.json', JSON.stringify(flatResults, null, 2), 'utf8', (err) => {
//     if (err) {
//       console.error('An error occurred while writing JSON to file:', err);
//     } else {
//       console.log('JSON data has been saved.');
//     }
//   });
// };

// extractData();

























// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const urls = [
//   "https://www.meesho.com/s/p/6tb9r2?utm_source=s_w",
//   "https://www.meesho.com/s/p/6tc5r5?utm_source=s_cc"
// ];

// const fetchData = async (url) => {
//   try {
//     const response = await axios.get(url);
//     const html = response.data;
//     const $ = cheerio.load(html);
//     const shopSelector = 'div.ShopCardstyled__ShopInfoSection-sc-du9pku-2.gKAgje';
//     const detailedSelector = 'div.sc-ftTHYK.hqYVzH.ShippingInfo__DetailCard-sc-frp12n-0.dKuTbW';
//     const descriptionSelector = 'div.sc-ftTHYK.jfdUoi.ProductDescription__DetailsCardStyled-sc-1l1jg0i-0.eFKyvM';

//     const productDetails = [];

//     $(shopSelector).each((i, shopElement) => {
//       const seller = $(shopElement).find('span.ShopCardstyled__ShopName-sc-du9pku-6.bdcHGu').text();
//       const sellerRating = $(shopElement).find('span.jkpPSq').text();

//       $(detailedSelector).each((j, detailElement) => {
//         const Title = $(detailElement).find('span.sc-eDvSVe.fhfLdV').text();
//         const price = $(detailElement).find('h4.sc-eDvSVe.biMVPh').text();
//         // const rating = $(detailElement).find('span.sc-eDvSVe.laVOtN').text();
//         // const totalRatings = $(detailElement).find('span.sc-eDvSVe.eOvght').text();
//         // const delivery = $(detailElement).find('span.sc-eDvSVe.fkvMlU').text();

//         $(descriptionSelector).each((k, descElement) => {
//           const isbnText = $(descElement).find('p:contains("ISBN")').text();
//           const isbn = isbnText.split(':')[1]?.trim() || 'N/A'; // Extract ISBN value

//           const productInfo = {
//             Url: url,
//             seller,
//             sellerRating,
//             Title,
//             price,
//             // rating,
//             // totalRatings,
//             // delivery,
//             isbn
//           };

//           productDetails.push(productInfo);
//         });
//       });
//     });

//     return productDetails;
//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     return null;
//   }
// };

// const extractData = async () => {
//   const promises = urls.map(url => fetchData(url));
//   const results = await Promise.all(promises);
//   const flatResults = results.flat(); // Flatten the results into a single list

//   fs.writeFile('output.json', JSON.stringify(flatResults, null, 2), 'utf8', (err) => {
//     if (err) {
//       console.error('An error occurred while writing JSON to file:', err);
//     } else {
//       console.log('JSON data has been saved.');
//     }
//   });
// };

// extractData();













// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const urls = [
  
//   "https://www.meesho.com/s/p/4mop2z?utm_source=s",
//   "https://www.meesho.com/s/p/4eai01?utm_source=s"

//   // Add more URLs as needed
// ];

// const fetchData = async (url) => {
//   try {
//     const response = await axios.get(url);
//     const html = response.data;
//     const $ = cheerio.load(html);
//     const selector = 'div.ShopCardstyled__ShopInfoSection-sc-du9pku-2.gKAgje';

//     const shopInfo = $(selector).map((i, element) => {
//       const Url =url;
//       const seller = $(element).find('span.ShopCardstyled__ShopName-sc-du9pku-6.bdcHGu').text();
//       const sellerRating = $(element).find('span.jkpPSq').text();
//     //   const totalRatings = $(element).find('span.YtJFx').first().text();
//     //   const followers = $(element).find('span.YtJFx').next().text();
//     //   const products = $(element).find('span.YtJFx').last().text();

//       return { Url,seller, sellerRating };
//     }).get();

//     return shopInfo;
//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     return null;
//   }
// };

// const extractData = async () => {
//     const promises = urls.map(url => fetchData(url));
//     const results = await Promise.all(promises);
//     const flatResults = results.flat(); // Flatten the results into a single list
//     fs.writeFile('output.json', JSON.stringify(flatResults, null, 2), 'utf8', (err) => {
//       if (err) {
//         console.error('An error occurred while writing JSON to file:', err);
//       } else {
//         console.log('JSON data has been saved.');
//       }
//     });
//   };
  
//   extractData();