const mysql = require('mysql2/promise');
const fs = require('fs');

// Database configuration
const dbConfigInterface = {
    host: '34.100.197.62', // Replace with your host
    user: 'naxap', // Replace with your username
    password: 'testyourmight.2893.gohanssj2',
    database: 'interface' // Update with your database name
};

const dbConfigInfinity = {
    host: '34.100.197.62', // Replace with your host
    user: 'naxap', // Replace with your username
    password: 'testyourmight.2893.gohanssj2',
    database: 'infinity' // Update with your database name
};

// List of tables for interface
//prod
const interfaceTables = [
  "active_history",
  "asset",
  "asset_info",
  "client_verdict",
  "credentials",
  "email_queue",
  "events",
  "exclusion_list",
  "facebooktoken",
  "googletoken",
  "group_info",
  "labels",
  "login_history",
  "manual_contacts",
  "manual_source",
  "map",
  "notice",
  "notice_history",
  "notice_tracker",
  "payment_history",
  "payment_initiate",
  "promo_code",
  "scheduler",
  "temp_cred",
  "token_vault",
  "tracker",
  "url_files",
  "url_label",
  "url_label_history",
  "url_notes",
  "url_status",
  "url_status_history",
  "user",
  "user_profile",
  "user_profile_history",
  "user_settings"
];

// List of tables for infinity

//tables of prod
const infinityTables = [
    "alexa",
  "asn",
  "asset",
  "checked",
  "city",
  "contacts",
  "dns",
  "download_status",
  "download_type",
  "events",
  "files",
  "geo",
  "igdb_api",
  "images",
  "itunes_api",
  "map",
  "os",
  "playstore_api",
  "popups",
  "ports",
  "proxy",
  "redirect",
  "search",
  "search_engine_map",
  "search_engine_map_temp",
  "social_search",
  "socials",
  "temp_table",
  "text_house",
  "text_search",
  "torrent_monitor",
  "torrents",
  "trace_route",
  "vulnerability",
  "wappalyzer",
  "website_type",
  "whois",
  "whois_history",
  "youtube_api"
];

// Function to fetch row counts and write to CSV
async function fetchAndWriteRowCounts(dbConfig, tables, outputFile) {
    let connection;

    try {
        // Connect to the database
        connection = await mysql.createConnection(dbConfig);
        console.log(`Connected to the database: ${dbConfig.database}`);

        const rowCounts = [];

        for (const table of tables) {
            try {
                // Query to count rows in the current table
                const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
                rowCounts.push({ table_name: table, row_count: rows[0].count });
                console.log(`Table: ${table}, Rows: ${rows[0].count}`);
            } catch (err) {
                console.error(`Error fetching row count for table "${table}": ${err.message}`);
                rowCounts.push({ table_name: table, row_count: 'Error' });
            }
        }

        // Write results to CSV
        const csvContent = rowCounts.map(row => `${row.table_name},${row.row_count}`).join('\n');
        fs.writeFileSync(outputFile, `table_name,row_count\n${csvContent}`);
        console.log(`Data written to ${outputFile}`);

    } catch (err) {
        console.error('Database connection error:', err.message);
    } finally {
        // Close the connection
        if (connection) {
            await connection.end();
            console.log('Connection closed.');
        }
    }
}

// Fetch and write row counts for interface and infinity databases
fetchAndWriteRowCounts(dbConfigInterface, interfaceTables, 'interface.csv');
fetchAndWriteRowCounts(dbConfigInfinity, infinityTables, 'infinity.csv');





















// const mysql = require('mysql2/promise');

// // Database configuration
// const dbConfig = {
//   host: 'bytescare-test.cd5ys33hnzln.ap-south-1.rds.amazonaws.com',       // Replace with your host
//   user: 'root',            // Replace with your username
//   password: 'Ycq07Zq3M0v2jwHtLWXCnOIHUhjEMU',
//     //database: 'infinity'     // Update with your database name
//     database:'interface'
// };

// // list of tables for db interface
// // const tables = [
// //     "alexa", "asn", "asset", "checked", "city", "contacts", "dns", "download_status",
// //     "download_type", "events", "files", "geo", "igdb_api", "images", "itunes_api", "map",
// //     "new_contact", "new_source", "os", "playstore_api", "popups", "ports", "proxy",
// //     "redirect", "search", "search_engine_map", "search_engine_map_temp", "social_search",
// //     "socials", "temp_table", "text_house", "text_search", "torrent_monitor", "torrents",
// //     "trace_route", "vulnerability", "wappalyzer", "website_type", "whois", "whois_history", 
// //     "youtube_api"
// // ];


// //list of tables for interface
// const tables = [
//   "active_history", "asset", "asset_info", "auth_users", "client_verdict",
//   "credentials", "email_queue", "events", "exclusion_list", "exclusion_list_2",
//   "facebooktoken", "googletoken", "group_info", "labels", "login_history",
//   "manual_contacts", "manual_source", "map", "notice", "notice_history",
//   "notice_tracker", "payment_history", "payment_initiate", "promo_code",
//   "scheduler", "temp_cred", "token_vault", "tracker", "url_files", "url_label",
//   "url_label_history", "url_notes", "url_status", "url_status_history", "user",
//   "user_profile", "user_profile_history", "user_settings"
// ];

// async function fetchTableRowCounts() {
//     let connection;

//     try {
//         // Connect to the database
//         connection = await mysql.createConnection(dbConfig);
//         console.log('Connected to the database.');

//         const rowCounts = [];

//         for (const table of tables) {
//             try {
//                 // Query to count rows in the current table
//                 const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
//                 rowCounts.push({ table_name: table, row_count: rows[0].count });
//                 console.log(`Table: ${table}, Rows: ${rows[0].count}`);
//             } catch (err) {
//                 console.error(`Error fetching row count for table "${table}": ${err.message}`);
//                 rowCounts.push({ table_name: table, row_count: 'Error' });
//             }
//         }

//         // Log results
//         console.table(rowCounts);

//     } catch (err) {
//         console.error('Database connection error:', err.message);
//     } finally {
//         // Close the connection
//         if (connection) {
//             await connection.end();
//             console.log('Connection closed.');
//         }
//     }
// }

// // Run the function
// fetchTableRowCounts();

// // Database configuration
// // const dbConfig = {
// //   host: '34.126.212.167',       // Replace with your host
// //   user: 'root',            // Replace with your username
// //   password: 'Ycq07Zq3M0v2jwHtLWXCnOIHUhjEMU',    // Replace with your password
// // };

// // // Database name
// // const dbName = 'infinity'; // Replace with the database name you want to query

// // // Run the function
// // fetchTablesAndRowCounts(dbConfig, dbName);
