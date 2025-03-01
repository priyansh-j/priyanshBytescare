// const fs = require('fs');
// const path = require('path');
// const nodemailer = require('nodemailer');

// // Input data
// const input = {
//     "client_name": "macmilan",
//     "crawlers": ["flipkart"], // Example: include both Amazon and Flipkart
//     "email_recipients": ["priyanshjain1203@gmail.com", "pj8438@srmist.edu.in"] // List of email addresses
// };

// // Construct the file path
// const filePath = path.join(__dirname, 'client_data', `${input.client_name}.json`);
// const outputDir = path.join(__dirname, 'Output_Data', input.client_name);

// // Function to delete specific files in a folder based on crawler names
// async function deleteCrawlerFiles(folderPath, crawlers) {
//     try {
//         const files = await fs.promises.readdir(folderPath);
//         for (const file of files) {
//             const fileBaseName = path.basename(file, path.extname(file));
//             if (crawlers.includes(fileBaseName)) {
//                 const filePath = path.join(folderPath, file);
//                 await fs.promises.unlink(filePath);
//                 console.log(`Deleted file: ${filePath}`);
//             }
//         }
//     } catch (err) {
//         console.error(`Error deleting files in folder '${folderPath}':`, err);
//     }
// }

// // Function to load and return the crawler module
// function loadCrawler(crawlerName) {
//     try {
//         const crawlerModulePath = path.join(__dirname, 'Crawlers', crawlerName);
//         return require(crawlerModulePath);
//     } catch (err) {
//         console.error(`Error loading crawler module '${crawlerName}':`, err);
//         return null;
//     }
// }

// // Function to read and process JSON file content
// async function processJsonFile(filePath, clientName, crawlers, emailRecipients) {
//     try {
//         const data = await fs.promises.readFile(filePath, 'utf8');
//         const jsonData = JSON.parse(data);
//         console.log('JSON file content:', jsonData);

//         // Process each item sequentially
//         for (const item of jsonData) {
//             for (const crawlerName of crawlers) {
//                 const crawler = loadCrawler(crawlerName);
//                 if (crawler) {
//                     await crawler.processItem(item, clientName);
//                 } else {
//                     console.error('Unsupported crawler:', crawlerName);
//                 }
//             }
//         }

//         // Send email after processing the files
//         sendEmailWithCSVs(clientName, crawlers, emailRecipients);
//     } catch (err) {
//         console.error('Error reading or processing the file:', err);
//     }
// }

// // Function to send email with CSV attachments
// async function sendEmailWithCSVs(clientName, crawlers, emailRecipients) {
//     // Configure the email transporter
//     const transporter = nodemailer.createTransport({
//         service: 'gmail.com',
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         }
//     });

//     // Collect attachments
//     const attachments = crawlers.map(crawler => {
//         const csvPath = path.join(__dirname, 'Output_Data', clientName, `${crawler}.csv`);
//         return {
//             filename: `${crawler}.csv`,
//             path: csvPath
//         };
//     });

//     // Define the email options
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: emailRecipients.join(','), // Join multiple email addresses with commas
//         subject: `Data for ${clientName}`,
//         text: 'Please find attached the CSV files for the crawlers.',
//         attachments: attachments
//     };

//     // Send the email
//     try {
//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully.');
//     } catch (error) {
//         console.error('Error sending email:', error);
//     }
// }

// // Main function to orchestrate the process
// async function main() {
//     await deleteCrawlerFiles(outputDir, input.crawlers);
//     await processJsonFile(filePath, input.client_name, input.crawlers, input.email_recipients);
// }

// // Run the main function
// main();












const fs = require('fs');
const path = require('path');

// Input data
const input = {
    "client_name": "test",
    "crawlers": ["amazon_seller","flipkart_seller"] // Example: include both Amazon and Flipkart
};

// Construct the file path
const filePath = path.join(__dirname, 'client_data', `${input.client_name}.json`);

// Function to load and return the crawler module
function loadCrawler(crawlerName) {
    try {
        const crawlerModulePath = path.join(__dirname, 'Crawlers', crawlerName);
        return require(crawlerModulePath);
    } catch (err) {
        console.error(`Error loading crawler module '${crawlerName}':`, err);
        return null;
    }
}

// Function to read and process JSON file content
async function processJsonFile(filePath, clientName, crawlers) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        console.log('JSON file content:', jsonData);

        // Process each item sequentially
        for (const item of jsonData) {
            for (const crawlerName of crawlers) {
                const crawler = loadCrawler(crawlerName);
                if (crawler) {
                    await crawler.processItem(item, clientName);
                } else {
                    console.error('Unsupported crawler:', crawlerName);
                }
            }
        }
    } catch (err) {
        console.error('Error reading or processing the file:', err);
    }
}

// Process the JSON file with the specified crawlers
processJsonFile(filePath, input.client_name, input.crawlers);













// const fs = require('fs');
// const path = require('path');

// // Input data

// const input = {
//     "client_name": "bharti_bhawan",
//     "crawlers": ["bookswagon"] // Example: include both Amazon and Flipkart
// };

// // Construct the file path
// const filePath = path.join(__dirname, 'client_data', `${input.client_name}.json`);

// // Function to load and return the crawler module
// function loadCrawler(crawlerName) {
//     try {
//         const crawlerModulePath = path.join(__dirname, 'Crawlers', crawlerName);
//         return require(crawlerModulePath);
//     } catch (err) {
//         console.error(`Error loading crawler module '${crawlerName}':`, err);
//         return null;
//     }
// }

// // Function to read and process JSON file content
// function processJsonFile(filePath, clientName, crawlers) {
//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading the file:', err);
//             return;
//         }
//         try {
//             const jsonData = JSON.parse(data);
//             console.log('JSON file content:', jsonData);

//             // Process each item with each specified crawler
//             jsonData.forEach(async item => {
//                 for (const crawlerName of crawlers) {
//                     const crawler = loadCrawler(crawlerName);
//                     if (crawler) {
//                         await crawler.processItem(item, clientName);
//                     } else {
//                         console.error('Unsupported crawler:', crawlerName);
//                     }
//                 }
//             });
//         } catch (parseErr) {
//             console.error('Error parsing JSON:', parseErr);
//         }
//     });
// }

// // Process the JSON file with the specified crawlers
// processJsonFile(filePath, input.client_name, input.crawlers);
















// const fs = require('fs');
// const path = require('path');

// // Input data
// const input = {
//     "client_name": "bharti_bhawan",
//     "crawlers": ["amazon"]
// };

// // Construct the file path
// const filePath = path.join(__dirname, 'client_data', `${input.client_name}.json`);

// // Load the Flipkart crawler
// const flipkartCrawler = require('./Crawlers/amazon');

// // Function to read and process JSON file content
// function processJsonFile(filePath, crawler) {
//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading the file:', err);
//             return;
//         }
//         try {
//             const jsonData = JSON.parse(data);
//             console.log('JSON file content:', jsonData);

//             // Process each item with the selected crawler
//             jsonData.forEach(async item => {
//                 if (crawler === 'amazon') {
//                     await flipkartCrawler.processItem(item, input.client_name);
//                 } else {
//                     console.error('Unsupported crawler:', crawler);
//                 }
//             });
//         } catch (parseErr) {
//             console.error('Error parsing JSON:', parseErr);
//         }
//     });
// }

// // Process the JSON file with the selected crawler
// processJsonFile(filePath, input.crawlers[0]);

