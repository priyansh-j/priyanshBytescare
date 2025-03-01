const axios = require('axios');
const fs = require('fs');

async function reddit(keywords) {
  try {
    // Initialize an empty object to store posts for each keyword
    let allPosts = {};

    // Iterate through each keyword
    for (let keyword of keywords) {
      let query = keyword;
      let after = '';
      let posts = [];

      // Fetch multiple pages of results for the current keyword
      for (let i = 0; i < 5; i++) { // You can adjust the number of pages as needed
        const url = `https://www.reddit.com/search.json?q=${query}&after=${after}`;

        // Send a GET request to the Reddit API
        const response = await axios.get(url);

        // Extract post details and add them to the posts array
        const postDetails = response.data.data.children.map(child => {
          const post = child.data;
          return {
            title: post.title,
            link: `https://www.reddit.com${post.permalink}`,
            time: new Date(post.created_utc * 1000).toISOString(),
            userProfile: `https://www.reddit.com/user/${post.author}`
          };
        });
        posts = posts.concat(postDetails);

        // Update the 'after' parameter for the next page
        after = response.data.data.after;

        // If there are no more pages, break the loop
        if (!after) {
          break;
        }
      }

      // Store posts for the current keyword in the allPosts object
      allPosts[keyword] = posts;
    }

    // Convert the allPosts object to a JSON string
    const jsonContent = JSON.stringify(allPosts, null, 2);

    // Write the JSON string to a file
    fs.writeFile('redditPosts.json', jsonContent, 'utf8', (err) => {
      if (err) {
        console.error('An error occurred while writing JSON to file:', err);
      } else {
        console.log('JSON file has been saved.');
      }
    });

  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

// Example usage:
const keywords = [ 
"india got latent private video",
"india got latent paid video",
"india got latent members content", 



];
reddit(keywords);












// const axios = require('axios');
// const fs = require('fs'); // Import the File System module

// async function reddit() {
//   try {
//     const query = 'pw'; // Your search query
//     let after = ''; // Initialize the 'after' parameter
//     let allPosts = []; // Initialize an array to store all posts

//     // Fetch multiple pages of results
//     for (let i = 0; i < 5; i++) { // Change the number of pages as needed
//       const url = `https://www.reddit.com/search.json?q=${query}`;
      
//       // Send a GET request to the Reddit API
//       const response = await axios.get(url);
      
//       // Extract post details and add them to the allPosts array
//       const postDetails = response.data.data.children.map(child => {
//         const post = child.data;
//         return {
//           title: post.title,
//           link: `https://www.reddit.com${post.permalink}`,
//           time: new Date(post.created_utc * 1000).toISOString(), // Convert timestamp to ISO string
//           userProfile: `https://www.reddit.com/user/${post.author}`,
//         };
//       });
//       allPosts = allPosts.concat(postDetails);

//       // Update the 'after' parameter for the next page
//       after = response.data.data.after;

//       // If there are no more pages, break the loop
//       if (!after) {
//         break;
//       }
//     }

//     // Convert the allPosts array to a JSON string
//     const jsonContent = JSON.stringify(allPosts, null, 2);

//     // Write the JSON string to a file
//     fs.writeFile('redditPosts.json', jsonContent, 'utf8', (err) => {
//       if (err) {
//         console.error('An error occurred while writing JSON to file:', err);
//       } else {
//         console.log('JSON file has been saved.');
//       }
//     });

//   } catch (error) {
//     console.error('An error occurred:', error.message);
//   }
// }

// reddit();
















