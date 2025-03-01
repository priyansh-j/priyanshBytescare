const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const scrapeBookDetails = async (url) => {
  try {
    const isbnFromUrl = url.split('/').pop().replace("'", '').trim();
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const title = $('#ctl00_phBody_ProductDetail_lblTitle').text().trim() || 'Title not found';
    const imageUrl = $('meta[property="og:image"]').attr('content') || 'Image URL not found';
    const isbn13 = isbnFromUrl || 'ISBN-13 not found';
    const author = $('#ctl00_phBody_ProductDetail_lblAuthor1 a').text().trim() || 'Author not found';
    const price = $('#ctl00_phBody_ProductDetail_lblourPrice').text().trim() || 'Price not found';
    const mrp = $('#ctl00_phBody_ProductDetail_lblListPrice del').text().replace('M.R.P. :', '').trim() || 'MRP not found';
    const status = $('#ctl00_phBody_ProductDetail_lblAvailable').text().trim() || 'Status not found';
    const binding = $('#ctl00_phBody_ProductDetail_lblBinding').text().trim() || 'Binding not found';

    return {
      url,
      title,
      imageUrl,
      isbn13,
      author,
      price,
      mrp,
      status,
      binding,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    throw url; // Throw the URL so we can log it as an error link
  }
};

const processUrls = async (urls) => {
  const results = [];
  const errorLinks = [];

  for (const url of urls) {
    try {
      const details = await scrapeBookDetails(url);
      results.push(details);
    } catch (errorUrl) {
      errorLinks.push({ url: errorUrl });
    }
  }

  // Write data to CSV files
  const csvWriter = createCsvWriter({
    path: 'books_data.csv',
    header: [
      { id: 'url', title: 'URL' },
      { id: 'title', title: 'Title' },
      { id: 'imageUrl', title: 'Image URL' },
      { id: 'isbn13', title: 'ISBN-13' },
      { id: 'author', title: 'Author' },
      { id: 'price', title: 'Price' },
      { id: 'mrp', title: 'MRP' },
      { id: 'status', title: 'Status' },
      { id: 'binding', title: 'Binding' },
    ],
  });

  const errorCsvWriter = createCsvWriter({
    path: 'error_links.csv',
    header: [{ id: 'url', title: 'Error URL' }],
  });

  // Write successful results and error links to respective CSVs
  await csvWriter.writeRecords(results);
  await errorCsvWriter.writeRecords(errorLinks);

  console.log('Data written to books_data.csv');
  console.log('Error links written to error_links.csv');
};


const inputString=`

https://www.bookswagon.com/book/foundation-science-physics-class-10/978b09j3lhfmc
https://www.bookswagon.com/book/foundation-science-physics-class-10/978b0ch83r8hy
https://www.bookswagon.com/book/foundation-science-physics-class-9/978b0cs3r33sp
https://www.bookswagon.com/book/foundation-science-physics-class-10/978b0c8djwqg5
https://www.bookswagon.com/book/foundation-science-physics-class-9/978b0cqh5wznp
https://www.bookswagon.com/book/foundation-science-physics-class-10/978b0c7c4z9zv
https://www.bookswagon.com/book/concepts-physics-vol-1-class/978b0blbphmw3
https://www.bookswagon.com/book/foundation-science-biology-class-9/978b07bn9rqb5
https://www.bookswagon.com/book/rs-aggarwal-ncrt-mathematics-class/978b0bt4yycx9
https://www.bookswagon.com/book/mathematics-class-6-by-rs/978b0ctg2b59k
https://www.bookswagon.com/book/junior-maths-5-asit-das/9788177099683
https://www.bookswagon.com/book/junior-maths-book-5-/978B09643THBD
https://www.bookswagon.com/author/math-junior
https://www.bookswagon.com/publisher/bharati-bhawan-(publishers-distributors)
https://www.bookswagon.com/book/junior-history-book-1-edward/9781902984964
https://www.bookswagon.com/book/concepts-physics-1-vol-2/978B07XP2X1JX
https://www.bookswagon.com/book/concept-physics-20222023-session-set/978b0b1fbsyfj
https://www.bookswagon.com/book/aadhunik-hindi-vyakaran-aur-rachana/978B07ZRSXT3Y
https://www.bookswagon.com/book/foundation-science-physics-class-10/978B0BTLVLRHZ
`;

const urls  = inputString.split('\n').map(id => id.trim()).filter(id => id);
processUrls(urls);
