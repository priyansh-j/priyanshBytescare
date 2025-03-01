const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Function to scrape Paytm Mall for a single keyword and page
async function scrapePaytmMall(keyword, page) {
    const url = `https://paytmmall.com/shop/search?q=${keyword}&page=${page}`;
    let results = [];

    try {
        // Fetch the page content
        const { data: body } = await axios.get(url);
        let $ = cheerio.load(body);

        // Check for CAPTCHA detection
        let block_text = $('div#infoDiv').text();
        if (block_text.indexOf('solve the CAPTCHA if you are using advanced terms that robots are known to use') > -1) {
            results.state = 'CAPTCHA_DETECTED';
            return results;
        }

        // Check for no accurate results
        let no_results = $('.card-section > div > b');
        if (no_results.length > 0) {
            results.state = 'NO_RESULTS';
            return results;
        }

        // Extract organic results
        let organic_results = $('div._2i1r');
        for (let i = 0; i < organic_results.length; i++) {
            let row_selector = cheerio.load(organic_results.eq(i).html());

            // Extract the product details
            let serp_obj = {
                title: row_selector('.UGUy').text(),
                source: "https://paytmmall.com" + row_selector('a._8vVO').attr('href'),
                price: row_selector('div._1kMS').text().replace('-31%', '').trim()
            };

            // Push valid results to the array
            if (serp_obj.source && serp_obj.source != '' && serp_obj.source != 'NA- Out of Stock') {
                results.push(serp_obj);
            }
        }

        
        //results.results_length = results.results.length;
        return results;

    } catch (error) {
        console.error('Error fetching the page:', error);
        return results;
    }
}

// Function to scrape for multiple keywords and save results in a JSON file
async function scrapeMultipleKeywords(keywords, page = 1) {
    let allResults = [];

    for (let keyword of keywords) {
        console.log(`Scraping results for keyword: ${keyword}`);
        let result = await scrapePaytmMall(keyword, page);
        allResults.push(result);
    }

    // Save the results to a JSON file
    fs.writeFileSync('paytm_scrape_results.json', JSON.stringify(allResults, null, 2));
    console.log('Results have been saved to paytm_scrape_results.json');
    
    return allResults;
}


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

// // Example usage for multiple keywords
// const keywords = [
    
//     "ckc chains and jewellery",
//     "ckc jewellery and product",
//     "C.krishniah chetty jewelleries",
//     "ckc chains and jewellery",

// "C.krishniah chetty & sons",
// "C.krishniah chetty Jewellers",
// "C.krishniah chetty & sons Manufactures",
// "C.krishniah chetty & sons",
// "C.krishniah chetty charitable Trust",
// "C.krishniah chetty Foundation",
// "CKC JEWELLER",
// "ckcjeweller",
// "ckc sons",
// "c.krishnah chetty",
// "c.k.c. groups",
// "jewel by CKC",
// "ckc jwellery",
// "ckc gold",
// "ckc ornaments"




// ];  // Add your keywords here

scrapeMultipleKeywords(keywords).then(data => {
    console.log('Scraping completed.');
});
