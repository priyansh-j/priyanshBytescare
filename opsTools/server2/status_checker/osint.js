const moment = require('moment');
const dns = require('dns');
const whois = require('whois');
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const winston = require('winston');
const { format, transports } = winston;

const { SocksProxyAgent } = require('socks-proxy-agent');

const proxyUrl = "socks://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000";
const agent = new SocksProxyAgent(proxyUrl);
// Define custom format for console output
const consoleFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.printf(({ level, message, timestamp, stack }) => {
    const logMessage = stack || message;
    return `[${timestamp}:${level}] -> ${logMessage}`;
  })
);
// Define JSON format for file output
const fileFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);
// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'domain-info-scraper' },
  transports: [
    new transports.File({ filename: 'combined.log', format: fileFormat }),
    new transports.Console({ format: consoleFormat })
  ]
});


/**
 * Formats a date string into 'YYYY-MM-DD HH:mm:ss' format.
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string.
 */
const formatDate = (dateString) => {
  return moment(dateString).isValid() ? moment(dateString).format('YYYY-MM-DD HH:mm:ss') : '';
};



/**
 * Performs a WHOIS lookup with retries.
 * @param {string} query - The query for the WHOIS lookup.
 * @param {number} [retries=3] - The number of retry attempts.
 * @returns {Promise<string>} The WHOIS lookup data.
 */
// Function to retry WHOIS lookup
const whoisLookupWithRetry = (query, retries = 3) => {
  return new Promise((resolve, reject) => {
    const attemptLookup = (attempt) => {
      whois.lookup(query, {agent},(err, data) => {
        if (err) {
          if ((err.code === 'EAI_AGAIN' || err.code === 'ECONNREFUSED')&& attempt < retries) {
            logger.info(`Retrying WHOIS lookup for ${query}... (attempt ${attempt + 1})`);
            //console.log(`Retrying WHOIS lookup for ${query}... (attempt ${attempt + 1})`);
            setTimeout(() => attemptLookup(attempt + 1), 1000); // Retry after 1 second
          } else {
            reject(err);
          }
        } else {
          resolve(data);
        }
      });
    };
    attemptLookup(0);
  });
};


// Function to resolve domain to a single IP address (IPv4)
function resolveDomainIPv4(domain) {
  return new Promise((resolve, reject) => {
    dns.resolve4(domain, (err, addresses) => {
      if (err) reject(err);
      resolve(addresses && addresses.length > 0 ? addresses[0] : 'N/A'); // Handle undefined or empty array
    });
  });
}

// Function to resolve domain to a single IP address (IPv6)
function resolveDomainIPv6(domain) {
  return new Promise((resolve, reject) => {
    dns.resolve6(domain, (err, addresses) => {
      if (err) {
        if (err.code === 'ENODATA') {
          resolve('N/A'); // Handle no data found for IPv6
        } else {
          reject(err);
        }
      } else {
        resolve(addresses && addresses.length > 0 ? addresses[0] : 'N/A'); // Handle undefined or empty array
      }
    });
  });
}


/**
 * Retrieves WHOIS information for an IP address.
 * @param {string} ip - The IP address to lookup.
 * @returns {Promise<string>} The WHOIS information.
 */
