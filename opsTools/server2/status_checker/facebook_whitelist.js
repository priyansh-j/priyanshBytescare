const puppeteer = require('puppeteer');
// const puppeteer = require("puppeteer-extra");
// const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// puppeteer.use(StealthPlugin());
const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Function to wait for a specified amount of time
const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

// // Proxy configuration
const proxyConfig = {
    host: 'rotating.proxyempire.io',
    port: 5000,
    username: 'package-10001',
    password: 'YcxXUKUSyPIO5MRn',
    // username: "YcxXUKUSyPIO5MRn",
    // password: "wifi;;;;",
};

const proxyAgent = new HttpsProxyAgent(`http://${proxyConfig.username}:${proxyConfig.password}@${proxyConfig.host}:${proxyConfig.port}`);


// Debugging logs
const debugLog = (message, data = null) => {
    console.log(`[DEBUG] ${message}`);
    if (data !== null) {
        console.log(data);
    }
};

// extract user id from url
const extractUserIDFromUrl = async (url) => {
    console.log("INSIDE extractUserIDFromUrl");

    try {
        // 1️**Attempt to extract user ID from URL (set=pb, set=a)**
        const userIdFromSetPb = url.match(/set=pb\.([0-9]+)\./);
        const userIdFromSetA = url.match(/set=a\.([0-9]+)/);

        if (userIdFromSetPb) {
            debugLog(`Extracted UserID from URL using set=pb: ${userIdFromSetPb[1]}`);
            return userIdFromSetPb[1];
        } 
        if (userIdFromSetA) {
            debugLog(`Extracted UserID from URL using set=a: ${userIdFromSetA[1]}`);
            return userIdFromSetA[1];
        }

        // 2️**Extract from URL (Profiles, Groups, Pages)**
        const profileIdMatch = url.match(/facebook\.com\/profile\.php\?id=(\d+)/);
        const usernameMatch = url.match(/facebook\.com\/([^/?]+)\/(photos|videos|posts|about|friends|groups|likes)/);
        const groupIdMatch = url.match(/facebook\.com\/groups\/(\d+)(?:\/|$)/);
        const groupUsernameMatch = url.match(/facebook\.com\/groups\/([^/?]+)(?:\/|$)/);

        if (profileIdMatch) {
            debugLog(`Extracted Profile User ID from URL: ${profileIdMatch[1]}`);
            return profileIdMatch[1];
        } 
        if (usernameMatch && usernameMatch[1] !== 'profile.php' && usernameMatch[1] !== 'groups') {
            const username = usernameMatch[1].split('?')[0]; // Remove query params
            debugLog(`Extracted Username from URL: ${username}`);
            return username;
        } 
        if (groupIdMatch) {
            debugLog(`Extracted Group ID from URL: ${groupIdMatch[1]}`);
            return groupIdMatch[1];
        } 
        if (groupUsernameMatch && groupUsernameMatch[1] !== 'groups') {
            debugLog(`Extracted Group Username from URL: ${groupUsernameMatch[1]}`);
            return groupUsernameMatch[1];
        }

        debugLog("No userID or username found in URL. Attempting to fetch the page and extract from canonical link...");
        
        // 3️**Fetch the page only if necessary (canonical fallback)**
        debugLog(`Fetching page: ${url}`);
        const response = await axios.get(url, { httpsAgent: proxyAgent });
        const html = response.data;
        const $ = cheerio.load(html);

        debugLog("HTML fetched successfully. Parsing for canonical link...");
        const canonicalLink = $('link[rel="canonical"]').attr('href');
        console.log("Canonical Link Found:", canonicalLink);

        if (canonicalLink) {
            debugLog(`Found canonical link: ${canonicalLink}`);
            const profileIdMatch = canonicalLink.match(/facebook\.com\/profile\.php\?id=(\d+)/);
            const profileUsernameMatch = canonicalLink.match(/facebook\.com\/([^/]+)(?:\/|$)/);
            const groupIdMatch = canonicalLink.match(/facebook\.com\/groups\/(\d+)(?:\/|$)/);
            const groupUsernameMatch = canonicalLink.match(/facebook\.com\/groups\/([^/?]+)(?:\/|$)/);

            if (profileIdMatch) {
                debugLog(`Extracted Profile User ID from canonical link: ${profileIdMatch[1]}`);
                return profileIdMatch[1];
            } 
            if (profileUsernameMatch && profileUsernameMatch[1] !== 'profile.php' && profileUsernameMatch[1] !== 'groups') {
                debugLog(`Extracted Profile Username from canonical link: ${profileUsernameMatch[1]}`);
                return profileUsernameMatch[1];
            } 
            if (groupIdMatch) {
                debugLog(`Extracted Group ID from canonical link: ${groupIdMatch[1]}`);
                return groupIdMatch[1];
            } 
            if (groupUsernameMatch && groupUsernameMatch[1] !== 'groups') {
                debugLog(`Extracted Group Username from canonical link: ${groupUsernameMatch[1]}`);
                return groupUsernameMatch[1];
            }
        }

        debugLog("No valid user or group ID/username found.");
    } catch (error) {
        debugLog(`Error fetching the URL ${url}:`, error.message);
    }

    return null;
};

