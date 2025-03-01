




const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');


const agent = new https.Agent({  
  rejectUnauthorized: false  // Bypasses SSL certificate verification
});
// Array of URLs to check
let proxies = {
  "http": "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000",
  "https": "http://package-10001:YcxXUKUSyPIO5MRn@rotating.proxyempire.io:5000",
     };
// const proxy = {
//   host: 'rotating.proxyempire.io',
//   port: 5000,
//   auth: {
//     username: 'package-10001',
//     password: 'YcxXUKUSyPIO5MRn'
//   }
// };
const urls = [
  // 'https://www.amazon.in/PRINCIPLES-PRACTICES-BANKING-DADA-96969/dp/B0CTYFG3B7/ref=sr_1_26',
  // 'https://www.amazon.in/Macmillan-CAIIB-Management-unknown_binding-Institute/dp/B0BTVPNX6K/ref=sr_1_59',
  // 'https://www.amazon.in/ADVANCED-BANK-MANAGEMENT-NVB-11QQ22WW33EE44RR55TT66YY77UU88II99OO00PP/dp/B0CYX5XYXG/ref=sr_1_7',
  // 'https://www.amazon.in/Bank-Financial-Management-IIBF/dp/9387000656/ref=sr_1_38_mod_primary_new'


  "https://www.amazon.in/Advanced-Bank-management-perfect-IIBF/dp/9356660271/ref=sr_1_1",
  "https://www.amazon.in/ADVANCED-MANAGEMENT-INSTITUTE-BANKING-FINANCE/dp/B0BY8WY32K/ref=sr_1_2",
  "https://www.amazon.in/CAIIB-ADVANCED-BANK-MANAGEMENT-DESCRIPTIVE-GROVER/dp/8193762487/ref=sr_1_3",
  "https://www.amazon.in/Advanced-management-Accounting-Financial-Management/dp/B0C5X6NYC5/ref=sr_1_4",
  "https://www.amazon.in/Advanced-Management-Institute-Banking-Finance/dp/0230330479/ref=sr_1_5",
  "https://www.amazon.in/Advanced-Management-Financial-Paperback-ARUNDEEP/dp/B0B3VL85FX/ref=sr_1_6",
  "https://www.amazon.in/CAIIB-ADVANCED-BANK-MANAGEMENT-OBJECTIVE-GROVER/dp/8193762495/ref=sr_1_7",
  "https://www.amazon.in/Advanced-bank-management-Guide-CAIIB/dp/8186141677/ref=sr_1_8",
  "https://www.amazon.in/Advanced-Management-English-Arundeep-Singh/dp/B07T8TMP7P/ref=sr_1_9",
  "https://www.amazon.in/ADVANCED-BANK-MANAGEMENT-NVB-Aakash/dp/B0CYX6Y8Z3/ref=sr_1_10",
  "https://www.amazon.in/Advanced-management-Business-Financial-Management/dp/B0C4YBMW9R/ref=sr_1_13",
  "https://www.amazon.in/Skylark-Publications-Advanced-Bank-Management/dp/938187381X/ref=sr_1_14",
  "https://www.amazon.in/ADVANCED-BANK-MANAGEMENT-NVB-11QQ22WW33EE44RR55TT66YY77UU88II99OO00PP/dp/B0CYX5XYXG/ref=sr_1_15",
  "https://www.amazon.in/CAIIB-Advanced-Bank-Management-12th/dp/B0B3JJX4H1/ref=sr_1_16",
  "https://www.amazon.in/CAIIB-Advanced-Management-Resources-Bullet-ebook/dp/B087394GTT/ref=sr_1_17",
  "https://www.amazon.in/Advanced-management-Retail-Banking-wealth/dp/B0C59Y5V5D/ref=sr_1_18",
  "https://www.amazon.in/Advanced-management-Indian-Economy-Financial/dp/B0C5B82TK1/ref=sr_1_19",
  "https://www.amazon.in/Bank-Financial-Management-Advanced-management/dp/B0C4Y9ZXFW/ref=sr_1_20",
  "https://www.amazon.in/Bank-Financial-Management-Advanced-Business/dp/B0C4YB56T2/ref=sr_1_21",
  "https://www.amazon.in/Human-Resource-Management-Advanced-management/dp/B0C53F86DT/ref=sr_1_22",
  "https://www.amazon.in/Risk-Management-Advanced-Bank-management/dp/B0C53LTJW9/ref=sr_1_23",
  "https://www.amazon.in/Macmillan-CAIIB-Financial-Management-unknown_binding/dp/B0BVVWJNPW/ref=sr_1_24",
  "https://www.amazon.in/Macmillan-Syllabus-Management-Regulations-Institute/dp/B0BVVRTN1D/ref=sr_1_25",
  "https://www.amazon.in/CAIIB-books-Financial-management-advanced/dp/B00NSMNNM4/ref=sr_1_26",
  "https://www.amazon.in/CAIIB-Paper-Management-Certified-Associate-ebook/dp/B0CMLWB7XV/ref=sr_1_29",
  "https://www.amazon.in/ADVANCED-BANK-MANAGEMENT-Financial-Management/dp/B0BVVZX1X8/ref=sr_1_30",
  "https://www.amazon.in/Macmillan-Advanced-Management-Information-Technology/dp/B0BTTH12WY/ref=sr_1_31",
  "https://www.amazon.in/dp/B0D4769BLS/ref=sr_1_32",
  "https://www.amazon.in/Guide-CAIIB-Multiple-Questions-Management/dp/B00RXAJSA8/ref=sr_1_33",
  "https://www.amazon.in/Bank-Financial-Management-perfect-IIBF/dp/935666028X/ref=sr_1_34",
  "https://www.amazon.in/Advanced-Business-Financial-Management-Regulations/dp/B0BVQJ5M2C/ref=sr_1_35",
  "https://www.amazon.in/Bank-Management-Control-Strategy-Professionals-ebook/dp/B00GICFZHM/ref=sr_1_36",
  "https://www.amazon.in/Bank-Management-Control-Strategy-Professionals-ebook/dp/B08933JQDG/ref=sr_1_35",
  "https://www.amazon.in/Advanced-Business-Financial-Management-perfect/dp/9356661944/ref=sr_1_36",
  "https://www.amazon.in/CAIIB-MACMILLAN-Management-unknown_binding-Institute/dp/B0BTTHKYGF/ref=sr_1_37",
  "https://www.amazon.in/CAIIB-Paper-Financial-Management-Certified/dp/9355569920/ref=sr_1_38",
  "https://www.amazon.in/Macmillan-CAIIB-Management-Financial-unknown_binding/dp/B0BVVQB1PZ/ref=sr_1_39",
  "https://www.amazon.in/Value-Risk-Bank-Capital-Management/dp/0123694663/ref=sr_1_40",
  "https://www.amazon.in/Management-Introduction-Financial-Retirement-Investment/dp/B09HLL8S5L/ref=sr_1_41",
  "https://www.amazon.in/CAIIB-Macmillan-New-Syllabus-unknown_binding/dp/B0BW7BTY7Z/ref=sr_1_42",
  "https://www.amazon.in/Quantitative-Aptitude-Competitive-Examinations-Revised/dp/9355012322/ref=sr_1_45",
  "https://www.amazon.in/Bank-Financial-Management-IIBF/dp/9387000656/ref=sr_1_46",
  "https://www.amazon.in/Advanced-Credit-Analysis-Management-Finance/dp/1118604911/ref=sr_1_47",
  "https://www.amazon.in/Bank-Communication-Management-SAP-4HANA-ebook/dp/B08KT5GCCC/ref=sr_1_48",
  "https://www.amazon.in/IIBF-CAIIB-Syllabus-Questions-Solutions/dp/B0C598TQ4C/ref=sr_1_49",
  "https://www.amazon.in/GMAT-Official-Advanced-Questions-GMAC/dp/8126519398/ref=sr_1_50",
  "https://www.amazon.in/Macmillan-Syllabus-Compulsory-Subjects-unknown_binding/dp/B0BWF64H6K/ref=sr_1_51",
  "https://www.amazon.in/Financial-Management-Institute-Banking-Finance/dp/0230330460/ref=sr_1_52",
  "https://www.amazon.in/Macmillan-CAIIB-Management-unknown_binding-Institute/dp/B0BTVPNX6K/ref=sr_1_51",
  "https://www.amazon.in/Master-Bank-Nifty-Psychology-Candlestick-ebook/dp/B0CP9CGJF1/ref=sr_1_52",
  "https://www.amazon.in/BANK-MANAGEMENT-FINANCIAL-SERVICES-8TH/dp/9339204816/ref=sr_1_53",
  "https://www.amazon.in/Advanced-Derivatives-Pricing-Management-Hands-ebook/dp/B005H89KA6/ref=sr_1_54",
  "https://www.amazon.in/Candlestick-Indicators-Entry-Exit-Management-Destination/dp/B0BWL2BQGS/ref=sr_1_55",
  "https://www.amazon.in/ADVANCED-BANK-MANAGEMENT-IIBF/dp/B00726U9LA/ref=sr_1_56",
  "https://www.amazon.in/Advanced-Handbook-Governance-Supervision-Australia/dp/9811617090/ref=sr_1_57",
  "https://www.amazon.in/Complete-Guide-Technical-Analysis-Candlestick/dp/9360128880/ref=sr_1_58",
  "https://www.amazon.in/Project-Management-Essentials-Always-Self-learning/dp/163651071X/ref=sr_1_61",
  "https://www.amazon.in/CAIIB-Advanced-Bank-Management-Book/dp/B08VWHWF6W/ref=sr_1_62",
  "https://www.amazon.in/ADVANCED-BANK-MANAGEMENT-Treasury-Management/dp/B0BQY7JL94/ref=sr_1_63",
  "https://www.amazon.in/FINANCIAL-MANAGEMENT-INSTITUTE-BANKING-FINANCE/dp/B0CZ78ZKL5/ref=sr_1_64",
  "https://www.amazon.in/Beat-Retail-Trader-Trade-banks-ebook/dp/B0CR9BVYFH/ref=sr_1_65",
  "https://www.amazon.in/Yogic-Management-Common-Diseases-Karmananda/dp/8185787247/ref=sr_1_66",
  "https://www.amazon.in/Science-Algorithmic-Trading-Portfolio-Management-ebook/dp/B00FQRWQMW/ref=sr_1_67",
  "https://www.amazon.in/Definitive-Guide-Advanced-Options-Trading-ebook/dp/B087ZZMY9Z/ref=sr_1_68",
  "https://www.amazon.in/Warren-Buffett-Accounting-Book-Statements/dp/1939370159/ref=sr_1_67",
  "https://www.amazon.in/Advanced-Approach-Data-Interpretation/dp/8121913594/ref=sr_1_68",
  "https://www.amazon.in/SMART-QUESTION-INTEL-REASONING-ENGLISH/dp/9355012128/ref=sr_1_69",
  "https://www.amazon.in/CAIIB-Advance-Bank-Management-Revision-ebook/dp/B07CRDMZ13/ref=sr_1_70",
  "https://www.amazon.in/CAIIB-Advanced-Bank-Management-Book/dp/B01M5E07NR/ref=sr_1_71",
  "https://www.amazon.in/Mastering-Bank-Guarantees-International-Trade-ebook/dp/B0CLJT5RX8/ref=sr_1_72",
  "https://www.amazon.in/Investment-Planning-Tax-Estate-2017/dp/9386394839/ref=sr_1_73",
  "https://www.amazon.in/ACCA-Advanced-Taxation-ATX-FA2020-ebook/dp/B08Z8LZKTS/ref=sr_1_74",
  "https://www.amazon.in/Advanced-Bank-Management-Objective-Questions/dp/8186141855/ref=sr_1_77",
  "https://www.amazon.in/ADVANCED-FINANCIAL-MANAGEMENT-Praveen-Suryavanshi-ebook/dp/B0968RJRP1/ref=sr_1_78",
  "https://www.amazon.in/GMAT-Official-Guide-2022-Bundle/dp/8126547367/ref=sr_1_79",
  "https://www.amazon.in/ACCA-Advanced-Taxation-Revision-Question-ebook/dp/B086QX6M2H/ref=sr_1_80",
  "https://www.amazon.in/Advanced-Bank-Management-Financial-Books/dp/8186141405/ref=sr_1_81",
  "https://www.amazon.in/Advanced-Income-Analysis-Moorad-Choudhry-ebook/dp/B014SOT4WS/ref=sr_1_82",
  "https://www.amazon.in/CAIIB-Advance-Bank-Management-Revision-ebook/dp/B07CRKVJWF/ref=sr_1_83",
  "https://www.amazon.in/COMBO-IIBF-Bank-Financial-Management-Regulations-Business/dp/B0BVQQ64W4/ref=sr_1_84",
  "https://www.amazon.in/Risk-Analysis-Insurance-Retirement-Planning/dp/9386394642/ref=sr_1_83",
  "https://www.amazon.in/Approach-REASONING-Verbal-Non-Verbal-Analytical/dp/932529947X/ref=sr_1_84",
  "https://www.amazon.in/205-ADVANCED-LEVEL-CALCULATION-EXERCISES-ebook/dp/B08QHNW8PZ/ref=sr_1_85",
  "https://www.amazon.in/GMAT-Official-Guide-2021-Bundle/dp/8126568011/ref=sr_1_86",
  "https://www.amazon.in/ADVANCED-FINANCIAL-MANAGEMENT-Illustrations-Studies/dp/B0CFHNSC6Y/ref=sr_1_87",
  "https://www.amazon.in/ACCA-Advanced-Financial-Management-Question/dp/1848081464/ref=sr_1_88",
  "https://www.amazon.in/ACCA-Advanced-Performance-Management-Question/dp/1848081472/ref=sr_1_89",
  "https://www.amazon.in/Excel-2019-Functions-Beginners-Spreadsheets-ebook/dp/B08MDJJYBD/ref=sr_1_90",
  "https://www.amazon.in/Skylark-Publications-Bank-Financial-Management/dp/B07HD3KRXP/ref=sr_1_93",
  "https://www.amazon.in/INFORMATION-TECHNOLOGY-DIGITAL-BANKING-IIBF-ebook/dp/B0BSHBLHW8/ref=sr_1_94",
  "https://www.amazon.in/ACCA-Advanced-Taxation-ATX-FA2021-ebook/dp/B09WZ4TMZ9/ref=sr_1_95",
  "https://www.amazon.in/IIMA-Economics-Satish-Y-Deodhar/dp/8184001630/ref=sr_1_96",
  "https://www.amazon.in/Non-Verbal-Analytical-Reasoning-Government-Entrance/dp/8196355963/ref=sr_1_97",
  "https://www.amazon.in/Quantitative-Aptitude-Competitive-Examinations-Aggarwal/dp/9352534026/ref=sr_1_98",
  "https://www.amazon.in/ACCA-Advanced-Taxation-ATX-FA2022-ebook/dp/B0C3DMH265/ref=sr_1_99",
  "https://www.amazon.in/Understanding-Derivatives-Instruments-Academic-Advanced-ebook/dp/B001YWNA8W/ref=sr_1_100",
  "https://www.amazon.in/Financial-Management-Questions-2023-24-English/dp/B0CMQXK5HB/ref=sr_1_6",
  "https://www.amazon.in/CAIIB-BANK-FINANCIAL-MANAGEMENT-GROVER/dp/8193762460/ref=sr_1_9",
  "https://www.amazon.in/CAIIB-BANK-FINANCIAL-MANAGEMENT-OBJECTIVE/dp/8193762479/ref=sr_1_10",
  "https://www.amazon.in/Regulations-Soulution-Financial-Management-Questions/dp/B0D427175V/ref=sr_1_13",
  "https://www.amazon.in/CAIIB-Bank-Financial-Management-12th/dp/B0B3JLXR3W/ref=sr_1_14",
  "https://www.amazon.in/Question-Financial-Management-Pradeepa-Ambuli/dp/9351611744/ref=sr_1_18",
  "https://www.amazon.in/IGNOU-Financial-Management-Depth-Student/dp/B0D29CR44P/ref=sr_1_19",
  "https://www.amazon.in/Financial-Management-Exams-Studies-Arundeep/dp/B0CZDZHCGK/ref=sr_1_20",
  "https://www.amazon.in/BANK-FINANCIAL-MANAGEMENT-NVB-Aakash/dp/B0CYX6KWBG/ref=sr_1_19",
  "https://www.amazon.in/MMPB-001-Financial-Management-IGNOU-Study/dp/B0CW9SPHZM/ref=sr_1_20",
  "https://www.amazon.in/Bank-Management-Financial-Services-bind/dp/0071267875/ref=sr_1_22",
  "https://www.amazon.in/BASIC-STATISTICS-MANAGEMENT-FINANCIAL-INSTITUTIONS/dp/0192849018/ref=sr_1_23",
  "https://www.amazon.in/Macmillan-Financial-Management-Regulations-unknown_binding/dp/B0BW7G77ZG/ref=sr_1_24",
  "https://www.amazon.in/Financial-Management-Questions-Question-Publications/dp/B09NW3CZRQ/ref=sr_1_26",
  "https://www.amazon.in/Bank-Financial-Management-Accounting-Bankers/dp/B0C5B8KT6B/ref=sr_1_29",
  "https://www.amazon.in/ADVANCED-BUSINESS-FINANCIAL-MANAGEMENT-IIBF-ebook/dp/B0BV372Q5G/ref=sr_1_31",
  "https://www.amazon.in/Intermediate-Financial-Management-Strategic-Syllabus/dp/9355869991/ref=sr_1_32",
  "https://www.amazon.in/Sanjay-Question-Financial-Management-Second/dp/B0BNKQQG4L/ref=sr_1_33",
  "https://www.amazon.in/Commercial-Financial-Management-Joseph-Sinkey/dp/0135210488/ref=sr_1_34",
  "https://www.amazon.in/Management-Financial-Services-Shuchi-Gautam/dp/8119843274/ref=sr_1_35",
  "https://www.amazon.in/Banking-Examination-2018-2019-Financial-Management/dp/B084ZBC21F/ref=sr_1_39",
  "https://www.amazon.in/Assistant-Professor-Economic-Adm-Financial-Management-Question/dp/B08Z7ZBS44/ref=sr_1_40",
  "https://www.amazon.in/Management-Financial-Services-Perry-Stinson/dp/1632407779/ref=sr_1_41",
  "https://www.amazon.in/BANK-FINANCIAL-MANAGEMENT-GUIDE-CAIIB/dp/8186141685/ref=sr_1_42",
  "https://www.amazon.in/Accounting-Standards-Financial-Institutions-Routledge/dp/103206353X/ref=sr_1_45",
  "https://www.amazon.in/Financial-Management-Tweflth-Pearson-Pandey/dp/939057725X/ref=sr_1_47",
  "https://www.amazon.in/Bank-Financial-Management-Strategies-Techniques/dp/0471849391/ref=sr_1_48",
  "https://www.amazon.in/Operational-Risk-Management-Financial-Services-ebook/dp/B092G2VQ39/ref=sr_1_49",
  "https://www.amazon.in/Modelling-Techniques-Financial-Management-Contributions/dp/3790809284/ref=sr_1_51",
  "https://www.amazon.in/Taxmanns-Bankers-Handbook-Credit-Management/dp/9357788492/ref=sr_1_52",
  "https://www.amazon.in/Financial-Management-Banking-Regulations-Business/dp/B0C4YBDT1G/ref=sr_1_51",
  "https://www.amazon.in/Management-Supervision-Developing-Financial-Markets/dp/0333633873/ref=sr_1_52",
  "https://www.amazon.in/IIBF-JAIIB-Questions-Principles-Accounting-Management/dp/B0BTDLJY72/ref=sr_1_53",
  "https://www.amazon.in/Management-Financial-Institutions-Emphasis-Bank/dp/8120335333/ref=sr_1_54",
  "https://www.amazon.in/Financial-Planning-Management-Question-Semester/dp/B0BDFTQL7Y/ref=sr_1_55",
  "https://www.amazon.in/Questions-Principles-Practices-Accounting-Regulatory/dp/B09NYF3RXM/ref=sr_1_56",
  "https://www.amazon.in/CAIIB-Paper-Management-Certified-Associate/dp/9355569637/ref=sr_1_57",
  "https://www.amazon.in/Financial-Crisis-Bank-Management-Japan/dp/1137541172/ref=sr_1_58",
  "https://www.amazon.in/dp/B0D47459WY/ref=sr_1_61",
  "https://www.amazon.in/BANK-MANAGEMENT-FINANCIAL-SERVICES-6E/dp/0071239367/ref=sr_1_62",
  "https://www.amazon.in/Bank-Management-Financial-Services-Peter/dp/0070706573/ref=sr_1_63",
  "https://www.amazon.in/Understanding-Commercial-Bank-Financial-Management/dp/6200486123/ref=sr_1_64",
  "https://www.amazon.in/Accounting-Finance-Essentials-Self-Study-Corporate/dp/1636510477/ref=sr_1_65",
  "https://www.amazon.in/Journal-Bank-Management-Financial-Strategies/dp/B074RG8TQH/ref=sr_1_66",
  "https://www.amazon.in/FUNDAMENTALS-INTERNATIONAL-FINANCIAL-MANAGEMENT-KEVIN-ebook/dp/B0BY54C9MM/ref=sr_1_67",
  "https://www.amazon.in/Accounting-Finance-Bankers-Full-length-Pattern/dp/9390893127/ref=sr_1_68",
  "https://www.amazon.in/role-credit-rating-agencies-Management-ebook/dp/B07MMWP18S/ref=sr_1_67",
  "https://www.amazon.in/Commercial-Bank-Management-Producing-Financial/dp/0071167552/ref=sr_1_68",
  "https://www.amazon.in/Previous-Question-Financial-Management-Administration/dp/B0CQC71HFD/ref=sr_1_69",
  "https://www.amazon.in/Financial-Management-Guidebook-Chapter-wise-Previous/dp/B0BHLXCQ3C/ref=sr_1_70",
  "https://www.amazon.in/Managing-Portfolio-Credit-Risk-Banks/dp/110714647X/ref=sr_1_71",
  "https://www.amazon.in/Assignment-Financial-Management-Administration-2023-2024/dp/B0CQ28BRB9/ref=sr_1_72",
  "https://www.amazon.in/ACCOUNTING-FINANCIAL-MANAGEMENT-BANKERS-IIBF-ebook/dp/B0BRQLPV2W/ref=sr_1_73",
  "https://www.amazon.in/Financial-Management-Solutions-Vijay-Kumar-ebook/dp/B08917JDSG/ref=sr_1_77",
  "https://www.amazon.in/Financial-Management-Kadapa-operative-Bank/dp/6202300906/ref=sr_1_78",
  "https://www.amazon.in/Bank-Financial-Management-Human-Resource/dp/B0C53CYF3N/ref=sr_1_79",
  "https://www.amazon.in/Bandhan-Making-Bank-Tamal-Bandyopadhyay/dp/8184004982/ref=sr_1_80",
  "https://www.amazon.in/Risk-Management-Bank-Financial/dp/B0C53S67FN/ref=sr_1_81",
  "https://www.amazon.in/Modeling-Financial-Management-Commercial-Bank/dp/1326728350/ref=sr_1_82",
  "https://www.amazon.in/Management-Financial-Institutions-Wiley-Finance/dp/1119932483/ref=sr_1_83",
  "https://www.amazon.in/Lets-Talk-Money-Youve-Worked/dp/9352779398/ref=sr_1_84",
  "https://www.amazon.in/Become-Successful-Bank-Branch-Manager-ebook/dp/B0CTT9BK75/ref=sr_1_83",
  "https://www.amazon.in/Indian-Financial-System-Pathak-Bharti/dp/9352864867/ref=sr_1_84",
  "https://www.amazon.in/Enterprise-Management-Banks-Financial-Institutions-ebook/dp/B0CK43NJHZ/ref=sr_1_85",
  "https://www.amazon.in/Financial-Insurance-Awareness-Current-Affairs/dp/9390711746/ref=sr_1_86",
  "https://www.amazon.in/Money-Bank-Trading-Strategy-Consistently-ebook/dp/B0CQ7YLWLF/ref=sr_1_87",
  "https://www.amazon.in/Information-Technology-Application-Curriculum-Undergraduate/dp/B0CXSWKSYF/ref=sr_1_89",
  "https://www.amazon.in/Assignment-Financial-Management-Administration-2023-2024/dp/B0CJXZ3DLJ/ref=sr_1_93",
  "https://www.amazon.in/Credit-Management-Financial-Performance-Commercial/dp/620615937X/ref=sr_1_94",
  "https://www.amazon.in/CMA-USA-Strategic-Management-Professional/dp/163873934X/ref=sr_1_95",
  "https://www.amazon.in/Candlestick-Breakout-Patterns-Indicators-Management/dp/B0BZ5LQFKP/ref=sr_1_96",
  "https://www.amazon.in/PIGGY-BANK-PORTFOLIO-Raise-Financially/dp/9391165397/ref=sr_1_97",
  "https://www.amazon.in/When-Genius-Failed-Long-Term-Management/dp/0375758259/ref=sr_1_98",
  "https://www.amazon.in/Introduction-Financial-Planning-4th-2017/dp/9386394553/ref=sr_1_99",
  "https://www.amazon.in/Market-Chandu-Kamaya-Option-Trading/dp/B0CN3D4SBZ/ref=sr_1_100",
  "https://www.amazon.in/Indian-Economy-Financial-System-2023/dp/935666031X/ref=sr_1_1",
  "https://www.amazon.in/Indian-Economy-Financial-System-Macmillan/dp/B0BX46NGYN/ref=sr_1_2",
  "https://www.amazon.in/Retail-banking-Indian-economy-financial/dp/B0BSQP88KC/ref=sr_1_3",
  "https://www.amazon.in/Indian-Economy-Financial-System-Objective/dp/9355565925/ref=sr_1_4",
  "https://www.amazon.in/JAIIB-Syllabus-Macmillan-Accounting-Financial/dp/B0BSLQ5TR4/ref=sr_1_5",
  "https://www.amazon.in/Economy-Financial-Principles-Practices-Management/dp/B0CXY2PF87/ref=sr_1_6",
  "https://www.amazon.in/Macmillan-JAIIB-2023-Financial-Oliveboard/dp/B0BZML358Z/ref=sr_1_7",
  "https://www.amazon.in/JAIIB-REGULATORY-ASPECTS-BANKING-OBJECTIVE/dp/8193762444/ref=sr_1_8",
  "https://www.amazon.in/INDIAN-ECONOMY-FINANCIAL-SYSTEM-THEORY/dp/8193762436/ref=sr_1_9",
  "https://www.amazon.in/INDIAN-ECONOMY-FINANCIAL-SYSTEM-NVB/dp/B0CYX9GWCC/ref=sr_1_10",
  "https://www.amazon.in/Indian-Economy-Financial-System-IFS-ebook/dp/B0CG18RZ4V/ref=sr_1_13",
  "https://www.amazon.in/Economy-Financial-Advanced-Business-Management/dp/B0C5B3ZGK6/ref=sr_1_14",
  "https://www.amazon.in/Economy-Financial-Banking-Regulations-Business/dp/B0C5BC8NWX/ref=sr_1_15",
  "https://www.amazon.in/dp/9356666717/ref=sr_1_18",
  "https://www.amazon.in/Principles-Practices-Banking-Economy-Financial/dp/B0C4YVDGVM/ref=sr_1_20",
  "https://www.amazon.in/Indian-Economy-English-Services-Administrative/dp/9355324626/ref=sr_1_22",
  "https://www.amazon.in/Select-Essays-Indian-Economy-Agriculture/dp/8171883389/ref=sr_1_23",
  "https://www.amazon.in/Economy-Prelims-English-General-Studies/dp/B0CGXGRH4T/ref=sr_1_24",
  "https://www.amazon.in/Indian-Financial-System-H-Machiraju/dp/9352718798/ref=sr_1_25",
  "https://www.amazon.in/BASICS-INDIAN-FINANCIAL-SYSTEM-MANJUNATH-ebook/dp/B0CPQ466DL/ref=sr_1_26",
  "https://www.amazon.in/Indian-Financial-System-Bharati-Pathak-ebook/dp/B07F82ZWHH/ref=sr_1_29",
  "https://www.amazon.in/Indian-Economy-English-Services-Administrative/dp/9355324340/ref=sr_1_30",
  "https://www.amazon.in/Retail-Banking-wealth-management-2023/dp/9356660344/ref=sr_1_31",
  "https://www.amazon.in/Indian-Economy-Performance-Policies-24th/dp/9332706247/ref=sr_1_32",
  "https://www.amazon.in/Indian-Financial-System-Bharati-Pathak-ebook/dp/B06X41Y37P/ref=sr_1_33",
  "https://www.amazon.in/Economy-Concepts-English-Services-Administrative/dp/9355321880/ref=sr_1_34",
  "https://www.amazon.in/Indian-Economy-2024-English-RAJU/dp/B0D26JDRQK/ref=sr_1_35",
  "https://www.amazon.in/Macmillan-Accounting-Oliveboard-Practice-Subjects/dp/B0BYPJ43MC/ref=sr_1_36"
];