const getWhoisInfo = (ip) => {
    return new Promise((resolve, reject) => {
      whois.lookup(ip, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  };
  

  /**
 * Retrieves ASN information for an IP address.
 * @param {string} ip - The IP address to lookup.
 * @returns {Promise<Object>} The ASN information.
 */
  const getAsnInfo = async (ip) => {
    try {
      const response = await axios.get(`https://ipinfo.io/${ip}/json`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  

  /**
 * Parses WHOIS data into a key-value object.
 * @param {string} data - The WHOIS data to parse.
 * @returns {Object} The parsed WHOIS information.
 */
  const parseWhoisData = (data) => {
    const lines = data.split('\n');
    const info = {};
    lines.forEach(line => {
      const [key, value] = line.split(':');
      if (key && value) {
        info[key.trim()] = value.trim();
      }
    });
    return info;
  };
  

  /**
 * Extracts a specific field from WHOIS data.
 * @param {string} key - The field key to extract.
 * @param {string} whoisData - The WHOIS data to search.
 * @returns {string} The extracted field value.
 */
  const extractField = (key, whoisData) => {
    try {
      const regex = new RegExp(`${key}:\\s*(.+)`);
      const match = whoisData.match(regex);
      const value = match ? match[1].trim() : '';
      return (value === 'REDACTED FOR PRIVACY' || value === 'Redacted For Privacy') ? '' : value;
    } catch (error) {
      logger.error(`Error extracting field ${key}: ${error.message}`);
      //console.error(`Error extracting field ${key}:`);
      return '';
    }
  };

  /**
 * Writes domain information to a CSV file.
 * @param {Array<Object>} results - The domain information results to write.
 * @returns {Promise<void>}
 */

  const writeToCsv = async (results) => {
    if (results.length === 0) {
      logger.info('No results to write.');
      //console.log('No results to write.');
      return;
    }
  
    // Dynamically create headers based on the number of domains
    const headers = [{ id: 'field', title: 'Field' }];
    results.forEach((result, index) => {
      headers.push({ id: `domain${index}`, title: `Domain ${index}` });
    });
   // headers.push({ id: 'error', title: 'Error' }); // Add an error column
    //headers.push({ id: 'error_domains', title: 'Error Domains' }); // Add error domains column
    const filePath = path.join(__dirname, 'public', 'domain_info.csv');
    const csvWriter = createCsvWriter({
      path:filePath,                                //'domain_info.csv',
      header: headers
    });
  
    // Dynamically create records based on the keys of the first result object
    const example = results[0].info;
    const records = Object.keys(example).map(key => {
      const record = { field: key };
      results.forEach((result, index) => {
        record[`domain${index}`] = result.info[key] || '';
      });
      return record;
    });
  
    try {
      await csvWriter.writeRecords(records);
      logger.info('CSV file was written successfully');
      //console.log('CSV file was written successfully');
    } catch (error) {
      logger.error(`Error writing to CSV file: ${error.message}`);
      //console.error('Error writing to CSV file:');   //, error
    }
  };

// Function to get the primary name server
function getPrimaryNameServer(domain) {
  return new Promise((resolve, reject) => {
    dns.resolveNs(domain, (err, addresses) => {
      if (err) {
        if (err.code === 'ENODATA') {
          resolve('N/A'); // Handle no data found
        } else {
          reject(err);
        }
      } else {
        resolve(addresses && addresses.length > 0 ? addresses[0] : 'N/A'); // Handle undefined or empty array
      }
    });
  });
}

// Function to get the primary MX server
function getPrimaryMxServer(domain) {
  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err) {
        if (err.code === 'ENODATA') {
          resolve('N/A'); // Handle no data found
        } else {
          reject(err);
        }
      } else {
        resolve(addresses && addresses.length > 0 ? addresses[0].exchange : 'N/A'); // Handle undefined or empty array
      }
    });
  });
}

// Function to get the primary A record
function getPrimaryARecord(domain) {
  return new Promise((resolve, reject) => {
    dns.resolve4(domain, (err, addresses) => {
      if (err) {
        if (err.code === 'ENODATA') {
          resolve('N/A'); // Handle no data found
        } else {
          reject(err);
        }
      } else {
        resolve(addresses && addresses.length > 0 ? addresses[0] : 'N/A'); // Handle undefined or empty array
      }
    });
  });
}

// Function to get the primary AAAA record
function getPrimaryAAAARecord(domain) {
  return new Promise((resolve, reject) => {
    dns.resolve6(domain, (err, addresses) => {
      if (err) {
        if (err.code === 'ENODATA') {
          resolve('N/A'); // Handle no data found for IPv6
        } else {
          reject(err);
        }
      } else {
        resolve(addresses && addresses.length > 0 ? addresses[0] : 'N/A'); // Handle undefined or empty array
      }
    });
  });
}

  /**
 * Gathers information for a single domain.
 * @param {string} domain - The domain to gather information for.
 * @returns {Promise<Object>} The gathered information.
 */
const gatherInfo = async (domain) => {
  try {
    // const ipAddress = await resolveDomainWithRetry(domain);
    // if (!ipAddress) {
    //   return { domain, info: {} };
    // }
    // logger.info(`IP address for ${domain}: ${ipAddress}`);
    // //console.log(`IP address for ${domain}: ${ipAddress}`);

    // const whoisInfo = await whoisLookupWithRetry(ipAddress);
    // const asnInfo = await getAsnInfo(ipAddress);
    // const parsedWhoisInfo = parseWhoisData(whoisInfo);

    const ipAddressV4 = await resolveDomainIPv4(domain);
    console.log(`IPv4 address for ${domain}: ${ipAddressV4}`);
    
    const whoisInfoV4 = await getWhoisInfo(ipAddressV4);
    const asnInfoV4 = await getAsnInfo(ipAddressV4);
    const parsedWhoisInfoV4 = parseWhoisData(whoisInfoV4);

    // Fetch IPv6 Information
    const ipAddressV6 = await resolveDomainIPv6(domain);
    console.log(`IPv6 address for ${domain}: ${ipAddressV6}`);
    
    const whoisInfoV6 = await getWhoisInfo(ipAddressV6);
    const asnInfoV6 = await getAsnInfo(ipAddressV6);
    const parsedWhoisInfoV6 = parseWhoisData(whoisInfoV6);

    // Fetch additional DNS records
    const primaryNameServer = await getPrimaryNameServer(domain);
    const primaryMxServer = await getPrimaryMxServer(domain);
    const primaryARecord = await getPrimaryARecord(domain);
    const primaryAAAARecord = await getPrimaryAAAARecord(domain);

    //const whoisInfoDomain = await whoisLookupWithRetry(domain);
    let whoisInfoDomain;
    try {
      whoisInfoDomain = await whoisLookupWithRetry(domain);
    } catch (error) {
      logger.error(`WHOIS lookup failed for ${domain}: ${error.message}`);
      whoisInfoDomain = null; // Set to null if WHOIS lookup fails
    }

    const info = {

      entry_id: '',
      website_domain: domain,
      // website_logo: '',
      // website_link: '',
      // store_name: '',
      // case_category: '',
      // associated_listing_name: '',
      // associated_listing_profile_link: '',
      // incident_date: '',
      // updated_at: '',
      // top_level_domain: '',
      // subdomain: '',
      // root_domain: '',
      // website_classification: '',
      // website_sub_classification: '',
      // violation_classification: '',
      // violating_content_classification: '',
      // violating_content_sub_classification: '',
      // violation_severity: '',
      // global_violating_entities: '',
      // local_violating_entities: '',
      // site_accessible_local: '',
      // site_accessible_proxy_vpn: '',
      // screenshots_recordings: '',
      // proxy_alias_site: '',
      // primary_domain: '',
      // legal_report: '',
      // reported_date: '',
      // approved_date: '',
      // resolved_date: '',
      // enforcement_outcome: '',
      // enforcement_outcome_description: '',
      // case_notes: '',
      server_ip_v4: ipAddressV4 || '',
      server_location_v4: (asnInfoV4.city + ', ' + asnInfoV4.region + ', ' + asnInfoV4.country) || '',
      reverse_dns_v4: parsedWhoisInfoV4['name'] || '',
      asn_number_v4: asnInfoV4.org.match(/AS\d+/)  || '',
      asn_name_v4: asnInfoV4.org || '',
      asn_registration_date_v4: '',
      asn_org_id_v4: parsedWhoisInfoV4['OrgId'] || '',
      asn_address_v4: parsedWhoisInfoV4['address'] || '',
      asn_city_v4: parsedWhoisInfoV4['city'] || '',
      asn_state_prov_v4: parsedWhoisInfoV4['state'] || '',
      asn_postal_code_v4: parsedWhoisInfoV4['postalCode'] || '',
      asn_country_v4: parsedWhoisInfoV4['country'] || asnInfoV4.country || '',
      reverse_ip_total_domains_v4: 'N/A' || '',
      asn_org_tech_handle_v4: parsedWhoisInfoV4['OrgTechHandle'] || '',
      asn_org_tech_name_v4: parsedWhoisInfoV4['OrgTechName'] || '',
      asn_org_tech_phone_v4: parsedWhoisInfoV4['OrgTechPhone'] || '',
      asn_org_tech_email_v4: parsedWhoisInfoV4['OrgTechEmail'] || '',
      asn_org_tech_ref_v4: parsedWhoisInfoV4['OrgTechRef'] || '',
      asn_org_abuse_handle_v4: parsedWhoisInfoV4['OrgAbuseHandle'] || '',
      asn_org_abuse_name_v4: parsedWhoisInfoV4['OrgAbuseName'] || '',
      asn_org_abuse_phone_v4: parsedWhoisInfoV4['OrgAbusePhone'] || '',
      asn_org_abuse_email_v4: parsedWhoisInfoV4['OrgAbuseEmail'] || '',
      asn_org_abuse_ref_v4: parsedWhoisInfoV4['OrgAbuseRef'] || '',
      public_reporting_email_v4: parsedWhoisInfoV4['OrgTechEmail'] || '',
      public_reporting_phone_v4: parsedWhoisInfoV4['OrgTechPhone'] || '',
      public_reporting_form_v4: '',
      hidden_isp_v4: '',
      hidden_isp_contact_v4: '',

      server_ip_v6: ipAddressV6,
      server_location_v6: asnInfoV6.city + ', ' + asnInfoV6.region + ', ' + asnInfoV6.country,
      reverse_dns_v6: parsedWhoisInfoV6['name'] || 'N/A',
      asn_number_v6: asnInfoV6.org.match(/AS\d+/)  || '',
      asn_name_v6: asnInfoV6.org,
      asn_registration_date_v6: 'N/A', // Not always available
      asn_org_id_v6: parsedWhoisInfoV6['OrgId'] || 'N/A',
      asn_address_v6: parsedWhoisInfoV6['address'] || 'N/A',
      asn_city_v6: parsedWhoisInfoV6['city'] || 'N/A',
      asn_state_prov_v6: parsedWhoisInfoV6['state'] || 'N/A',
      asn_postal_code_v6: parsedWhoisInfoV6['postalCode'] || 'N/A',
      asn_country_v6: parsedWhoisInfoV6['country'] || asnInfoV6.country,
      reverse_ip_total_domains_v6: 'N/A', // Requires specific reverse DNS service
      asn_org_tech_handle_v6: parsedWhoisInfoV6['OrgTechHandle'] || 'N/A',
      asn_org_tech_name_v6: parsedWhoisInfoV6['OrgTechName'] || 'N/A',
      asn_org_tech_phone_v6: parsedWhoisInfoV6['OrgTechPhone'] || 'N/A',
      asn_org_tech_email_v6: parsedWhoisInfoV6['OrgTechEmail'] || 'N/A',
      asn_org_tech_ref_v6: parsedWhoisInfoV6['OrgTechRef'] || 'N/A',
      asn_org_abuse_handle_v6: parsedWhoisInfoV6['OrgAbuseHandle'] || 'N/A',
      asn_org_abuse_name_v6: parsedWhoisInfoV6['OrgAbuseName'] || 'N/A',
      asn_org_abuse_phone_v6: parsedWhoisInfoV6['OrgAbusePhone'] || 'N/A',
      asn_org_abuse_email_v6: parsedWhoisInfoV6['OrgAbuseEmail'] || 'N/A',
      asn_org_abuse_ref_v6: parsedWhoisInfoV6['OrgAbuseRef'] || 'N/A',
      public_reporting_email_v6: parsedWhoisInfoV6['OrgTechEmail'] || 'N/A',
      public_reporting_phone_v6: parsedWhoisInfoV6['OrgTechPhone'] || 'N/A',
      public_reporting_form_v6: 'N/A', // Not always available
      hidden_isp_v6: 'N/A', // Requires specific service
      hidden_isp_contact_v6: 'N/A', // Requires specific service
         
      registry_domain_id: whoisInfoDomain ? extractField('Registry Domain ID', whoisInfoDomain) : null,
      registrar_whois_server: whoisInfoDomain ? extractField('Registrar WHOIS Server', whoisInfoDomain) : null,
      registrar_url: whoisInfoDomain ? extractField('Registrar URL', whoisInfoDomain) : null,
      domain_updated_date: whoisInfoDomain ? formatDate(extractField('Updated Date', whoisInfoDomain)) : null,
      domain_creation_date: whoisInfoDomain ? formatDate(extractField('Creation Date', whoisInfoDomain)) : null,
      registrar_name: whoisInfoDomain ? extractField('Registrar', whoisInfoDomain) : null,
      registrar_iana_id: whoisInfoDomain ? extractField('Registrar IANA ID', whoisInfoDomain) : null,
      registrar_abuse_contact_email: whoisInfoDomain ? extractField('Registrar Abuse Contact Email', whoisInfoDomain) : null,
      registrar_abuse_contact_phone: whoisInfoDomain ? extractField('Registrar Abuse Contact Phone', whoisInfoDomain) : null,
      registry_registrant_id: whoisInfoDomain ? extractField('Registry Registrant ID', whoisInfoDomain) : null,
      registrant_name: whoisInfoDomain ? extractField('Registrant Name', whoisInfoDomain) : null,
      registrant_organization: whoisInfoDomain ? extractField('Registrant Organization', whoisInfoDomain) : null,
      registrant_street: whoisInfoDomain ? extractField('Registrant Street', whoisInfoDomain) : null,
      registrant_city: whoisInfoDomain ? extractField('Registrant City', whoisInfoDomain) : null,
      registrant_state_province: whoisInfoDomain ? extractField('Registrant State/Province', whoisInfoDomain) : null,
      registrant_postal_code: whoisInfoDomain ? extractField('Registrant Postal Code', whoisInfoDomain) : null,    
      registrant_country: whoisInfoDomain ? extractField('Registrant Country', whoisInfoDomain) : null,
      registrant_phone: whoisInfoDomain ? extractField('Registrant Phone', whoisInfoDomain) : null,
      registrant_phone_ext: whoisInfoDomain ? extractField('Registrant Phone Ext', whoisInfoDomain) : null,
      registrant_fax: whoisInfoDomain ? extractField('Registrant Fax', whoisInfoDomain) : null,
      registrant_fax_ext: whoisInfoDomain ? '' : null,
      registrant_email: whoisInfoDomain ? extractField('Registrant Email', whoisInfoDomain) : null,
      registry_admin_id: whoisInfoDomain ? extractField('Registry Admin ID', whoisInfoDomain) : null,

      // registry_domain_id: extractField('Registry Domain ID', whoisInfoDomain),
      // registrar_whois_server: extractField('Registrar WHOIS Server', whoisInfoDomain),
      // registrar_url: extractField('Registrar URL', whoisInfoDomain),
      // domain_updated_date: formatDate(extractField('Updated Date', whoisInfoDomain)),
      // domain_creation_date: formatDate(extractField('Creation Date', whoisInfoDomain)),
      // registrar_name: extractField('Registrar', whoisInfoDomain),
      // registrar_iana_id: extractField('Registrar IANA ID', whoisInfoDomain),
      // registrar_abuse_contact_email: extractField('Registrar Abuse Contact Email', whoisInfoDomain),
      // registrar_abuse_contact_phone: extractField('Registrar Abuse Contact Phone', whoisInfoDomain),
      // registry_registrant_id: extractField('Registry Registrant ID', whoisInfoDomain),
      // registrant_name: extractField('Registrant Name', whoisInfoDomain),
      // registrant_organization: extractField('Registrant Organization', whoisInfoDomain),
      // registrant_street: extractField('Registrant Street', whoisInfoDomain),
      // registrant_city: extractField('Registrant City', whoisInfoDomain),
      // registrant_state_province: extractField('Registrant State/Province', whoisInfoDomain),
      // registrant_postal_code: extractField('Registrant Postal Code', whoisInfoDomain),    
      // registrant_country: extractField('Registrant Country', whoisInfoDomain),
      // registrant_phone: extractField('Registrant Phone', whoisInfoDomain),
      // registrant_phone_ext: extractField('Registrant Phone Ext', whoisInfoDomain),
      // registrant_fax: extractField('Registrant Fax', whoisInfoDomain),
      // registrant_fax_ext: '',
      // registrant_email: extractField('Registrant Email', whoisInfoDomain),
      // registry_admin_id: extractField('Registry Admin ID', whoisInfoDomain),

      PrimaryNameServer: primaryNameServer || 'N/A',
      PrimaryMxServer: primaryMxServer || 'N/A',
      PrimaryARecord: primaryARecord  || 'N/A',
      PrimaryAAAARecord: primaryAAAARecord || 'N/A',
    };
    logger.info(`Gathered info for ${domain}: ${JSON.stringify(info)}`);
    //console.log(`Gathered info for ${domain}: ${JSON.stringify(info)}`);
    return { domain, info };
  } catch (error) {
    logger.error(`Error in gatherInfo: ${error.message}`);
    throw error;
  }
};


/**
 * Gathers information for multiple domains.
 * @param {Array<string>} domains - The domains to gather information for.
 * @returns {Promise<Array<Object>>} The gathered information for all domains.
 */

const gatherInfoForDomains = async (domains) => {
  const results = [];
  for (const domain of domains) {
    
    try {
      const info = await gatherInfo(domain);
      results.push(info);
    } catch (error) {
      logger.error(`Failed to gather info for domain: ${domain}`);
    }
  }
  return results;
};

//Example of domains array
//const domains = ["arabseed.show","egydead.space","yalla-shoot-tv.vip","tv.buz-sport.com"];    

// Calling the function
// gatherInfoForDomains(domains)
//   .then(results => {
   
//     console.log("Gathered information for domains:", results);
//     writeToCsv(results);
//   })
//   .catch(error => {
//     console.error("An error occurred while gathering info for domains:", error);
//     //return { domain, info: { error: `Failed for this domain try again` } };
    
//   });

module.exports = {
  gatherInfoForDomains,
  writeToCsv
};