// process official links
const Official_Links_Processing = async (urls) => {
    console.log("INSIDE Official_Links_Processing")
    for (const url of urls) {
        let username = null;
        let userID = null;
        if (url.includes('profile.php?id=')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            userID = urlParams.get('id');
        } else {
            userID = await getUserIDFromURL(url);
            const urlParts = url.split('/');
            username = urlParts[urlParts.length - 1];
        }
        if (username) Official_usernames.push(username);
        if (userID) Official_userIds.push(userID);
        if (username || userID) {
            OfficialLinks_Data.push({ url, username: username || null, userID: userID || null });
        } else {
            Unknown_OfficialLinks_Data.push(url);
        }
    }
    return { Official_usernames, Official_userIds, OfficialLinks_Data, Unknown_OfficialLinks_Data };
};


const getUserIDFromURL = async (url) => {
    console.log("INSIDE getUserIDFromURL");
    try {
        debugLog(`Fetching URL: ${url}`);
        const response = await axios.get(url, { httpsAgent: proxyAgent });
        const html = response.data;
        const $ = cheerio.load(html);
        debugLog("HTML fetched successfully. Parsing for userID and username...");
        let userID = null;
        let username = null;
        $('script').each((i, script) => {
            const scriptContent = $(script).html();
            const userIDMatch = scriptContent && scriptContent.match(/"userID":"(\d+)"/);
            if (userIDMatch) {
                userID = userIDMatch[1];
                debugLog(`Found userID: ${userID}`);
                return false; 
            }
        });
        const canonicalLink = $('link[rel="canonical"]').attr('href');
        if (canonicalLink) {
            debugLog(`Found canonical link: ${canonicalLink}`);
            const profileIdMatch = canonicalLink.match(/facebook\.com\/profile\.php\?id=(\d+)/);
            const profileUsernameMatch = canonicalLink.match(/facebook\.com\/([^/]+)(?:\/|$)/);
            const groupIdMatch = canonicalLink.match(/facebook\.com\/groups\/(\d+)(?:\/|$)/);
            const groupUsernameMatch = canonicalLink.match(/facebook\.com\/groups\/([^/?]+)(?:\/|$)/);

            if (profileIdMatch && profileIdMatch[1]) {
                userID = profileIdMatch[1];
                debugLog(`Extracted Profile User ID: ${userID}`);
            }
            else if (profileUsernameMatch && profileUsernameMatch[1] && profileUsernameMatch[1] !== 'profile.php' && profileUsernameMatch[1] !== 'groups') {
                username = profileUsernameMatch[1];
                debugLog(`Extracted Profile Username: ${username}`);
            }
            else if (groupIdMatch && groupIdMatch[1]) {
                userID = groupIdMatch[1];
                debugLog(`Extracted Group ID: ${userID}`);
            }
            else if (groupUsernameMatch && groupUsernameMatch[1] && groupUsernameMatch[1] !== 'groups') {
                username = groupUsernameMatch[1];
                debugLog(`Extracted Group Username: ${username}`);
            }
        }

        if (!userID && !username) {
            debugLog(`No userID or username found for URL: ${url}`);
        }

        return { userID, username };
    } catch (error) {
        debugLog(`Error fetching the page ${url}:`, error.message);
        return { userID: null, username: null };
    }
};

