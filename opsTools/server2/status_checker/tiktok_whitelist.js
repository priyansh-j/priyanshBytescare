const { createObjectCsvWriter } = require('csv-writer');

function processTikTokLinks(submittedLinks, officialLinks) {
    const officialUsernames = officialLinks.map(link => link.split('/')[3]);

    const Whitelist_Links = [];
    const Non_Whitelist_Links = [];
    const check_manual = [];

    submittedLinks.forEach(link => {
        const parts = link.split('/');
        const username = parts.length > 3 ? parts[3] : null;
        if (!username || !username.startsWith('@')) {
            check_manual.push(link);
        } else if (officialUsernames.includes(username)) {
            Whitelist_Links.push(link);
        } else {
            Non_Whitelist_Links.push(link);
        }
    });

    return {
        Whitelist_Links,
        Non_Whitelist_Links,
        check_manual
    };
}

function writeCsv(Whitelist_Links, Non_Whitelist_Links, check_manual, filePath) {
    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
            { id: 'whitelist_links', title: 'Whitelist Links' },
            { id: 'non_whitelist_links', title: 'Non-Whitelist Links' },
            { id: 'check_manual_links', title: 'Check Manual Links' }
        ]
    });

    const csvData = [];
    csvData.push({
        whitelist_links: Whitelist_Links.join('\n'),
        non_whitelist_links: Non_Whitelist_Links.join('\n'),
        check_manual_links: check_manual.join('\n')
    });

    return csvWriter.writeRecords(csvData);
}

module.exports = {
    processTikTokLinks,
    writeCsv
};







