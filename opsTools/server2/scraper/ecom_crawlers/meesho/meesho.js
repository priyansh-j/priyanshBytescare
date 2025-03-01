const axios = require('axios');
const fs = require('fs');

async function fetchBookData(bookName) {
  try {
    let i = 1;
    const resultData = []; // Create an array to store the extracted data

    while (i < 5) {
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

      const proxies = {
        "http": "http://package-10001:uHUtgPyRMmABDjT0@rotating.proxyempire.io:5000",
        "https": "http://package-10001:uHUtgPyRMmABDjT0@rotating.proxyempire.io:5000"
      };

      const response = await axios.post(apiUrl, requestBody, { proxies: proxies });
      const catalogs = response.data.catalogs;
      const extractedData = catalogs.map(catalog => {
        const slug = catalog.slug;
        const images = catalog.product_images.length > 0 ? catalog.product_images[0].url : null;
        const consumerShareText = catalog.consumer_share_text ? catalog.consumer_share_text.split('\n')[1] : null;
        const minProductPrice = catalog.min_product_price;
        const isbnMatch = catalog.full_details.match(/ISBN:\s+(\d+)/);
        const isbn = isbnMatch ? isbnMatch[1] : null;

        return {
          title: slug || null,
          source: consumerShareText || null,
          isbn13: isbn || null,
          ProductPrice: minProductPrice || null,
          thumbnail_url: images || null 
        };
      });

      resultData.push(...extractedData);

      if (extractedData.length === 0) {
        break;
      }

      i++; // Increment i to continue the loop
    }

    return resultData;
  } catch (error) {
    console.error('Error:', error);
    throw error; // Rethrow the error to indicate a failure
  }
}

async function runForMultipleBooks(bookNames) {
    let allData = []; // Ensure this is an array
  
    for (const bookName of bookNames) {
      console.log(`Fetching data for: ${bookName}`);
      const data = await fetchBookData(bookName);
      allData = allData.concat(data); // Properly concat data
    }
  
    fs.writeFile('book_data.json', JSON.stringify(allData, null, 2), (err) => {
      if (err) throw err;
      console.log('Data has been written to file successfully.');
    });
  }
  
  // Example usage with multiple keywords
  const bookNames = ["ikigai","harry potter"]; // Add more book names as needed
  runForMultipleBooks(bookNames);
