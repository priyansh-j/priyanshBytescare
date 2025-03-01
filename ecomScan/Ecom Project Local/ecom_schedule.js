const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const cron = require('node-cron'); // Import node-cron
const clientConfigs = require('./clientConfigs'); // Import client configurations

require('dotenv').config();

const delay = (time) => {
    return new Promise(function(resolve) { 
      setTimeout(resolve, time);
    });
};

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

// Function to process each client based on its configuration
async function processClient(clientConfig) {
    const filePath = path.join(__dirname, 'client_data', `${clientConfig.client_name}.json`);
    const outputDir = path.join(__dirname, 'Output_Data', clientConfig.client_name);
    
    await deleteCrawlerFiles(outputDir, clientConfig.crawlers);
    await processJsonFile(filePath, clientConfig.client_name, clientConfig.crawlers, clientConfig.email_recipients);
    
    console.log(`Finished processing for ${clientConfig.client_name}`);
}

// Schedule each client according to their cron expression
clientConfigs.forEach(clientConfig => {
    cron.schedule(clientConfig.cron_schedule, () => {
        console.log(`Starting scheduled task for ${clientConfig.client_name}`);
        processClient(clientConfig);
    });
});

console.log('All cron jobs scheduled.');
