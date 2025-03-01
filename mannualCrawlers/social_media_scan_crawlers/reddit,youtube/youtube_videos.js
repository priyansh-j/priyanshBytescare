const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dataDirPath = path.join(__dirname, 'data');
const dataFilePath = path.join(dataDirPath, 'videoData.json');

async function fetchYouTubeData(search_keyword, filter) {
    const apiUrl = 'https://www.youtube.com/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false';

    const requestBody = {
        "context": {
            "client": {
                "hl": "en-GB",
                "gl": "IN",
                "clientName": "WEB",
                "clientVersion": "2.20230831.09.00"
            }
        },
        "query": search_keyword
    };

    const response = await axios.post(apiUrl, requestBody);

    // Use regular expression to extract videoId, thumbnail URL, title, views, time, and URL
    const regex = /"videoRenderer":\s*{[^}]*"videoId":"([^"]+)".*?"thumbnails":\s*\[{\s*"url":"([^"]+)".*?"title":\s*{\s*"runs":\s*\[{\s*"text":"([^"]+)".*?"label":"([^"]+ views [^"]+)"}}.*?"label":"([^"]+)"/g;

    const videoData = [];
    let match;
    while ((match = regex.exec(JSON.stringify(response.data))) !== null) {
        const videoId = match[1];
        const thumbnailUrl = match[2];
        const title = match[3];
        const timeSimpleText = match[5];
        const url = "https://www.youtube.com/watch?v=" + match[1];

        videoData.push({ videoId, thumbnailUrl, title, time: timeSimpleText, url });
    }

    const regex_token = /"continuationCommand":\s*{\s*"token":\s*"([^"]+)"/;
    const match_token = regex_token.exec(JSON.stringify(response.data));
    if (match_token !== null) {
        let token = match_token[1];

        let i = 0;
        let originalurl;

        if (filter === "Rating") {
            originalurl = "https://www.youtube.com/results?search_query=" + search_keyword + "+&sp=CAE%253D";
        } else if (filter === "View count") {
            originalurl = "https://www.youtube.com/results?search_query=" + search_keyword + "+&sp=CAM%253D";
        } else if (filter === "Upload date") {
            originalurl = "https://www.youtube.com/results?search_query=" + search_keyword + "+&sp=CAI%253D";
        } else if (filter === "latest") {
            originalurl = "https://www.youtube.com/results?search_query=" + search_keyword + "+&sp=EgIIAw%253D%253D";
        } else {
            originalurl = "https://www.youtube.com/results?search_query=" + search_keyword;
        }
        console.log(originalurl);
        while (token && i < 10) {
            // Create the request body with the current token
            const requestBody = {
                "context": {
                    "client": {
                        "hl": "en-IN",
                        "gl": "IN",
                        "clientName": "WEB",
                        "clientVersion": "2.20230911.01.00",
                        "originalUrl": originalurl
                    }
                },
                "continuation": token
            };

            // Make the API request
            const response = await axios.post(apiUrl, requestBody);

            const regex_token = /"continuationCommand":\s*{\s*"token":\s*"([^"]+)"/;
            const match_token = regex_token.exec(JSON.stringify(response.data));
            token = match_token ? match_token[1] : null; // Update token, set to empty if not found
            console.log(i, ":", token);

            // Use the regex to extract video information and add it to the allVideoData array
            const regex = /"videoRenderer":\s*{[^}]*"videoId":"([^"]+)".*?"thumbnails":\s*\[{\s*"url":"([^"]+)".*?"title":\s*{\s*"runs":\s*\[{\s*"text":"([^"]+)".*?"label":"([^"]+ views [^"]+)"}}.*?"label":"([^"]+)"/g;

            let match;
            while ((match = regex.exec(JSON.stringify(response.data))) !== null) {
                const videoId = match[1];
                const thumbnailUrl = match[2];
                const title = match[3];
                const timeSimpleText = match[5];
                const url = "https://www.youtube.com/watch?v=" + match[1];

                videoData.push({ videoId, thumbnailUrl, title, time: timeSimpleText, url });
            }

            i++;
        }
    }
    return videoData;
}

function saveToJsonFile(data, filePath) {
    // Ensure the directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Example usage
(async () => {
    const search_keywords = [
        
"latent members content", 



    ]; // Replace with your search keywords
    const filter = "latest"; // Replace with your desired filter

    const allVideoData = {};

    for (const keyword of search_keywords) {
        try {
            const videoData = await fetchYouTubeData(keyword, filter);
            allVideoData[keyword] = videoData;
        } catch (error) {
            console.error('Error fetching data for keyword:', keyword, error);
        }
    }

    saveToJsonFile(allVideoData, dataFilePath);
    console.log('Data saved to:', dataFilePath);
})();


















// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
// const dataFilePath = path.join(__dirname, 'data', 'videoData.json');

// async function fetchYouTubeData(search_keyword, filter) {
//     const apiUrl = 'https://www.youtube.com/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false';

//     const requestBody = {
//         "context": {
//             "client": {
//                 "hl": "en-GB",
//                 "gl": "IN",
//                 "clientName": "WEB",
//                 "clientVersion": "2.20230831.09.00"
//             }
//         },
//         "query": search_keyword
//     };

//     const response = await axios.post(apiUrl, requestBody);

//     // Use regular expression to extract videoId, thumbnail URL, title, views, time, and URL
//     const regex = /"videoRenderer":\s*{[^}]*"videoId":"([^"]+)".*?"thumbnails":\s*\[{\s*"url":"([^"]+)".*?"title":\s*{\s*"runs":\s*\[{\s*"text":"([^"]+)".*?"label":"([^"]+ views [^"]+)"}}.*?"label":"([^"]+)"/g;

//     const videoData = [];
//     let match;
//     while ((match = regex.exec(JSON.stringify(response.data))) !== null) {
//         const videoId = match[1];
//         const thumbnailUrl = match[2];
//         const title = match[3];
//         const timeSimpleText = match[5];
//         const url = "https://www.youtube.com/watch?v=" + match[1];

//         videoData.push({ videoId, thumbnailUrl, title, time: timeSimpleText, url });
//     }

//     const regex_token = /"continuationCommand":\s*{\s*"token":\s*"([^"]+)"/;
//     const match_token = regex_token.exec(JSON.stringify(response.data));
//     if (match_token !== null) {
//         let token = match_token[1];

//         let i = 0;
//         let originalurl;

//         if (filter === "Rating") {
//             originalurl = "https://www.youtube.com/results?search_query=" + search_keyword + "+&sp=CAE%253D";
//         } else if (filter === "View count") {
//             originalurl = "https://www.youtube.com/results?search_query=" + search_keyword + "+&sp=CAM%253D";
//         } else if (filter === "Upload date") {
//             originalurl = "https://www.youtube.com/results?search_query=" + search_keyword + "+&sp=CAI%253D";
//         } else if (filter === "latest") {
//             originalurl = "https://www.youtube.com/results?search_query=" + search_keyword + "+&sp=EgIIAw%253D%253D";
//         } else {
//             originalurl = "https://www.youtube.com/results?search_query=" + search_keyword;
//         }
//         console.log(originalurl);
//         while (token && i < 10) {
//             // Create the request body with the current token
//             const requestBody = {
//                 "context": {
//                     "client": {
//                         "hl": "en-IN",
//                         "gl": "IN",
//                         "clientName": "WEB",
//                         "clientVersion": "2.20230911.01.00",
//                         "originalUrl": originalurl
//                     }
//                 },
//                 "continuation": token
//             };

//             // Make the API request
//             const response = await axios.post(apiUrl, requestBody);

//             const regex_token = /"continuationCommand":\s*{\s*"token":\s*"([^"]+)"/;
//             const match_token = regex_token.exec(JSON.stringify(response.data));
//             token = match_token ? match_token[1] : null; // Update token, set to empty if not found
//             console.log(i, ":", token);

//             // Use the regex to extract video information and add it to the allVideoData array
//             const regex = /"videoRenderer":\s*{[^}]*"videoId":"([^"]+)".*?"thumbnails":\s*\[{\s*"url":"([^"]+)".*?"title":\s*{\s*"runs":\s*\[{\s*"text":"([^"]+)".*?"label":"([^"]+ views [^"]+)"}}.*?"label":"([^"]+)"/g;

//             let match;
//             while ((match = regex.exec(JSON.stringify(response.data))) !== null) {
//                 const videoId = match[1];
//                 const thumbnailUrl = match[2];
//                 const title = match[3];
//                 const timeSimpleText = match[5];
//                 const url = "https://www.youtube.com/watch?v=" + match[1];

//                 videoData.push({ videoId, thumbnailUrl, title, time: timeSimpleText, url });
//             }

//             i++;
//         }
//     }
//     return videoData;
// }

// function saveToJsonFile(data, filePath) {
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
// }

// // Example usage
// (async () => {
//     const search_keywords =    [ 
//         "indian railway introduce 110 pantry cars in upcoming years	",																								
// "Chenab Rail Bridge news",																																															
// "#indian railways latest news",																								
// "news related to priotrize train services",																								
// "Viral Senior citizen Harish Mehta and his son Jai Mehta committed suicide"
    
    
    
//     ]; // Replace with your search keywords
//     const filter = "Relevance"; // Replace with your desired filter

//     const allVideoData = {};

//     for (const keyword of search_keywords) {
//         try {
//             const videoData = await fetchYouTubeData(keyword, filter);
//             allVideoData[keyword] = videoData;
//         } catch (error) {
//             console.error('Error fetching data for keyword:', keyword, error);
//         }
//     }

//     saveToJsonFile(allVideoData, dataFilePath);
//     console.log('Data saved to:', dataFilePath);
// })();
















// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
// const dataFilePath = path.join(__dirname, 'data', 'videoData.json');



// async function fetchYouTubeData(search_keyword, filter) {
//     const apiUrl = 'https://www.youtube.com/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false';

//     const requestBody = {
//         "context": {
//             "client": {
//                 "hl": "en-GB",
//                 "gl": "IN",
//                 "clientName": "WEB",
//                 "clientVersion": "2.20230831.09.00"
//             }
//         },
//         "query": search_keyword
//     };

//     const response = await axios.post(apiUrl, requestBody);

//     // Use regular expression to extract videoId, thumbnail URL, title, views, time, and URL
//     const regex = /"videoRenderer":\s*{[^}]*"videoId":"([^"]+)".*?"thumbnails":\s*\[{\s*"url":"([^"]+)".*?"title":\s*{\s*"runs":\s*\[{\s*"text":"([^"]+)".*?"label":"([^"]+ views [^"]+)"}}.*?"label":"([^"]+)"/g;

//     const videoData = [];
//     let match;
//     while ((match = regex.exec(JSON.stringify(response.data))) !== null) {
//         const videoId = match[1];
//         const thumbnailUrl = match[2];
//         const title = match[3];
//         const timeSimpleText = match[5];
//         const url = "https://www.youtube.com/watch?v=" + match[1];

//         videoData.push({ videoId, thumbnailUrl, title, time: timeSimpleText, url });
//     }

//     const regex_token = /"continuationCommand":\s*{\s*"token":\s*"([^"]+)"/;
//     const match_token = regex_token.exec(JSON.stringify(response.data));
//     if (match_token !== null){
//         let token = match_token[1];

//         let i = 0;
//         let originalurl;

//         if (filter === "Rating") {
//             originalurl = "https://www.youtube.com/results?search_query=" + search_keyword + "+&sp=CAE%253D";
//         } else if (filter === "View count") {
//             originalurl = "https://www.youtube.com/results?search_query=" + search_keyword + "+&sp=CAM%253D";
//         } else if (filter === "Upload date") {
//             originalurl = "https://www.youtube.com/results?search_query=" + search_keyword + "+&sp=CAI%253D";
//         } 
//         else if(filter === "latest") {
//             originalurl = "https://www.youtube.com/results?search_query=" + search_keyword + "+&sp=EgIIAw%253D%253D";
//         } else {
//             originalurl = "https://www.youtube.com/results?search_query=" + search_keyword;
//         }
//         console.log(originalurl);
//         while (token && i<10) {
//             // Create the request body with the current token
//             const requestBody = {
//                 "context": {
//                     "client": {
//                         "hl": "en-IN",
//                         "gl": "IN",
//                         "clientName": "WEB",
//                         "clientVersion": "2.20230911.01.00",
//                         "originalUrl": originalurl
//                     }
//                 },
//                 "continuation": token
//             };

//             // Make the API request
//             const response = await axios.post(apiUrl, requestBody);

//             const regex_token = /"continuationCommand":\s*{\s*"token":\s*"([^"]+)"/;
//             const match_token = regex_token.exec(JSON.stringify(response.data));
//             token = match_token ? match_token[1] : null; // Update token, set to empty if not found
//             console.log(i,":",token);

//             // Use the regex to extract video information and add it to the allVideoData array
//             const regex = /"videoRenderer":\s*{[^}]*"videoId":"([^"]+)".*?"thumbnails":\s*\[{\s*"url":"([^"]+)".*?"title":\s*{\s*"runs":\s*\[{\s*"text":"([^"]+)".*?"label":"([^"]+ views [^"]+)"}}.*?"label":"([^"]+)"/g;

//             let match;
//             while ((match = regex.exec(JSON.stringify(response.data))) !== null) {
//                 const videoId = match[1];
//                 const thumbnailUrl = match[2];
//                 const title = match[3];
//                 const timeSimpleText = match[5];
//                 const url = "https://www.youtube.com/watch?v=" + match[1];

//                 videoData.push({ videoId, thumbnailUrl, title, time: timeSimpleText, url });
//             }

//             i++;
//         }
//     }
//     return videoData;
// }

// function saveToJsonFile(data, filePath) {
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
// }

// // Example usage
// (async () => {
//     const search_keyword = "assam elephant accident news"; // Replace with your search keyword
//     const filter = "Relevance"; // Replace with your desired filter

//     try {
//         const videoData = await fetchYouTubeData(search_keyword, filter);
//         //saveToJsonFile(videoData, dataFilePath);
//         fs.writeFileSync('video_data.json', JSON.stringify(videoData, null, 2));
//         console.log('Data saved to:', dataFilePath);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// })();



//         "assam elephant accident news",																									
//         "indian railway introduce 110 pantry cars in upcoming years	",																								
//         // "Chenab Rail Bridge news",																																															
//         // "#indian railways latest news",																								
//         // "news related to priotrize train services",																								
//         // "Viral Senior citizen Harish Mehta and his son Jai Mehta committed suicide"