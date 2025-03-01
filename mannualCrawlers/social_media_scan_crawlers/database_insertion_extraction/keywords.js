const mysql = require('mysql');

// Define the userId as an array
const userId = ["013c9da0-ac34-11ed-90cd-e388ae025e87"];

// Create a new MySQL connection
const connection = mysql.createConnection({
    user: 'naxap',
    host: '34.100.197.62',
    database: 'interface',
    password: 'testyourmight.2893.gohanssj2',
    port: 3306, 
});

// Function to connect to the database and run the queries
function runQueries() {
    connection.connect(err => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return;
        }
        console.log('Connected to the database');

        // Define the first query
        const firstQuery = 'SELECT pid FROM interface.map WHERE rid = ? and ptable = "asset"';

        // Execute the first query with the userId as a parameter
        connection.query(firstQuery, userId, (err, results) => {
            if (err) {
                console.error('Error running first query:', err);
                connection.end();
                return;
            }
            
            // Extract PIDs from the results
            const pids = results.map(row => row.pid);

            if (pids.length === 0) {
                console.log('No PIDs found.');
                connection.end();
                return;
            }

            console.log('PIDs from first query:', pids);

            // Define the second query
            const secondQuery = 'SELECT pid FROM infinity.map WHERE rid IN (?) and ptable = "text_search"';

            // Execute the second query with the PIDs as a parameter
            connection.query(secondQuery, [pids], (err, results) => {
                if (err) {
                    console.error('Error running second query:', err);
                    connection.end();
                    return;
                }

                // Extract PIDs from the results of the second query
                const secondPids = results.map(row => row.pid);

                if (secondPids.length === 0) {
                    console.log('No PIDs found from second query.');
                    connection.end();
                    return;
                }

                console.log('PIDs from second query:', secondPids);

                // Define the third query
                const thirdQuery = 'SELECT * FROM infinity.text_search WHERE pid IN (?)';

                // Execute the third query with the PIDs from the second query
                connection.query(thirdQuery, [secondPids], (err, results) => {
                    if (err) {
                        console.error('Error running third query:', err);
                        connection.end();
                        return;
                    }

                    // Log the results of the third query
                    console.log('Results from third query:', results);

                    // Close the database connection
                    connection.end(err => {
                        if (err) {
                            console.error('Error closing the connection:', err);
                            return;
                        }
                        console.log('Database connection closed');
                    });
                });
            });
        });
    });
}

// Run the function
runQueries();
















// const mysql = require('mysql');

// // Define the userId as an array
// const userId = ["013c9da0-ac34-11ed-90cd-e388ae025e87"];

// // Create a new MySQL connection
// const connection = mysql.createConnection({
//     user: 'naxap',
//     host: '34.100.197.62',
//     database: 'interface',
//     password: 'testyourmight.2893.gohanssj2',
//     port: 3306, 
// });

// // Function to connect to the database and run the queries
// function runQueries() {
//     connection.connect(err => {
//         if (err) {
//             console.error('Error connecting to the database:', err);
//             return;
//         }
//         console.log('Connected to the database');

//         // Define the first query
//         const firstQuery = 'SELECT pid FROM interface.map WHERE rid = ? and ptable = "asset"';

//         // Execute the first query with the userId as a parameter
//         connection.query(firstQuery, userId, (err, results) => {
//             if (err) {
//                 console.error('Error running first query:', err);
//                 connection.end();
//                 return;
//             }
            
//             // Extract PIDs from the results
//             const pids = results.map(row => row.pid);

//             if (pids.length === 0) {
//                 console.log('No PIDs found.');
//                 connection.end();
//                 return;
//             }

//             console.log('PIDs:', pids);

//             // Define the second query
//             const secondQuery = 'SELECT pid FROM infinity.map WHERE rid IN (?) and ptable = "text_search"';

//             // Execute the second query with the PIDs as a parameter
//             connection.query(secondQuery, [pids], (err, results) => {
//                 if (err) {
//                     console.error('Error running second query:', err);
//                     connection.end();
//                     return;
//                 }

//                 // Log the results of the second query
//                 console.log('Results:', results);

//                 // Close the database connection
//                 connection.end(err => {
//                     if (err) {
//                         console.error('Error closing the connection:', err);
//                         return;
//                     }
//                     console.log('Database connection closed');
//                 });
//             });
//         });
//     });
// }

// // Run the function
// runQueries();















// const mysql = require('mysql');

// // Define the userId as an array
// const userId = ["013c9da0-ac34-11ed-90cd-e388ae025e87"];

// // Create a new MySQL connection
// const connection = mysql.createConnection({
//       user: 'naxap',
//     host: '34.100.197.62',
//     database: 'interface',
//     password: 'testyourmight.2893.gohanssj2',
//     port: 3306, 
// });

// // Function to connect to the database and run the query
// function runQuery() {
//     connection.connect(err => {
//         if (err) {
//             console.error('Error connecting to the database:', err);
//             return;
//         }
//         console.log('Connected to the database');

//         // Define the query
//         const query = 'SELECT pid FROM interface.map WHERE rid = ? and ptable = "asset"';
        
//         // Execute the query with the userId as a parameter
//         connection.query(query, userId, (err, results) => {
//             if (err) {
//                 console.error('Error running query:', err);
//                 return;
//             }
            
//             // Log the results
//             console.log(results);

//             // Close the database connection
//             connection.end(err => {
//                 if (err) {
//                     console.error('Error closing the connection:', err);
//                     return;
//                 }
//                 console.log('Database connection closed');
//             });
//         });
//     });
// }

// // Run the function
// runQuery();