const checkAvailability = async (url) => {
  try {
    const response = await axios.get(url, {
      httpsAgent: agent,
      proxies: proxies,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Resolves for 2xx and 4xx status codes
      }
    });

    const $ = cheerio.load(response.data);
    const title = $('title').text();

    if (title.includes('Page Not Found')) {
      return { url, status: 'Removed' };
    }

    const outOfStock = $('#outOfStock');
    if (outOfStock.length) {
      return { url, status: 'Unavailable' };
    }

    // If the outOfStock div is not found, set the status to 'Available'
    return { url, status: 'Available' };
  } catch (error) {
    console.error('Error fetching the page:', error);
    return { url, status: 'Error' }; // Update the error status to 'Error'
  }
};

const checkMultipleURLs = async () => {
  const promises = urls.map(url => checkAvailability(url));
  const results = await Promise.all(promises);
  console.log(JSON.stringify(results, null, 2)); // Better formatted output for debugging
};

checkMultipleURLs();






// const axios = require('axios');
// const cheerio = require('cheerio');
// const { HttpsProxyAgent } = require('https-proxy-agent'); 

// // Proxy configuration
// const proxyConfig = {
//   host: 'rotating.proxyempire.io',
//   port: 5000,
//   auth: {
//     username: 'package-10001',
//     password: 'YcxXUKUSyPIO5MRn'
//   }
// };

