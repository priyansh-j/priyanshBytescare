const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const { resourceLimits } = require('worker_threads');

// Add Stealth plugin to Puppeteer
puppeteer.use(StealthPlugin());



// Helper function to add delay
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

const scrapeGoogleAds = async (keyword) => {
  const url = `https://adstransparency.google.com/?region=GB&domain=${keyword}`;
  const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
  const page = await browser.newPage();

  try {
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the creative-preview elements to load
    await page.waitForSelector('creative-preview', { timeout: 60000 });

    console.log('Initial creative-preview elements loaded.');

    // Click the "See All Ads" button to load additional elements
    const seeAllAdsButtonSelector = 'material-button.grid-expansion-button';
    const buttonExists = await page.$(seeAllAdsButtonSelector);
    if (buttonExists) {
      await page.click(seeAllAdsButtonSelector);
      console.log('Clicked the "See All Ads" button.');
      await delay(5000); // Wait for additional elements to load
    } else {
      console.log('See All Ads button not found.');
    }

    // Scroll to load all dynamically loaded elements
    console.log('Scrolling to load all creative-preview elements...');
    let previousHeight;
    let currentHeight = await page.evaluate(() => document.body.scrollHeight);

    do {
      previousHeight = currentHeight;
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await delay(2000); // Delay to allow content to load
      currentHeight = await page.evaluate(() => document.body.scrollHeight);
    } while (currentHeight > previousHeight);

    console.log('Finished scrolling. Extracting data from all creative-preview elements.');

    // Extract ad data
    const adsData = await page.evaluate(() => {
      const adElements = document.querySelectorAll('creative-preview');
      const ads = [];

      adElements.forEach((ad) => {
        const adInfo = {};

        // Extract advertisement link
        const linkElement = ad.querySelector('a');
        adInfo.adLink = linkElement ? linkElement.href : null;

        // Count iframes
        const iframeElements = ad.querySelectorAll('iframe');
        adInfo.iframeCount = iframeElements.length;

        ads.push(adInfo);
      });

      return ads;
    });

    for (const [index, ad] of adsData.entries()) {
      console.log(`Processing ad ${index + 1} with ${ad.iframeCount} iframes...`);
      console.log(`Ad Link: ${ad.adLink}`);

      if (ad.adLink) {
        // Locate the iframe associated with the ad link
        const iframeHandle = await page.evaluateHandle((adLink) => {
          const creativePreviewElement = Array.from(document.querySelectorAll('creative-preview')).find(
            (el) => el.querySelector('a')?.href === adLink
          );

          if (creativePreviewElement) {
            return creativePreviewElement.querySelector('iframe');
          }
          return null;
        }, ad.adLink);

        if (iframeHandle) {
          const iframe = await iframeHandle.asElement().contentFrame();

          if (iframe) {
            console.log(`Extracting data from iframe of ad ${index + 1}...`);

            const extractedData = await iframe.evaluate(() => {
              const title = document.querySelector('div.XF4BTe.wHYXAf')?.textContent || 'N/A';
              const image = document.querySelector('img.u07Ndb')?.src || 'N/A';
              const advertiserName = document.querySelector('div.ktRTDc.cN4mZc')?.textContent || 'N/A';
              const advertisedBy = document.querySelector('div.JzrAMe.cN4mZc.wHYXAf')?.textContent || 'N/A';

              return { title, image, advertiserName, advertisedBy };
            });

            ad.extractedIframeData = extractedData;
            console.log(`Extracted data for ad ${index + 1}:`, extractedData);
          } else {
            console.log(`No content frame found for iframe of ad ${index + 1}.`);
          }
        } else {
          console.log(`No iframe found for ad ${index + 1}.`);
        }
      } else {
        console.log(`Ad link not available for ad ${index + 1}.`);
      }
    }

    // Save the data to a JSON file
    const outputFilePath = `adsData_${keyword}.json`;
    fs.writeFileSync(outputFilePath, JSON.stringify(adsData, null, 2));

    console.log(`Ad data has been saved to ${outputFilePath}`);
  } catch (error) {
    console.error('Error while scraping:', error);
  } finally {
    await browser.close();
  }
};

// Example usage
const keyword ='CareToBeauty';  //example keyword
scrapeGoogleAds(keyword);