const getUsernameFromReelLink = async (url) => {
    console.log("INSIDE getUsernameFromReelLink")
    try {
        debugLog(`Fetching reel link: ${url}`);
        const response = await axios.get(url, {
            httpsAgent: proxyAgent
        });
        const html = response.data;
        const $ = cheerio.load(html);
        debugLog("HTML fetched successfully. Parsing for canonical link...");
        const canonicalLink = $('link[rel="canonical"]').attr('href');

        if (canonicalLink) {
            debugLog(`Found canonical link: ${canonicalLink}`);
            const profileIdMatch = canonicalLink.match(/facebook\.com\/profile\.php\?id=(\d+)/);
            const profileUsernameMatch = canonicalLink.match(/facebook\.com\/([^/]+)(?:\/|$)/);
            const groupIdMatch = canonicalLink.match(/facebook\.com\/groups\/(\d+)(?:\/|$)/);
            const groupUsernameMatch = canonicalLink.match(/facebook\.com\/groups\/([^/?]+)(?:\/|$)/);

            if (profileIdMatch && profileIdMatch[1]) {
                const userId = profileIdMatch[1];
                debugLog(`Extracted Profile User ID: ${userId}`);
                return userId;
            }
            else if (profileUsernameMatch && profileUsernameMatch[1] && profileUsernameMatch[1] !== 'profile.php') {
                const username = profileUsernameMatch[1];
                debugLog(`Extracted Profile Username: ${username}`);
                return username;
            }
            else if (groupIdMatch && groupIdMatch[1]) {
                const groupID = groupIdMatch[1];
                debugLog(`Extracted Group ID: ${groupID}`);
                return groupID;
            }
            else if (groupUsernameMatch && groupUsernameMatch[1] && groupUsernameMatch[1] !== 'groups') {
                const groupUsername = groupUsernameMatch[1];
                debugLog(`Extracted Group Username: ${groupUsername}`);
                return groupUsername;
            }
        }

        debugLog(`No valid user or group ID/username found for reel: ${url}`);
    } catch (error) {
        debugLog(`Error fetching the reel URL ${url}:`, error.message);
    }
    return null;
};

const processSubmittedLinks = (submittedLinks, officialUsernames, officialUserIds) => {
    console.log("INSIDE processSubmittedLinks")
    submittedLinks.forEach(link => {
        const userIdMatch = extractUserIDFromUrl(link.url);
        const extractedUserId = userIdMatch ? userIdMatch[1] : null;
        console.log('Extracted User ID:', extractedUserId);
        if ((link.username && officialUsernames.includes(link.username)) ||
            (link.username && officialUserIds.includes(link.username))) {
            Whitelist_Links.push(link.url);
        } else if (link.userID && officialUserIds.includes(link.userID)) {
            Whitelist_Links.push(link.url);
        }
        else if (extractedUserId && officialUserIds.includes(extractedUserId)) {
            Whitelist_Links.push(link.url);
        } else {
            console.log("PUSHING TO NON-WHITELIST", Non_Whitelist_Links.push(link.url))
            Non_Whitelist_Links.push(link.url);
        }
    });
};

