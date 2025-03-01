
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

require('dotenv').config();
const delay = (time) => {
    return new Promise(function(resolve) { 
      setTimeout(resolve, time);
    });
};
// Input data: array of clients
const clients = [
    // {
    //     "client_name": "pearson",
    //     "crawlers": ["amazon","amazon_seller","flipkart","flipkart_seller"],
    //     "email_recipients": ["priyanshjain1203@gmail.com","twinkle.gupta@bytescare.com"]
    // },
    // {
    //     "client_name": "pearson_weekly",
    //     "crawlers": ["amazon","flipkart","amazon_seller","flipkart_seller"],
    //     "email_recipients": ["priyanshjain1203@gmail.com","twinkle.gupta@bytescare.com"]
    // },
    //  {
    //     "client_name": "test",
    //     "crawlers": ["amazon","flipkart","meesho","bookswagon","sapna_online","snapdeal"],
    //     "email_recipients": ["priyanshjain1203@gmail.com"]
    // },

     {
        "client_name": "gupta",
        "crawlers": ["amazon","flipkart","meesho","bookswagon","sapna_online","snapdeal"],        //
        "email_recipients": ["priyanshjain1203@gmail.com","twinkle.gupta@bytescare.com"]
    },

    // {
    //     "client_name": "bharti_bhawan",
    //     "crawlers": ["sapna_online"],   //"amazon","flipkart","meesho","bookswagon","sapna_online","snapdeal"
    //     "email_recipients": ["priyanshjain1203@gmail.com"]
    // },


// {
//         "client_name": "balaji",
//         "crawlers": ["amazon","flipkart","meesho","bookswagon","snapdeal"],   
//         "email_recipients": ["priyanshjain1203@gmail.com","mithun@bytescare.com","twinkle.gupta@bytescare.com"]

// }

    //  {
    //     "client_name": "avichal",
    //     "crawlers": ["amazon","flipkart","bookswagon","sapna_online","snapdeal"],<
    //     "email_recipients": ["priyanshjain1203@gmail.com","twinkle.gupta@bytescare.com"]
    // },
    // {
    //     "client_name": "macmilan",
    //     "crawlers": ["amazon","flipkart","bookswagon","sapna_online"],
    //     "email_recipients": ["priyanshjain1203@gmail.com"]
    // }

    //   {
    //     "client_name": "wolters",
    //     "crawlers": ["aibh"],
    //     "email_recipients": ["priyanshjain1203@gmail.com","twinkle.gupta@bytescare.com"]
    // },
    //  {
    //     "client_name": "test",
    //     "crawlers": ["amazon","flipkart","meesho","paytm","tataCliq"],    //  "amazon","flipkart","meesho"]
    //     "email_recipients": ["priyanshjain1203@gmail.com"]
    // }
];



// Function to delete specific files in a folder based on crawler names
async function deleteCrawlerFiles(folderPath, crawlers) {
    try {
        const files = await fs.promises.readdir(folderPath);
        for (const file of files) {
            const fileBaseName = path.basename(file, path.extname(file));
            if (crawlers.includes(fileBaseName)) {
                const filePath = path.join(folderPath, file);
                await fs.promises.unlink(filePath);
                console.log(`Deleted file: ${filePath}`);
            }
        }
    } catch (err) {
        console.error(`Error deleting files in folder '${folderPath}':`, err);
    }
}

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
async function processJsonFile(filePath, clientName, crawlers, emailRecipients) {
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
            await delay(2000);
        }

        // Send email after processing the files
        await sendEmailWithCSVs(clientName, crawlers, emailRecipients);
    } catch (err) {
        console.error('Error reading or processing the file:', err);
    }
}

// Function to send email with CSV attachments
async function sendEmailWithCSVs(clientName, crawlers, emailRecipients) {
    // Configure the email transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail.com',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Collect attachments
    const attachments = crawlers.map(crawler => {
        const csvPath = path.join(__dirname, 'Output_Data', clientName, `${crawler}.csv`);
        return {
            filename: `${crawler}.csv`,
            path: csvPath
        };
    });

    // Define the email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailRecipients.join(','), // Join multiple email addresses with commas
        subject: `Data for ${clientName}`,
        text: 'Please find attached the CSV files for the crawlers.',
        attachments: attachments
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Main function to orchestrate the process
async function main() {
    for (const client of clients) {
        const filePath = path.join(__dirname, 'client_data', `${client.client_name}.json`);
        const outputDir = path.join(__dirname, 'Output_Data', client.client_name);
        
        await deleteCrawlerFiles(outputDir, client.crawlers);
        await processJsonFile(filePath, client.client_name, client.crawlers, client.email_recipients);
        
        // Delay of 15 seconds between each client
        console.log(`Waiting for 15 seconds before processing the next client...`);
        await delay(15000);
    }
}

// Run the main function
main();
