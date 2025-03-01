const puppeteer = require('puppeteer');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

(async () => {
  try {
    // Accept multiple keywords as input

    const inputString = `

    Adhunik Hindi Vyakaran Aur Rachna
    Basic Science for Class 6
    Basic Science for Class 7
    Basic Science for Class 8
    Foundation Science: Physics for Class 9
    Foundation Science: Physics for Class 10
    Ganit Parichay 1
    Ganit Parichay 2
    Ganit Parichay 3
    Ganit Parichay 4
    Ganit Parichay 5
    Hindi Reader 0
    Hindi Reader 1
    Hindi Reader 2
    Hindi Reader 3
    Hindi Reader 4
    Hindi Reader 5
    Junior Maths 1
    Junior Maths 2
    Junior Maths 3
    Junior Maths 4
    Math Steps 1
    Math Steps 2
    Math Steps 3
    Math Steps 4
    Math Steps 5
    Mathematics for Class 6
    Mathematics for Class 7
    Mathematics for Class 8
    Mathematics for Olympiads and Talent Search Competitions for Class 6
    Mathematics for Olympiads and Talent Search Competitions for Class 7
    Mathematics for Olympiads and Talent Search Competitions for Class 8
    My Grammar Time 1
    My Grammar Time 2
    My Grammar Time 3
    My Grammar Time 4
    My Grammar Time 5
    Our World: Then and Now 1
    Our World: Then and Now 2
    Our World: Then and Now 3
    Sanskrit Bharati 1
    Sanskrit Bharati 2
    Sanskrit Bharati 3
    Sanskrit Bharati 4
    Saral Hindi Vyakaran Aur Rachna
    Secondary School Mathematics for Class 9
    Secondary School Mathematics for Class 10
    Senior Secondary School Mathematics for Class 11
    Senior Secondary School Mathematics for Class 12
    Sugam Sanskrit Vyakaran 1
    Sugam Sanskrit Vyakaran 2
    The Magic Carpet 1
    The Magic Carpet 2
    The Magic Carpet 3
    The Magic Carpet 4
    The Magic Carpet 5
    The Magic Carpet 6
    The Magic Carpet 7
    The Magic Carpet 8
    Concepts of Physics 1
    Concepts of Physics 2
    Modern Approach to Chemical Calculations
    Bhoutiki ki Samajh 1
    Reactions, Rearrangements and Reagents
    Physics MCQ
    Chemistry MCQ
    Mathematics MCQ
    Problems Plus in IIT Mathematics
    Organic Chemistry Volume 1: Chemistry of Organic Compounds
    High School Bhoutiki 1
    High School Bhoutiki 2
    High School Rasayanshastra 1
    High School Rasayanshastra 2
    High School Jeevvigyan 1
    High School Jeevvigyan 2
    High School Prathmik Ganit 1
    High School Prathmik Ganit 2
    Sugam Ganit 1
    Sugam Ganit 2
    Sugam Ganit 3
    Sugam Vigyan 1
    Sugam Vigyan 2
    Sugam Vigyan 3
    
    
    `;
    // Split the input string to create an array of product IDs
    const keywords  = inputString.split('\n').map(id => id.trim()).filter(id => id);

    //const keywords = ['Adhunik+Hindi+Vyakaran+aur+Rachana', 'Keyword2', 'Keyword3']; // Add more keywords as needed

    // Create a CSV writer
    const csvWriter = createObjectCsvWriter({
      path: 'output.csv',
      header: [
        { id: 'title', title: 'Title' },
        { id: 'author', title: 'Author' },
        { id: 'price', title: 'Price' },
        { id: 'mrp', title: 'MRP' },
        { id: 'save', title: 'Save' },
        { id: 'discount', title: 'Discount' },
        { id: 'coverImage', title: 'Cover Image' },
        { id: 'link', title: 'Link' }
      ]
    });

    // Launch a new browser instance
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Loop through each keyword
    for (const keyword of keywords) {
      // Go to the URL with the current keyword
      const url = `https://www.kopykitab.com/index.php?route=product%2Fsearch&q=${keyword}`;
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Wait for the products to load
      await page.waitForSelector('.one-product.cat_product_details', { timeout: 10000 });

      // Scrape the product details
      const products = await page.evaluate(() => {
        const productElements = document.querySelectorAll('.one-product.cat_product_details');

        const products = [];

        productElements.forEach(product => {
          const title = product.querySelector('.cat_product_name a')?.innerText?.trim() || 'N/A';
          const author = product.querySelector('.author_name_text')?.innerText?.trim() || 'N/A';
          const price = product.querySelector('.catpage_product_new_price')?.innerText?.trim() || 'N/A';
          const mrp = product.querySelector('.catpage_product_old_price')?.innerText?.trim() || 'N/A';
          const save = product.querySelector('.catpage_save_amount b')?.innerText?.trim() || 'N/A';
          const discount = product.querySelector('.catpage_product_off')?.innerText?.trim() || 'N/A';
          const coverImage = product.querySelector('.web_cat_product_image img')?.getAttribute('src') || 'N/A';
          const link = product.querySelector('.cat_product_name a')?.getAttribute('href') || 'N/A';

          products.push({
            title,
            author,
            price,
            mrp,
            save,
            discount,
            coverImage,
            link
          });
        });

        return products;
      });

      // Write the scraped product details to the CSV file
      await csvWriter.writeRecords(products);
    }

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
})();






  