// // HTTPS Proxy Agent
// const httpsAgent = new HttpsProxyAgent(proxyConfig);

// // Array of URLs to check
// const urls = [
//   'https://www.amazon.in/PRINCIPLES-PRACTICES-BANKING-DADA-96969/dp/B0CTYFG3B7/ref=sr_1_26',
//   'https://www.amazon.in/Macmillan-CAIIB-Management-unknown_binding-Institute/dp/B0BTVPNX6K/ref=sr_1_59',
//   'https://www.amazon.in/ADVANCED-BANK-MANAGEMENT-NVB-11QQ22WW33EE44RR55TT66YY77UU88II99OO00PP/dp/B0CYX5XYXG/ref=sr_1_7',
//   'https://www.amazon.in/Bank-Financial-Management-IIBF/dp/9387000656/ref=sr_1_38_mod_primary_new'
// ];

// const checkAvailability = async (url) => {
//   try {
//     const response = await axios.get(url, {
//       httpsAgent: httpsAgent,
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
//       },
//       validateStatus: function (status) {
//         return status >= 200 && status < 500;
//       }
//     });

//     const $ = cheerio.load(response.data);
//     const title = $('title').text();

//     if (title.includes('Page Not Found')) {
//       return { url, status: 'Removed' };
//     }

//     const outOfStock = $('#outOfStock');
//     if (outOfStock.length) {
//       return { url, status: 'Unavailable' };
//     }

