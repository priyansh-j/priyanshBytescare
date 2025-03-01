const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

async function fetchSellerInfo(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const selector = 'div.ShopCardstyled__ShopInfoSection-sc-du9pku-2.gKAgje';

    const shopInfo = $(selector).map((i, element) => {
      const seller = $(element).find('span.ShopCardstyled__ShopName-sc-du9pku-6.bdcHGu').text();
      const sellerRating = $(element).find('span.jkpPSq').text();
      return { seller, sellerRating };
    }).get();

    return shopInfo.length > 0 ? shopInfo[0] : null;
  } catch (error) {
    console.error('Error fetching seller info:', error);
    return null;
  }
}

async function fetchBookData(bookName) {
  try {
    let i = 1;
    const resultData = [];

    while (i < 3) {
      const apiUrl = 'https://www.meesho.com/api/v1/products/search';
      const requestBody = {
        "query": bookName,
        "type": "text_search",
        "page": i,
        "offset": 50 * (i - 1),
        "limit": 50,
        "cursor": null,
        "isDevicePhone": false
      };

      const response = await axios.post(apiUrl, requestBody);

      const catalogs = response.data.catalogs;
      const extractedData = await Promise.all(catalogs.map(async catalog => {
        const slug = catalog.slug;
        const images = catalog.product_images.length > 0 ? catalog.product_images[0].url : null;
        const consumerShareText = catalog.consumer_share_text ? catalog.consumer_share_text.split('\n')[1] : null;
        const minProductPrice = catalog.min_product_price;
        const isbnMatch = catalog.full_details.match(/ISBN:\s+(\d+)/);
        const isbn = isbnMatch ? isbnMatch[1] : null;
        const product_id = catalog.product_id;
        const source = "https://www.meesho.com/" + slug + "/p/" + product_id;

        // Fetch seller info
        const sellerInfo = await fetchSellerInfo(source);
        const seller = sellerInfo ? sellerInfo.seller : null;
        const sellerRating = sellerInfo ? sellerInfo.sellerRating : null;

        return {
          title: slug || null,
          source: source || null,
          isbn13: isbn || null,
          ProductPrice: minProductPrice || null,
          thumbnail_url: images || null,
          seller: seller || null,
          sellerRating: sellerRating || null
        };
      }));

      resultData.push(...extractedData);

      if (extractedData.length === 0) {
        break;
      }

      i++;
    }

    return resultData;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function runForMultipleBooks(bookNames) {
  let allData = [];

  for (const bookName of bookNames) {
    console.log(`Fetching data for: ${bookName}`);
    const data = await fetchBookData(bookName);
    allData = allData.concat(data);
  }

  fs.writeFile('book_data.json', JSON.stringify(allData, null, 2), (err) => {
    if (err) throw err;
    console.log('Data has been written to file successfully.');
  });
}

// Example usage with multiple keywords
const bookNames = [
 // "Adhunik Hindi Vyakaran Aur Rachna",
"C.krishniah chetty & sons ",
"C.krishniah chetty Jewellers",
"C.krishniah chetty & sons Manufactures",
"C.krishniah chetty & sons",
"C.krishniah chetty charitable Trust",
"C.krishniah chetty Foundation",
"C.krishniah chetty jewelleries",
"ckc chains and jewellery"

]; 
runForMultipleBooks(bookNames);











// const axios = require('axios');
// const fs = require('fs');

// async function fetchBookData(bookName) {
//   try {
//     let i = 1;
//     const resultData = []; // Create an array to store the extracted data

//     while (i < 5) {
//       const apiUrl = 'https://www.meesho.com/api/v1/products/search';
//       const requestBody = {
//         "query": bookName,
//         "type": "text_search",
//         "page": i,
//         "offset": 50 * (i - 1),
//         "limit": 50,
//         "cursor": null,
//         "isDevicePhone": false
//       };

//       const proxies = {
//         "http": "http://package-10001:uHUtgPyRMmABDjT0@rotating.proxyempire.io:5000",
//         "https": "http://package-10001:uHUtgPyRMmABDjT0@rotating.proxyempire.io:5000"
//       };

//       const response = await axios.post(apiUrl, requestBody, { proxies: proxies });


//       const catalogs = response.data.catalogs;
//       const extractedData = catalogs.map(catalog => {
//         const slug = catalog.slug;
//         const images = catalog.product_images.length > 0 ? catalog.product_images[0].url : null;
//         const consumerShareText = catalog.consumer_share_text ? catalog.consumer_share_text.split('\n')[1] : null;
//         const minProductPrice = catalog.min_product_price;
//         const isbnMatch = catalog.full_details.match(/ISBN:\s+(\d+)/);
//         const isbn = isbnMatch ? isbnMatch[1] : null;
//         const product_id=catalog.product_id
//         const source ="https://www.meesho.com/"+slug+"/p/"+product_id;
//         return {
//           title: slug || null,
//           source: source || null,
//           isbn13: isbn || null,
//           ProductPrice: minProductPrice || null,
//           thumbnail_url: images || null 
//         };
//       });

//       resultData.push(...extractedData);

//       if (extractedData.length === 0) {
//         break;
//       }

//       i++; // Increment i to continue the loop
//     }

//     return resultData;
//   } catch (error) {
//     console.error('Error:', error);
//     throw error; // Rethrow the error to indicate a failure
//   }
// }

// async function runForMultipleBooks(bookNames) {
//   let allData = []; // Ensure this is an array

//   for (const bookName of bookNames) {
//     console.log(`Fetching data for: ${bookName}`);
//     const data = await fetchBookData(bookName);
//     allData = allData.concat(data); // Properly concat data
//   }

//   fs.writeFile('book_data.json', JSON.stringify(allData, null, 2), (err) => {
//     if (err) throw err;
//     console.log('Data has been written to file successfully.');
//   });
// }

// // Example usage with multiple keywords
// const bookNames = [
//   "BlackBook of General Awareness ",
//   "Blackbook Of English Vocabulary (2023-2024)",
//   "BlackBook of Samanya Jagrukta "
// ]; // Add more book names as needed
// runForMultipleBooks(bookNames);











// const axios = require('axios');
// const fs = require('fs');

// async function fetchBookData(bookName) {
//   try {
//     let i = 1;
//     const resultData = []; // Create an array to store the extracted data

//     while (i < 5) {
//       const apiUrl = 'https://www.meesho.com/api/v1/products/search';
//       const requestBody = {
//         "query": bookName,
//         "type": "text_search",
//         "page": i,
//         "offset": 50 * (i - 1),
//         "limit": 50,
//         "cursor": null,
//         "isDevicePhone": false
//       };

//       const proxies = {
//         "http": "http://package-10001:uHUtgPyRMmABDjT0@rotating.proxyempire.io:5000",
//         "https": "http://package-10001:uHUtgPyRMmABDjT0@rotating.proxyempire.io:5000"
//       };

//       //const response = await axios.post(apiUrl, requestBody, { proxies: proxies });
//       const response = await axios.post(apiUrl, requestBody, { proxies: proxies });
// fs.writeFile('response.json', JSON.stringify(response.data, null, 2), (err) => {
//   if (err) {
//     console.error('Error writing to file', err);
//   } else {
//     console.log('Response successfully written to response.json');
//   }
// });

//       const catalogs = response.data.catalogs;
//       const extractedData = catalogs.map(catalog => {
//         const slug = catalog.slug;
//         const images = catalog.product_images.length > 0 ? catalog.product_images[0].url : null;
//         const consumerShareText = catalog.consumer_share_text ? catalog.consumer_share_text.split('\n')[1] : null;
//         const minProductPrice = catalog.min_product_price;
//         const isbnMatch = catalog.full_details.match(/ISBN:\s+(\d+)/);
//         const isbn = isbnMatch ? isbnMatch[1] : null;

//         return {
//           title: slug || null,
//           source: consumerShareText || null,
//           isbn13: isbn || null,
//           ProductPrice: minProductPrice || null,
//           thumbnail_url: images || null 
//         };
//       });

//       resultData.push(...extractedData);

//       if (extractedData.length === 0) {
//         break;
//       }

//       i++; // Increment i to continue the loop
//     }

//     return resultData;
//   } catch (error) {
//     console.error('Error:', error);
//     throw error; // Rethrow the error to indicate a failure
//   }
// }

// async function runForMultipleBooks(bookNames) {
//     let allData = []; // Ensure this is an array
  
//     for (const bookName of bookNames) {
//       console.log(`Fetching data for: ${bookName}`);
//       const data = await fetchBookData(bookName);
//       allData = allData.concat(data); // Properly concat data
//     }
  
//     fs.writeFile('book_data.json', JSON.stringify(allData, null, 2), (err) => {
//       if (err) throw err;
//       console.log('Data has been written to file successfully.');
//     });
//   }
  
//   // Example usage with multiple keywords
//   const bookNames = [
//     "BlackBook of General Awareness ",
//     // "Blackbook Of English Vocabulary (2023-2024)",
//     // "BlackBook of Samanya Jagrukta "

  
//   ]; // Add more book names as needed
//   runForMultipleBooks(bookNames);