const processFacebookWhitelist = async (submitted_urls, official_urls, filePath) => {
    const submitted_userlinks = [];
    const unknown_submitted_links = [];

    const Official_usernames = [];
    const Official_userIds = [];
    const OfficialLinks_Data = [];
    const Unknown_OfficialLinks_Data = [];

    const Whitelist_Links = [];
    const Non_Whitelist_Links = [];

    submitted_urls = [...new Set(submitted_urls)];
    official_urls = [...new Set(official_urls)];

    console.log('Submitted URLs:', submitted_urls);
    console.log('Official URLs:', official_urls);
    const Official_Group_Ids = [];
    const Official_Group_Usernames = [];
    official_urls.forEach(url => {
        const groupIdMatch = url.match(/groups\/(\d+)(?:\/|$)/); 
        const groupUsernameMatch = url.match(/groups\/([^/?]+)(?:\/|$)/);

        if (groupIdMatch) {
            Official_Group_Ids.push(groupIdMatch[1]);
        } else if (groupUsernameMatch) { 
            Official_Group_Usernames.push(groupUsernameMatch[1]);
        }
    });
    console.log("Official Group IDs:", Official_Group_Ids);
    console.log("Official Group Usernames:", Official_Group_Usernames);

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            `--proxy-server=http://${proxyConfig.host}:${proxyConfig.port}`,
        ]
    });

    for (const url of submitted_urls) {
        console.log(`Processing URL: ${url}`);
        const userIdFromUrl = await extractUserIDFromUrl(url);
        // Extract Group ID and Username from submitted URL
        const submittedGroupId = url.match(/groups\/(\d+)/)?.[1];
        const submittedGroupUsername = url.match(/groups\/([^/?]+)/)?.[1];

        console.log(` Extracted Submitted Group ID: ${submittedGroupId}`);
        console.log(` Extracted Submitted Group Username: ${submittedGroupUsername}`);

        if (
            (submittedGroupId && Official_Group_Ids.includes(submittedGroupId)) ||
            (submittedGroupUsername && Official_Group_Usernames.includes(submittedGroupUsername))
        ) {
            console.log(` Whitelisting Group Link: ${url}`);
            Whitelist_Links.push(url);
            continue;
        }

        // **Group URL Whitelisting Logic**
        if (submittedGroupId && Official_Group_Ids.includes(submittedGroupId)) {
            console.log(`Whitelisting Group Link: ${url}`);
            Whitelist_Links.push(url);
            continue;
        }
        if (userIdFromUrl) {
            submitted_userlinks.push({ url, userID: userIdFromUrl });
            continue;
        }

        if (url.includes('reel')) {
            const username = await getUsernameFromReelLink(url);
            if (username) {
                submitted_userlinks.push({ url, username });
            } else {
                unknown_submitted_links.push(url);
            }
        } else if (/facebook\.com\/[^/]+$/.test(url)) {
            const userID = await getUserIDFromURL(url);
            if (userID) {
                submitted_userlinks.push({ url, userID });
            } else {
                unknown_submitted_links.push(url);
            }
        } else {
            const page = await browser.newPage();
            await page.authenticate({ username: proxyConfig.username, password: proxyConfig.password });
            try {
                debugLog(`Navigating to URL with Puppeteer: ${url}`);
                await page.goto(url, { waitUntil: 'networkidle2' });
                await delay(2000);

                const result = await page.evaluate(() => {
                    const linkElement = document.querySelector('span.xt0psk2 a');
                    if (linkElement) {
                        const linkHref = linkElement.href;
                        const idMatch = linkHref.match(/\/(\d+)\//);
                        if (idMatch) {
                            return { type: 'userID', value: idMatch[1] };
                        } else {
                            return { type: 'link', value: linkHref };
                        }
                    }
                    return null;
                });

                if (result) {
                    debugLog(`Found result: ${JSON.stringify(result)}`);
                    if (result.type === 'userID') {
                        console.log(`Extracted User ID from ${url}: ${result.value}`);
                        submitted_userlinks.push({ url, userID: result.value });
                    } else if (result.type === 'link') {
                        console.log(`Extracted Link from ${url}: ${result.value}`);
                        const userID = await getUserIDFromURL(result.value);
                        if (userID) {
                            console.log(`Extracted User ID from link ${result.value}: ${userID}`);
                            submitted_userlinks.push({ url, userID });
                        } else {
                            console.log(`No User ID found for link ${result.value}`);
                            unknown_submitted_links.push(url);
                        }
                    }
                } else {
                    debugLog(`No result found for Puppeteer URL: ${url}`);
                    unknown_submitted_links.push(url);
                }
            } catch (error) {
                debugLog(`Error processing URL with Puppeteer: ${url}`, error.message);
                unknown_submitted_links.push(url);
            } finally {
                await page.close();
                await delay(2000);
            }
        }
    }

    await browser.close();


    debugLog("Final Results:");
    debugLog("Submitted User Links", submitted_userlinks);
    debugLog("Unknown Submitted Links", unknown_submitted_links);

    // Process Official URLs
    // await Official_Links_Processing(official_urls);
    for (const url of official_urls) {
        let username = null;
        let userID = null;
        if (url.includes('profile.php?id=')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            userID = urlParams.get('id');
            if (userID) {
                const result = await getUserIDFromURL(url);
                username = result.username;
            }
        } else {
            const result = await getUserIDFromURL(url);
            userID = result.userID;
            username = result.username;
        }
        if (username) Official_usernames.push(username);
        if (userID) Official_userIds.push(userID);
        if (username || userID) {
            OfficialLinks_Data.push({ url, username: username || null, userID: userID || null });
        } else {
            Unknown_OfficialLinks_Data.push(url);
        }
    }
    console.log('Official Usernames:', Official_usernames);
    console.log('Official User IDs:', Official_userIds);
    console.log('Unknown Official Links:', Unknown_OfficialLinks_Data);

    console.log("submitted_userlinks, Official_usernames, Official_userIds", submitted_userlinks, Official_usernames, Official_userIds)
    // processSubmittedLinks(submitted_userlinks, Official_usernames, Official_userIds);

    submitted_userlinks.forEach(link => {
        // const userIdMatch = link.url.match(/set=pb\.([0-9]+)\./);
        const userIdMatch = extractUserIDFromUrl(link.url);
        // const extractedUserId = userIdMatch ? userIdMatch[1] : null;
        const extractedUserId = typeof link.userID === 'string'
            ? link.userID
            : link.userID?.userID || null;

        const extractedUsername = typeof link.userID === 'object' && link.userID?.username
            ? link.userID.username.toLowerCase()
            : null;

        console.log("EXTRACTERD", extractedUserId)
        const lowercasedOfficialUsernames = Official_usernames.map(u => u.toLowerCase());
        if (
            (link.username && lowercasedOfficialUsernames.includes(link.username.toLowerCase())) || 
            (link.username && Official_userIds.includes(link.username))
        ) {
            console.log(` Whitelisted (Username Match): ${link.url}`);
            Whitelist_Links.push(link.url);
        }
        else if (link.userID && Official_userIds.includes(link.userID)) { 
            console.log(` Whitelisted (UserID Match): ${link.url}`);
            Whitelist_Links.push(link.url);
        }
        else if (
            (extractedUserId && lowercasedOfficialUsernames.includes(extractedUserId.toLowerCase())) ||
            (extractedUserId && Official_userIds.includes(extractedUserId)) 
        ) {
            console.log(`Whitelisted (Extracted ID Match): ${link.url}`);
            Whitelist_Links.push(link.url);
        }
        else if (
            extractedUsername && lowercasedOfficialUsernames.includes(extractedUsername) 
        ) {
            console.log(` Whitelisted (Extracted Username Match): ${link.url}`);
            Whitelist_Links.push(link.url);
        }
        else {
            console.log(` Non-Whitelisted: ${link.url}`);
            Non_Whitelist_Links.push(link.url);
        }
    });

    // Write to CSV
    const csvWriter = createCsvWriter({
        path: filePath,
        header: [
            { id: 'Whitelist_Links', title: 'Whitelist_Links' },
            { id: 'Non_Whitelist_Links', title: 'Non_Whitelist_Links' },
            { id: 'Unknown_Official_Links', title: 'Unknown_OfficialLinks_Data' },
            { id: 'Unknown_Submitted_Links', title: 'Unknown_Submitted_Links' }
        ],
        append: false
    });

    const maxLength = Math.max(
        Whitelist_Links.length,
        Non_Whitelist_Links.length,
        Unknown_OfficialLinks_Data.length,
        unknown_submitted_links.length
    );

    const data = [];
    for (let i = 0; i < maxLength; i++) {
        data.push({
            Whitelist_Links: Whitelist_Links[i] || '',
            Non_Whitelist_Links: Non_Whitelist_Links[i] || '',
            Unknown_Official_Links: Unknown_OfficialLinks_Data[i] || '',
            Unknown_Submitted_Links: unknown_submitted_links[i] || ''
        });
    }
    console.log("DATA", data)
    await csvWriter.writeRecords(data);

    console.log('CSV file written successfully:', filePath);
};

module.exports = {
    processFacebookWhitelist
};