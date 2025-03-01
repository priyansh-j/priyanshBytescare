module.exports = [
    {
        client_name: "pearson",
        crawlers: ["amazon", "flipkart", "amazon_seller", "flipkart_seller"],
        email_recipients: ["priyanshjain1203@gmail.com", ],   //"ankita.kumari@bytescare.com", "twinkle.gupta@bytescare.com"
        cron_schedule: "0 19 * * *" // Runs daily at midnight
    },
    
    {
        client_name: "test",
        crawlers: ["amazon", "flipkart", "meesho", "bookswagon", "sapna_online", "snapdeal"],
        email_recipients: ["priyanshjain1203@gmail.com"],
        cron_schedule: "45 18 * * *" // Runs daily at 6 AM
    },
    
];
