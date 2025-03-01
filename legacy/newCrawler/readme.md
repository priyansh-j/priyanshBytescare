# Overview
This service will consume queues and crawl the internet.

## Scan generation
- We generate scans for each asset for each cycle.
    - These scans also save keywords, platforms and status for each platform.
- After creation of these scans we add them to queues.
- Scan generation is run every minimum of all deltas.
    - The minimum delta of all the cycles that we have encountered till now is 3 hrs.
    - To cover the above case scan generations should run every 3hrs.

## Process queue
- We consume these items from the queue 
    - Scrape them
    - Save the results
    - Update the status.


## Steps to add a new platform

1. Add the platform scrapper at `./src/domain/scrappers/` and its exported and mapped in `./src/domain/scrappers/index.js`
2. Add the platform type, in `addKeywordsToQueue` usecase, the platforms shall be determined by keyword type and asset type.
    - Add the keyword type and asset type mapping in the `getPlatforms` fn in `addKeywordsToQueue` usescase.
3. The previous step added the platforms to the queue, now we need to add logic to process them.
    - The `./src/crawler.js` file is where the items in the queue are processed.
    - Ensure that platform to domain mapping exists for the platform being added, this is used to add same domain requests delay. 

