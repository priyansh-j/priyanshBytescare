const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// A delay function for pauses between requests
const delay = (time) => {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time);
    });
};

async function scrapeYahoo(keyword, numResults = 100) {
    let results = [];
    let currentPage = 1;

    while (results.length < numResults) {
        const startResult = (currentPage - 1) * 10 + 1;
        const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(keyword)}&b=${startResult}`;
        
        // Fetch the HTML using Axios
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
            }
        });
        
        // Add a delay for the next request to avoid rate-limiting
        await delay(2000);

        // Load the HTML into Cheerio
        const $ = cheerio.load(response.data);

        // Selector for each search result block within a list item <li>
        $('li').each((index, element) => {
            if (results.length >= numResults) return false;

            const titleElement = $(element).find('h3.title > a');
            const descriptionElement = $(element).find('div.compText p');
            const linkElement = titleElement.attr('href');
            const title = titleElement.text();
            const description = descriptionElement.text();

            if (title && linkElement && description) {
                results.push({
                    title: title.trim(),
                    link: linkElement.trim(),
                    description: description.trim()
                });
            }
        });

        // If no more results are found, exit the loop
        if ($('li').length === 0) break;
        
        currentPage++;
    }

    return results;
}

// Example usage
scrapeYahoo('physics wallah', 50).then(results => {
    // Write the results to a JSON file
    fs.writeFile('yahooSearchResults1.json', JSON.stringify(results, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('Results saved to yahooSearchResults.json');
        }
    });
}).catch(error => {
    console.error('Error:', error);
});
