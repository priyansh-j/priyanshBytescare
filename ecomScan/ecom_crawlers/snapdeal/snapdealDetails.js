const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { Parser } = require("json2csv");

async function scrapeSnapdeal(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extracting product details
    const title = $("h1.pdp-e-i-head").text().trim();
    const mrp =
      $(".pdpCutPrice")
        .text()
        .match(/Rs.\s*(\d+)/)?.[1] || "N/A";
    const price = $(".payBlkBig").text().trim();
    const discount = $(".pdpDiscount span").text().trim();

    // Extract ISBN13, ISBN10, and Binding
    let isbn13 = "N/A",
      isbn10 = "N/A",
      binding = "N/A";
    $(".p-keyfeatures li").each((_, el) => {
      const text = $(el).text().trim();
      if (text.includes("ISBN13:")) isbn13 = text.split("ISBN13:")[1].trim();
      if (text.includes("ISBN10:")) isbn10 = text.split("ISBN10:")[1].trim();
      if (text.includes("Binding:")) binding = text.split("Binding:")[1].trim();
    });

    // Extracting cover image URL
    const coverImage = $(".cloudzoom").attr("bigsrc") || "N/A";

    return {
      url,
      title,
      mrp,
      price,
      discount,
      isbn13,
      isbn10,
      binding,
      coverImage,
    };
  } catch (error) {
    console.error("Error fetching the page:", error);
    return {
      url,
      title: "N/A",
      mrp: "N/A",
      price: "N/A",
      discount: "N/A",
      isbn13: "N/A",
      isbn10: "N/A",
      binding: "N/A",
      coverImage: "N/A",
    };
  }
}

async function main() {
  const inputString = `
https://www.snapdeal.com/product/hc-verma-physics-modern-abc/644830195442
https://www.snapdeal.com/product/concept-of-physics-by-hc/680040051401
https://www.snapdeal.com/product/hc-verma-modern-abc-and/643145038960
https://www.snapdeal.com/product/concepts-of-physics-volume-1/681242013414
https://www.snapdeal.com/product/concept-of-physics-part-1/683410638071
https://www.snapdeal.com/product/concept-of-physics-20182019-session/625107877752
https://www.snapdeal.com/product/concepts-of-physics-volume-1/634109290252
https://www.snapdeal.com/product/concepts-of-physics-vol-i/668773722223
https://www.snapdeal.com/product/concept-of-physics-20182019-session/663700266497
https://www.snapdeal.com/product/mathematics-for-class-10-by/676006197690
https://www.snapdeal.com/product/rs-aggarwal/675002535440
https://www.snapdeal.com/product/rsaggarwal-mathematics-class-11-rsaggarwal/623185172620
https://www.snapdeal.com/product/-r-s-aggarwal-mathematics/645623663019
https://www.snapdeal.com/product/secondary-school-mathematics-for-class/652869654272
https://www.snapdeal.com/product/r-s-aggarwals-secondary-school/635055696749
https://www.snapdeal.com/product/rs-aggarwal-mathematics-for-class/637203693714
https://www.snapdeal.com/product/secondary-school-mathematics-for-class/679759246062
https://www.snapdeal.com/product/rs-aggarwal/678893077558
https://www.snapdeal.com/product/bharati-bhawan-rs-aggarwal-mathematics/667850415728
https://www.snapdeal.com/product/secondary-school-mathematics-for-class/628972369131
https://www.snapdeal.com/product/mathematics-10th-rs-aggarwal-english/678611531485
https://www.snapdeal.com/product/mathematics-for-class-7-cbse/647622041553
https://www.snapdeal.com/product/rs-aggarwal/621414022144
https://www.snapdeal.com/product/secondary-school-mathematics-for-class/653512558658
https://www.snapdeal.com/product/r-s-aggarwalmathematics-for-class/625834228947
https://www.snapdeal.com/product/mathematics-for-class-6-cbse/628131829304
https://www.snapdeal.com/product/mathematics-for-class-6-cbse/650946576906
https://www.snapdeal.com/product/bharati-bhawan-cbse-r-s/662939008753
https://www.snapdeal.com/product/secondary-school-mathematics-for-class/680992053846
https://www.snapdeal.com/product/rs-aggarwal-senior-secondary-school/686112480824
https://www.snapdeal.com/product/mathematics-6th-rs-aggarwal/657788397860
https://www.snapdeal.com/product/mathematics-for-class-8-by/640145849045
https://www.snapdeal.com/product/mathematics-for-class-7-by/656381999806
https://www.snapdeal.com/product/mathematics-class-7-paperback-english/621506591992
https://www.snapdeal.com/product/secondary-school-mathematics-for-class/683196633707
https://www.snapdeal.com/product/secondary-school-mathematics-for-class/681060241149
https://www.snapdeal.com/product/mathematics-for-class-8-cbse/619132482163

    `;

  const urls = inputString
    .split("\n")
    .map((id) => id.trim())
    .filter((id) => id);

  const results = [];
  for (const url of urls) {
    const data = await scrapeSnapdeal(url);
    results.push(data);
  }

  // Convert to CSV
  const parser = new Parser();
  const csv = parser.parse(results);
  fs.writeFileSync("snapdeal_products.csv", csv);
  console.log("CSV file saved as snapdeal_products.csv");
}

main();
