document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('loading');
    loading.style.display = 'none';  // Ensure loading spinner is hidden initially
});

let isScraping = false;

document.getElementById('scrapeButton').addEventListener('click', async () => {
    if (isScraping) {
        alert('Please wait for the current process to complete.');
        return;
    }

    isScraping = true;

    const asins = document.getElementById('asins').value.split('\n').map(asin => asin.trim()).filter(asin => asin);
    const loading = document.getElementById('loading');
    const downloadButton = document.getElementById('downloadButton');
    const copyButton = document.getElementById('copyButton');
    const scrapeButton = document.getElementById('scrapeButton');

    // Show loading spinner and hide buttons
    loading.style.display = 'inline-block';
    downloadButton.classList.add('hidden');
    copyButton.classList.add('hidden');
    scrapeButton.disabled = true;

    try {
        const response = await fetch('/amazon_seller', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ asins })
        });
        const data = await response.json();

        // Hide loading spinner and show buttons
        loading.style.display = 'none';
        downloadButton.classList.remove('hidden');
        copyButton.classList.remove('hidden');
        scrapeButton.disabled = false;

        displayResults(data.results);
    } catch (error) {
        console.error('Error:', error);
        loading.style.display = 'none';
        scrapeButton.disabled = false;
    }

    isScraping = false;
});

document.getElementById('downloadButton').addEventListener('click', async () => {
    const response = await fetch('/download-csv');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'results.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

document.getElementById('copyButton').addEventListener('click', () => {
    const table = document.getElementById('resultsTable');
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    alert('Table copied to clipboard');
});

function displayResults(results) {
    const tbody = document.getElementById('resultsTable').querySelector('tbody');
    tbody.innerHTML = '';
    results.forEach(result => {
        const row = document.createElement('tr');
        Object.values(result).forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
}
