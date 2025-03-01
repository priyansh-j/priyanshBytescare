const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrapeBooks() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://www.abebooks.com/servlet/SearchResults?kn=9789389335408&sts=t&ds=20', {
        waitUntil: 'networkidle2'
    });

    const html = await page.content();
    const $ = cheerio.load(html);

    const books = [];
    $('li[data-cy="listing-item"]').each((index, element) => {

        const isbnLink = $(element).find('a[data-cy="listing-isbn-link"]');
        const isbnText = isbnLink.text();
        const isbn10Match = isbnText.match(/ISBN\s10:\s(\d+)/);
        const isbn13Match = isbnText.match(/ISBN\s13:\s(\d+)/);

        const isbn10 = isbn10Match ? isbn10Match[1] : 'Not Available';
        const isbn13 = isbn13Match ? isbn13Match[1] : 'Not Available';
        // const isbn10 = $(element).find('span:contains("ISBN 10")').next().text().trim();
        // const isbn13 = $(element).find('span:contains("ISBN 13")').next().text().trim();
        const title = $(element).find('meta[itemprop="name"]').attr('content');
        const author = $(element).find('meta[itemprop="author"]').attr('content');
        const publisher = $(element).find('meta[itemprop="publisher"]').attr('content');
        const publishedDate = $(element).find('meta[itemprop="datePublished"]').attr('content');
        const condition = $(element).find('[data-cy="listing-book-condition"]').text();
        const price = $(element).find('.item-price').text().trim();
        const shippingPrice = $(element).find('.item-shipping').text().trim();
        const imageUrl = $(element).find('.srp-item-image').attr('src');
        const seller = $(element).find('.bookseller-info a').text().trim();
        const sellerUrl = $(element).find('.bookseller-info a').attr('href');
        const bookUrl = $(element).find('a[itemprop="url"]').attr('href');

        books.push({
            isbn10,
            isbn13,
            title,
            author,
            publisher,
            publishedDate,
            condition,
            price,
            shippingPrice,
            imageUrl,
            seller,
            sellerUrl: `https://www.abebooks.com${sellerUrl}`,
            bookUrl: `https://www.abebooks.com${bookUrl}`
        });
    });

    console.log(books);

    await browser.close();
}

scrapeBooks();