//     return { url, status: 'Available' };
//   } catch (error) {
//     console.error('Error fetching the page:', error);
//     return { url, status: 'Error' };
//   }
// };

// const checkMultipleURLs = async () => {
//   const promises = urls.map(url => checkAvailability(url));
//   const results = await Promise.all(promises);
//   console.log(JSON.stringify(results, null, 2));
// };

// checkMultipleURLs();










// const axios = require('axios');
// const cheerio = require('cheerio');

// // Array of URLs to check
// const urls = [
//   'https://www.amazon.in/PRINCIPLES-PRACTICES-BANKING-DADA-96969/dp/B0CTYFG3B7/ref=sr_1_26',
//   'https://www.amazon.in/Macmillan-CAIIB-Management-unknown_binding-Institute/dp/B0BTVPNX6K/ref=sr_1_59',
//   'https://www.amazon.in/ADVANCED-BANK-MANAGEMENT-NVB-11QQ22WW33EE44RR55TT66YY77UU88II99OO00PP/dp/B0CYX5XYXG/ref=sr_1_7',
//   'https://www.amazon.in/Bank-Financial-Management-IIBF/dp/9387000656/ref=sr_1_38_mod_primary_new'
// ];



// const checkAvailability = async (url) => {
//   try {
//     const response = await axios.get(url, {
//       validateStatus: function (status) {
//         return status >= 200 && status < 500; // Resolves for 2xx and 4xx status codes
//       }
//     });

//     const $ = cheerio.load(response.data);
//     const title = $('title').text();

//     if (title.includes('Page Not Found')) {
//       return { url, status: 'Removed' };
//     }

//     const outOfStock = $('#outOfStock');
//     if (outOfStock.length) {
//       return { url, status: 'Unavailable' };
//     }

//     // If the outOfStock div is not found, set the status to 'Available'
//     return { url, status: 'Available' };
//   } catch (error) {
//     console.error('Error fetching the page:', error);
//     return { url, status: 'Manually' }; // Set the status to 'Manually' for other errors
//   }
// };

// const checkMultipleURLs = async () => {
//   const promises = urls.map(url => checkAvailability(url));
//   const results = await Promise.all(promises);
//   console.log(results);
// };

// checkMultipleURLs();
